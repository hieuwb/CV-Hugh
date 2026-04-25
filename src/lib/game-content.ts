// Layout mới: 6 cung đường toả ra từ roundabout trung tâm (có tượng Hugh).
// 5 landmark chính + 1 cung dành cho bến liên hệ (7 stops thẳng hàng).

import { PROJECTS, type ProjectItem } from "./projects";

export type LandmarkKind =
  | "hero"
  | "story"
  | "journey"
  | "skills"
  | "projects"
  | "contact";

export type SocialKind =
  | "email"
  | "ens"
  | "phone"
  | "x"
  | "youtube"
  | "discord"
  | "telegram"
  | "github"
  | "location";

export type ContactLink = {
  kind: SocialKind;
  label: string;
  href?: string;
  accent: string;
};

export type Landmark = {
  id: string;
  kind: LandmarkKind;
  title: string;
  subtitle?: string;
  position: [number, number];
  radius: number;
  accent: string;
  body?: string;
  bullets?: string[];
  links?: ContactLink[];
  ctaLabel?: string;
  ctaHref?: string;
  socialKind?: SocialKind;
};

// ---------------------------------------------------------------------
// TOPOLOGY: roundabout ở tâm (0,0), 6 arm toả 60° từng cái.
// Arms mapping (góc tính từ +X CCW, +Z flip để "lên" màn hình là -Z):
//   - 0°   east    → Skills
//   - 60°  NE      → Journey
//   - 120° NW      → Story
//   - 180° west    → CV PDF
//   - 240° SW      → Contact village (7 stops thẳng hàng)
//   - 300° SE      → Projects hub
// ---------------------------------------------------------------------

export const ROUNDABOUT_RADIUS_OUTER = 15;
export const ROUNDABOUT_RADIUS_INNER = 7;
export const ROAD_WIDTH = 8;
export const ARM_LENGTH = 70; // road từ r=15 đến r=85 (nối vào ring)
export const LANDMARK_RADIUS = 55; // landmark midway trên arm

// Ring road bao quanh: tâm ring ở r = outer_roundabout + arm_length = 85
export const RING_CENTER_RADIUS =
  ROUNDABOUT_RADIUS_OUTER + ARM_LENGTH; // 85
export const RING_INNER_RADIUS = RING_CENTER_RADIUS - ROAD_WIDTH / 2; // 81
export const RING_OUTER_RADIUS = RING_CENTER_RADIUS + ROAD_WIDTH / 2; // 89

// Terrain island shrink: vừa đủ chứa ring + lề. Ngoài là beach → water.
export const TERRAIN_RADIUS_V2 = RING_OUTER_RADIUS + 8; // 97

// Kerb (bó vỉa): dải bê tông phân cách road và vỉa hè
export const KERB_WIDTH = 0.35;
export const KERB_HEIGHT = 0.18;
// Post-apoc weathered concrete — xám rêu thay vì cream sạch
export const KERB_COLOR = "#5e574c";
export const ASPHALT_COLOR = "#2e2c33";

// Helpers chuyển góc → toạ độ world (x, z) trên mặt đất
function toPos(angleDeg: number, r: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [Math.cos(rad) * r, -Math.sin(rad) * r];
}

// Vector đơn vị theo 1 arm (x, z)
export function armDirection(angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [Math.cos(rad), -Math.sin(rad)];
}

export const ARM_ANGLES = {
  skills: 0,
  journey: 60,
  story: 120,
  cv: 180,
  contact: 240,
  projects: 300
} as const;

// Export arm list cho ground / minimap vẽ roads
export const ALL_ARM_ANGLES = [0, 60, 120, 180, 240, 300];

// ---------------------------------------------------------------------
// Contact village: 7 stops thẳng hàng dọc arm 240° (SW).
// Bắt đầu từ r=22 (ngay sau roundabout), spacing 10 đến r=82.
// ---------------------------------------------------------------------
export const CONTACT_ARM_ANGLE = ARM_ANGLES.contact;
export const CONTACT_STOP_START_R = 22;
export const CONTACT_STOP_SPACING = 10;
export const NUM_CONTACT_STOPS = 7;

// ---------------------------------------------------------------------
// LANDMARKS CHÍNH
// ---------------------------------------------------------------------
export const LANDMARKS: Landmark[] = [
  {
    id: "hero",
    kind: "hero",
    title: "Phan Minh Hiếu",
    subtitle: "pmhieu111.eth · Hugh",
    body:
      "Chào — đây là Hugh. Roundabout trung tâm này là nơi 6 con đường gặp " +
      "nhau. Lái theo bất kỳ con đường nào để khám phá 1 phần câu chuyện — " +
      "kỹ năng, hành trình, giới thiệu, CV, dự án hay bến liên hệ.",
    position: [0, 0],
    radius: 3.5,
    accent: "#ffd479"
  },
  {
    id: "skills",
    kind: "skills",
    title: "Kỹ năng",
    subtitle: "Hai bộ công cụ, một người cầm",
    bullets: [
      "🦺 Xây dựng: AutoCAD · Revit · Civil 3D · Shop drawing · Lisp",
      "🖥️ Web3/Dev: TypeScript · Next.js 14 · viem/Wagmi · Supabase · Solidity · AI vibe coding"
    ],
    position: toPos(ARM_ANGLES.skills, LANDMARK_RADIUS),
    radius: 3.2,
    accent: "#72d9ff"
  },
  {
    id: "journey",
    kind: "journey",
    title: "Hành trình",
    subtitle: "Mười năm, hai ngành",
    bullets: [
      "2016 – 2021 · ĐH Kinh Tế – KT Bình Dương · Kỹ thuật Xây dựng",
      "2021 – 2025 · Kỹ sư Xây dựng @ Công ty TNHH Vận Tải Đại Nam",
      "2021 – 2025 · Shop drawing · Novaworld Hồ Tràm (Novaland)",
      "2023 · Pivot: Lisp → lập trình → Web3",
      "2024 – nay · Web3 dev độc lập · dApp · tool · bot",
      "2025 – nay · AI × AutoCAD — ra lệnh bằng prompt"
    ],
    position: toPos(ARM_ANGLES.journey, LANDMARK_RADIUS),
    radius: 3.2,
    accent: "#c28bff"
  },
  {
    id: "story",
    kind: "story",
    title: "Giới thiệu",
    subtitle: "Từ công trường đến on-chain",
    body:
      "Tốt nghiệp kỹ thuật xây dựng 2021. Bốn năm shop drawing & hồ sơ chất " +
      "lượng cho Novaworld Hồ Tràm (Novaland). COVID 2023 là bước ngoặt: Lisp " +
      "tự động hoá AutoCAD kéo mình vào lập trình, rồi chạm Web3. Giờ build " +
      "dApp, bot, tool — và nghiên cứu cách AI ra lệnh trực tiếp cho bản vẽ.",
    position: toPos(ARM_ANGLES.story, LANDMARK_RADIUS),
    radius: 3.2,
    accent: "#ff7b4a"
  },
  {
    id: "cv",
    kind: "contact",
    title: "CV PDF",
    subtitle: "Bản in truyền thống",
    body:
      "Nếu bạn cần CV dạng PDF để gửi HR hoặc in giấy, bản tĩnh vẫn có sẵn.",
    ctaLabel: "Mở CV PDF",
    ctaHref: "/cv",
    position: toPos(ARM_ANGLES.cv, LANDMARK_RADIUS),
    radius: 3.2,
    accent: "#9cff9c"
  },
  {
    id: "projects-hub",
    kind: "projects",
    title: "Dự án",
    subtitle: "Những thứ đã ship",
    body:
      "5 trụ quanh đây là các dự án đã ship. Lái sát từng trụ để xem chi tiết và mở link.",
    position: toPos(ARM_ANGLES.projects, LANDMARK_RADIUS),
    radius: 3.2,
    accent: "#ffb347"
  }
];

// ---------------------------------------------------------------------
// Contact stops: 7 bến trải dọc arm 240° (SW)
// ---------------------------------------------------------------------
type StopSpec = {
  kind: SocialKind;
  title: string;
  subtitle: string;
  body: string;
  href?: string;
  handle: string;
  accent: string;
  ctaLabel?: string;
};

const STOPS: StopSpec[] = [
  {
    kind: "email",
    title: "Email",
    subtitle: "Kênh trả lời nhanh nhất",
    handle: "pmhieu111@gmail.com",
    body: "Cần hợp tác hay hỏi chi tiết? Email là nơi mình trả lời nhanh nhất — trong 24h.",
    href: "mailto:pmhieu111@gmail.com",
    accent: "#ff7a7a",
    ctaLabel: "Soạn email"
  },
  {
    kind: "ens",
    title: "ENS",
    subtitle: "pmhieu111.eth",
    handle: "pmhieu111.eth",
    body: "Định danh Web3 của Hugh — resolve sang địa chỉ chính, tiện gửi on-chain.",
    href: "https://app.ens.domains/pmhieu111.eth",
    accent: "#72d9ff",
    ctaLabel: "Mở trên ENS"
  },
  {
    kind: "x",
    title: "X (Twitter)",
    subtitle: "@Hugh_0x",
    handle: "@Hugh_0x",
    body: "Mình ở đây chia sẻ hành trình build, screenshot dApp và vibes airdrop.",
    href: "https://x.com/Hugh_0x",
    accent: "#e7e9ea",
    ctaLabel: "Theo dõi X"
  },
  {
    kind: "github",
    title: "GitHub",
    subtitle: "github.com/hieuwb",
    handle: "hieuwb",
    body: "Source code các tool, dApp, bot mình ship.",
    href: "https://github.com/hieuwb",
    accent: "#c9d1d9",
    ctaLabel: "Xem GitHub"
  },
  {
    kind: "telegram",
    title: "Telegram",
    subtitle: "t.me/zminhhieu",
    handle: "t.me/zminhhieu",
    body: "Nhắn trực tiếp cho nhanh — mình trả lời trong ngày.",
    href: "https://t.me/zminhhieu",
    accent: "#2aabee",
    ctaLabel: "Nhắn Telegram"
  },
  {
    kind: "youtube",
    title: "YouTube",
    subtitle: "@HughanimePets",
    handle: "@HughanimePets",
    body: "Ngoài code, mình còn làm channel về thú cưng & anime.",
    href: "https://www.youtube.com/@HughanimePets",
    accent: "#ff4040",
    ctaLabel: "Mở YouTube"
  },
  {
    kind: "discord",
    title: "Discord",
    subtitle: "hieuwb",
    handle: "hieuwb",
    body: "Kết bạn trên Discord tên `hieuwb`. Không có deep link — copy handle.",
    accent: "#7289da"
  }
];

export const CONTACT_STOPS: Landmark[] = STOPS.map((s, i) => {
  const r = CONTACT_STOP_START_R + i * CONTACT_STOP_SPACING;
  const [dirX, dirZ] = armDirection(CONTACT_ARM_ANGLE);
  // Perpendicular: rotate 90° CCW
  const perpX = -dirZ;
  const perpZ = dirX;
  // Tất cả nằm cùng bên TRÁI driver perspective (perp- = left khi đi outward)
  const side = -3.2;
  const x = dirX * r + perpX * side;
  const z = dirZ * r + perpZ * side;
  return {
    id: `contact-${s.kind}`,
    kind: "contact",
    title: s.title,
    subtitle: s.subtitle,
    body: s.body,
    position: [x, z],
    radius: 2.8,
    accent: s.accent,
    socialKind: s.kind,
    ctaLabel: s.ctaLabel,
    ctaHref: s.href,
    links: [{ kind: s.kind, label: s.handle, href: s.href, accent: s.accent }]
  };
});

// ---------------------------------------------------------------------
// PROJECT PILLARS — xếp dọc arm 300° (tương tự contact stops trên arm 240°),
// với perp ±3.2 xen kẽ. Bỏ hub ở r=55 (đó là projects-hub landmark).
// ---------------------------------------------------------------------
export type ProjectPillar = Landmark & {
  project: ProjectItem;
};

const orderedProjects = [
  ...PROJECTS.filter((x) => !x.featured),
  ...PROJECTS.filter((x) => x.featured)
];

// 5 vị trí dọc arm 300°, tránh r=55 (hub)
const PROJECT_PILLAR_RADII = [22, 32, 42, 67, 78];

export const PROJECT_PILLARS: ProjectPillar[] = PROJECTS.map((p) => {
  const index = orderedProjects.indexOf(p);
  const armDeg = ARM_ANGLES.projects;
  const armRad = (armDeg * Math.PI) / 180;
  const dirX = Math.cos(armRad);
  const dirZ = -Math.sin(armRad);
  const perpX = -dirZ;
  const perpZ = dirX;
  const r = PROJECT_PILLAR_RADII[index % PROJECT_PILLAR_RADII.length];
  // Tất cả nằm cùng bên TRÁI driver — đồng nhất với contact stops
  const side = -3.2;
  const x = dirX * r + perpX * side;
  const z = dirZ * r + perpZ * side;
  return {
    id: `proj-${p.slug}`,
    kind: "projects" as const,
    title: p.title,
    subtitle: p.displayUrl,
    body: p.description,
    bullets: p.tags.map((t) => `· ${t}`),
    ctaLabel: p.kind === "github" ? "Mở GitHub" : "Mở demo",
    ctaHref: p.url,
    position: [x, z],
    radius: 2.5,
    accent: p.artwork.ring.match(/#[0-9a-f]+/i)?.[0] ?? "#f4c26b",
    project: p
  };
});

export const ALL_LANDMARKS: Landmark[] = [
  ...LANDMARKS,
  ...CONTACT_STOPS,
  ...PROJECT_PILLARS
];
