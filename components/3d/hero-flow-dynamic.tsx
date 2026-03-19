"use client";

import dynamic from "next/dynamic";

const HeroFlow = dynamic(
  () => import("./hero-flow").then((mod) => ({ default: mod.HeroFlow })),
  { ssr: false, loading: () => null }
);

export function HeroFlow3D() {
  return (
    <div className="hidden lg:block w-full h-[480px] xl:h-[540px]">
      <HeroFlow />
    </div>
  );
}
