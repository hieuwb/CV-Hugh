import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { GameLoader } from "@/components/game/game-loader";

export const metadata: Metadata = {
  title: "Hugh — pmhieu111.eth · Civil engineer turned Web3 builder",
  description:
    "CV dạng game 3D của Phan Minh Hiếu (Hugh). Lái xe khám phá hành trình từ công trường Novaworld Hồ Tràm đến các dApp Web3. Dùng Three.js, Next.js 14.",
  keywords: [
    "Phan Minh Hiếu",
    "Hugh",
    "pmhieu111.eth",
    "Web3 developer Vietnam",
    "3D portfolio",
    "Three.js",
    "Next.js"
  ],
  openGraph: {
    title: "Phan Minh Hiếu — pmhieu111.eth",
    description:
      "Lái xe qua CV 3D: công trường Hồ Tràm → on-chain. Web3 builder · dApp · AI × AutoCAD.",
    type: "website"
  }
};

// SSR-disabled — toàn bộ scene 3D là client-only (Three.js + WebAudio cần
// browser API). Tránh hydration mismatch do random/refs/etc.
const GameClient = dynamic(
  () => import("@/components/game/game-client").then((m) => m.GameClient),
  {
    ssr: false,
    loading: () => <GameLoader />
  }
);

export default function LandingPage() {
  return <GameClient />;
}
