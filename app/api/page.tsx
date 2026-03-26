"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { AnimateOnScroll, StaggerChildren } from "@/components/animate-on-scroll";

function CheckIcon({ className = "text-emerald-400" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-800/50">
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
      </div>
      <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

async function handleApiCheckout(openSignup: (role?: any) => void) {
  const res = await fetch("/api/checkout/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: "api_pro" }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else if (data.error === "unauthorized") {
    openSignup("agent");
  }
}

export default function ApiPage() {
  const { openSignup } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-neutral-950" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            The first creator marketplace<br className="hidden sm:block" /> your agent can use
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Search creators, check availability, and place bookings programmatically.
            MCP-native and REST API, built for the agentic era.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleApiCheckout(openSignup)}
              className="px-8 py-3.5 text-base font-medium text-neutral-900 bg-white rounded-full hover:bg-neutral-100 transition-colors shadow-lg shadow-white/10 w-full sm:w-auto"
            >
              Get API Access
            </button>
            <a
              href="#docs"
              className="px-8 py-3.5 text-base font-medium text-neutral-300 bg-transparent rounded-full border border-neutral-700 hover:border-neutral-500 transition-all w-full sm:w-auto text-center"
            >
              Read the Docs
            </a>
          </div>
        </div>
      </section>

      {/* MCP Section */}
      <AnimateOnScroll as="section" className="border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
                Model Context Protocol
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-6">
                Native MCP support
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                Your AI agent can discover and book creators natively through MCP.
                Compatible with Claude, GPT, and any MCP-enabled agent.
              </p>
              <div className="text-sm font-medium text-neutral-300 mb-3">Setup</div>
              <p className="text-neutral-400 text-sm mb-4">
                Add HireACreator to your MCP configuration:
              </p>
            </div>
            <div className="space-y-4">
              <CodeBlock>
                <div className="text-neutral-500">{"// Install the MCP server"}</div>
                <div className="text-neutral-300">npm install @hireacreator/mcp-server</div>
              </CodeBlock>
              <CodeBlock>
                <div className="text-neutral-500">{"// claude_desktop_config.json"}</div>
                <div className="text-neutral-300">{"{"}</div>
                <div className="text-neutral-300 pl-4">{'"mcpServers": {'}</div>
                <div className="text-neutral-300 pl-8">{'"hireacreator": {'}</div>
                <div className="text-neutral-300 pl-12">{'"command": "npx",'}</div>
                <div className="text-neutral-300 pl-12">{'"args": ['}</div>
                <div className="text-emerald-400 pl-16">{'"@hireacreator/mcp-server"'}</div>
                <div className="text-neutral-300 pl-12">{'],'}</div>
                <div className="text-neutral-300 pl-12">{'"env": {'}</div>
                <div className="text-neutral-300 pl-16">{'"HIREACREATOR_API_KEY": '}<span className="text-amber-400">{'"your-api-key"'}</span></div>
                <div className="text-neutral-300 pl-12">{"}"}</div>
                <div className="text-neutral-300 pl-8">{"}"}</div>
                <div className="text-neutral-300 pl-4">{"}"}</div>
                <div className="text-neutral-300">{"}"}</div>
              </CodeBlock>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* MCP Tools */}
      <section className="border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <h2 className="font-display text-2xl font-bold mb-10">Available MCP Tools</h2>
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerMs={100}>
            {[
              { name: "search_creators", desc: "Search and filter creators by niche, rate, location, platform, and engagement." },
              { name: "get_creator", desc: "Get full profile details including portfolio, services, reviews, and availability." },
              { name: "book_service", desc: "Book a creator's service with brief, budget, and timeline. Creates secure payment." },
              { name: "check_booking", desc: "Check the status of an existing booking. Track deliverables and milestones." },
              { name: "list_bookings", desc: "List all bookings for your account with filtering by status and date." },
            ].map((tool) => (
              <div key={tool.name} className="aos-stagger-item bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
                <code className="text-sm font-mono text-emerald-400">{tool.name}</code>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* REST API Section */}
      <AnimateOnScroll as="section" id="docs" className="border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
                REST API
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-6">
                Full programmatic access
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                Standard REST endpoints with JSON responses. Search, filter, book, and manage
                campaigns from any language or framework.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">GET</span>
                  <code className="text-neutral-300">/v1/creators</code>
                  <span className="text-neutral-500">Search creators</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">GET</span>
                  <code className="text-neutral-300">/v1/creators/:id</code>
                  <span className="text-neutral-500">Get creator details</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-medium">POST</span>
                  <code className="text-neutral-300">/v1/bookings</code>
                  <span className="text-neutral-500">Create booking</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">GET</span>
                  <code className="text-neutral-300">/v1/bookings/:id</code>
                  <span className="text-neutral-500">Get booking status</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">GET</span>
                  <code className="text-neutral-300">/v1/bookings</code>
                  <span className="text-neutral-500">List bookings</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <CodeBlock>
                <div className="text-neutral-500">{"// Search for UGC creators under $2k"}</div>
                <div><span className="text-emerald-400">GET</span> <span className="text-neutral-300">/v1/creators</span></div>
                <div className="text-neutral-500 mb-4">{"  ?category=ugc&max_rate=2000"}</div>
                <div className="text-neutral-500">{"// Response"}</div>
                <div className="text-neutral-300">{"{"}</div>
                <div className="text-neutral-300 pl-4">{'"data": ['}</div>
                <div className="text-neutral-300 pl-8">{"{"}</div>
                <div className="text-neutral-300 pl-12">{'"id": "cr_abc123",'}</div>
                <div className="text-neutral-300 pl-12">{'"name": "Sarah Chen",'}</div>
                <div className="text-neutral-300 pl-12">{'"category": "UGC Creator",'}</div>
                <div className="text-neutral-300 pl-12">{'"hourly_rate": 150,'}</div>
                <div className="text-neutral-300 pl-12">{'"rating": 4.9,'}</div>
                <div className="text-neutral-300 pl-12">{'"verified": true'}</div>
                <div className="text-neutral-300 pl-8">{"}"}</div>
                <div className="text-neutral-300 pl-4">{"],"}</div>
                <div className="text-neutral-300 pl-4">{'"total": 47'}</div>
                <div className="text-neutral-300">{"}"}</div>
              </CodeBlock>
              <CodeBlock>
                <div className="text-neutral-500">{"// Book a service"}</div>
                <div><span className="text-amber-400">POST</span> <span className="text-neutral-300">/v1/bookings</span></div>
                <div className="text-neutral-300 mt-2">{"{"}</div>
                <div className="text-neutral-300 pl-4">{'"service_id": "svc_xyz789",'}</div>
                <div className="text-neutral-300 pl-4">{'"brief": "30s product video for...",'}</div>
                <div className="text-neutral-300 pl-4">{'"budget": 1200'}</div>
                <div className="text-neutral-300">{"}"}</div>
              </CodeBlock>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Machine Payments Protocol */}
      <AnimateOnScroll as="section" className="border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
                Machine Payments Protocol
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-6">
                Agent-to-agent payments
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                Let your AI agent pay for creator services programmatically using Stripe&apos;s
                Machine Payments Protocol. Supports both card and stablecoin (crypto) payments.
              </p>
              <div className="text-sm font-medium text-neutral-300 mb-3">How it works</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium">1</span>
                  <span className="text-neutral-400">Search creators via REST API or MCP</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium">2</span>
                  <span className="text-neutral-400">POST /api/agent/pay with creator &amp; service ID</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium">3</span>
                  <span className="text-neutral-400">Confirm payment (card via client_secret, or deposit stablecoins)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium">4</span>
                  <span className="text-neutral-400">POST /api/agent/book to confirm the booking</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">GET</span>
                  <code className="text-neutral-300">/api/agent/mpp-info</code>
                  <span className="text-neutral-500">MPP discovery</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-medium">POST</span>
                  <code className="text-neutral-300">/api/agent/pay</code>
                  <span className="text-neutral-500">Create payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-medium">POST</span>
                  <code className="text-neutral-300">/api/agent/book</code>
                  <span className="text-neutral-500">Confirm booking</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <CodeBlock>
                <div className="text-neutral-500">{"// Step 1: Create payment (card)"}</div>
                <div><span className="text-amber-400">POST</span> <span className="text-neutral-300">/api/agent/pay</span></div>
                <div className="text-neutral-300 mt-2">{"{"}</div>
                <div className="text-neutral-300 pl-4">{'"creatorId": "cr_abc123",'}</div>
                <div className="text-neutral-300 pl-4">{'"serviceId": "svc_xyz789",'}</div>
                <div className="text-neutral-300 pl-4">{'"paymentMethod": "card",'}</div>
                <div className="text-neutral-300 pl-4">{'"brief": "30s product video"'}</div>
                <div className="text-neutral-300">{"}"}</div>
                <div className="mt-4 text-neutral-500">{"// Response"}</div>
                <div className="text-neutral-300">{"{"}</div>
                <div className="text-neutral-300 pl-4">{'"payment": {'}</div>
                <div className="text-neutral-300 pl-8">{'"payment_intent_id": "pi_...",'}</div>
                <div className="text-neutral-300 pl-8">{'"client_secret": "pi_..._secret_...",'}</div>
                <div className="text-neutral-300 pl-8">{'"amount": 120000,'}</div>
                <div className="text-neutral-300 pl-8">{'"currency": "aud"'}</div>
                <div className="text-neutral-300 pl-4">{"}"}</div>
                <div className="text-neutral-300">{"}"}</div>
              </CodeBlock>
              <CodeBlock>
                <div className="text-neutral-500">{"// Step 1 (crypto alternative)"}</div>
                <div><span className="text-amber-400">POST</span> <span className="text-neutral-300">/api/agent/pay</span></div>
                <div className="text-neutral-300 mt-2">{"{"}</div>
                <div className="text-neutral-300 pl-4">{'"creatorId": "cr_abc123",'}</div>
                <div className="text-neutral-300 pl-4">{'"serviceId": "svc_xyz789",'}</div>
                <div className="text-emerald-400 pl-4">{'"paymentMethod": "crypto"'}</div>
                <div className="text-neutral-300">{"}"}</div>
              </CodeBlock>
              <CodeBlock>
                <div className="text-neutral-500">{"// Step 2: Confirm booking after payment"}</div>
                <div><span className="text-amber-400">POST</span> <span className="text-neutral-300">/api/agent/book</span></div>
                <div className="text-neutral-300 mt-2">{"{"}</div>
                <div className="text-neutral-300 pl-4">{'"creatorId": "cr_abc123",'}</div>
                <div className="text-neutral-300 pl-4">{'"serviceId": "svc_xyz789",'}</div>
                <div className="text-neutral-300 pl-4">{'"paymentIntentId": "pi_...",'}</div>
                <div className="text-neutral-300 pl-4">{'"date": "2025-02-15"'}</div>
                <div className="text-neutral-300">{"}"}</div>
              </CodeBlock>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Authentication */}
      <AnimateOnScroll as="section" className="border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <h2 className="font-display text-2xl font-bold mb-6">Authentication</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                All API requests require authentication via API key or OAuth2 bearer token.
                Include your key in the Authorization header.
              </p>
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-neutral-200 mb-1">API Keys</div>
                  <p className="text-sm text-neutral-400">
                    Generate API keys from your dashboard. Keys are scoped to your account
                    and can be revoked at any time.
                  </p>
                </div>
                <div>
                  <div className="font-medium text-neutral-200 mb-1">OAuth2</div>
                  <p className="text-sm text-neutral-400">
                    For apps that act on behalf of users, use OAuth2 authorization code flow.
                    Supports PKCE for public clients.
                  </p>
                </div>
              </div>
            </div>
            <CodeBlock>
              <div className="text-neutral-500">{"// API Key authentication"}</div>
              <div className="text-neutral-300">curl https://api.hireacreator.ai/v1/creators \</div>
              <div className="text-neutral-300 pl-4">-H {'"Authorization: Bearer '}<span className="text-amber-400">hca_your_api_key</span>{'"'}</div>
              <div className="mt-4 text-neutral-500">{"// OAuth2 bearer token"}</div>
              <div className="text-neutral-300">curl https://api.hireacreator.ai/v1/creators \</div>
              <div className="text-neutral-300 pl-4">-H {'"Authorization: Bearer '}<span className="text-amber-400">eyJhbGciOi...</span>{'"'}</div>
            </CodeBlock>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Rate Limits */}
      <section className="border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <h2 className="font-display text-2xl font-bold mb-10">Rate Limits</h2>
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerMs={100}>
            <div className="aos-stagger-item bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
              <div className="text-sm text-neutral-500 mb-2">Read endpoints</div>
              <div className="font-display text-2xl font-bold">1,000</div>
              <div className="text-sm text-neutral-500">requests / minute</div>
            </div>
            <div className="aos-stagger-item bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
              <div className="text-sm text-neutral-500 mb-2">Write endpoints</div>
              <div className="font-display text-2xl font-bold">100</div>
              <div className="text-sm text-neutral-500">requests / minute</div>
            </div>
            <div className="aos-stagger-item bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
              <div className="text-sm text-neutral-500 mb-2">MCP tools</div>
              <div className="font-display text-2xl font-bold">500</div>
              <div className="text-sm text-neutral-500">calls / minute</div>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <h2 className="font-display text-3xl font-bold mb-4 text-center">API Pricing</h2>
          <p className="text-neutral-400 text-center mb-14 max-w-xl mx-auto">
            Start free, scale when you need to.
          </p>
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto" staggerMs={150}>
            <div className="aos-stagger-item bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Free</div>
              <div className="font-display text-3xl font-bold mb-1">$0</div>
              <div className="text-sm text-neutral-500 mb-6">per month</div>
              <ul className="space-y-3">
                {["100 requests/day", "Read-only access", "Community support"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-neutral-400">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="aos-stagger-item bg-neutral-900 rounded-2xl p-8 border border-neutral-700 ring-1 ring-neutral-700">
              <div className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-2">Pro</div>
              <div className="font-display text-3xl font-bold mb-1">$49</div>
              <div className="text-sm text-neutral-500 mb-6">per month</div>
              <ul className="space-y-3">
                {["10,000 requests/day", "Full read + write access", "MCP server access", "Priority support"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-neutral-400">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="aos-stagger-item bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Enterprise</div>
              <div className="font-display text-3xl font-bold mb-1">Custom</div>
              <div className="text-sm text-neutral-500 mb-6">contact us</div>
              <ul className="space-y-3">
                {["Unlimited requests", "Dedicated infrastructure", "Custom integrations", "Priority support with response time commitments", "Dedicated support"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-neutral-400">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* Final CTA */}
      <AnimateOnScroll as="section" className="border-t border-neutral-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Start building today
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
            Get your API key and start searching creators in minutes.
            Free tier available, no credit card required.
          </p>
          <button
            onClick={() => handleApiCheckout(openSignup)}
            className="px-8 py-3.5 text-base font-medium text-neutral-900 bg-white rounded-full hover:bg-neutral-100 transition-colors shadow-lg shadow-white/10"
          >
            Get API Access
          </button>
        </div>
      </AnimateOnScroll>

      <Footer />
    </div>
  );
}
