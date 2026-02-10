"use client";

import { useEffect, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "สวัสดีจ้าว มีหยังหื้อจ่วยก่อ? ✨" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // ✅ แก้ hydration ตรงนี้
  const [sessionId, setSessionId] = useState("demo");

  useEffect(() => {
    const key = "session_id";
    const existing = localStorage.getItem(key);
    if (existing) {
      setSessionId(existing);
    } else {
      const id = crypto.randomUUID();
      localStorage.setItem(key, id);
      setSessionId(id);
    }
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: "U-001",
          customer_name: "Somchai",
          message: text,
        }),
      });

      const data = await res.json();
      const reply = data?.reply ?? "สุมมาเตอะ บ่ฮู้ ตอบบ่าได้เลย";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "อุ๊ย! การเชื่อมต่อขัดข้องจ้าว ย่ะใหม่เด้อ" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-pink-500 drop-shadow-sm">
          🎀 Web Chat CRM (Next.js → n8n → Model Gemini 2.5 Flash) 🎀
        </h1>
        <p className="text-purple-400 text-sm font-medium">พี่เคียนคนเมืองแต้ๆ</p>
      </div>

      <div className="chat-container">
        <div className="messages-area">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "bubble-user" : "bubble-assistant"}
            >
              <span className="label">
                {m.role === "user" ? "Me" : "อ้าย เจมินาย ✨"}
              </span>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          ))}

          {busy && (
            <div className="bubble-assistant italic animate-pulse">
              กะลังพิมพ์รอกำ... ☁️
            </div>
          )}
        </div>

        <div className="input-area">
          <input
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="พิมพ์อู้กับเปิ้ลตรงนี้ได้เลย..."
            disabled={busy}
          />
          <button
            className="send-btn"
            onClick={send}
            disabled={busy || !input.trim()}
            title="ส่งความรัก"
          >
            ❤
          </button>
        </div>
      </div>

      <div className="text-[10px] text-pink-300 mt-6 tracking-widest uppercase">
        Session ID: {sessionId}
      </div>
    </main>
  );
}
