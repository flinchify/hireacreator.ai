"use client";

import { Button } from "@/components/ui/button";

export function CreatorProfileClient({ serviceId, price }: { serviceId: string; price: number }) {
  async function handleBook() {
    const res = await fetch("/api/checkout/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.error === "unauthorized") {
      // TODO: open auth modal
      alert("Please sign in to book a service.");
    } else if (data.error === "free_service") {
      alert("This is a sponsorship listing. Contact the creator directly.");
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
      {price === 0 ? "Contact for Sponsorship" : "Book This Service"}
    </Button>
  );
}
