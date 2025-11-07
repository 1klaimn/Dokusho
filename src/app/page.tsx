"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AuthModal } from "../components/layout-components";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="absolute inset-0 bg-linear-to-b from-background to-transparent z-0" />
      
      <main className="relative z-10 grow flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-8 w-48 h-72 mx-auto transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <Image
              // --- UPDATED IMAGE URL ---
              src="https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx33-r1o22SMyEk5P.jpg" // A more stable URL for Attack on Titan
              alt="Attack on Titan Cover"
              fill
              className="rounded-lg shadow-2xl object-cover"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Cross-site Series Tracker
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
            Sync your reading across 20+ sites, discover new favourites, and share
            progress with friends—all for free.
          </p>
          <div className="mt-8">
            <AuthModal>
              <Button size="lg" className="h-12 text-lg px-8 rounded-full">
                Get started for free
              </Button>
            </AuthModal>
          </div>
        </div>

        <div className="mt-24 w-full max-w-5xl">
          <Image
            src="https://kenmei.co/_next/image?url=%2Fimg%2Fapp_preview.png&w=1920&q=75"
            alt="App Preview"
            width={1920}
            height={1080}
            className="rounded-xl shadow-2xl"
          />
        </div>
      </main>
    </div>
  );
}