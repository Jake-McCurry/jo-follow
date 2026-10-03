import { KnowingGodShell } from "@/components/knowing-god/KnowingGodShell";
import { PromisesReader } from "@/components/promises/PromisesReader";
import "@/styles/promises-theme.css";

export function PromisesPage() {
  return (
    <KnowingGodShell warmWrapper>
      <div className="promises-theme flex flex-1 flex-col">
        <PromisesReader />
      </div>
    </KnowingGodShell>
  );
}

export default PromisesPage;
