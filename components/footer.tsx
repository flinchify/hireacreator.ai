import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Platform: [
    { label: "Browse Creators", href: "/browse" },
    { label: "Pricing", href: "/pricing" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "API Docs", href: "/api" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "For Brands", href: "/for-brands" },
    { label: "For Creators", href: "/for-creators" },
    { label: "About", href: "/about" },
  ],
  Legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
  Connect: [
    {
      label: "X (Twitter)",
      href: "https://x.com/hireacreatorAI",
      external: true,
    },
    {
      label: "hello@hireacreator.ai",
      href: "mailto:hello@hireacreator.ai",
      external: true,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Logo + tagline */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Image
              src="/logo-512.png"
              alt="H"
              width={32}
              height={32}
              className="w-8 h-8 invert"
            />
            <span className="font-display font-bold text-lg">
              HireACreator
            </span>
          </div>
          <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
            The premium marketplace connecting brands with world-class creators.
          </p>
        </div>

        {/* 4-column link grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} HireACreator.ai. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
