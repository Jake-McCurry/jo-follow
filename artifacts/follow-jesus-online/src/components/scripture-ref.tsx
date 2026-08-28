import { useState, useRef } from "react";
import { useGetBiblePassage, getGetBiblePassageQueryKey } from "@workspace/api-client-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Loader2, AlertCircle } from "lucide-react";

interface ScriptureRefProps {
  reference: string;
  children?: React.ReactNode;
}

export function ScriptureRef({ reference, children }: ScriptureRefProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // We want to fetch if the popover is open, OR if we prefetch on hover
  const shouldFetch = isOpen || isHovered;

  const { data, isLoading, error } = useGetBiblePassage(
    { passage: reference },
    { 
      query: { 
        enabled: shouldFetch,
        queryKey: getGetBiblePassageQueryKey({ passage: reference }),
        staleTime: 1000 * 60 * 60 * 24 // 24 hours caching
      } 
    }
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 400); // 400ms delay before opening on hover
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsOpen(false);
    setTimeout(() => setIsHovered(false), 300); // Delay disabling fetch
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="inline-flex font-medium text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 -mx-1"
          aria-expanded={isOpen}
        >
          {children || reference}
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[340px] max-w-[calc(100vw-2rem)] p-5 shadow-lg max-h-[300px] overflow-y-auto" 
        onMouseEnter={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setIsOpen(true);
        }}
        onMouseLeave={handleMouseLeave}
        sideOffset={6}
        collisionPadding={16}
      >
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-lg text-foreground border-b pb-2">
            {data?.reference || reference}
          </h4>
          
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading Scripture...</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-destructive py-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-sm leading-tight">Could not load passage. Please check your connection.</span>
            </div>
          )}

          {data && (
            <div className="text-sm leading-relaxed text-foreground/90 space-y-2">
              <p>
                {data.verses.map((v, i) => (
                  <span key={`${v.chapter}-${v.verse}-${i}`} className="inline mr-1.5">
                    <sup className="text-[0.65em] font-bold text-primary mr-0.5 align-super">{v.verse}</sup>
                    <span>{v.text}</span>
                  </span>
                ))}
              </p>
              <div className="pt-2 text-xs text-muted-foreground opacity-75">
                {data.copyright}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
