"use client";

import Hero from "@/components/general/hero";
import Footer from "@/components/general/footer";

export default function Home() {
  return (
    <div className="mx-auto flex h-screen w-full flex-col">
      <Hero />
      <Footer />
    </div>
  );
}
