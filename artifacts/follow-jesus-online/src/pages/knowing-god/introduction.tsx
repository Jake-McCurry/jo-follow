import { useParams } from "wouter";
import { KnowingGodShell } from "@/components/knowing-god/KnowingGodShell";
import { IntroArticle, IntroIndex } from "@/components/knowing-god/IntroArticle";
import { knowingGodIntroductions } from "@/data/knowingGodIntroductions";
import NotFound from "@/pages/not-found";

export function KnowingGodIntroductionIndexPage() {
  return <KnowingGodShell warmWrapper><IntroIndex /></KnowingGodShell>;
}

export function KnowingGodIntroductionPage() {
  const { section = "" } = useParams<{ section: string }>();
  const index = knowingGodIntroductions.findIndex(item => item.slug === section);
  if (index < 0) return <NotFound />;
  return (
    <KnowingGodShell warmWrapper>
      <IntroArticle article={knowingGodIntroductions[index]} previous={knowingGodIntroductions[index - 1] ?? null} next={knowingGodIntroductions[index + 1] ?? null} />
    </KnowingGodShell>
  );
}
