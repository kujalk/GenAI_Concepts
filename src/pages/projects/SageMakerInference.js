import { useState } from "react";
import Layout from "../../components/Layout";

const data = [
  {
    id: "realtime",
    title: "Real-Time Inference",
    icon: "⚡",
    color: "#3b82f6",
    bg: "#dbeafe",
    border: "#2563eb",
    tagline: "Always ON, Always Fast",
    keywords: ["Persistent endpoint", "REST API", "Fully managed", "Low latency", "High throughput"],
    payload: "25 MB",
    timeout: "60s (regular) / 8 min (streaming)",
    traffic: "Sustained / Predictable",
    scaling: "Instance-backed (you choose type)",
    cost: "Pay for uptime (even idle)",
    scaleToZero: false,
    useWhen: "Online, low-latency apps with steady traffic — chatbots, APIs, search",
    mnemonic: "Think: Restaurant with full-time staff — always open, always ready, you pay even when empty",
  },
  {
    id: "serverless",
    title: "Serverless Inference",
    icon: "☁️",
    color: "#8b5cf6",
    bg: "#ede9fe",
    border: "#7c3aed",
    tagline: "Pay Only When Used",
    keywords: ["No instance mgmt", "Auto-scales", "Cold starts possible", "Intermittent traffic"],
    payload: "4 MB",
    timeout: "60 seconds",
    traffic: "Intermittent / Unpredictable",
    scaling: "Fully managed by AWS",
    cost: "Pay per request (no idle cost)",
    scaleToZero: true,
    useWhen: "Sporadic traffic, dev/test, low-volume production workloads",
    mnemonic: "Think: Food truck — shows up only when needed, no rent when parked",
  },
  {
    id: "batch",
    title: "Batch Transform",
    icon: "📦",
    color: "#f59e0b",
    bg: "#fef3c7",
    border: "#d97706",
    tagline: "Big Data, No Endpoint",
    keywords: ["Offline processing", "No persistent endpoint", "Large datasets", "Pre-processing"],
    payload: "GBs of data",
    timeout: "Days",
    traffic: "None (offline)",
    scaling: "Processes entire dataset at once",
    cost: "Pay for compute during job",
    scaleToZero: "N/A (no endpoint)",
    useWhen: "Bulk scoring, nightly predictions, pre-processing large datasets",
    mnemonic: "Think: Laundry service — drop off a huge bag, pick up results later",
  },
  {
    id: "async",
    title: "Async Inference",
    icon: "⏳",
    color: "#10b981",
    bg: "#d1fae5",
    border: "#059669",
    tagline: "Queue It, Process Later",
    keywords: ["Request queue", "Large payloads", "Long processing", "Scale to 0", "SNS notifications"],
    payload: "1 GB",
    timeout: "1 hour",
    traffic: "Bursty / Large jobs",
    scaling: "Auto-scales + scale to 0",
    cost: "Pay for compute (can scale to 0)",
    scaleToZero: true,
    useWhen: "Video processing, large document analysis, genomics, any heavy long-running job",
    mnemonic: "Think: Mechanic shop with a queue — drop your car, get notified when done",
  },
];

const comparisonRows = [
  { key: "traffic", label: "Traffic Pattern", icon: "📊" },
  { key: "payload", label: "Max Payload", icon: "📐" },
  { key: "timeout", label: "Max Timeout", icon: "⏱️" },
  { key: "scaling", label: "Scaling", icon: "📈" },
  { key: "cost", label: "Cost Model", icon: "💰" },
  { key: "useWhen", label: "Best For", icon: "🎯" },
];

const QuizCard = ({ q, opts, ans }) => {
  const [show, setShow] = useState(false);
  const [picked, setPicked] = useState(null);
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "2px solid #e2e8f0", padding: 16, marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 }}>❓ {q}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map(o => {
          const isCorrect = o === ans;
          const bg = picked === null ? "#f1f5f9" : isCorrect ? "#d1fae5" : picked === o ? "#fee2e2" : "#f1f5f9";
          const border = picked === null ? "#cbd5e1" : isCorrect ? "#10b981" : picked === o ? "#ef4444" : "#cbd5e1";
          return (
            <button key={o} onClick={() => { setPicked(o); setShow(true); }}
              style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${border}`, background: bg, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>
              {o}
            </button>
          );
        })}
      </div>
      {show && <div style={{ marginTop: 8, fontSize: 13, color: picked === ans ? "#059669" : "#dc2626", fontWeight: 600 }}>
        {picked === ans ? "✅ Correct!" : `❌ Answer: ${ans}`}
      </div>}
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState("map");
  const [expanded, setExpanded] = useState(null);

  return (
    <Layout>
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, textAlign: "center" }}>
        🧠 SageMaker Inference Options
      </h1>
      <p style={{ color: "#64748b", textAlign: "center", margin: "4px 0 20px", fontSize: 14 }}>Study Guide — Memory Map, Comparison & Quiz</p>

      {/* Tab Nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {[["map", "🗺️ Mind Map"], ["table", "📊 Comparison"], ["numbers", "🔢 Key Numbers"], ["quiz", "🧪 Quiz"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: "10px 20px", borderRadius: 10, border: `2px solid ${tab === k ? "#2563eb" : "#e2e8f0"}`, background: tab === k ? "#dbeafe" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: tab === k ? "#1d4ed8" : "#64748b" }}>
            {l}
          </button>
        ))}
      </div>

      {/* MIND MAP TAB */}
      {tab === "map" && (
        <div>
          {/* Central node */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ display: "inline-block", background: "#0f172a", color: "#fff", padding: "14px 28px", borderRadius: 16, fontWeight: 800, fontSize: 16 }}>
              🤖 SageMaker Inference
            </div>
          </div>
          {/* Decision flow */}
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
            ↓ What kind of traffic do you have? ↓
          </div>
          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {data.map(d => (
              <div key={d.id} onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                style={{ background: d.bg, border: `2px solid ${d.border}`, borderRadius: 14, padding: 18, cursor: "pointer", transition: "all 0.2s", transform: expanded === d.id ? "scale(1.02)" : "scale(1)" }}>
                <div style={{ fontSize: 32, textAlign: "center" }}>{d.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: d.border, textAlign: "center", marginTop: 6 }}>{d.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", fontStyle: "italic", margin: "4px 0 10px" }}>"{d.tagline}"</div>
                {/* Keywords */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                  {d.keywords.map(kw => (
                    <span key={kw} style={{ background: "#fff", border: `1px solid ${d.color}`, borderRadius: 6, padding: "3px 8px", fontSize: 11, color: d.border, fontWeight: 600 }}>{kw}</span>
                  ))}
                </div>
                {/* Expanded details */}
                {expanded === d.id && (
                  <div style={{ marginTop: 14, borderTop: `2px dashed ${d.color}`, paddingTop: 12 }}>
                    <div style={{ fontSize: 12, lineHeight: 1.8, color: "#334155" }}>
                      <div><strong>📐 Payload:</strong> {d.payload}</div>
                      <div><strong>⏱️ Timeout:</strong> {d.timeout}</div>
                      <div><strong>📊 Traffic:</strong> {d.traffic}</div>
                      <div><strong>💰 Cost:</strong> {d.cost}</div>
                      <div><strong>🎯 Use:</strong> {d.useWhen}</div>
                    </div>
                    <div style={{ marginTop: 10, background: "#fff", borderRadius: 8, padding: "10px 12px", border: `1px solid ${d.color}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: d.border, marginBottom: 4 }}>🧠 MEMORY TRICK</div>
                      <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, fontStyle: "italic" }}>{d.mnemonic}</div>
                    </div>
                  </div>
                )}
                <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#94a3b8" }}>
                  {expanded === d.id ? "▲ tap to collapse" : "▼ tap for details"}
                </div>
              </div>
            ))}
          </div>

          {/* Decision Tree */}
          <div style={{ marginTop: 24, background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>🌳 Quick Decision Tree</h3>
            <div style={{ fontSize: 13, lineHeight: 2.2, color: "#334155" }}>
              <div>Is it <strong>offline / bulk data</strong>? → <span style={{ background: "#fef3c7", padding: "2px 8px", borderRadius: 6, fontWeight: 700, color: "#92400e" }}>📦 Batch Transform</span></div>
              <div>Is payload <strong>&gt; 25MB</strong> or processing <strong>&gt; 60s</strong>? → <span style={{ background: "#d1fae5", padding: "2px 8px", borderRadius: 6, fontWeight: 700, color: "#065f46" }}>⏳ Async Inference</span></div>
              <div>Is traffic <strong>intermittent / unpredictable</strong>? → <span style={{ background: "#ede9fe", padding: "2px 8px", borderRadius: 6, fontWeight: 700, color: "#5b21b6" }}>☁️ Serverless</span></div>
              <div>Is traffic <strong>sustained & needs low latency</strong>? → <span style={{ background: "#dbeafe", padding: "2px 8px", borderRadius: 6, fontWeight: 700, color: "#1e40af" }}>⚡ Real-Time</span></div>
            </div>
          </div>
        </div>
      )}

      {/* COMPARISON TABLE TAB */}
      {tab === "table" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#0f172a", color: "#fff" }}>
                <th style={{ padding: "12px", textAlign: "left", borderRadius: "10px 0 0 0" }}>Feature</th>
                {data.map((d, i) => (
                  <th key={d.id} style={{ padding: "12px", textAlign: "center", borderRadius: i === 3 ? "0 10px 0 0" : 0 }}>
                    <div style={{ fontSize: 20 }}>{d.icon}</div>
                    <div style={{ fontSize: 12, marginTop: 4, color: d.id === "realtime" ? "#93c5fd" : d.id === "serverless" ? "#c4b5fd" : d.id === "batch" ? "#fcd34d" : "#6ee7b7" }}>{d.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((r, ri) => (
                <tr key={r.key} style={{ background: ri % 2 === 0 ? "#f8fafc" : "#fff" }}>
                  <td style={{ padding: "12px", fontWeight: 700, borderBottom: "1px solid #e2e8f0", color: "#334155", whiteSpace: "nowrap" }}>{r.icon} {r.label}</td>
                  {data.map(d => (
                    <td key={d.id} style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: 12, lineHeight: 1.5 }}>
                      {d[r.key]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{ background: "#f0fdf4" }}>
                <td style={{ padding: "12px", fontWeight: 700, color: "#334155" }}>🔽 Scale to Zero?</td>
                {data.map(d => (
                  <td key={d.id} style={{ padding: "12px", textAlign: "center", fontSize: 18 }}>
                    {d.scaleToZero === true ? "✅" : d.scaleToZero === false ? "❌" : "➖"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* KEY NUMBERS TAB */}
      {tab === "numbers" && (
        <div>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px", textAlign: "center" }}>The numbers that show up on exams — memorize these!</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {data.map(d => (
              <div key={d.id} style={{ background: d.bg, border: `2px solid ${d.border}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>{d.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: d.border, marginTop: 4 }}>{d.title}</div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "#fff", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>MAX PAYLOAD</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: d.border }}>{d.payload}</div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>MAX TIMEOUT</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: d.border }}>{d.timeout}</div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SCALE TO ZERO</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: d.border }}>
                      {d.scaleToZero === true ? "✅ Yes" : d.scaleToZero === false ? "❌ No" : "➖ N/A"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Memory trick for numbers */}
          <div style={{ marginTop: 20, background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 20 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#92400e" }}>🧠 Number Mnemonics</h3>
            <div style={{ fontSize: 13, lineHeight: 2, color: "#78350f" }}>
              <div><strong>Payload sizes in order:</strong> Serverless (4 MB) → Real-Time (25 MB) → Async (1 GB) → Batch (GBs)</div>
              <div><strong>Remember "4-25-1G-GBs"</strong> — gets bigger as you go from online → offline</div>
              <div><strong>Timeouts in order:</strong> Serverless (60s) = Real-Time (60s) → Async (1 hr) → Batch (days)</div>
              <div><strong>Scale to Zero:</strong> Only <strong>Async</strong> and <strong>Serverless</strong> — the "S" options (Sort of... A-S!)</div>
              <div><strong>Real-Time streaming:</strong> 8 min — think "8 is great for streaming"</div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ TAB */}
      {tab === "quiz" && (
        <div>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px", textAlign: "center" }}>Test yourself! Click an answer to check.</p>
          <QuizCard
            q="Which inference option supports payloads up to 1 GB?"
            opts={["Real-Time", "Serverless", "Batch Transform", "Async Inference"]}
            ans="Async Inference"
          />
          <QuizCard
            q="Which option can scale to 0 instances when idle?"
            opts={["Real-Time", "Serverless & Async", "Batch Transform", "All of them"]}
            ans="Serverless & Async"
          />
          <QuizCard
            q="Max payload for Serverless Inference?"
            opts={["4 MB", "25 MB", "1 GB", "6 MB"]}
            ans="4 MB"
          />
          <QuizCard
            q="You need to score predictions on a 50GB dataset overnight. Which option?"
            opts={["Real-Time", "Serverless", "Batch Transform", "Async Inference"]}
            ans="Batch Transform"
          />
          <QuizCard
            q="Your chatbot needs < 100ms responses with steady traffic. Which option?"
            opts={["Real-Time", "Serverless", "Batch Transform", "Async Inference"]}
            ans="Real-Time"
          />
          <QuizCard
            q="Max processing time for Real-Time streaming responses?"
            opts={["60 seconds", "5 minutes", "8 minutes", "1 hour"]}
            ans="8 minutes"
          />
          <QuizCard
            q="Which option has NO persistent endpoint?"
            opts={["Real-Time", "Serverless", "Batch Transform", "Async Inference"]}
            ans="Batch Transform"
          />
          <QuizCard
            q="Traffic is unpredictable — sometimes 0 requests, sometimes 100/min. Payload is small. Which option?"
            opts={["Real-Time", "Serverless", "Batch Transform", "Async Inference"]}
            ans="Serverless"
          />
          <QuizCard
            q="You need to process 500MB video files with 30-min processing time. Which option?"
            opts={["Real-Time", "Serverless", "Batch Transform", "Async Inference"]}
            ans="Async Inference"
          />
        </div>
      )}
    </div>
    </Layout>
  );
}