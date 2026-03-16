"use client";

import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  TwitterIcon,
  LinkedInIcon,
  TwitchIcon,
  SpotifyIcon,
  PinterestIcon,
  FacebookIcon,
  SnapchatIcon,
  DiscordIcon,
  DribbbleIcon,
  BehanceIcon,
  GitHubIcon,
} from "@/components/icons/platforms";

const row1 = [
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  TwitterIcon,
  LinkedInIcon,
  TwitchIcon,
  SpotifyIcon,
  PinterestIcon,
  FacebookIcon,
  SnapchatIcon,
  DiscordIcon,
  DribbbleIcon,
  BehanceIcon,
  GitHubIcon,
];

const row2 = [
  GitHubIcon,
  BehanceIcon,
  DribbbleIcon,
  DiscordIcon,
  SnapchatIcon,
  FacebookIcon,
  PinterestIcon,
  SpotifyIcon,
  TwitchIcon,
  LinkedInIcon,
  TwitterIcon,
  YouTubeIcon,
  TikTokIcon,
  InstagramIcon,
];

function TickerRow({
  icons,
  direction = "left",
}: {
  icons: typeof row1;
  direction?: "left" | "right";
}) {
  const items = [...icons, ...icons];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />

      <div
        className={`flex items-center gap-10 sm:gap-14 ${
          direction === "left" ? "animate-ticker-left" : "animate-ticker-right"
        }`}
        style={{ width: "max-content" }}
      >
        {items.map((Icon, i) => (
          <div key={i} className="shrink-0">
            <Icon size={36} className="text-neutral-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformTicker() {
  return (
    <div className="space-y-6 py-2">
      <TickerRow icons={row1} direction="left" />
      <TickerRow icons={row2} direction="right" />
    </div>
  );
}
