import { useState } from "react";

const strategies = [
  {
    id: "fixed",
    name: "Fixed-Size Chunking",
    icon: "▦",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
    summary: "Splits documents into chunks of a predefined token size with optional overlap.",
    bedrock: "Default strategy in Bedrock Knowledge Bases. Configure max tokens (20–8192) and overlap percentage (0–99%).",
    howItWorks: [
      "Document is tokenized into a stream of tokens",
      "Tokens are grouped into chunks of a fixed max size",
      "An overlap window carries context between consecutive chunks",
      "Metadata (source, page number) is attached to each chunk"
    ],
    pros: ["Simple and predictable", "Low compute cost", "Easy to reason about storage and retrieval", "Works well for uniform documents"],
    cons: ["Can split mid-sentence or mid-paragraph", "No awareness of semantic boundaries", "Overlap adds redundancy and storage cost"],
    params: [
      { name: "maxTokens", label: "Max Tokens", min: 20, max: 8192, default: 300, step: 10 },
      { name: "overlapPercentage", label: "Overlap %", min: 0, max: 99, default: 20, step: 1 }
    ],
    useCases: ["FAQs & support articles", "Uniform structured docs", "High-volume ingestion pipelines"],
    example: {
      text: "Amazon Bedrock is a fully managed service that offers a choice of high-performing foundation models from leading AI companies. It provides a single API to access these models. You can customize them with your data using techniques like fine-tuning and RAG. Bedrock also offers tools for building AI agents that can execute complex tasks.",
      split: (max, overlap) => {
        const words = "Amazon Bedrock is a fully managed service that offers a choice of high-performing foundation models from leading AI companies. It provides a single API to access these models. You can customize them with your data using techniques like fine-tuning and RAG. Bedrock also offers tools for building AI agents that can execute complex tasks.".split(" ");
        const chunkWords = Math.max(3, Math.round(max / 8));
        const overlapWords = Math.max(0, Math.round(chunkWords * overlap / 100));
        const chunks = [];
        let i = 0;
        while (i < words.length) {
          chunks.push(words.slice(i, i + chunkWords).join(" "));
          i += chunkWords - overlapWords;
          if (i >= words.length) break;
        }
        return chunks;
      }
    }
  },
  {
    id: "semantic",
    name: "Semantic Chunking",
    icon: "◎",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.25)",
    summary: "Groups text by semantic similarity using embedding models to find natural breakpoints.",
    bedrock: "Available in Bedrock Knowledge Bases. Uses a Bedrock embedding model to compute similarity. Configure max tokens, buffer size, and breakpoint percentile threshold.",
    howItWorks: [
      "Document is split into initial sentences or small segments",
      "Each segment is embedded using a foundation model (e.g. Titan Embeddings)",
      "Cosine similarity is computed between consecutive segment embeddings",
      "Breakpoints are inserted where similarity drops below the percentile threshold",
      "Adjacent similar segments are merged into semantically coherent chunks"
    ],
    pros: ["Preserves meaning and context", "Chunks align with topic boundaries", "Better retrieval relevance for complex docs"],
    cons: ["Higher compute cost (embedding each segment)", "Slower ingestion pipeline", "Threshold tuning can be tricky", "Max chunk size still applies as a hard limit"],
    params: [
      { name: "maxTokens", label: "Max Tokens", min: 20, max: 8192, default: 500, step: 10 },
      { name: "bufferSize", label: "Buffer Size", min: 0, max: 5, default: 1, step: 1 },
      { name: "breakpointThreshold", label: "Breakpoint Percentile", min: 50, max: 99, default: 95, step: 1 }
    ],
    useCases: ["Research papers & whitepapers", "Legal & compliance docs", "Multi-topic long-form content"],
    example: {
      text: null,
      visual: true,
      segments: [
        { text: "Amazon Bedrock is a fully managed service.", topic: "A" },
        { text: "It offers foundation models from leading AI companies.", topic: "A" },
        { text: "You can access these models through a single API.", topic: "A" },
        { text: "Fine-tuning lets you customize models with your data.", topic: "B" },
        { text: "RAG connects models to your knowledge bases.", topic: "B" },
        { text: "Agents can execute multi-step tasks autonomously.", topic: "C" },
        { text: "They integrate with Lambda functions and APIs.", topic: "C" },
      ]
    }
  },
  {
    id: "hierarchical",
    name: "Hierarchical Chunking",
    icon: "⊞",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    summary: "Creates parent and child chunks at two levels of granularity for multi-resolution retrieval.",
    bedrock: "Bedrock Knowledge Bases supports a two-tier hierarchy. Configure max tokens and overlap for both parent and child levels independently.",
    howItWorks: [
      "Document is first split into large parent chunks",
      "Each parent chunk is further divided into smaller child chunks",
      "During retrieval, child chunks are matched against the query",
      "The parent chunk provides broader context to the LLM",
      "This enables both precise matching and rich context in responses"
    ],
    pros: ["Best of both worlds: precision + context", "Reduces hallucination from missing context", "Great for documents with nested structure"],
    cons: ["More complex indexing and storage", "Requires careful sizing of both tiers", "Higher storage footprint"],
    params: [
      { name: "parentMaxTokens", label: "Parent Max Tokens", min: 100, max: 8192, default: 1500, step: 50 },
      { name: "childMaxTokens", label: "Child Max Tokens", min: 20, max: 4096, default: 300, step: 10 },
      { name: "overlapTokens", label: "Overlap Tokens", min: 0, max: 200, default: 60, step: 5 }
    ],
    useCases: ["Technical documentation", "Product manuals", "Books and long reports"],
    example: { visual: "hierarchy" }
  },
  {
    id: "none",
    name: "No Chunking",
    icon: "▣",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    summary: "Each document is treated as a single chunk. Best for short, self-contained documents.",
    bedrock: "Select 'No chunking' in the Knowledge Base configuration. Each file becomes one vector embedding.",
    howItWorks: [
      "The entire document content is embedded as a single vector",
      "No splitting or overlap logic is applied",
      "Retrieval returns whole documents ranked by similarity",
      "Works best when documents are already short and focused"
    ],
    pros: ["Zero information loss from splitting", "Simplest configuration", "Ideal for pre-chunked or short content"],
    cons: ["Doesn't scale to large documents", "Wastes context window on irrelevant content", "Poor retrieval precision for long docs", "Embedding quality degrades with length"],
    params: [],
    useCases: ["FAQ entries", "Product descriptions", "Pre-chunked content", "Metadata-rich short records"],
    example: { visual: "single" }
  }
];

const comparisonData = [
  { dim: "Retrieval Precision", fixed: 3, semantic: 5, hierarchical: 4, none: 2 },
  { dim: "Context Preservation", fixed: 2, semantic: 4, hierarchical: 5, none: 5 },
  { dim: "Ingestion Speed", fixed: 5, semantic: 2, hierarchical: 3, none: 5 },
  { dim: "Storage Efficiency", fixed: 3, semantic: 4, hierarchical: 2, none: 4 },
  { dim: "Config Simplicity", fixed: 4, semantic: 2, hierarchical: 2, none: 5 },
];

const decisionTree = [
  { q: "Are your documents short (< 500 tokens each)?", yes: "none", no: 1 },
  { q: "Do your documents cover multiple distinct topics?", yes: 2, no: "fixed" },
  { q: "Do you need both precise answers and surrounding context?", yes: "hierarchical", no: "semantic" },
];

function Bar({ value, max = 5, color }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 18, height: 10, borderRadius: 3,
          background: i <= value ? color : "rgba(255,255,255,0.08)",
          transition: "background 0.3s"
        }} />
      ))}
    </div>
  );
}

function ParamSlider({ param, value, onChange, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#ccc" }}>
        <span>{param.label}</span>
        <span style={{ color, fontWeight: 600 }}>{value}</span>
      </div>
      <input type="range" min={param.min} max={param.max} step={param.step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }} />
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("fixed");
  const [tab, setTab] = useState("explore");
  const [params, setParams] = useState({
    fixed: { maxTokens: 300, overlapPercentage: 20 },
    semantic: { maxTokens: 500, bufferSize: 1, breakpointThreshold: 95 },
    hierarchical: { parentMaxTokens: 1500, childMaxTokens: 300, overlapTokens: 60 },
    none: {}
  });
  const [dtStep, setDtStep] = useState(0);
  const [dtResult, setDtResult] = useState(null);

  const s = strategies.find(x => x.id === active);
  const p = params[active];
  const setP = (key, val) => setParams(prev => ({ ...prev, [active]: { ...prev[active], [key]: val } }));

  const resetDT = () => { setDtStep(0); setDtResult(null); };

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", color: "#E5E7EB", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "36px 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ background: "linear-gradient(135deg,#FF9900,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 14, letterSpacing: 1.5 }}>AWS BEDROCK</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Chunking Strategies</h1>
          <p style={{ color: "#9CA3AF", marginTop: 8, fontSize: 15, lineHeight: 1.6, maxWidth: 650 }}>
            How you chunk documents for Knowledge Bases directly impacts retrieval quality, latency, and cost. Explore each strategy interactively.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {/* Top tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4 }}>
          {[["explore","Explore Strategies"],["compare","Compare"],["decide","Decision Helper"]].map(([k,l]) => (
            <button key={k} onClick={() => { setTab(k); if(k==="decide") resetDT(); }}
              style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
                background: tab === k ? "rgba(255,255,255,0.1)" : "transparent",
                color: tab === k ? "#fff" : "#6B7280", transition: "all 0.2s" }}>
              {l}
            </button>
          ))}
        </div>

        {/* ===== EXPLORE TAB ===== */}
        {tab === "explore" && <>
          {/* Strategy selector cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
            {strategies.map(st => (
              <button key={st.id} onClick={() => setActive(st.id)}
                style={{ background: active === st.id ? st.bg : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${active === st.id ? st.border : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12, padding: "16px 10px", cursor: "pointer", textAlign: "center", transition: "all 0.25s" }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{st.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: active === st.id ? st.color : "#9CA3AF", lineHeight: 1.3 }}>{st.name}</div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: 28, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{s.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: s.color }}>{s.name}</h2>
                <p style={{ margin: "4px 0 0", fontSize: 14, color: "#9CA3AF" }}>{s.summary}</p>
              </div>
            </div>

            {/* Bedrock config note */}
            <div style={{ background: "rgba(255,153,0,0.08)", border: "1px solid rgba(255,153,0,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#F59E0B", lineHeight: 1.6 }}>
              <strong>Bedrock Config:</strong> {s.bedrock}
            </div>

            {/* Two column: How it works + Params */}
            <div style={{ display: "grid", gridTemplateColumns: s.params.length ? "1fr 1fr" : "1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>How It Works</h3>
                {s.howItWorks.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "#D1D5DB", lineHeight: 1.5 }}>
                    <span style={{ background: s.color, color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {s.params.length > 0 && (
                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 18 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Parameters</h3>
                  {s.params.map(param => (
                    <ParamSlider key={param.name} param={param} value={p[param.name]} onChange={v => setP(param.name, v)} color={s.color} />
                  ))}
                </div>
              )}
            </div>

            {/* Pros / Cons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={{ background: "rgba(16,185,129,0.06)", borderRadius: 10, padding: 16 }}>
                <h4 style={{ color: "#10B981", fontSize: 13, marginTop: 0, marginBottom: 8 }}>✓ Strengths</h4>
                {s.pros.map((t,i) => <div key={i} style={{ fontSize: 13, color: "#D1D5DB", marginBottom: 5, paddingLeft: 8 }}>• {t}</div>)}
              </div>
              <div style={{ background: "rgba(239,68,68,0.06)", borderRadius: 10, padding: 16 }}>
                <h4 style={{ color: "#EF4444", fontSize: 13, marginTop: 0, marginBottom: 8 }}>✗ Trade-offs</h4>
                {s.cons.map((t,i) => <div key={i} style={{ fontSize: 13, color: "#D1D5DB", marginBottom: 5, paddingLeft: 8 }}>• {t}</div>)}
              </div>
            </div>

            {/* Use cases */}
            {s.useCases && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, lineHeight: "28px" }}>Best for:</span>
                {s.useCases.map((uc,i) => (
                  <span key={i} style={{ background: `${s.color}22`, color: s.color, fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 500 }}>{uc}</span>
                ))}
              </div>
            )}

            {/* Interactive example for fixed */}
            {active === "fixed" && s.example.split && (
              <div style={{ marginTop: 20, background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: 18 }}>
                <h4 style={{ color: "#fff", fontSize: 13, marginTop: 0, textTransform: "uppercase", letterSpacing: 1 }}>Live Preview</h4>
                <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>Adjust the sliders above to see how the text gets split.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.example.split(p.maxTokens, p.overlapPercentage).map((chunk, i) => (
                    <div key={i} style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#D1D5DB", lineHeight: 1.5 }}>
                      <span style={{ color: s.color, fontWeight: 700, fontSize: 11, marginRight: 8 }}>CHUNK {i+1}</span>{chunk}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual for semantic */}
            {active === "semantic" && (
              <div style={{ marginTop: 20, background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: 18 }}>
                <h4 style={{ color: "#fff", fontSize: 13, marginTop: 0, textTransform: "uppercase", letterSpacing: 1 }}>Semantic Grouping Visualization</h4>
                <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>Sentences with similar meaning are grouped together. Color = topic cluster.</p>
                {["A","B","C"].map(topic => {
                  const segs = s.example.segments.filter(x => x.topic === topic);
                  const colors = { A: "#8B5CF6", B: "#EC4899", C: "#06B6D4" };
                  const labels = { A: "Service Overview", B: "Customization", C: "Agents" };
                  return (
                    <div key={topic} style={{ background: `${colors[topic]}10`, border: `1px solid ${colors[topic]}30`, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                      <span style={{ color: colors[topic], fontWeight: 700, fontSize: 11, marginRight: 8 }}>CHUNK — {labels[topic]}</span>
                      <div style={{ fontSize: 13, color: "#D1D5DB", lineHeight: 1.6, marginTop: 4 }}>
                        {segs.map(sg => sg.text).join(" ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Visual for hierarchical */}
            {active === "hierarchical" && (
              <div style={{ marginTop: 20, background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: 18 }}>
                <h4 style={{ color: "#fff", fontSize: 13, marginTop: 0, textTransform: "uppercase", letterSpacing: 1 }}>Two-Tier Hierarchy</h4>
                <div style={{ border: `2px solid ${s.color}50`, borderRadius: 12, padding: 16, marginTop: 12 }}>
                  <div style={{ color: s.color, fontWeight: 700, fontSize: 12, marginBottom: 10 }}>PARENT CHUNK (up to {p.parentMaxTokens} tokens)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ background: `${s.color}18`, border: `1px solid ${s.color}35`, borderRadius: 8, padding: 12, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>CHILD {i}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>≤ {p.childMaxTokens} tokens</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 10, textAlign: "center" }}>
                    ↕ Overlap: {p.overlapTokens} tokens between children
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 12, lineHeight: 1.5 }}>
                  Query matches a <strong style={{color:"#fff"}}>child chunk</strong> → LLM receives the full <strong style={{color:"#fff"}}>parent chunk</strong> as context.
                </p>
              </div>
            )}

            {/* Visual for none */}
            {active === "none" && (
              <div style={{ marginTop: 20, background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: 18, textAlign: "center" }}>
                <div style={{ border: `2px solid ${s.color}50`, borderRadius: 12, padding: 24, display: "inline-block", minWidth: 300 }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                  <div style={{ color: s.color, fontWeight: 700, fontSize: 13 }}>Entire Document = 1 Chunk</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Single vector embedding per file</div>
                </div>
              </div>
            )}
          </div>
        </>}

        {/* ===== COMPARE TAB ===== */}
        {tab === "compare" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 20px", color: "#fff" }}>Strategy Comparison</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#6B7280", fontWeight: 600 }}>Dimension</th>
                    {strategies.map(st => (
                      <th key={st.id} style={{ textAlign: "center", padding: "10px 12px", color: st.color, fontWeight: 700 }}>
                        <span style={{ fontSize: 18, display: "block", marginBottom: 2 }}>{st.icon}</span>
                        {st.name.replace(" Chunking", "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "12px", color: "#D1D5DB", fontWeight: 500 }}>{row.dim}</td>
                      {strategies.map(st => (
                        <td key={st.id} style={{ padding: "12px", textAlign: "center" }}>
                          <Bar value={row[st.id]} color={st.color} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Terraform Snippet</h3>
              <div style={{ background: "#0d1117", borderRadius: 10, padding: 16, fontSize: 12, fontFamily: "'Fira Code',monospace", color: "#c9d1d9", overflowX: "auto", lineHeight: 1.7 }}>
                <span style={{ color: "#7ee787" }}>chunking_configuration</span> {"{"}<br/>
                &nbsp;&nbsp;<span style={{ color: "#79c0ff" }}>chunking_strategy</span> = <span style={{ color: "#a5d6ff" }}>"FIXED_SIZE"</span><br/>
                &nbsp;&nbsp;<span style={{ color: "#7ee787" }}>fixed_size_chunking_configuration</span> {"{"}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#79c0ff" }}>max_tokens</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span style={{ color: "#f2cc60" }}>300</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#79c0ff" }}>overlap_percentage</span> = <span style={{ color: "#f2cc60" }}>20</span><br/>
                &nbsp;&nbsp;{"}"}<br/>
                {"}"}
              </div>
            </div>
          </div>
        )}

        {/* ===== DECISION HELPER TAB ===== */}
        {tab === "decide" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>Which Strategy Should You Use?</h2>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Answer a few questions to get a recommendation.</p>

            {dtResult === null ? (
              <div>
                {decisionTree.slice(0, dtStep + 1).map((node, i) => (
                  <div key={i} style={{ marginBottom: 20, opacity: i < dtStep ? 0.4 : 1, transition: "opacity 0.3s" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 12 }}>{node.q}</div>
                    {i === dtStep && (
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => {
                          const next = node.yes;
                          if (typeof next === "string") setDtResult(next);
                          else setDtStep(next);
                        }} style={{ padding: "10px 28px", borderRadius: 8, border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.1)", color: "#10B981", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Yes</button>
                        <button onClick={() => {
                          const next = node.no;
                          if (typeof next === "string") setDtResult(next);
                          else setDtStep(next);
                        }} style={{ padding: "10px 28px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", color: "#EF4444", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>No</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {(() => {
                  const rec = strategies.find(x => x.id === dtResult);
                  return (
                    <div style={{ background: rec.bg, border: `2px solid ${rec.border}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>{rec.icon}</div>
                      <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>Recommended Strategy</div>
                      <h3 style={{ fontSize: 22, fontWeight: 700, color: rec.color, margin: "0 0 8px" }}>{rec.name}</h3>
                      <p style={{ fontSize: 14, color: "#D1D5DB", maxWidth: 450, margin: "0 auto 16px", lineHeight: 1.6 }}>{rec.summary}</p>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        {rec.useCases.map((uc,i) => (
                          <span key={i} style={{ background: `${rec.color}22`, color: rec.color, fontSize: 12, padding: "4px 12px", borderRadius: 20 }}>{uc}</span>
                        ))}
                      </div>
                      <button onClick={resetDT} style={{ marginTop: 20, padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#9CA3AF", cursor: "pointer", fontSize: 13 }}>Start Over</button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: "#4B5563" }}>
          Bedrock Knowledge Bases · Chunking Strategies Reference
        </div>
      </div>
    </div>
  );
}