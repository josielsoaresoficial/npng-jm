import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  userId?: string;
}

// Helper to convert base64url to ArrayBuffer
function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binaryString = atob(base64 + padding);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

// Helper to convert ArrayBuffer to base64url
function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Create VAPID JWT token using JWK format
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64url: string,
  publicKeyBase64url: string
): Promise<string> {
  const header = {
    typ: 'JWT',
    alg: 'ES256',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerEncoded = arrayBufferToBase64url(encoder.encode(JSON.stringify(header)).buffer as ArrayBuffer);
  const payloadEncoded = arrayBufferToBase64url(encoder.encode(JSON.stringify(payload)).buffer as ArrayBuffer);
  const unsignedToken = `${headerEncoded}.${payloadEncoded}`;

  // Convert raw EC keys to JWK format
  // VAPID private key is 32 bytes (the d value in JWK)
  // VAPID public key is 65 bytes (uncompressed point: 0x04 + x + y)
  const publicKeyBytes = new Uint8Array(base64urlToArrayBuffer(publicKeyBase64url));
  
  // Extract x and y coordinates from public key (skip first byte which is 0x04)
  const x = publicKeyBytes.slice(1, 33);
  const y = publicKeyBytes.slice(33, 65);
  
  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: arrayBufferToBase64url(x.buffer as ArrayBuffer),
    y: arrayBufferToBase64url(y.buffer as ArrayBuffer),
    d: privateKeyBase64url, // Private key is already in base64url format
  };

  try {
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    // Sign the token
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      encoder.encode(unsignedToken)
    );

    // The signature from Web Crypto is in IEEE P1363 format (r || s)
    // JWT expects the same format, so we can use it directly
    const signatureEncoded = arrayBufferToBase64url(signature);
    return `${unsignedToken}.${signatureEncoded}`;
  } catch (error) {
    console.error('Error creating JWT:', error);
    throw error;
  }
}

// Simple payload encryption using aes128gcm
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  
  // Generate a local key pair for ECDH
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Export local public key
  const localPublicKeyBuffer = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyBuffer);

  // Import subscriber's public key
  const subscriberPublicKeyBytes = base64urlToArrayBuffer(p256dhKey);
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw',
    subscriberPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecretBuffer = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPublicKey },
    localKeyPair.privateKey,
    256
  );

  // Import auth secret
  const authSecretBytes = base64urlToArrayBuffer(authSecret);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF derivation
  const sharedSecretKey = await crypto.subtle.importKey(
    'raw',
    sharedSecretBuffer,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );

  // Derive IKM (input keying material) using auth secret
  const ikmInfo = concatArrays(
    encoder.encode('WebPush: info\0'),
    new Uint8Array(subscriberPublicKeyBytes),
    localPublicKey
  );

  const prkBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: authSecretBytes,
      info: ikmInfo.buffer as ArrayBuffer,
    },
    sharedSecretKey,
    256
  );

  const prkKey = await crypto.subtle.importKey(
    'raw',
    prkBits,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );

  // Derive CEK (content encryption key)
  const cekInfo = encoder.encode('Content-Encoding: aes128gcm\0');
  const cekBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt.buffer as ArrayBuffer,
      info: cekInfo,
    },
    prkKey,
    128
  );

  // Derive nonce
  const nonceInfo = encoder.encode('Content-Encoding: nonce\0');
  const nonceBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt.buffer as ArrayBuffer,
      info: nonceInfo,
    },
    prkKey,
    96
  );

  // Import CEK for AES-GCM
  const cekKey = await crypto.subtle.importKey(
    'raw',
    cekBits,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Prepare plaintext with padding delimiter
  const payloadBytes = encoder.encode(payload);
  const plaintext = new Uint8Array(payloadBytes.length + 1);
  plaintext.set(payloadBytes);
  plaintext[payloadBytes.length] = 2; // Delimiter

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: new Uint8Array(nonceBits) },
    cekKey,
    plaintext
  );

  // Build aes128gcm header
  const recordSize = 4096;
  const header = new Uint8Array(21 + localPublicKey.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, recordSize, false);
  header[20] = localPublicKey.length;
  header.set(localPublicKey, 21);

  // Combine header and ciphertext
  const encrypted = new Uint8Array(header.length + ciphertext.byteLength);
  encrypted.set(header);
  encrypted.set(new Uint8Array(ciphertext), header.length);

  return encrypted.buffer as ArrayBuffer;
}

// Helper to concatenate Uint8Arrays
function concatArrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const vapidSubject = Deno.env.get('VAPID_SUBJECT');
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ Missing VAPID keys configuration');
      throw new Error('VAPID keys not configured');
    }

    console.log('✅ VAPID keys loaded');
    console.log('📊 Public key length:', vapidPublicKey.length);
    console.log('📊 Private key length:', vapidPrivateKey.length);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Manual JWT validation
    const authHeader = req.headers.get('Authorization');
    let authenticatedUserId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          authenticatedUserId = user.id;
          console.log('✅ User authenticated:', authenticatedUserId);
        } else {
          console.log('⚠️ Token validation failed:', error?.message);
        }
      } catch (authError) {
        console.log('⚠️ Auth error:', authError);
      }
    } else {
      console.log('⚠️ No Authorization header provided');
    }

    const payloadData: NotificationPayload = await req.json();
    const { title, body, icon, badge, tag, data, userId } = payloadData;

    console.log('📧 Sending push notification:', { title, userId, authenticatedUserId });

    // Determine target user(s)
    let targetUserId = userId;
    if (!targetUserId && authenticatedUserId) {
      targetUserId = authenticatedUserId;
    }

    // Fetch subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ No subscriptions found for user:', targetUserId);
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`📨 Sending to ${subscriptions.length} subscription(s)`);

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-192x192.png',
      tag: tag || 'default',
      data: data || {},
    });

    // Send notifications to each subscription
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const endpoint = subscription.endpoint;
          const url = new URL(endpoint);
          const audience = `${url.protocol}//${url.host}`;

          console.log(`🔄 Processing subscription for endpoint: ${endpoint.substring(0, 50)}...`);

          // Create VAPID authorization header
          let jwt: string;
          try {
            jwt = await createVapidJwt(
              audience,
              vapidSubject,
              vapidPrivateKey,
              vapidPublicKey
            );
            console.log('✅ JWT created successfully');
          } catch (jwtError) {
            console.error('❌ JWT creation failed:', jwtError);
            return { success: false, endpoint, error: 'JWT creation failed: ' + String(jwtError) };
          }

          // Encrypt the payload
          let encrypted: ArrayBuffer;
          try {
            encrypted = await encryptPayload(
              notificationPayload,
              subscription.p256dh,
              subscription.auth
            );
            console.log('✅ Payload encrypted successfully');
          } catch (encryptError) {
            console.error('❌ Encryption failed:', encryptError);
            return { success: false, endpoint, error: 'Encryption failed: ' + String(encryptError) };
          }

          // Send the push notification
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
              'Content-Type': 'application/octet-stream',
              'Content-Encoding': 'aes128gcm',
              'TTL': '86400',
              'Urgency': 'normal',
            },
            body: encrypted,
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Push failed (${response.status}):`, errorText);
            
            // Remove invalid subscriptions
            if (response.status === 404 || response.status === 410) {
              console.log('🗑️ Removing invalid subscription');
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', endpoint);
            }
            
            return { success: false, endpoint, error: errorText, statusCode: response.status };
          }

          console.log('✅ Notification sent to:', endpoint.substring(0, 50) + '...');
          return { success: true, endpoint };
        } catch (error: any) {
          console.error('❌ Error sending notification:', error.message);
          return { success: false, endpoint: subscription.endpoint, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - successful;

    console.log(`✅ Sent: ${successful}, ❌ Failed: ${failed}`);

    // Log failed results for debugging
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const value = result.value as any;
        if (!value.success) {
          console.log(`  Failed ${index + 1}: ${value.error}`);
        }
      } else {
        console.log(`  Rejected ${index + 1}: ${result.reason}`);
      }
    });

    return new Response(
      JSON.stringify({ 
        message: 'Notifications processed',
        sent: successful,
        failed: failed,
        total: subscriptions.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
