"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

function StarButton({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-0.5 transition-transform hover:scale-110 active:scale-95">
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
        className={filled ? "text-amber-400" : "text-neutral-300 hover:text-amber-300"}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  );
}

export function ReviewSection({ creatorId, creatorName }: { creatorId: string; creatorName: string }) {
  const { user } = useAuth();
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedBooking, setSelectedBooking] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    // Fetch user's completed bookings with this creator that haven't been reviewed
    fetch(`/api/reviews/eligible?creatorId=${creatorId}`)
      .then(r => r.json())
      .then(data => {
        setCompletedBookings(data.bookings || []);
        if (data.bookings?.length === 1) setSelectedBooking(data.bookings[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, creatorId]);

  async function submit() {
    if (!selectedBooking || rating === 0) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: selectedBooking, rating, comment }),
    });
    const data = await res.json();
    if (data.id) {
      setSubmitted(true);
    } else {
      setError(data.message || "Failed to submit review.");
    }
    setSubmitting(false);
  }

  // Don't show if not logged in, still loading, or no eligible bookings
  if (!user || loading || completedBookings.length === 0) return null;

  if (submitted) {
    return (
      <Card className="p-6 text-center bg-emerald-50 border-emerald-200">
        <div className="text-2xl mb-2">&#10003;</div>
        <p className="font-medium text-emerald-800">Review submitted! Thank you.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-display font-semibold text-neutral-900 mb-3">Leave a Review</h3>
      <p className="text-xs text-neutral-500 mb-4">Share your experience working with {creatorName}.</p>

      {completedBookings.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Which booking?</label>
          <select
            value={selectedBooking}
            onChange={e => setSelectedBooking(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
          >
            <option value="">Select a booking...</option>
            {completedBookings.map((b: any) => (
              <option key={b.id} value={b.id}>{b.serviceTitle} — {new Date(b.completedAt).toLocaleDateString()}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Rating</label>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(n => (
            <StarButton key={n} filled={n <= rating} onClick={() => setRating(n)} />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-y text-neutral-900"
          rows={3}
          placeholder="How was the experience?"
          maxLength={2000}
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <Button onClick={submit} disabled={submitting || rating === 0 || !selectedBooking} className="w-full">
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </Card>
  );
}
