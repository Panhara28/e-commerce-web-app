import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SignInForm } from "@/screens/views/signin"

export const metadata = {
  title: "Sign In",
  description: "Sign in to the T-Sport Cambodia admin portal",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left · brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-blue-950 p-10 text-white lg:flex lg:w-1/2 xl:p-14">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,197,253,0.18),transparent_38%),radial-gradient(circle_at_25%_75%,rgba(59,130,246,0.16),transparent_42%),radial-gradient(circle_at_85%_25%,rgba(37,99,235,0.18),transparent_36%)]"
        />
        {/* soft light blooms */}
        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-400/12 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 left-8 h-96 w-96 rounded-full bg-blue-500/12 blur-3xl"
        />

        <div className="relative flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/95 p-1.5 shadow-lg">
            <Image src="/logo.png" alt="T-Sport Cambodia" width={44} height={44} className="h-11 w-auto" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight">T-Sport Cambodia</span>
            <span className="block text-sm text-white/70">Admin Portal</span>
          </span>
        </div>

        <h1 className="relative max-w-md text-3xl font-semibold leading-snug xl:text-4xl xl:leading-snug">
          Your store&apos;s command center — products, orders, and customers in one place.
        </h1>

        <p className="relative text-sm text-white/60">
          © {new Date().getFullYear()} T-Sport Cambodia. All rights reserved.
        </p>
      </aside>

      {/* Right · form panel */}
      <main className="relative flex w-full flex-1 items-center justify-center bg-white px-4 py-12 sm:px-8 lg:w-1/2">
        <Link
          href="/views"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            {/* logo shown only on small screens where the brand panel is hidden */}
            <Image
              src="/logo.png"
              alt="T-Sport Cambodia"
              width={56}
              height={56}
              className="mx-auto mb-5 h-14 w-auto lg:hidden"
            />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to the T-Sport Cambodia admin portal
            </p>
          </div>

          <SignInForm />
        </div>
      </main>
    </div>
  )
}
