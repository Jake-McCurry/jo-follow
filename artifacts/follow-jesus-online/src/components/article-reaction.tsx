import { useState } from "react";
import { ThumbsUp, Heart, ThumbsDown, Loader2 } from "lucide-react";
import {
  useGetArticleReactions,
  useSetArticleReaction,
  getGetArticleReactionsQueryKey,
  type ArticleReactionType
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ArticleReaction({
  articleSlug,
  compact = false,
}: {
  articleSlug: string;
  compact?: boolean;
}) {
  const { data, isLoading, isError, refetch } = useGetArticleReactions(articleSlug);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingReaction, setPendingReaction] = useState<ArticleReactionType | null>(null);

  const setReaction = useSetArticleReaction({
    mutation: {
      onSuccess: (newData) => {
        queryClient.setQueryData(getGetArticleReactionsQueryKey(articleSlug), newData);
        setPendingReaction(null);
      },
      onError: () => {
        toast({
          title: "Could not save reaction",
          description: "Please try again later.",
          variant: "destructive",
        });
        setPendingReaction(null);
      },
    },
  });

  if (isLoading) {
    if (compact) {
      return (
        <div className="flex h-10 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-border/40 bg-card/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    if (compact) {
      return (
        <div className="flex min-h-10 items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Reactions are temporarily unavailable.</span>
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>Try again</Button>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm text-muted-foreground">
          Reactions are temporarily unavailable.
        </p>
        <Button variant="ghost" className="mt-2" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const handleReact = (reaction: ArticleReactionType) => {
    setPendingReaction(reaction);
    setReaction.mutate({ articleSlug, data: { reaction } });
  };

  const isPending = setReaction.isPending;

  if (compact) {
    return (
      <div className="flex min-h-11 items-center justify-center gap-3 border-y border-border-soft py-2">
        <span className="text-sm font-medium text-slate">Was this helpful?</span>
        <Button
          variant={data.selected === "helpful" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => handleReact("helpful" as ArticleReactionType)}
          disabled={isPending}
          aria-label="Yes, this was helpful"
          aria-pressed={data.selected === "helpful"}
        >
          {pendingReaction === "helpful" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant={data.selected === "disagree" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => handleReact("disagree" as ArticleReactionType)}
          disabled={isPending}
          aria-label="No, this was not helpful"
          aria-pressed={data.selected === "disagree"}
        >
          {pendingReaction === "disagree" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsDown className="h-4 w-4" />
          )}
        </Button>
        <span className="sr-only" aria-live="polite">
          {data.selected ? "Your response has been saved. You can change it at any time." : "Choose one response."}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
      <h3 className="mb-5 text-center text-xl font-bold text-foreground">
        Was this article helpful?
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant={data.selected === "helpful" ? "default" : "outline"}
          className={`rounded-full px-5 h-11 ${data.selected !== "helpful" ? "text-foreground hover:bg-muted" : ""}`}
          onClick={() => handleReact("helpful" as ArticleReactionType)}
          disabled={isPending}
          aria-pressed={data.selected === "helpful"}
        >
          {pendingReaction === "helpful" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp className={`mr-2 h-4 w-4 ${data.selected !== "helpful" ? "text-muted-foreground" : ""}`} />
          )}
          Helpful
          {data.helpful !== null && (
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
              data.selected === "helpful" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {data.helpful}
            </span>
          )}
        </Button>
        <Button
          variant={data.selected === "encouraging" ? "warm" : "outline"}
          className={`rounded-full px-5 h-11 ${data.selected !== "encouraging" ? "text-foreground hover:bg-muted" : ""}`}
          onClick={() => handleReact("encouraging" as ArticleReactionType)}
          disabled={isPending}
          aria-pressed={data.selected === "encouraging"}
        >
          {pendingReaction === "encouraging" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`mr-2 h-4 w-4 ${data.selected !== "encouraging" ? "text-muted-foreground" : ""}`} />
          )}
          Encouraging
          {data.encouraging !== null && (
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
              data.selected === "encouraging" ? "bg-warm-foreground/20 text-warm-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {data.encouraging}
            </span>
          )}
        </Button>
        <Button
          variant={data.selected === "disagree" ? "secondary" : "outline"}
          className={`rounded-full px-5 h-11 ${data.selected !== "disagree" ? "text-foreground hover:bg-muted" : ""}`}
          onClick={() => handleReact("disagree" as ArticleReactionType)}
          disabled={isPending}
          aria-pressed={data.selected === "disagree"}
        >
          {pendingReaction === "disagree" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ThumbsDown className={`mr-2 h-4 w-4 ${data.selected !== "disagree" ? "text-muted-foreground" : ""}`} />
          )}
          I disagree
        </Button>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground" aria-live="polite">
        {data.selected ? "Your response has been saved. You can change it at any time." : "Choose one response."}
      </p>
    </div>
  );
}
