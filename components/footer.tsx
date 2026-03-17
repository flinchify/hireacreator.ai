import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Platform: [
    { label: "Browse Creators", href: "/browse" },
    { label: "For Brands", href: "/for-brands" },
    { label: "For Creators", href: "/for-creators" },
    { label: "Pricing", href: "/pricing" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "API Docs", href: "/api" },
    { label: "Compare", href: "/compare" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo-512.png"
                alt="H"
                width={32}
                height={32}
                className="w-8 h-8 invert"
              />
              <span className="font-display font-bold text-lg text-white">
                HireACreator
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              The premium marketplace connecting brands with world-class creators.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} HireACreator.ai. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://x.com/hireacreatorAI" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors" aria-label="X (Twitter)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
