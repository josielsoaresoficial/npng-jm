import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Users, Share2, Copy, Check, Mail, MessageCircle, Twitter, Facebook, Send, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { LiquidGlassWrapper } from '@/components/liquid-glass/LiquidGlassWrapper';
import { FavoriteRecipe, RecipeCategory } from '@/hooks/useFavoriteRecipes';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EditRecipeDialog } from '@/components/EditRecipeDialog';

interface RecipeCardProps {
  recipe: FavoriteRecipe;
  onDelete: (id: string) => void;
  onEdit: (recipeId: string, updates: Partial<FavoriteRecipe>) => Promise<void>;
}

export const RecipeCard = ({ recipe, onDelete, onEdit }: RecipeCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const categoryLabels: Record<RecipeCategory, string> = {
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    post_workout: 'Pós-Treino',
    snack: 'Lanche'
  };

  const categoryColors: Record<RecipeCategory, string> = {
    breakfast: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    lunch: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    dinner: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    post_workout: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    snack: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
  };

  const tagLabels: Record<string, string> = {
    low_carb: 'Low Carb',
    high_protein: 'High Protein',
    vegetarian: 'Vegetariana',
    vegan: 'Vegana',
    gluten_free: 'Sem Glúten',
    dairy_free: 'Sem Lactose',
    keto: 'Keto',
    paleo: 'Paleo'
  };

  const formatRecipeText = (forWhatsApp = false) => {
    const ingredients = recipe.ingredients
      .map(ing => `• ${ing.quantity ? `${ing.quantity} - ${ing.item}` : ing.item}`)
      .join('\n');
    
    const macrosText = recipe.macros 
      ? `\n${forWhatsApp ? '*' : ''}Informações Nutricionais:${forWhatsApp ? '*' : ''}\n${recipe.macros.calories ? `🔥 ${recipe.macros.calories} kcal\n` : ''}${recipe.macros.protein ? `💪 ${recipe.macros.protein}g proteína\n` : ''}${recipe.macros.carbs ? `🍞 ${recipe.macros.carbs}g carboidratos\n` : ''}${recipe.macros.fat ? `🥑 ${recipe.macros.fat}g gordura\n` : ''}`
      : '';

    const title = forWhatsApp ? `*${recipe.title}*` : recipe.title;
    const ingredientsHeader = forWhatsApp ? '*Ingredientes:*' : 'Ingredientes:';
    const instructionsHeader = forWhatsApp ? '*Modo de Preparo:*' : 'Modo de Preparo:';
    const notesHeader = forWhatsApp ? '*Notas:*' : 'Notas:';

    return `${title}${recipe.prep_time ? `\n⏱️ ${recipe.prep_time}` : ''}${recipe.servings ? `\n👥 ${recipe.servings} ${recipe.servings === 1 ? 'porção' : 'porções'}` : ''}\n\n${ingredientsHeader}\n${ingredients}\n\n${instructionsHeader}\n${recipe.instructions}${macrosText}${recipe.notes ? `\n\n${notesHeader}\n${recipe.notes}` : ''}`;
  };

  const handleShareWhatsApp = () => {
    const message = formatRecipeText(true);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Receita: ${recipe.title}`);
    const body = encodeURIComponent(formatRecipeText(false));
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(formatRecipeText(false));
    window.open(`https://t.me/share/url?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const shortText = `🍽️ ${recipe.title}${recipe.macros?.calories ? ` - ${recipe.macros.calories} kcal` : ''}${recipe.macros?.protein ? ` | ${recipe.macros.protein}g proteína` : ''}\n\nConfira esta receita incrível!`;
    const text = encodeURIComponent(shortText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const quote = encodeURIComponent(`🍽️ ${recipe.title} - Uma receita deliciosa!`);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${quote}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: formatRecipeText(false),
        });
        toast({
          title: "Compartilhado!",
          description: "Receita compartilhada com sucesso",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: "Erro",
            description: "Não foi possível compartilhar",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleCopyRecipe = async () => {
    const text = formatRecipeText(false);
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Receita copiada!",
        description: "A receita foi copiada para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a receita",
        variant: "destructive",
      });
    }
  };

  return (
    <LiquidGlassWrapper variant="nutrition" hoverable className="hover:shadow-lg transition-shadow">
      <CardHeader className="bg-transparent">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <CardTitle className="text-xl">{recipe.title}</CardTitle>
              {recipe.category && (
                <Badge variant="outline" className={categoryColors[recipe.category]}>
                  {categoryLabels[recipe.category]}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {recipe.prep_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.prep_time}
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
              title="Editar receita"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  title="Compartilhar receita"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {typeof navigator !== 'undefined' && navigator.share && (
                  <>
                    <DropdownMenuItem onClick={handleNativeShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem onClick={handleShareWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                  WhatsApp
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareTelegram}>
                  <Send className="h-4 w-4 mr-2 text-blue-500" />
                  Telegram
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareEmail}>
                  <Mail className="h-4 w-4 mr-2 text-orange-500" />
                  Email
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleShareTwitter}>
                  <Twitter className="h-4 w-4 mr-2 text-sky-500" />
                  Twitter/X
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareFacebook}>
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleCopyRecipe}>
                  {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar texto'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Receita?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover "{recipe.title}" dos seus favoritos? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(recipe.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {recipe.prep_time && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {recipe.prep_time}
            </Badge>
          )}
          {recipe.servings && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}
            </Badge>
          )}
          {recipe.tags && recipe.tags.length > 0 && recipe.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tagLabels[tag] || tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {recipe.macros && (
          <div className="flex gap-2 flex-wrap">
            {recipe.macros.calories && (
              <Badge variant="outline">{recipe.macros.calories} kcal</Badge>
            )}
            {recipe.macros.protein && (
              <Badge variant="outline">{recipe.macros.protein}g proteína</Badge>
            )}
            {recipe.macros.carbs && (
              <Badge variant="outline">{recipe.macros.carbs}g carbs</Badge>
            )}
            {recipe.macros.fat && (
              <Badge variant="outline">{recipe.macros.fat}g gordura</Badge>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Recolher
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Ver receita completa
            </>
          )}
        </Button>

        {isExpanded && (
          <div className="space-y-4 pt-2 border-t">
            <div>
              <h4 className="font-semibold mb-2">Ingredientes:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>
                    {ing.quantity ? `${ing.quantity} - ${ing.item}` : ing.item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Modo de Preparo:</h4>
              <p className="text-sm whitespace-pre-line">{recipe.instructions}</p>
            </div>

            {recipe.notes && (
              <div>
                <h4 className="font-semibold mb-2">Notas:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{recipe.notes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <EditRecipeDialog
        recipe={recipe}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={onEdit}
      />
    </LiquidGlassWrapper>
  );
};
