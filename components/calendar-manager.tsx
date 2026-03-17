"use client";

import { useState, useEffect } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = Array.from({ length: 28 }, (_, i) => {
  const h = Math.floor(i / 2) + 7; // 7:00 AM to 20:30
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

interface CalSession {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  currency: string;
  is_active: boolean;
}

interface Availability {
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

interface Booking {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  client_name: string | null;
  client_name_user: string | null;
  client_email: string | null;
  session_title: string;
  status: string;
}

export function CalendarManager() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [sessions, setSessions] = useState<CalSession[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"sessions" | "availability" | "bookings">("sessions");

  // New session form
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDuration, setNewDuration] = useState(30);
  const [newPrice, setNewPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/calendar");
    const data = await res.json();
    if (data.calendarEnabled !== undefined) setEnabled(data.calendarEnabled);
    if (data.sessions) setSessions(data.sessions);
    if (data.availability) setAvailability(data.availability);
    if (data.bookings) setBookings(data.bookings);
    setLoading(false);
  }

  async function toggleEnabled() {
    const next = !enabled;
    setEnabled(next);
    await fetch("/api/calendar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarEnabled: next }),
    });
  }

  async function createSession() {
    if (!newTitle.trim()) return;
    setSaving(true);
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc || null,
        durationMinutes: newDuration,
        priceCents: Math.round(newPrice * 100),
      }),
    });
    setNewTitle(""); setNewDesc(""); setNewDuration(30); setNewPrice(0); setShowNew(false);
    setSaving(false);
    load();
  }

  async function deleteSession(id: string) {
    await fetch(`/api/calendar?sessionId=${id}`, { method: "DELETE" });
    load();
  }

  async function saveAvailability(slots: Availability[]) {
    await fetch("/api/calendar/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: slots.map(s => ({ dayOfWeek: s.day_of_week, startTime: s.start_time, endTime: s.end_time, timezone: s.timezone })) }),
    });
    setAvailability(slots);
  }

  if (loading) return <div className="py-8 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-neutral-900">Calendar</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Let clients book time with you</p>
        </div>
        <button onClick={toggleEnabled} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-neutral-300"}`}>
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      {!enabled ? (
        <p className="text-sm text-neutral-400">Enable your calendar to start accepting bookings on your link-in-bio page.</p>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-neutral-100 rounded-lg p-0.5">
            {(["sessions", "availability", "bookings"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${tab === t ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500"}`}>{t}</button>
            ))}
          </div>

          {/* Sessions Tab */}
          {tab === "sessions" && (
            <div>
              {sessions.length === 0 && !showNew && (
                <p className="text-sm text-neutral-400 mb-3">No session types yet. Add one to start accepting bookings.</p>
              )}
              {sessions.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200 mb-2">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{s.title}</div>
                    <div className="text-xs text-neutral-500">{s.duration_minutes} min — {s.price_cents === 0 ? "Free" : `$${(s.price_cents / 100).toFixed(0)}`}</div>
                  </div>
                  <button onClick={() => deleteSession(s.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1">Remove</button>
                </div>
              ))}
              {showNew ? (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 mt-2 space-y-3">
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Session name (e.g. 1-on-1 Coaching)" className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                  <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none h-16" />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-medium text-neutral-500 uppercase">Duration</label>
                      <select value={newDuration} onChange={e => setNewDuration(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm mt-0.5">
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                        <option value={90}>90 min</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-medium text-neutral-500 uppercase">Price ($)</label>
                      <input type="number" min="0" step="1" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm mt-0.5" placeholder="0 = free" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowNew(false)} className="flex-1 py-2 text-xs font-medium text-neutral-700 bg-neutral-200 rounded-full">Cancel</button>
                    <button onClick={createSession} disabled={!newTitle.trim() || saving} className="flex-1 py-2 text-xs font-medium text-white bg-neutral-900 rounded-full disabled:opacity-50">{saving ? "Saving..." : "Add Session"}</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNew(true)} className="w-full mt-2 py-2.5 text-xs font-medium text-neutral-900 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors">
                  + Add Session Type
                </button>
              )}
            </div>
          )}

          {/* Availability Tab */}
          {tab === "availability" && (
            <AvailabilityEditor availability={availability} onSave={saveAvailability} />
          )}

          {/* Bookings Tab */}
          {tab === "bookings" && (
            <div>
              {bookings.length === 0 ? (
                <p className="text-sm text-neutral-400">No upcoming bookings yet.</p>
              ) : (
                <div className="space-y-2">
                  {bookings.map(b => (
                    <div key={b.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-neutral-900">{b.session_title}</div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"}`}>{b.status}</span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {new Date(b.date).toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" })} at {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">{b.client_name_user || b.client_name || "Unknown"} ({b.client_email})</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AvailabilityEditor({ availability, onSave }: { availability: Availability[]; onSave: (slots: Availability[]) => void }) {
  const [slots, setSlots] = useState<Availability[]>(availability);
  const [saved, setSaved] = useState(false);

  function addSlot(day: number) {
    setSlots([...slots, { day_of_week: day, start_time: "09:00", end_time: "17:00", timezone: "Australia/Sydney" }]);
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: "start_time" | "end_time", value: string) {
    const next = [...slots];
    next[index] = { ...next[index], [field]: value };
    setSlots(next);
  }

  async function save() {
    await onSave(slots);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div>
      <p className="text-xs text-neutral-500 mb-3">Set your weekly availability. Clients can only book during these hours.</p>
      {DAYS.map((day, dayIndex) => {
        const daySlots = slots.filter(s => s.day_of_week === dayIndex);
        return (
          <div key={dayIndex} className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-neutral-700">{day}</span>
              <button onClick={() => addSlot(dayIndex)} className="text-[10px] text-neutral-500 hover:text-neutral-900">+ Add</button>
            </div>
            {daySlots.length === 0 ? (
              <div className="text-[11px] text-neutral-400 ml-1">Unavailable</div>
            ) : (
              daySlots.map((slot, si) => {
                const globalIndex = slots.indexOf(slot);
                return (
                  <div key={si} className="flex items-center gap-2 mb-1">
                    <select value={slot.start_time} onChange={e => updateSlot(globalIndex, "start_time", e.target.value)} className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs">
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-xs text-neutral-400">to</span>
                    <select value={slot.end_time} onChange={e => updateSlot(globalIndex, "end_time", e.target.value)} className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs">
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={() => removeSlot(globalIndex)} className="text-red-400 hover:text-red-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        );
      })}
      <button onClick={save} className="w-full mt-3 py-2.5 text-xs font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">
        {saved ? "Saved!" : "Save Availability"}
      </button>
    </div>
  );
}
