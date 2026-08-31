import { useState, useCallback } from "react";
import { Share2, Link as LinkIcon, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "link";
  label?: string;
}

export function ShareButton({ title, text, url, className, variant = "outline", label = "Share" }: ShareButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || window.location.href;

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  }, [title, text, shareUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting the text manually.",
        variant: "destructive"
      });
    }
  };

  const emailSubject = encodeURIComponent(title);
  const emailBody = encodeURIComponent(`${text}\n\n${shareUrl}`);
  const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  return (
    <>
      <Button 
        variant={variant} 
        onClick={handleShare} 
        className={className}
        data-testid="button-share"
      >
        <Share2 className="w-4 h-4 mr-2" />
        {label}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this page</DialogTitle>
            <DialogDescription>
              Share this resource with someone or save it for later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input readOnly value={shareUrl} className="flex-1 text-sm" />
              <Button size="icon" variant="secondary" onClick={copyToClipboard} aria-label="Copy link">
                {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              </Button>
            </div>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href={mailtoLink}>
                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                Send via Email
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
