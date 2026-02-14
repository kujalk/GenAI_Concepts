import { useState } from "react";

const approaches = [
  {
    id: 1,
    title: "Custom Lambda Pipeline",
    subtitle: "DIY — Full Control",
    color: "#f59e0b",
    bgLight: "#fef3c7",
    border: "#d97706",
    whoChunks: "You (in Lambda)",
    whoEmbeds: "You (call Bedrock API)",
    whoStores: "You (write to OpenSearch)",
    effort: "High",
    flexibility: "Maximum",
    managed: "None",
    steps: [
      { label: "S3 / Source", icon: "📄", desc: "Raw documents" },
      { label: "Lambda / Step Fn", icon: "⚙️", desc: "Your code runs" },
      { label: "Chunk Text", icon: "✂️", desc: "Split into pieces (you control size, overlap)" },
      { label: "Bedrock Embeddings API", icon: "🧠", desc: "InvokeModel → Titan / Cohere embed" },
      { label: "OpenSearch k-NN Index", icon: "🔍", desc: "You PUT vectors + metadata" },
    ],
    notes: "You own every step. Great for custom chunking strategies, metadata enrichment, or non-standard pipelines.",
  },
  {
    id: 2,
    title: "Bedrock Knowledge Bases",
    subtitle: "Fully Managed by AWS",
    color: "#3b82f6",
    bgLight: "#dbeafe",
    border: "#2563eb",
    whoChunks: "Bedrock (automatic)",
    whoEmbeds: "Bedrock (automatic)",
    whoStores: "Bedrock → OpenSearch Serverless",
    effort: "Low",
    flexibility: "Moderate",
    managed: "Fully managed",
    steps: [
      { label: "S3 Bucket", icon: "📄", desc: "Drop your docs here" },
      { label: "Bedrock Knowledge Base", icon: "🤖", desc: "Click 'Sync' — it handles everything" },
      { label: "Auto Chunking", icon: "✂️", desc: "Fixed-size, semantic, or hierarchical" },
      { label: "Auto Embedding", icon: "🧠", desc: "Uses your chosen Bedrock model" },
      { label: "OpenSearch Serverless", icon: "🔍", desc: "Vectors stored automatically" },
    ],
    notes: "Easiest path. Just configure data source, embedding model, and vector store. Bedrock handles chunking + embedding + indexing. Also supports Pinecone, Aurora, Redis.",
  },
  {
    id: 3,
    title: "OpenSearch Neural Plugin",
    subtitle: "OpenSearch-Native ML Pipeline",
    color: "#10b981",
    bgLight: "#d1fae5",
    border: "#059669",
    whoChunks: "You (before sending to OpenSearch)",
    whoEmbeds: "OpenSearch (at ingest time)",
    whoStores: "OpenSearch (automatic after embed)",
    effort: "Medium",
    flexibility: "High",
    managed: "Partial (embedding only)",
    steps: [
      { label: "Your App / Lambda", icon: "📄", desc: "Pre-chunked text" },
      { label: "OpenSearch Ingest API", icon: "📥", desc: "Send plain text to index" },
      { label: "Neural Ingest Pipeline", icon: "🔌", desc: "Pipeline triggers ML model" },
      { label: "ML Connector → Bedrock", icon: "🧠", desc: "OpenSearch calls Bedrock for embedding" },
      { label: "k-NN Index", icon: "🔍", desc: "Vector auto-stored alongside text" },
    ],
    notes: "OpenSearch's ml-commons framework + neural plugin. You register a Bedrock connector, create an ingest pipeline, and OpenSearch embeds text on ingest. You still chunk yourself.",
  },
];

const ComparisonTable = () => (
  <div style={{ overflowX: "auto", marginTop: 24 }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ background: "#1e293b", color: "#fff" }}>
          <th style={{ padding: "10px 14px", textAlign: "left", borderRadius: "8px 0 0 0" }}>Aspect</th>
          {approaches.map((a, i) => (
            <th key={a.id} style={{ padding: "10px 14px", textAlign: "center", borderRadius: i === 2 ? "0 8px 0 0" : 0 }}>
              <span style={{ color: a.color === "#f59e0b" ? "#fcd34d" : a.color === "#3b82f6" ? "#93c5fd" : "#6ee7b7" }}>{a.title}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {["whoChunks", "whoEmbeds", "whoStores", "effort", "flexibility", "managed"].map((key, ri) => (
          <tr key={key} style={{ background: ri % 2 === 0 ? "#f8fafc" : "#fff" }}>
            <td style={{ padding: "10px 14px", fontWeight: 600, borderBottom: "1px solid #e2e8f0", color: "#334155" }}>
              {{ whoChunks: "Who Chunks?", whoEmbeds: "Who Embeds?", whoStores: "Who Stores?", effort: "Effort Level", flexibility: "Flexibility", managed: "Managed?" }[key]}
            </td>
            {approaches.map(a => (
              <td key={a.id} style={{ padding: "10px 14px", textAlign: "center", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                {a[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function App() {
  const [selected, setSelected] = useState(0);
  const a = approaches[selected];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>
        🏗️ AWS Bedrock RAG — 3 Approaches Explained
      </h1>
      <p style={{ color: "#64748b", margin: "6px 0 20px", fontSize: 14 }}>
        Click each tab to see the architecture flow
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {approaches.map((ap, i) => (
          <button
            key={ap.id}
            onClick={() => setSelected(i)}
            style={{
              flex: 1,
              minWidth: 180,
              padding: "12px 16px",
              border: `2px solid ${selected === i ? ap.border : "#e2e8f0"}`,
              borderRadius: 10,
              background: selected === i ? ap.bgLight : "#fff",
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: ap.border }}>{ap.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{ap.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Flow Diagram */}
      <div style={{ marginTop: 20, background: "#f8fafc", borderRadius: 14, border: `2px solid ${a.border}`, padding: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: a.color }} />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: a.border, margin: "0 0 4px" }}>
          Approach {a.id}: {a.title}
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>{a.subtitle}</p>

        {/* Steps flow */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
          {a.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                background: "#fff",
                border: `2px solid ${a.color}`,
                borderRadius: 12,
                padding: "14px 16px",
                width: 130,
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontSize: 28 }}>{step.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a", marginTop: 6 }}>{step.label}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>{step.desc}</div>
              </div>
              {i < a.steps.length - 1 && (
                <div style={{ fontSize: 22, color: a.color, fontWeight: 900, padding: "0 4px", flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{
          marginTop: 16,
          padding: "12px 16px",
          background: a.bgLight,
          borderRadius: 8,
          borderLeft: `4px solid ${a.color}`,
          fontSize: 13,
          color: "#334155",
          lineHeight: 1.5,
        }}>
          💡 {a.notes}
        </div>
      </div>

      {/* Query-time flow */}
      <div style={{ marginTop: 20, background: "#faf5ff", borderRadius: 14, border: "2px solid #a855f7", padding: 24 }}>
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#7c3aed", margin: "0 0 4px" }}>
            🔎 Query Time (Same for All Approaches)
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>Once vectors are stored, retrieval works the same way</p>
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
            {[
              { icon: "💬", label: "User Query", desc: "Natural language question" },
              { icon: "🧠", label: "Embed Query", desc: "Same embedding model" },
              { icon: "🔍", label: "k-NN Search", desc: "Find similar vectors in OpenSearch" },
              { icon: "📄", label: "Retrieve Chunks", desc: "Top-K relevant passages" },
              { icon: "🤖", label: "LLM (Bedrock)", desc: "Generate answer with context" },
            ].map((s, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  background: "#fff",
                  border: "2px solid #a855f7",
                  borderRadius: 12,
                  padding: "14px 16px",
                  width: 130,
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a", marginTop: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ fontSize: 22, color: "#a855f7", fontWeight: 900, padding: "0 4px", flexShrink: 0 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "28px 0 4px" }}>📊 Side-by-Side Comparison</h2>
      <ComparisonTable />

      {/* When to use */}
      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {approaches.map(ap => (
          <div key={ap.id} style={{ flex: 1, minWidth: 220, padding: "16px", borderRadius: 12, border: `2px solid ${ap.border}`, background: ap.bgLight }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: ap.border, marginBottom: 6 }}>✅ Use {ap.title} when:</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              {ap.id === 1 && "You need custom chunking, metadata enrichment, complex preprocessing, or want to integrate with non-AWS vector DBs."}
              {ap.id === 2 && "You want the fastest setup, minimal code, and are okay with AWS-managed defaults. Best for most production use cases."}
              {ap.id === 3 && "You're already invested in OpenSearch, want embedding at ingest without external orchestration, or need OpenSearch-native search features."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}