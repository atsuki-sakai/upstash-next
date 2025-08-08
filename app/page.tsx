
import Link
 from "next/link"
 import { Button } from "@/components/ui/button"
export default function Home() {
  return (
    <div className="flex flex-col gap-4 h-screen w-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Upstash Demo</h1>
      <div className="grid grid-cols-3 gap-4">
        <Link href="/redis">
          <Button>
            Redis
          </Button>
        </Link>
        <Link href="/vector">
          <Button>
            VectorDB
          </Button>
        </Link>
        <Link href="/workflow">
          <Button>
            Workflow
          </Button>
        </Link>
      </div>
    </div>
  )
}