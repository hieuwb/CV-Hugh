import type { SocialKind } from "@/lib/game-content";

// SVG inline cho mọi social/contact. Không phụ thuộc icon font ngoài.
// Tất cả glyph public domain — outline phổ biến, không phải logo bản quyền.

export type IconProps = { size?: number };

export function XLogo({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
    </svg>
  );
}

export function YouTubeLogo({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.51a3 3 0 0 0-2.11-2.12C19.5 3.86 12 3.86 12 3.86s-7.5 0-9.39.53A3 3 0 0 0 .5 6.51 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.49 3 3 0 0 0 2.11 2.12c1.89.53 9.39.53 9.39.53s7.5 0 9.39-.53a3 3 0 0 0 2.11-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.49ZM9.6 15.57V8.43L15.82 12Z" />
    </svg>
  );
}

export function DiscordLogo({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3a14.84 14.84 0 0 0-.671 1.384 18.34 18.34 0 0 0-5.482 0A12.84 12.84 0 0 0 9.73 3a19.74 19.74 0 0 0-3.76 1.369C2.632 9.02 1.673 13.553 2.114 18.022a19.95 19.95 0 0 0 6.073 3.066 14.76 14.76 0 0 0 1.29-2.099 12.94 12.94 0 0 1-2.03-.973c.17-.123.336-.252.497-.385a14.25 14.25 0 0 0 12.114 0c.162.134.328.263.498.385a12.86 12.86 0 0 1-2.034.974 14.74 14.74 0 0 0 1.29 2.099 19.93 19.93 0 0 0 6.076-3.066c.516-5.178-.94-9.671-3.571-13.653ZM8.52 15.333c-1.18 0-2.152-1.094-2.152-2.438 0-1.345.947-2.44 2.152-2.44 1.205 0 2.177 1.095 2.152 2.44 0 1.344-.947 2.438-2.152 2.438Zm7.957 0c-1.18 0-2.152-1.094-2.152-2.438 0-1.345.947-2.44 2.152-2.44 1.205 0 2.177 1.095 2.152 2.44 0 1.344-.947 2.438-2.152 2.438Z" />
    </svg>
  );
}

export function TelegramLogo({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0Zm5.89 8.23-1.97 9.3c-.15.66-.54.82-1.09.51l-3-2.21-1.45 1.4c-.16.16-.3.29-.6.29l.22-3.07 5.6-5.06c.24-.21-.05-.33-.38-.12L7.9 13.46l-3.01-.95c-.65-.2-.67-.66.14-.98l11.76-4.54c.54-.2 1.01.13.84.86Z" />
    </svg>
  );
}

export function GitHubLogo({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.08 1.84 2.82 1.31 3.51 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 0Z" />
    </svg>
  );
}

export function EmailLogo({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-11Zm2.28-.5 7.72 5.79L19.72 6H4.28Zm15.72 1.64-7.28 5.47a1 1 0 0 1-1.44 0L4 7.64V17.5c0 .28.22.5.5.5h15a.5.5 0 0 0 .5-.5V7.64Z" />
    </svg>
  );
}

export function PhoneLogo({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2Z" />
    </svg>
  );
}

export function PinLogo({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

export function EnsLogo({ size = 14 }: IconProps) {
  // Glyph Ξ của Ethereum đơn giản để đại diện ENS.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 5 13l7 4 7-4-7-11Zm0 14-7-4 7 10 7-10-7 4Z" />
    </svg>
  );
}

export function iconFor(kind: SocialKind) {
  const map: Record<SocialKind, (p: IconProps) => JSX.Element> = {
    email: EmailLogo,
    ens: EnsLogo,
    phone: PhoneLogo,
    x: XLogo,
    youtube: YouTubeLogo,
    discord: DiscordLogo,
    telegram: TelegramLogo,
    github: GitHubLogo,
    location: PinLogo
  };
  return map[kind];
}
