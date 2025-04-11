import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, Zap, Rocket, Cog } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50/50 flex items-center justify-center overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_4rem]" />

      <section className="w-full px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col items-center space-y-16 text-center">
        {/* Hero content with improved animations */}
        <header className="space-y-8 animate-fade-in">
          <h1 className="text-5xl relative z-50 font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 bg-clip-text text-transparent mb-8 pb-2 animate-gradient-x-subtle">
            Advi Agents
          </h1>
          <p className="max-w-[600px] text-lg text-gray-600 md:text-xl/relaxed xl:text-2xl/relaxed">
            Meet your new AI employees that will help your company grow
            <br />
            <span className="text-gray-400 text-base mt-2 inline-block">
              Powered by IBM, LangGraph, Make.com, your favourite LLM models, and many more leading software solutions
            </span>
          </p>
        </header>

        {/* CTA Button with enhanced styling */}
        <SignedIn>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-white bg-gradient-to-r from-gray-900 to-purple-800 rounded-full hover:from-purple-800 hover:to-gray-800 transition-[background,transform,box-shadow] duration-700 shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-purple-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton
            mode="modal"
            fallbackRedirectUrl={"/dashboard"}
            forceRedirectUrl={"/dashboard"}
          >
            <div className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-white bg-gradient-to-r from-gray-900 to-purple-800 rounded-full hover:from-purple-800 hover:to-gray-800 transition-[background,transform,box-shadow] duration-700 shadow-lg hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              Sign Up
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-purple-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </SignInButton>
        </SignedOut>

      </section>
    </main>
  );
}
