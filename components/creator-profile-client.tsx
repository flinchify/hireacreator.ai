"use client";

import { useAuth } from "./auth-context";
import { Button } from "./ui/button";

// Hero action buttons — conditional on services, messages, auth
export function CreatorHeroActions({
  hasServices,
  allowMessages,
  creatorName,
  creatorId,
}: {
  hasServices: boolean;
  allowMessages: boolean;
  creatorName: string;
  creatorId: string;
}) {
  const { user, openLogin } = useAuth();

  if (!hasServices && !allowMessages) return null;

  function handleBook() {
    if (!user) {
      openLogin();
      return;
    }
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleMessage() {
    if (!user) {
      openLogin();
      return;
    }
    // Send an initial message to create/open the conversation, then redirect
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: creatorId, content: `Hi ${creatorName.split(" ")[0]}, I'd like to connect with you.` }),
    });
    const data = await res.json();
    if (data.error === "age_verification_required") {
      window.location.href = "/messages";
      return;
    }
    if (data.conversationId) {
      window.location.href = "/messages";
    } else if (data.error) {
      alert(data.message || "Could not start conversation.");
    }
  }

  return (
    <div className="mt-4 sm:mt-0 sm:pb-2 flex gap-3">
      {hasServices && (
        <Button size="lg" className="shadow-lg shadow-neutral-900/20 hover:scale-105 transition-transform" onClick={handleBook}>
          Book Now
        </Button>
      )}
      {allowMessages && (
        <Button variant="outline" size="lg" className="hover:scale-105 transition-transform" onClick={handleMessage}>
          Message
        </Button>
      )}
    </div>
  );
}

// Service card book/contact button — auth-gated
export function ServiceAction({ serviceId, price, creatorId }: { serviceId: string; price: number; creatorId?: string }) {
  const { user, openLogin } = useAuth();

  async function handleBook() {
    if (!user) {
      openLogin();
      return;
    }

    if (price === 0 && creatorId) {
      window.location.href = "/messages";
      return;
    }

    const res = await fetch("/api/checkout/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.error === "unauthorized") {
      openLogin();
    } else if (data.error) {
      alert(data.message || "Something went wrong.");
    }
  }

  return (
    <Button
      onClick={handleBook}
      className="w-full mt-3 hover:scale-[1.02] transition-transform"
      size="sm"
    >
      {price === 0 ? "Contact Creator" : `Book — $${price.toLocaleString()}`}
    </Button>
  );
}

// Contact button when no services listed but messages allowed
export function ContactCreatorButton({ creatorName, creatorId, allowMessages }: { creatorName: string; creatorId: string; allowMessages: boolean }) {
  const { user, openLogin } = useAuth();

  if (!allowMessages) return null;

  async function handleContact() {
    if (!user) {
      openLogin();
      return;
    }
    window.location.href = "/messages";
  }

  return (
    <Button onClick={handleContact} variant="outline" className="w-full" size="sm">
      Message {creatorName.split(" ")[0]}
    </Button>
  );
}

// 18+ content warning overlay
export function AgeWarningOverlay({ creatorName, onAccept }: { creatorName: string; onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-black text-amber-600">18+</span>
        </div>
        <h2 className="text-lg font-bold text-neutral-900 mb-2">Mature Content Warning</h2>
        <p className="text-sm text-neutral-500 mb-6">
          {creatorName} has indicated their profile may contain content or links 
          not intended for users under 18. By continuing, you confirm you are 18 
          years or older.
        </p>
        <div className="flex gap-3">
          <a href="/" className="flex-1 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-full text-center hover:bg-neutral-200">Go Back</a>
          <button onClick={onAccept} className="flex-1 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800">
            I am 18+, Continue
          </button>
        </div>
      </div>
    </div>
  );
}
