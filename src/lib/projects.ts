// Dữ liệu 5 dự án public của Hugh — nguồn duy nhất.
// Sau này khi Phase 2 có bảng Supabase `projects`, component sẽ chuyển sang đọc từ DB.

export type ProjectKind = "web" | "github";

export type ProjectArtwork = {
  gradient: string;
  ring: string;
  glyph: string;
};

export type ProjectItem = {
  slug: string;
  title: string;
  description: string;
  url: string;
  displayUrl: string;
  kind: ProjectKind;
  tags: string[];
  featured?: boolean;
  artwork: ProjectArtwork;
};

export const PROJECTS: ProjectItem[] = [
  {
    slug: "blob-alpha-shelby",
    title: "Blob Alpha — Shelby",
    description:
      "Showcase tương tác trên Shelby protocol — bản demo nổi bật nhất mình đang tinker. Dùng làm sandbox thử các idea về decentralized storage & on-chain UX.",
    url: "https://blob-alpha-shelby.vercel.app/",
    displayUrl: "blob-alpha-shelby.vercel.app",
    kind: "web",
    tags: ["Next.js", "Shelby", "On-chain UX", "Vercel"],
    featured: true,
    artwork: {
      gradient:
        "linear-gradient(135deg, #1a1538 0%, #3c1a66 40%, #6b2d8c 70%, #f4c26b 100%)",
      ring:
        "radial-gradient(circle, rgba(244,194,107,0.9), rgba(107, 45, 140, 0.1) 65%)",
      glyph: "◉"
    }
  },
  {
    slug: "zama-dapp-swap",
    title: "Zama dApp Swap",
    description:
      "Swap dApp demo sử dụng Zama FHE — trải nghiệm swap với dữ liệu được mã hoá hoàn toàn đồng thái. Next.js + viem.",
    url: "https://zama-dapp-swap.vercel.app/",
    displayUrl: "zama-dapp-swap.vercel.app",
    kind: "web",
    tags: ["Zama FHE", "Swap", "viem", "Next.js"],
    artwork: {
      gradient:
        "linear-gradient(135deg, #0b1629 0%, #1a3a66 50%, #ffcc33 100%)",
      ring: "radial-gradient(circle, rgba(255,204,51,0.85), transparent 60%)",
      glyph: "Z"
    }
  },
  {
    slug: "shelby-drive-demo",
    title: "Shelby Drive Demo",
    description:
      "Bản demo lưu trữ phi tập trung trên Shelby — upload, share, cảm nhận model pricing & latency so với Drive/IPFS thường.",
    url: "https://shelby-drive-demo.vercel.app/",
    displayUrl: "shelby-drive-demo.vercel.app",
    kind: "web",
    tags: ["Shelby", "Storage", "Demo"],
    artwork: {
      gradient:
        "linear-gradient(135deg, #0a2236 0%, #1b5e8a 50%, #72d9ff 100%)",
      ring: "radial-gradient(circle, rgba(114,217,255,0.8), transparent 60%)",
      glyph: "⇅"
    }
  },
  {
    slug: "dachain-testnet",
    title: "Dachain Testnet Tool",
    description:
      "Công cụ hỗ trợ làm testnet Dachain — tự động task, log tiến độ, tránh các thao tác lặp trong farming.",
    url: "https://github.com/hieuwb/dachain-testnet",
    displayUrl: "github.com/hieuwb/dachain-testnet",
    kind: "github",
    tags: ["TypeScript", "Node.js", "Testnet", "Automation"],
    artwork: {
      gradient:
        "linear-gradient(135deg, #0b0b0f 0%, #2a1b3d 50%, #ef6e54 100%)",
      ring: "radial-gradient(circle, rgba(239,110,84,0.8), transparent 60%)",
      glyph: "▣"
    }
  },
  {
    slug: "news-binance-bot",
    title: "News Binance Bot",
    description:
      "Bot tự động pull tin tức listing/announcements từ Binance, push tới Telegram — dùng cho trader bắt kịp listing mới.",
    url: "https://github.com/hieuwb/news-binance-bot",
    displayUrl: "github.com/hieuwb/news-binance-bot",
    kind: "github",
    tags: ["Bot", "Node.js", "Telegram", "CEX"],
    artwork: {
      gradient:
        "linear-gradient(135deg, #1a1308 0%, #3d2f0b 50%, #f0b90b 100%)",
      ring: "radial-gradient(circle, rgba(240,185,11,0.85), transparent 60%)",
      glyph: "◎"
    }
  }
];
