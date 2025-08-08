
import Link
 from "next/link"
export default function Home() {
  return (
    <div className="flex flex-col gap-4 h-screen w-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Upstash Tutorial</h1>
      <div className="flex flex-col gap-4">
        <Link href="/redis">Redis</Link>
        <Link href="/vector">Vector</Link>
        <Link href="/workflow">Workflow</Link>
        <Link href="/search">Search</Link>
      </div>
    </div>
  )
}