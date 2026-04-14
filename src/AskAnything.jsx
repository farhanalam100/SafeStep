import { useState, useRef, useEffect } from "react";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

async function askGemini(question, history) {
  const systemContext = `You are a friendly, patient technology helper for senior citizens. 
Always respond in simple, clear language with no jargon. 
Never use abbreviations. 
Keep answers short and easy to follow.
Use numbered steps when explaining how to do something.
Be warm, encouraging and never condescending.`;

  const contents = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));
  contents.push({ role: "user", parts: [{ text: question }] });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemContext }] },
        contents,
      }),
    }
  );
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

const SUGGESTED = [
  "How do I video call my grandchildren?",
  "What is WhatsApp and how do I use it?",
  "How do I make the text on my phone bigger?",
  "Someone called saying I owe the IRS money. Is this real?",
  "How do I send a photo by email?",
];

export default function AskAnything() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! 👋 I'm here to help you with any technology questions. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const question = text || input;
    if (!question.trim()) return;
    const newMessages = [...messages, { role: "user", text: question }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const history = messages.filter((m) => m.role !== "model" || messages.indexOf(m) > 0);
      const reply = await askGemini(question, history);
      setMessages([...newMessages, { role: "model", text: reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: "model", text: "Sorry, something went wrong. Please try again in a moment." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Georgia, serif", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <div style={{ background: "#2563eb", padding: "24px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>💬</div>
        <h1 style={{ fontSize: 32, fontWeight: "bold", color: "white", margin: "8px 0 4px" }}>Ask Anything</h1>
        <p style={{ fontSize: 18, color: "#bfdbfe", margin: 0 }}>Ask any technology question — I'll explain it simply!</p>
      </div>

      {/* Suggested Questions */}
      <div style={{ padding: "20px 20px 0", maxWidth: 700, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <p style={{ fontSize: 16, color: "#64748b", marginBottom: 10 }}>💡 Try asking:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              style={{
                background: "white", border: "2px solid #2563eb", borderRadius: 20,
                padding: "8px 16px", fontSize: 15, color: "#2563eb", cursor: "pointer",
                fontFamily: "Georgia, serif"
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", maxWidth: 700, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 20, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "model" && (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2563eb", color: "white", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 }}>
                🤖
              </div>
            )}
            <div style={{
              maxWidth: "75%", padding: "16px 20px", borderRadius: 16, fontSize: 18, lineHeight: 1.7,
              background: msg.role === "user" ? "#2563eb" : "white",
              color: msg.role === "user" ? "white" : "#1e293b",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              whiteSpace: "pre-wrap",
              borderBottomRightRadius: msg.role === "user" ? 4 : 16,
              borderBottomLeftRadius: msg.role === "model" ? 4 : 16,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2563eb", color: "white", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>🤖</div>
            <div style={{ background: "white", padding: "16px 20px", borderRadius: 16, fontSize: 18, color: "#64748b", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              ✍️ Typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: "white", borderTop: "2px solid #e2e8f0", padding: "20px", position: "sticky", bottom: 0 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", gap: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your question here..."
            style={{
              flex: 1, fontSize: 18, padding: "14px 18px", borderRadius: 10,
              border: "2px solid #e2e8f0", fontFamily: "Georgia, serif",
              outline: "none", color: "#1e293b"
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              padding: "14px 24px", fontSize: 18, fontWeight: "bold",
              background: loading || !input.trim() ? "#94a3b8" : "#2563eb",
              color: "white", border: "none", borderRadius: 10, cursor: "pointer"
            }}
          >
            Send ➤
          </button>
        </div>
      </div>

    </div>
  );
}