import { useLocation } from "wouter"
import { useEffect } from "react"
import { Layout } from "@/components/layout"
import { Loader2 } from "lucide-react"

export function Home() {
  const [, setLocation] = useLocation()
  
  useEffect(() => {
    // Redirect to the default passage on mount
    setLocation("/bible/John/3")
  }, [setLocation])

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Opening Scripture...</p>
      </div>
    </Layout>
  )
}