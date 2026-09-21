import { useState } from "react";
import { Loader2, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  useGetReactionAdminSession,
  useCreateReactionAdminSession,
  useDeleteReactionAdminSession,
  useListReactionStats,
  getGetReactionAdminSessionQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getArticleBySlug, getArticlePath } from "@/data/article-library";
import { Link } from "wouter";

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) return undefined;
  return typeof error.status === "number" ? error.status : undefined;
}

export function AdminReactionsPage() {
  const { data: session, isLoading: sessionLoading } = useGetReactionAdminSession();

  if (sessionLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!session?.authenticated) {
    return <AdminLoginForm />;
  }

  return <AdminReactionsReport />;
}

function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const login = useCreateReactionAdminSession({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetReactionAdminSessionQueryKey(), data);
      },
      onError: (loginError) => {
        setError(
          errorStatus(loginError) === 503
            ? "The private report password has not been configured yet."
            : "Incorrect password. Please try again.",
        );
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ data: { password } });
  };

  return (
    <Layout>
      <div className="container mx-auto flex max-w-md flex-col items-center justify-center px-5 py-20">
        <div className="w-full rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-foreground">Reaction Report Sign-in</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <Button type="submit" disabled={login.isPending} className="mt-2 w-full h-11">
              {login.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function AdminReactionsReport() {
  const { data: stats, isLoading } = useListReactionStats();
  const queryClient = useQueryClient();

  const logout = useDeleteReactionAdminSession({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetReactionAdminSessionQueryKey(), data);
      },
    },
  });

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold font-serif text-foreground">Reaction Report</h1>
            <p className="mt-2 text-muted-foreground">
              Private summary of article reactions.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Sign Out
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-border/40 bg-card/30">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !stats || stats.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-12 text-center shadow-sm">
            <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold text-foreground">No reactions yet</h2>
            <p className="mt-2 text-muted-foreground">
              When visitors react to articles, the totals will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50">
                    <th className="p-4 font-semibold text-muted-foreground">Article</th>
                    <th className="p-4 font-semibold text-muted-foreground">Helpful</th>
                    <th className="p-4 font-semibold text-muted-foreground">Encouraging</th>
                    <th className="p-4 font-semibold text-muted-foreground">Disagree</th>
                    <th className="p-4 font-semibold text-muted-foreground">Total</th>
                    <th className="p-4 font-semibold text-muted-foreground">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {stats.map((stat) => {
                    const article = getArticleBySlug(stat.articleSlug);
                    return (
                      <tr key={stat.articleSlug} className="transition-colors hover:bg-muted/20">
                        <td className="p-4">
                          {article ? (
                            <div>
                              <Link
                                href={getArticlePath(stat.articleSlug)}
                                className="font-semibold text-primary hover:underline"
                              >
                                {article.title}
                              </Link>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {stat.articleSlug}
                              </div>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">
                              {stat.articleSlug}
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-medium">{stat.helpful}</td>
                        <td className="p-4 font-medium">{stat.encouraging}</td>
                        <td className="p-4 font-medium text-destructive/80">{stat.disagree}</td>
                        <td className="p-4 font-bold">{stat.total}</td>
                        <td className="p-4 text-muted-foreground">
                          {stat.updatedAt
                            ? new Date(stat.updatedAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
