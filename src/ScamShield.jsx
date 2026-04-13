import { useState } from "react";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

async function analyzeWithGemini(message) {
  const prompt = `You are a scam detection expert helping senior citizens stay safe online. Analyze the following message and respond ONLY with a JSON object in this exact format, nothing else:
{
  "score": <number from 1 to 10 where 1 is completely safe and 10 is definitely a scam>,
  "verdict": "<Safe|Suspicious|Dangerous>",
  "explanation": "<2-3 simple sentences explaining why in plain language a senior citizen would understand>",
  "whatToDo": "<1-2 sentences telling them exactly what to do next>"
}

Message to analyze: "${message}"`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );
  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export default function ScamShield() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await analyzeWithGemini(message);
      setResult(res);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score <= 3) return "#16a34a";
    if (score <= 6) return "#d97706";
    return "#dc2626";
  };

  const getScoreBg = (score) => {
    if (score <= 3) return "#f0fdf4";
    if (score <= 6) return "#fffbeb";
    return "#fef2f2";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 20px", fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🛡️</div>
          <h1 style={{ fontSize: 36, fontWeight: "bold", color: "#1e293b", margin: 0 }}>Scam Shield</h1>
          <p style={{ fontSize: 20, color: "#64748b", marginTop: 10 }}>
            Paste any suspicious message, email, or phone call below and we'll check if it's a scam.
          </p>
        </div>

        {/* Input Box */}
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 24 }}>
          <label style={{ fontSize: 20, fontWeight: "bold", color: "#1e293b", display: "block", marginBottom: 12 }}>
            Paste the suspicious message here:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Example: "Your bank account has been locked. Call 1-800-555-0199 immediately to verify your identity."'
            style={{
              width: "100%", minHeight: 160, fontSize: 18, padding: 16,
              borderRadius: 10, border: "2px solid #e2e8f0", resize: "vertical",
              fontFamily: "Georgia, serif", color: "#1e293b", boxSizing: "border-box",
              outline: "none", lineHeight: 1.6
            }}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !message.trim()}
            style={{
              marginTop: 16, width: "100%", padding: "18px 0", fontSize: 22,
              fontWeight: "bold", background: loading ? "#94a3b8" : "#2563eb",
              color: "white", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}
          >
            {loading ? "⏳ Analyzing..." : "🔍 Check This Message"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: 12, padding: 20, marginBottom: 24, fontSize: 18, color: "#dc2626" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ background: getScoreBg(result.score), border: `3px solid ${getScoreColor(result.score)}`, borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>

            {/* Score */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                display: "inline-block", width: 100, height: 100, borderRadius: "50%",
                background: getScoreColor(result.score), color: "white",
                fontSize: 42, fontWeight: "bold", lineHeight: "100px", marginBottom: 12
              }}>
                {result.score}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>DANGER SCORE (out of 10)</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: getScoreColor(result.score) }}>
                {result.score <= 3 ? "✅ Looks Safe" : result.score <= 6 ? "⚠️ Be Careful" : "🚨 This is a Scam!"}
              </div>
            </div>

            {/* Explanation */}
            <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#1e293b", marginTop: 0, marginBottom: 12 }}>
                📋 What We Found:
              </h3>
              <p style={{ fontSize: 18, color: "#374151", lineHeight: 1.7, margin: 0 }}>{result.explanation}</p>
            </div>

            {/* What to do */}
            <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#1e293b", marginTop: 0, marginBottom: 12 }}>
                👉 What You Should Do:
              </h3>
              <p style={{ fontSize: 18, color: "#374151", lineHeight: 1.7, margin: 0 }}>{result.whatToDo}</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}