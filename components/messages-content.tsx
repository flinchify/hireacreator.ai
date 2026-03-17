"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "./auth-context";
import Link from "next/link";

interface Conversation {
  id: string;
  other_user_id: string;
  other_name: string;
  other_avatar: string | null;
  other_slug: string;
  other_role: string;
  last_message: string | null;
  unread_count: number;
  last_message_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  is_flagged: boolean;
  read_at: string | null;
  created_at: string;
  sender_name: string;
  sender_avatar: string | null;
}

function AgeGate({ onVerify }: { onVerify: () => void }) {
  const [loading, setLoading] = useState(false);

  async function verify() {
    setLoading(true);
    const res = await fetch("/api/settings/age-verify", { method: "POST" });
    if (res.ok) onVerify();
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center max-w-md mx-auto mt-8">
      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h2 className="text-lg font-bold text-neutral-900 mb-2">Age Verification Required</h2>
      <p className="text-sm text-neutral-500 mb-6">
        You must confirm you are 18 years or older to use the messaging feature. 
        By continuing, you confirm that you are at least 18 years of age and agree 
        to our messaging terms of use.
      </p>
      <button onClick={verify} disabled={loading} className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50">
        {loading ? "Verifying..." : "I confirm I am 18 or older"}
      </button>
      <p className="text-[11px] text-neutral-400 mt-3">
        HireACreator is not liable for any content exchanged in messages. 
        All conversations may be reviewed for safety purposes.
      </p>
    </div>
  );
}

function ReportModal({ messageId, onClose }: { messageId: string; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!reason.trim()) return;
    setSending(true);
    const res = await fetch("/api/messages/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, reason: reason.trim() }),
    });
    if (res.ok) setSent(true);
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" /></svg>
            </div>
            <h3 className="font-bold text-neutral-900">Report Submitted</h3>
            <p className="text-sm text-neutral-500 mt-1">Our team will review this message.</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-neutral-900 text-white text-sm rounded-full">Close</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-neutral-900 mb-1">Report Message</h3>
            <p className="text-sm text-neutral-500 mb-4">Why are you reporting this message?</p>
            <div className="flex flex-col gap-2 mb-4">
              {["Harassment or abuse", "Spam or scam", "Inappropriate content", "Off-platform solicitation", "Other"].map(r => (
                <button key={r} onClick={() => setReason(r)} className={`text-left px-3 py-2 text-sm rounded-lg border transition-colors ${reason === r ? "border-neutral-900 bg-neutral-50 font-medium" : "border-neutral-200 hover:border-neutral-300"}`}>{r}</button>
              ))}
            </div>
            {reason === "Other" && (
              <textarea value={reason === "Other" ? "" : reason} onChange={e => setReason(e.target.value)} placeholder="Describe the issue..." className="w-full border border-neutral-200 rounded-lg p-3 text-sm mb-4 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-full hover:bg-neutral-200">Cancel</button>
              <button onClick={submit} disabled={!reason.trim() || sending} className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 disabled:opacity-50">
                {sending ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ConversationView({ conversationId, userId, onBack }: { conversationId: string; userId: string; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reportMsgId, setReportMsgId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/messages/${conversationId}`)
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages || []);
        setOtherUser(d.otherUser);
      });
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !otherUser) return;
    setSending(true);
    setError("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: otherUser.id, content: newMsg.trim() }),
    });
    const data = await res.json();

    if (res.ok) {
      setMessages(prev => [...prev, { ...data.message, sender_id: userId, sender_name: "You", sender_avatar: null }]);
      setNewMsg("");
    } else {
      setError(data.message || "Failed to send message.");
    }
    setSending(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m0 0l7 7m-7-7l7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {otherUser && (
          <Link href={`/creators/${otherUser.slug}`} className="flex items-center gap-2.5 hover:opacity-80">
            {otherUser.avatar_url ? (
              <img src={otherUser.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600">{otherUser.full_name?.[0] || "?"}</div>
            )}
            <div>
              <div className="text-sm font-semibold text-neutral-900">{otherUser.full_name}</div>
              <div className="text-[11px] text-neutral-400 capitalize">{otherUser.role}</div>
            </div>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="text-center">
          <p className="text-[10px] text-neutral-400 bg-neutral-50 inline-block px-3 py-1 rounded-full">
            Messages are monitored for safety. Do not share personal information.
          </p>
        </div>
        {messages.map(m => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`relative group max-w-[75%] ${mine ? "order-2" : ""}`}>
                <div className={`px-3.5 py-2 text-sm rounded-2xl ${mine ? "bg-neutral-900 text-white rounded-br-md" : "bg-neutral-100 text-neutral-900 rounded-bl-md"}`}>
                  {m.content}
                </div>
                <div className={`flex items-center gap-2 mt-0.5 ${mine ? "justify-end" : ""}`}>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {!mine && (
                    <button onClick={() => setReportMsgId(m.id)} className="opacity-0 group-hover:opacity-100 text-[10px] text-red-400 hover:text-red-600 transition-all">
                      Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {error && <div className="px-4 py-2 bg-red-50 text-red-600 text-xs">{error}</div>}
      <form onSubmit={send} className="flex items-center gap-2 px-4 py-3 border-t border-neutral-100">
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1 px-4 py-2.5 bg-neutral-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 border border-neutral-200"
        />
        <button type="submit" disabled={!newMsg.trim() || sending} className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors disabled:opacity-30 shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>

      {reportMsgId && <ReportModal messageId={reportMsgId} onClose={() => setReportMsgId(null)} />}
    </div>
  );
}

export function MessagesContent() {
  const { user, loading, openLogin } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [needsAge, setNeedsAge] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch("/api/messages")
      .then(r => r.json())
      .then(d => {
        if (d.error === "age_verification_required") {
          setNeedsAge(true);
        } else {
          setConversations(d.conversations || []);
        }
        setLoadingConvs(false);
      })
      .catch(() => setLoadingConvs(false));
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" /></div>;

  if (!user) return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center mt-8">
      <h2 className="text-lg font-bold text-neutral-900 mb-2">Sign in to view messages</h2>
      <p className="text-sm text-neutral-500 mb-4">You need an account to send and receive messages.</p>
      <button onClick={openLogin} className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800">Sign In</button>
    </div>
  );

  if (needsAge) return <AgeGate onVerify={() => { setNeedsAge(false); window.location.reload(); }} />;

  if (activeConv) return <ConversationView conversationId={activeConv} userId={user.id} onBack={() => setActiveConv(null)} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Messages</h1>
      {loadingConvs ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" /></div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="font-bold text-neutral-900 mb-1">No messages yet</h2>
          <p className="text-sm text-neutral-500">When you message a creator or a brand messages you, conversations will appear here.</p>
          <Link href="/browse" className="inline-block mt-4 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800">Browse Creators</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
          {conversations.map(c => (
            <button key={c.id} onClick={() => setActiveConv(c.id)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors text-left">
              {c.other_avatar ? (
                <img src={c.other_avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-neutral-600">{c.other_name?.[0] || "?"}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900 truncate">{c.other_name}</span>
                  <span className="text-[10px] text-neutral-400 shrink-0 ml-2">
                    {new Date(c.last_message_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-neutral-500 truncate">{c.last_message || "Start a conversation"}</span>
                  {c.unread_count > 0 && (
                    <span className="shrink-0 ml-2 w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center">{c.unread_count}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
