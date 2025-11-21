import { SignInForm } from "@/screens/views/signin"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Sign In | SportHub",
  description: "Sign into your SportHub account",
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      
      {/* Left Side - Background Image Section */}
      <div
        className="
          hidden lg:flex lg:w-1/2 
          relative 
          flex-col justify-between p-8
        "
        style={{
          backgroundImage: "url('/login-banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">

        {/* 🔙 Back Button */}
        <Link
          href="/views"
          className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your SportHub account</p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
