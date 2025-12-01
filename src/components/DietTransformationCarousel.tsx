import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Transformation {
  id: number;
  name: string;
  weightLoss: string;
  beforeImage: string;
  afterImage: string;
}

// Dados ilustrativos de transformações
const transformations: Transformation[] = [
  {
    id: 1,
    name: "Maria Clara",
    weightLoss: "-8kg",
    beforeImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    name: "Ricardo Silva",
    weightLoss: "-12kg",
    beforeImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
  },
  {
    id: 3,
    name: "Ana Ferreira",
    weightLoss: "-6kg",
    beforeImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop"
  },
  {
    id: 4,
    name: "João Santos",
    weightLoss: "-10kg",
    beforeImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
  }
];

export function DietTransformationCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "center",
    skipSnaps: false 
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {transformations.map((transformation) => (
            <div 
              key={transformation.id}
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_45%] lg:flex-[0_0_30%]"
            >
              <div className="glass-card rounded-xl overflow-hidden hover:shadow-xl transition-smooth group">
                <div className="relative">
                  {/* Antes/Depois Comparison */}
                  <div className="grid grid-cols-2 gap-1">
                    {/* Antes */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img 
                        src={transformation.beforeImage}
                        alt={`${transformation.name} - Antes`}
                        className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                        Antes
                      </div>
                    </div>
                    
                    {/* Depois */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img 
                        src={transformation.afterImage}
                        alt={`${transformation.name} - Depois`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                        Depois
                      </div>
                    </div>
                  </div>

                  {/* Seta central indicando transformação */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-gradient-to-r from-red-500 to-green-500 rounded-full p-2 shadow-lg animate-pulse">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 text-center bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                  <p className="font-bold text-foreground text-lg">{transformation.name}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {transformation.weightLoss}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">em 21 dias</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-2 mt-6">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === selectedIndex 
                ? "bg-green-500 w-8" 
                : "bg-muted hover:bg-green-500/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
