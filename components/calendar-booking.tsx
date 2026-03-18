"use client";

import { useState, useEffect } from "react";

interface Session {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  currency: string;
  color: string;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

interface BookedSlot {
  date: string;
  start_time: string;
  end_time: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateTimeSlots(availability: AvailabilitySlot[], bookedSlots: BookedSlot[], date: Date, duration: number): string[] {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split("T")[0];
  const daySlots = availability.filter(a => a.day_of_week === dayOfWeek);
  if (daySlots.length === 0) return [];

  const booked = bookedSlots.filter(b => b.date === dateStr);
  const times: string[] = [];

  for (const slot of daySlots) {
    const [sh, sm] = slot.start_time.split(":").map(Number);
    const [eh, em] = slot.end_time.split(":").map(Number);
    let current = sh * 60 + sm;
    const end = eh * 60 + em;

    while (current + duration <= end) {
      const timeStr = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
      const endStr = `${String(Math.floor((current + duration) / 60)).padStart(2, "0")}:${String((current + duration) % 60).padStart(2, "0")}`;
      
      const isBooked = booked.some(b => {
        const bStart = b.start_time.slice(0, 5);
        const bEnd = b.end_time.slice(0, 5);
        return timeStr < bEnd && endStr > bStart;
      });

      if (!isBooked) times.push(timeStr);
      current += 30; // 30-min increments
    }
  }
  return times;
}

function MiniCalendar({ selectedDate, onSelect, availability }: { selectedDate: Date | null; onSelect: (d: Date) => void; availability: AvailabilitySlot[] }) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availableDays = new Set(availability.map(a => a.day_of_week));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(new Date(year, month - 1))} className="p-1 rounded-full hover:bg-neutral-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="text-sm font-semibold text-neutral-900">
          {viewMonth.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
        </span>
        <button onClick={() => setViewMonth(new Date(year, month + 1))} className="p-1 rounded-full hover:bg-neutral-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-neutral-400 mb-1">
        {DAYS.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const date = new Date(year, month, day);
          const isPast = date < today;
          const isAvailable = availableDays.has(date.getDay()) && !isPast;
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <button
              key={day}
              disabled={!isAvailable}
              onClick={() => onSelect(date)}
              className={`w-full aspect-square rounded-lg text-xs font-medium transition-all
                ${isSelected ? "bg-neutral-900 text-white" : ""}
                ${isAvailable && !isSelected ? "hover:bg-neutral-100 text-neutral-900" : ""}
                ${!isAvailable ? "text-neutral-300 cursor-not-allowed" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarBooking({ creatorId, creatorName }: { creatorId: string; creatorName: string }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"session" | "date" | "time" | "details" | "done">("session");
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/calendar/${creatorId}`)
      .then(r => r.json())
      .then(d => {
        if (d.sessions) setSessions(d.sessions);
        if (d.availability) setAvailability(d.availability);
        if (d.bookedSlots) setBookedSlots(d.bookedSlots);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [creatorId]);

  const timeSlots = selectedDate && selectedSession
    ? generateTimeSlots(availability, bookedSlots, selectedDate, selectedSession.duration_minutes)
    : [];

  async function book() {
    if (!selectedSession || !selectedDate || !selectedTime || !form.name || !form.email) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/calendar/${creatorId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: selectedSession.id,
        date: selectedDate.toISOString().split("T")[0],
        startTime: selectedTime,
        clientName: form.name,
        clientEmail: form.email,
        notes: form.notes,
      }),
    });
    const data = await res.json();

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    if (data.success) {
      setStep("done");
    } else {
      setError(data.message || data.error || "Something went wrong");
    }
    setSubmitting(false);
  }

  if (loading) return <div className="py-6 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" /></div>;
  if (sessions.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Book a Session</span>
      </div>

      {step === "done" ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
          </div>
          <p className="font-semibold text-neutral-900">Booked!</p>
          <p className="text-xs text-neutral-500 mt-1">{selectedSession?.title} on {selectedDate?.toLocaleDateString("en-AU", { weekday: "long", month: "long", day: "numeric" })} at {selectedTime}</p>
          <p className="text-xs text-neutral-400 mt-1">{creatorName} will confirm your booking.</p>
        </div>
      ) : (
        <>
          {/* Session type selection */}
          {step === "session" && (
            <div className="space-y-2">
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSession(s); setStep("date"); }}
                  className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-neutral-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">{s.title}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{s.duration_minutes} min</div>
                    </div>
                    <div className="text-sm font-bold text-neutral-900">
                      {s.price_cents === 0 ? "Free" : `$${(s.price_cents / 100).toFixed(0)}`}
                    </div>
                  </div>
                  {s.description && <p className="text-xs text-neutral-400 mt-1">{s.description}</p>}
                </button>
              ))}
            </div>
          )}

          {/* Date selection */}
          {step === "date" && (
            <div>
              <button onClick={() => { setStep("session"); setSelectedDate(null); }} className="text-xs text-neutral-500 hover:text-neutral-900 mb-3 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>
                {selectedSession?.title}
              </button>
              <MiniCalendar
                selectedDate={selectedDate}
                onSelect={d => { setSelectedDate(d); setStep("time"); }}
                availability={availability}
              />
            </div>
          )}

          {/* Time selection */}
          {step === "time" && (
            <div>
              <button onClick={() => { setStep("date"); setSelectedTime(null); }} className="text-xs text-neutral-500 hover:text-neutral-900 mb-3 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>
                {selectedDate?.toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" })}
              </button>
              {timeSlots.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">No available times on this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(t => (
                    <button
                      key={t}
                      onClick={() => { setSelectedTime(t); setStep("details"); }}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors
                        ${selectedTime === t ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 hover:border-neutral-400 text-neutral-900"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details form */}
          {step === "details" && (
            <div>
              <button onClick={() => setStep("time")} className="text-xs text-neutral-500 hover:text-neutral-900 mb-3 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>
                {selectedDate?.toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" })} at {selectedTime}
              </button>

              <div className="p-3 bg-neutral-50 rounded-xl mb-4 text-sm">
                <div className="font-semibold text-neutral-900">{selectedSession?.title}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {selectedDate?.toLocaleDateString("en-AU", { weekday: "long", month: "long", day: "numeric" })} at {selectedTime} ({selectedSession?.duration_minutes} min)
                </div>
                <div className="text-sm font-bold text-neutral-900 mt-1">
                  {selectedSession?.price_cents === 0 ? "Free" : `$${((selectedSession?.price_cents || 0) / 100).toFixed(0)} ${selectedSession?.currency}`}
                </div>
              </div>

              <div className="space-y-3">
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                <input type="email" placeholder="Your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none h-16" />
              </div>

              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

              <button
                onClick={book}
                disabled={!form.name || !form.email || submitting}
                className="w-full mt-4 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {submitting ? "Booking..." : selectedSession?.price_cents === 0 ? "Confirm Booking" : `Pay $${((selectedSession?.price_cents || 0) / 100).toFixed(0)} and Book`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
