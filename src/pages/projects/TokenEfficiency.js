import { useState, useMemo } from "react";

const sections = [
  { id: "tokens", label: "Token Efficiency", icon: "⚡" },
  { id: "caching", label: "Prompt Caching", icon: "💾" },
  { id: "calc", label: "Cost Calculator", icon: "🧮" },
  { id: "patterns", label: "Architecture Patterns", icon: "🏗" },
];

const tokenTechniques = [
  {
    id: "prompt-eng",
    name: "Prompt Engineering",
    icon: "✏️",
    color: "#3B82F6",
    impact: "High",
    impactColor: "#10B981",
    effort: "Low",
    description: "Reduce token consumption by crafting concise, structured prompts that minimize redundancy while preserving instruction quality.",
    tactics: [
      { title: "System prompt compression", detail: "Move static instructions to system prompts (cached separately). Remove filler words, use abbreviated references for repeated concepts.", savings: "15–30%" },
      { title: "Few-shot → zero-shot with schema", detail: "Replace verbose examples with JSON schema or XML structure definitions. Models like Claude and Titan follow schemas well.", savings: "40–60%" },
      { title: "Output token budgeting", detail: "Set max_tokens precisely. Use stop_sequences to halt generation early. Request structured output (JSON) to avoid prose padding.", savings: "10–25%" },
      { title: "Context window pruning", detail: "For multi-turn conversations, summarize older turns instead of passing full history. Keep only the last N relevant turns.", savings: "30–50%" },
    ]
  },
  {
    id: "model-select",
    name: "Model Selection",
    icon: "🎯",
    color: "#8B5CF6",
    impact: "High",
    impactColor: "#10B981",
    effort: "Medium",
    description: "Match model capability to task complexity. Not every request needs the most powerful (and expensive) model.",
    tactics: [
      { title: "Model routing by complexity", detail: "Use a lightweight classifier or rule engine to route simple tasks (extraction, classification) to Haiku/Lite models and complex tasks (reasoning, generation) to Sonnet/Opus.", savings: "50–80%" },
      { title: "Smaller models for preprocessing", detail: "Use a cheaper model to clean, format, or summarize inputs before sending to a more capable model for the final response.", savings: "30–40%" },
      { title: "Cross-provider benchmarking", detail: "Bedrock gives access to Anthropic, Meta, Mistral, Amazon, Cohere, and AI21. Benchmark task-specific accuracy vs. cost across providers.", savings: "20–60%" },
      { title: "Provisioned Throughput", detail: "For sustained workloads (>1000 requests/hr), Provisioned Throughput gives a flat hourly rate that can be cheaper than on-demand per-token pricing.", savings: "Variable" },
    ]
  },
  {
    id: "rag-opt",
    name: "RAG Optimization",
    icon: "📚",
    color: "#F59E0B",
    impact: "Medium",
    impactColor: "#F59E0B",
    effort: "Medium",
    description: "Minimize tokens spent on retrieved context by improving retrieval precision and compressing chunks before injection.",
    tactics: [
      { title: "Top-K tuning", detail: "Reduce the number of retrieved chunks (default is often 5). Many queries only need 2–3 highly relevant chunks. Fewer chunks = fewer input tokens.", savings: "20–50%" },
      { title: "Re-ranking with Cohere/cross-encoder", detail: "Retrieve a broader set (top-20), then re-rank and take only top-3. Bedrock supports Cohere Rerank natively.", savings: "25–40%" },
      { title: "Chunk compression", detail: "Post-retrieval, use a small model to extract only the relevant sentences from each chunk before injecting into the final prompt.", savings: "30–50%" },
      { title: "Metadata filtering", detail: "Use Knowledge Base metadata filters to narrow the search space before vector similarity. Reduces irrelevant chunks significantly.", savings: "15–30%" },
    ]
  },
  {
    id: "batch",
    name: "Batching & Async",
    icon: "📦",
    color: "#EC4899",
    impact: "Medium",
    impactColor: "#F59E0B",
    effort: "Low",
    description: "Use Bedrock's batch inference and async invocation to reduce costs for non-real-time workloads.",
    tactics: [
      { title: "Batch inference API", detail: "Submit large sets of prompts as a batch job. Bedrock processes them asynchronously at a 50% discount compared to on-demand pricing.", savings: "50%" },
      { title: "Combine related requests", detail: "If multiple questions target the same context, combine them into a single prompt with numbered responses instead of separate API calls.", savings: "20–40%" },
      { title: "Async invocation with S3", detail: "Use InvokeModelWithResponseStream or async patterns with S3 output for non-interactive workloads. Avoid paying for idle connections.", savings: "10–20%" },
      { title: "Queue-based architecture", detail: "Buffer requests in SQS, process in batches on a schedule. Smooth out spikes and enable batch pricing for bursty workloads.", savings: "30–50%" },
    ]
  },
];

const cachingDetails = {
  overview: {
    title: "Prompt Caching in Bedrock",
    description: "Prompt Caching allows you to cache frequently used prompt prefixes (system prompts, few-shot examples, document context) so subsequent requests referencing the same prefix are served at reduced cost and lower latency. The cache operates at the token level — if the prefix of your prompt matches a cached version, you only pay reduced rates for the cached portion.",
  },
  supported: [
    { model: "Claude 3.5 Sonnet", provider: "Anthropic", minTokens: 1024, ttl: "5 min", writeMultiplier: "1.25×", readDiscount: "0.1× (90% off)" },
    { model: "Claude 3.5 Haiku", provider: "Anthropic", minTokens: 1024, ttl: "5 min", writeMultiplier: "1.25×", readDiscount: "0.1× (90% off)" },
    { model: "Claude 3 Opus", provider: "Anthropic", minTokens: 1024, ttl: "5 min", writeMultiplier: "1.25×", readDiscount: "0.1× (90% off)" },
    { model: "Nova Micro / Lite / Pro", provider: "Amazon", minTokens: 0, ttl: "Auto", writeMultiplier: "—", readDiscount: "Up to 90% off" },
  ],
  howItWorks: [
    { step: "Mark Cache Points", detail: "Add cache_control breakpoints in your prompt structure (system, messages) to indicate which prefix to cache." },
    { step: "First Request (Cold)", detail: "Bedrock processes the full prompt and writes the prefix to cache. You pay the write multiplier (1.25×) on cached tokens." },
    { step: "Subsequent Requests (Warm)", detail: "If the prefix matches exactly, cached tokens are read at 90% discount. Only new/changed tokens are processed at full price." },
    { step: "TTL Expiry", detail: "Cache entries expire after ~5 minutes of inactivity. The TTL resets on each cache hit. High-traffic prompts stay cached indefinitely." },
  ],
  cacheableContent: [
    { type: "System Prompts", icon: "📋", desc: "Long system instructions, persona definitions, output schemas", ideal: true },
    { type: "Document Context", icon: "📄", desc: "Injected documents, RAG chunks, reference materials", ideal: true },
    { type: "Few-Shot Examples", icon: "🎓", desc: "Static example pairs for consistent output formatting", ideal: true },
    { type: "Tool Definitions", icon: "🔧", desc: "Function/tool schemas for agent-based architectures", ideal: true },
    { type: "Conversation History", icon: "💬", desc: "Previous turns in multi-turn chat (grows each turn)", ideal: false },
    { type: "User Query", icon: "❓", desc: "The final user message — usually unique per request", ideal: false },
  ],
  antiPatterns: [
    { pattern: "Randomized prompt prefixes", why: "Injecting timestamps, request IDs, or random seeds into the cached region invalidates the cache every time." },
    { pattern: "Reordering few-shot examples", why: "Cache matching is exact prefix. Shuffling examples creates a different prefix each time." },
    { pattern: "Caching too little", why: "Below the minimum token threshold (1024 for Claude), nothing gets cached. Ensure your cached block exceeds the minimum." },
    { pattern: "Low-traffic endpoints", why: "With a 5-minute TTL, endpoints with <12 requests/hour will rarely get cache hits. Batch or consolidate traffic." },
  ]
};

const models = [
  { name: "Claude 3.5 Sonnet", inputPer1K: 0.003, outputPer1K: 0.015, cacheReadPer1K: 0.0003, cacheWritePer1K: 0.00375 },
  { name: "Claude 3.5 Haiku", inputPer1K: 0.0008, outputPer1K: 0.004, cacheReadPer1K: 0.00008, cacheWritePer1K: 0.001 },
  { name: "Claude 3 Opus", inputPer1K: 0.015, outputPer1K: 0.075, cacheReadPer1K: 0.0015, cacheWritePer1K: 0.01875 },
  { name: "Nova Pro", inputPer1K: 0.0008, outputPer1K: 0.0032, cacheReadPer1K: 0.00008, cacheWritePer1K: 0.001 },
  { name: "Nova Lite", inputPer1K: 0.00006, outputPer1K: 0.00024, cacheReadPer1K: 0.000006, cacheWritePer1K: 0.000075 },
];

const archPatterns = [
  {
    id: "tiered-routing",
    name: "Tiered Model Routing",
    color: "#3B82F6",
    diagram: [
      { label: "API Gateway", type: "entry" },
      { label: "Complexity\nClassifier", type: "decision" },
      { label: "Haiku / Nova Lite\n(Simple)", type: "model", branch: "left" },
      { label: "Sonnet / Nova Pro\n(Complex)", type: "model", branch: "right" },
    ],
    description: "Route requests to cheaper models for simple tasks. A lightweight classifier (rule-based or small model) evaluates task complexity and selects the appropriate model tier.",
    savings: "50–70% average cost reduction",
    components: ["API Gateway", "Lambda (classifier)", "Bedrock (multi-model)", "CloudWatch (cost tracking)"],
  },
  {
    id: "cache-first",
    name: "Cache-First RAG Pipeline",
    color: "#8B5CF6",
    diagram: [
      { label: "User Query", type: "entry" },
      { label: "Semantic\nCache Check", type: "decision" },
      { label: "Return Cached\nResponse", type: "model", branch: "left" },
      { label: "RAG + LLM\n(Cache Miss)", type: "model", branch: "right" },
    ],
    description: "Add a semantic cache layer (e.g., ElastiCache + embeddings) before the RAG pipeline. Similar queries return cached responses, avoiding both retrieval and generation costs.",
    savings: "40–80% for repetitive query patterns",
    components: ["ElastiCache / DynamoDB", "Lambda", "Bedrock KB", "Bedrock (inference)", "S3"],
  },
  {
    id: "summarize-compress",
    name: "Summarize-then-Generate",
    color: "#F59E0B",
    diagram: [
      { label: "Long Document", type: "entry" },
      { label: "Haiku\nSummarizer", type: "decision" },
      { label: "Compressed\nContext", type: "model", branch: "left" },
      { label: "Sonnet/Opus\nGenerator", type: "model", branch: "right" },
    ],
    description: "Use a cheap model to compress retrieved context or long documents before sending to the primary model. Reduces input tokens by 50–70% while preserving key information.",
    savings: "40–60% input token reduction",
    components: ["S3 / Knowledge Base", "Bedrock (Haiku)", "Bedrock (Sonnet/Opus)", "Step Functions"],
  },
  {
    id: "batch-queue",
    name: "Batch Queue Pipeline",
    color: "#10B981",
    diagram: [
      { label: "Incoming\nRequests", type: "entry" },
      { label: "SQS Buffer\n& Batcher", type: "decision" },
      { label: "Batch Inference\nAPI (50% off)", type: "model", branch: "left" },
      { label: "Results → S3\n/ DynamoDB", type: "model", branch: "right" },
    ],
    description: "Buffer non-real-time requests in SQS, aggregate into batches, and submit via Bedrock's Batch Inference API at 50% discount. Results stored in S3 or DynamoDB for async retrieval.",
    savings: "50% flat discount on all tokens",
    components: ["SQS", "Lambda (batcher)", "Bedrock Batch API", "S3", "DynamoDB", "EventBridge"],
  },
];

function Pill({ children, color }) {
  return <span style={{ background: `${color}22`, color, fontSize: 11, padding: "3px 10px", borderRadius: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}

function SavingsBar({ text, color = "#10B981" }) {
  const match = text.match(/(\d+)/);
  const pct = match ? parseInt(match[0]) : 20;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 3, transition: "width 0.5s" }} />
      </div>
      <span style={{ color, fontWeight: 600, minWidth: 55, textAlign: "right" }}>{text}</span>
    </div>
  );
}

function FlowDiagram({ steps, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", padding: "12px 0" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            background: s.type === "entry" ? "rgba(255,255,255,0.08)" : s.type === "decision" ? `${color}20` : `${color}12`,
            border: `1.5px solid ${s.type === "entry" ? "rgba(255,255,255,0.15)" : `${color}40`}`,
            borderRadius: s.type === "decision" ? 12 : 10,
            padding: "10px 14px", textAlign: "center", minWidth: 90,
            fontSize: 11, fontWeight: 600, color: s.type === "entry" ? "#D1D5DB" : color, lineHeight: 1.4, whiteSpace: "pre-line"
          }}>
            {s.label}
          </div>
          {i < steps.length - 1 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>→</span>}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("tokens");
  const [expandedTech, setExpandedTech] = useState("prompt-eng");
  const [expandedPattern, setExpandedPattern] = useState("tiered-routing");

  // Calculator state
  const [calcModel, setCalcModel] = useState(0);
  const [reqPerDay, setReqPerDay] = useState(1000);
  const [inputTokens, setInputTokens] = useState(2000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [cachedPct, setCachedPct] = useState(60);
  const [cacheHitRate, setCacheHitRate] = useState(70);

  const m = models[calcModel];
  const calcResults = useMemo(() => {
    const daily = reqPerDay;
    const inTok = inputTokens;
    const outTok = outputTokens;
    const cachedTokens = Math.round(inTok * cachedPct / 100);
    const uncachedTokens = inTok - cachedTokens;
    const hitRate = cacheHitRate / 100;

    // Without caching
    const noCacheCostDay = daily * ((inTok / 1000) * m.inputPer1K + (outTok / 1000) * m.outputPer1K);

    // With caching
    const hitsPerDay = Math.round(daily * hitRate);
    const missesPerDay = daily - hitsPerDay;

    // Cache hits: cached portion at read price + uncached at full price
    const hitCost = hitsPerDay * ((cachedTokens / 1000) * m.cacheReadPer1K + (uncachedTokens / 1000) * m.inputPer1K + (outTok / 1000) * m.outputPer1K);
    // Cache misses: cached portion at write price + uncached at full price
    const missCost = missesPerDay * ((cachedTokens / 1000) * m.cacheWritePer1K + (uncachedTokens / 1000) * m.inputPer1K + (outTok / 1000) * m.outputPer1K);

    const withCacheCostDay = hitCost + missCost;
    const savingsDay = noCacheCostDay - withCacheCostDay;
    const savingsPct = noCacheCostDay > 0 ? (savingsDay / noCacheCostDay) * 100 : 0;

    return {
      noCacheDay: noCacheCostDay,
      noCacheMonth: noCacheCostDay * 30,
      withCacheDay: withCacheCostDay,
      withCacheMonth: withCacheCostDay * 30,
      savingsDay,
      savingsMonth: savingsDay * 30,
      savingsPct,
    };
  }, [calcModel, reqPerDay, inputTokens, outputTokens, cachedPct, cacheHitRate, m]);

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", color: "#E5E7EB", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #1a0a2e 100%)", padding: "36px 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ background: "linear-gradient(135deg,#FF9900,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 14, letterSpacing: 1.5 }}>AWS BEDROCK</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Token Efficiency & Caching Strategy</h1>
          <p style={{ color: "#9CA3AF", marginTop: 8, fontSize: 15, lineHeight: 1.6, maxWidth: 700 }}>
            Optimize your Bedrock spend by reducing token consumption, leveraging prompt caching, and choosing the right architecture patterns for your workloads.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {/* Section nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, overflowX: "auto" }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ flex: 1, padding: "10px 6px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: activeSection === s.id ? "rgba(255,255,255,0.1)" : "transparent",
                color: activeSection === s.id ? "#fff" : "#6B7280", transition: "all 0.2s", whiteSpace: "nowrap" }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* ===== TOKEN EFFICIENCY ===== */}
        {activeSection === "tokens" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
              {tokenTechniques.map(t => (
                <button key={t.id} onClick={() => setExpandedTech(t.id)}
                  style={{
                    background: expandedTech === t.id ? `${t.color}12` : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${expandedTech === t.id ? `${t.color}40` : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 12, padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.25s"
                  }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: expandedTech === t.id ? t.color : "#9CA3AF", lineHeight: 1.3 }}>{t.name}</div>
                  <div style={{ marginTop: 6 }}>
                    <Pill color={t.impactColor}>{t.impact} Impact</Pill>
                  </div>
                </button>
              ))}
            </div>

            {(() => {
              const t = tokenTechniques.find(x => x.id === expandedTech);
              return (
                <div style={{ background: `${t.color}08`, border: `1px solid ${t.color}25`, borderRadius: 16, padding: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 28 }}>{t.icon}</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.color }}>{t.name}</h2>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <Pill color={t.impactColor}>{t.impact} Impact</Pill>
                        <Pill color="#6B7280">{t.effort} Effort</Pill>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "#B0B7C3", lineHeight: 1.6, margin: "12px 0 20px" }}>{t.description}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {t.tactics.map((tac, i) => (
                      <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "16px 18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, marginBottom: 8 }}>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>{tac.title}</h4>
                          <Pill color="#10B981">~{tac.savings}</Pill>
                        </div>
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>{tac.detail}</p>
                        <SavingsBar text={tac.savings} color={t.color} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== PROMPT CACHING ===== */}
        {activeSection === "caching" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Overview */}
            <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: 28 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#8B5CF6" }}>{cachingDetails.overview.title}</h2>
              <p style={{ fontSize: 14, color: "#B0B7C3", lineHeight: 1.7, margin: 0 }}>{cachingDetails.overview.description}</p>
            </div>

            {/* How it works - horizontal steps */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#fff" }}>How It Works</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {cachingDetails.howItWorks.map((s, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <div style={{ background: "#8B5CF6", color: "#fff", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{i + 1}</div>
                    <h4 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#8B5CF6" }}>{s.step}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported models table */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, overflowX: "auto" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#fff" }}>Supported Models</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    {["Model", "Min Tokens", "TTL", "Cache Write", "Cache Read"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#6B7280", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cachingDetails.supported.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "#D1D5DB" }}>{r.model}</td>
                      <td style={{ padding: "10px 12px", color: "#9CA3AF" }}>{r.minTokens}</td>
                      <td style={{ padding: "10px 12px", color: "#9CA3AF" }}>{r.ttl}</td>
                      <td style={{ padding: "10px 12px" }}><Pill color="#F59E0B">{r.writeMultiplier}</Pill></td>
                      <td style={{ padding: "10px 12px" }}><Pill color="#10B981">{r.readDiscount}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* What to cache vs not */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#fff" }}>What to Cache</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {cachingDetails.cacheableContent.map((c, i) => (
                  <div key={i} style={{
                    background: c.ideal ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                    border: `1px solid ${c.ideal ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.15)"}`,
                    borderRadius: 10, padding: "14px 16px"
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{c.type}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.5 }}>{c.desc}</div>
                    <div style={{ marginTop: 8 }}>
                      <Pill color={c.ideal ? "#10B981" : "#EF4444"}>{c.ideal ? "✓ Cache This" : "✗ Don't Cache"}</Pill>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-patterns */}
            <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#EF4444" }}>⚠ Anti-Patterns to Avoid</h3>
              {cachingDetails.antiPatterns.map((ap, i) => (
                <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: i < cachingDetails.antiPatterns.length - 1 ? 10 : 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F87171", marginBottom: 4 }}>{ap.pattern}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>{ap.why}</div>
                </div>
              ))}
            </div>

            {/* Code example */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#fff" }}>Implementation Example</h3>
              <div style={{ background: "#0d1117", borderRadius: 10, padding: 18, fontSize: 12, fontFamily: "'Fira Code',monospace", color: "#c9d1d9", overflowX: "auto", lineHeight: 1.8 }}>
                <span style={{ color: "#7ee787" }}>import</span> boto3, json<br/><br/>
                client = boto3.<span style={{ color: "#79c0ff" }}>client</span>(<span style={{ color: "#a5d6ff" }}>"bedrock-runtime"</span>)<br/><br/>
                response = client.<span style={{ color: "#79c0ff" }}>invoke_model</span>(<br/>
                &nbsp;&nbsp;modelId=<span style={{ color: "#a5d6ff" }}>"anthropic.claude-3-5-sonnet-20241022-v2:0"</span>,<br/>
                &nbsp;&nbsp;body=json.dumps({"{"}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#a5d6ff" }}>"system"</span>: [{"{"}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#a5d6ff" }}>"type"</span>: <span style={{ color: "#a5d6ff" }}>"text"</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#a5d6ff" }}>"text"</span>: <span style={{ color: "#a5d6ff" }}>"Your long system prompt..."</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#f2cc60" }}>"cache_control"</span>: {"{"}<span style={{ color: "#a5d6ff" }}>"type"</span>: <span style={{ color: "#a5d6ff" }}>"ephemeral"</span>{"}"} <span style={{ color: "#6e7681" }}>  # ← cache breakpoint</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;{"}"}],<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#a5d6ff" }}>"messages"</span>: [{"{"}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#a5d6ff" }}>"role"</span>: <span style={{ color: "#a5d6ff" }}>"user"</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#a5d6ff" }}>"content"</span>: <span style={{ color: "#a5d6ff" }}>"User's unique query"</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;{"}"}],<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#a5d6ff" }}>"max_tokens"</span>: <span style={{ color: "#f2cc60" }}>1024</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#a5d6ff" }}>"anthropic_version"</span>: <span style={{ color: "#a5d6ff" }}>"bedrock-2023-05-31"</span><br/>
                &nbsp;&nbsp;{"}"})<br/>
                )
              </div>
            </div>
          </div>
        )}

        {/* ===== COST CALCULATOR ===== */}
        {activeSection === "calc" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#fff" }}>Caching Cost Calculator</h2>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Estimate how much prompt caching saves for your workload.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#9CA3AF", display: "block", marginBottom: 6, fontWeight: 600 }}>Model</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {models.map((md, i) => (
                      <button key={i} onClick={() => setCalcModel(i)}
                        style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${calcModel === i ? "#8B5CF6" : "rgba(255,255,255,0.1)"}`,
                          background: calcModel === i ? "rgba(139,92,246,0.15)" : "transparent",
                          color: calcModel === i ? "#8B5CF6" : "#9CA3AF", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        {md.name}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  { label: "Requests / Day", val: reqPerDay, set: setReqPerDay, min: 10, max: 100000, step: 10 },
                  { label: "Input Tokens / Request", val: inputTokens, set: setInputTokens, min: 100, max: 100000, step: 100 },
                  { label: "Output Tokens / Request", val: outputTokens, set: setOutputTokens, min: 50, max: 10000, step: 50 },
                  { label: "% of Input Tokens Cacheable", val: cachedPct, set: setCachedPct, min: 0, max: 100, step: 1 },
                  { label: "Cache Hit Rate %", val: cacheHitRate, set: setCacheHitRate, min: 0, max: 100, step: 1 },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#9CA3AF" }}>
                      <span style={{ fontWeight: 600 }}>{s.label}</span>
                      <span style={{ color: "#fff", fontWeight: 700 }}>{s.val.toLocaleString()}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                      onChange={e => s.set(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#8B5CF6" }} />
                  </div>
                ))}
              </div>

              {/* Results */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 600, marginBottom: 6 }}>WITHOUT CACHING</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#F87171" }}>${calcResults.noCacheDay.toFixed(2)} <span style={{ fontSize: 14, fontWeight: 500, color: "#9CA3AF" }}>/ day</span></div>
                  <div style={{ fontSize: 14, color: "#9CA3AF", marginTop: 2 }}>${calcResults.noCacheMonth.toFixed(2)} / month</div>
                </div>

                <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600, marginBottom: 6 }}>WITH CACHING</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#34D399" }}>${calcResults.withCacheDay.toFixed(2)} <span style={{ fontSize: 14, fontWeight: 500, color: "#9CA3AF" }}>/ day</span></div>
                  <div style={{ fontSize: 14, color: "#9CA3AF", marginTop: 2 }}>${calcResults.withCacheMonth.toFixed(2)} / month</div>
                </div>

                <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(16,185,129,0.1))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 12, color: "#A78BFA", fontWeight: 600, marginBottom: 6 }}>MONTHLY SAVINGS</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>${calcResults.savingsMonth.toFixed(2)}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#10B981" }}>{calcResults.savingsPct.toFixed(1)}% ↓</span>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${100 - calcResults.savingsPct}%`, height: "100%", background: "linear-gradient(90deg, #10B981, #8B5CF6)", borderRadius: 4, transition: "width 0.4s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                      <span>Cached cost</span><span>Original cost</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 14, fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
                  <strong style={{ color: "#9CA3AF" }}>Note:</strong> Estimates based on Bedrock on-demand pricing. Cache write cost ({m.cacheWritePer1K > 0 ? `$${m.cacheWritePer1K}/1K tokens` : "varies"}) is applied to cache misses. Actual costs may vary.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ARCHITECTURE PATTERNS ===== */}
        {activeSection === "patterns" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
              {archPatterns.map(p => (
                <button key={p.id} onClick={() => setExpandedPattern(p.id)}
                  style={{
                    background: expandedPattern === p.id ? `${p.color}12` : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${expandedPattern === p.id ? `${p.color}40` : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 12, padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.25s"
                  }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: expandedPattern === p.id ? p.color : "#9CA3AF", lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ marginTop: 8 }}><Pill color="#10B981">{p.savings}</Pill></div>
                </button>
              ))}
            </div>

            {(() => {
              const p = archPatterns.find(x => x.id === expandedPattern);
              return (
                <div style={{ background: `${p.color}08`, border: `1px solid ${p.color}25`, borderRadius: 16, padding: 28 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: p.color }}>{p.name}</h2>
                  <Pill color="#10B981">{p.savings}</Pill>

                  <p style={{ fontSize: 14, color: "#B0B7C3", lineHeight: 1.7, margin: "16px 0" }}>{p.description}</p>

                  {/* Flow diagram */}
                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <FlowDiagram steps={p.diagram} color={p.color} />
                  </div>

                  {/* AWS Components */}
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>AWS Components</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {p.components.map((c, i) => (
                        <span key={i} style={{ background: `${p.color}15`, border: `1px solid ${p.color}30`, color: p.color, fontSize: 12, padding: "5px 14px", borderRadius: 8, fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: "#4B5563" }}>
          AWS Bedrock · Token Efficiency & Caching Strategy Reference
        </div>
      </div>
    </div>
  );
}