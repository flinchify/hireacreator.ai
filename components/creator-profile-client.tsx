"use client";

import { useAuth } from "./auth-context";
import { Button } from "./ui/button";

// Hero action buttons — conditional on services, messages, auth
export function CreatorHeroActions({
  hasServices,
  allowMessages,
  creatorName,
}: {
  hasServices: boolean;
  allowMessages: boolean;
  creatorName: string;
}) {
  const { user, openLogin } = useAuth();

  if (!hasServices && !allowMessages) return null;

  function handleBook() {
    if (!user) {
      openLogin();
      return;
    }
    // Scroll to services section
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleMessage() {
    if (!user) {
      openLogin();
      return;
    }
    // TODO: open message modal
    alert(`Messaging ${creatorName} — coming soon.`);
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
          Contact
        </Button>
      )}
    </div>
  );
}

// Service card book/contact button — auth-gated
export function ServiceAction({ serviceId, price }: { serviceId: string; price: number }) {
  const { user, openLogin } = useAuth();

  async function handleBook() {
    if (!user) {
      openLogin();
      return;
    }

    if (price === 0) {
      // Open to offers = contact flow
      alert("Direct messaging coming soon. The creator will be notified of your interest.");
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
export function ContactCreatorButton({ creatorName, allowMessages }: { creatorName: string; allowMessages: boolean }) {
  const { user, openLogin } = useAuth();

  if (!allowMessages) return null;

  function handleContact() {
    if (!user) {
      openLogin();
      return;
    }
    alert(`Messaging ${creatorName} — coming soon.`);
  }

  return (
    <Button onClick={handleContact} variant="outline" className="w-full" size="sm">
      Contact {creatorName.split(" ")[0]}
    </Button>
  );
}
