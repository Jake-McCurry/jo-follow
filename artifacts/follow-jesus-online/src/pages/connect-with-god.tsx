import { Layout } from "@/components/layout";
import { ConnectWithGodSection } from "@/components/connect-with-god-section";

export function ConnectWithGodPage() {
  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-5 py-8 sm:px-8 md:py-10">
        <ConnectWithGodSection headingLevel={1} />
      </div>
    </Layout>
  );
}
