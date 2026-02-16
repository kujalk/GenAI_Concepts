import { useState } from "react";


const tabs = ["problem", "reranker", "pipeline", "hybrid", "fullflow", "compare", "quiz"];
const tabLabels = { problem: "❓ The Problem", reranker: "🏆 Reranker Explained", pipeline: "🔄 Full Pipeline", hybrid: "🔀 Hybrid Search", fullflow: "🚀 Complete RAG Flow", compare: "📊 Compare", quiz: "🧪 Quiz" };

const Box = ({ icon, label, desc, bg, border, w = 140, highlight, small }) => (
  <div style={{ background: bg || "#fff", border: `${highlight ? 3 : 2}px solid ${border || "#cbd5e1"}`, borderRadius: 12, padding: small ? "8px 10px" : "12px 14px", width: w, textAlign: "center", flexShrink: 0, boxShadow: highlight ? `0 0 16px ${border}40` : "none" }}>
    <div style={{ fontSize: small ? 18 : 24 }}>{icon}</div>
    <div style={{ fontWeight: 700, fontSize: small ? 10 : 11, color: "#0f172a", marginTop: small ? 2 : 4 }}>{label}</div>
    {desc && <div style={{ fontSize: small ? 9 : 10, color: "#475569", marginTop: 3, lineHeight: 1.4 }}>{desc}</div>}
  </div>
);

const AD = ({ color = "#94a3b8", label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0" }}>
    {label && <div style={{ fontSize: 9, color, fontWeight: 700 }}>{label}</div>}
    <div style={{ fontSize: 16, color, fontWeight: 900 }}>↓</div>
  </div>
);

const AR = ({ color = "#94a3b8", label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, padding: "0 2px" }}>
    {label && <div style={{ fontSize: 9, color, fontWeight: 700, marginBottom: 1 }}>{label}</div>}
    <div style={{ fontSize: 16, color, fontWeight: 900 }}>→</div>
  </div>
);

const ChunkCard = ({ text, score, rank, highlight, faded }) => (
  <div style={{ background: highlight ? "#d1fae5" : faded ? "#f8fafc" : "#fff", border: `2px solid ${highlight ? "#10b981" : faded ? "#e2e8f0" : "#cbd5e1"}`, borderRadius: 10, padding: "8px 12px", opacity: faded ? 0.5 : 1, transition: "all 0.3s" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {rank && <span style={{ fontSize: 10, fontWeight: 800, color: highlight ? "#059669" : "#94a3b8" }}>#{rank}</span>}
      {score !== undefined && <span style={{ fontSize: 10, fontWeight: 700, color: highlight ? "#059669" : "#64748b", background: highlight ? "#a7f3d0" : "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>{score}</span>}
    </div>
    <div style={{ fontSize: 11, color: "#334155", marginTop: 4, lineHeight: 1.4 }}>{text}</div>
  </div>
);

const QuizCard = ({ q, opts, ans, explanation }) => {
  const [p, setP] = useState(null);
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "2px solid #e2e8f0", padding: 16, marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 }}>❓ {q}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map(o => (
          <button key={o} onClick={() => setP(o)} style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${!p ? "#cbd5e1" : o === ans ? "#10b981" : p === o ? "#ef4444" : "#cbd5e1"}`, background: !p ? "#f1f5f9" : o === ans ? "#d1fae5" : p === o ? "#fee2e2" : "#f1f5f9", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>{o}</button>
        ))}
      </div>
      {p && <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
        <span style={{ color: p === ans ? "#059669" : "#dc2626", fontWeight: 700 }}>{p === ans ? "✅ Correct!" : `❌ Answer: ${ans}`}</span>
        {explanation && <div style={{ color: "#64748b", marginTop: 4 }}>{explanation}</div>}
      </div>}
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState("problem");
  const [showReranked, setShowReranked] = useState(false);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 920, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, textAlign: "center" }}>🔍 Bedrock RAG: Reranker & Hybrid Search</h1>
      <p style={{ color: "#64748b", textAlign: "center", margin: "4px 0 16px", fontSize: 13 }}>When is reranker called? What is hybrid search? Full visual breakdown.</p>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 12px", borderRadius: 10, border: `2px solid ${tab === t ? "#2563eb" : "#e2e8f0"}`, background: tab === t ? "#dbeafe" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 11, color: tab === t ? "#1d4ed8" : "#64748b" }}>{tabLabels[t]}</button>
        ))}
      </div>

      {/* ========== THE PROBLEM ========== */}
      {tab === "problem" && (
        <div>
          <div style={{ background: "#fef2f2", border: "2px solid #ef4444", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#991b1b", marginBottom: 8 }}>🤔 Why Do We Need a Reranker?</div>
            <div style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.8 }}>
              When you do semantic search (k-NN) in OpenSearch, it returns chunks that are <strong>"roughly similar"</strong> based on vector distance. But vector similarity is <strong>not the same as relevance</strong>. A chunk can be semantically close but not actually answer the question.
            </div>
          </div>

          {/* Example */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Example: "What are the side effects of aspirin?"</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>OpenSearch returns these chunks by vector similarity:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ChunkCard rank={1} score="0.92" text="Aspirin was first synthesized in 1897 by Felix Hoffmann at Bayer..." />
              <ChunkCard rank={2} score="0.89" text="Common side effects of aspirin include stomach upset, heartburn, nausea..." highlight />
              <ChunkCard rank={3} score="0.87" text="Aspirin belongs to the NSAID class of drugs and works by inhibiting COX enzymes..." />
              <ChunkCard rank={4} score="0.85" text="In rare cases, aspirin can cause serious side effects including GI bleeding, allergic reactions..." highlight />
              <ChunkCard rank={5} score="0.82" text="The recommended dosage of aspirin for adults is 325-650mg every 4-6 hours..." />
            </div>
            <div style={{ marginTop: 12, background: "#fef2f2", borderRadius: 10, padding: 12, border: "1px solid #fca5a5" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b" }}>❌ Problem: Chunks #2 and #4 (actual answers!) are ranked 2nd and 4th</div>
              <div style={{ fontSize: 11, color: "#7f1d1d", marginTop: 4 }}>The history chunk (#1) is semantically close to "aspirin" but doesn't answer the question about side effects. If we only send top-2 to the LLM, we'd miss chunk #4!</div>
            </div>
          </div>

          <div style={{ background: "#d1fae5", border: "2px solid #10b981", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#065f46", marginBottom: 8 }}>💡 Solution: Reranker</div>
            <div style={{ fontSize: 13, color: "#065f46", lineHeight: 1.8 }}>
              A reranker model takes the query + each chunk and <strong>deeply analyzes how relevant each chunk actually is</strong> to the specific question. It then reorders them by <strong>true relevance</strong>, not just vector similarity. Think of it as a second, smarter judge.
            </div>
          </div>
        </div>
      )}

      {/* ========== RERANKER EXPLAINED ========== */}
      {tab === "reranker" && (
        <div>
          <div style={{ background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: 14, padding: 18, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#92400e" }}>🔑 When is the Reranker Called?</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#065f46", marginTop: 8 }}>AFTER retrieval from OpenSearch, BEFORE sending to LLM</div>
            <div style={{ fontSize: 13, color: "#78350f", marginTop: 6 }}>It sits between the vector search results and the final LLM prompt</div>
          </div>

          {/* Two-stage visual */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #3b82f6", padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1d4ed8", marginBottom: 16, textAlign: "center" }}>Two-Stage Retrieval Architecture</div>

            {/* Stage 1 */}
            <div style={{ background: "#dbeafe", borderRadius: 12, padding: 16, marginBottom: 6, border: "2px solid #93c5fd" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ background: "#3b82f6", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>STAGE 1</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#1d4ed8" }}>Initial Retrieval (Fast & Broad)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
                <Box icon="💬" label="User Query" desc='"Side effects of aspirin?"' bg="#fff" border="#3b82f6" w={130} />
                <AR color="#3b82f6" label="embed" />
                <Box icon="🧠" label="Embedding Model" desc="Query → Vector" bg="#fff" border="#3b82f6" w={120} />
                <AR color="#3b82f6" label="k-NN search" />
                <Box icon="🔍" label="OpenSearch" desc="Vector similarity search" bg="#fff" border="#3b82f6" w={120} />
                <AR color="#3b82f6" label="returns" />
                <Box icon="📄" label="Top 20-50 Chunks" desc="Roughly similar (noisy)" bg="#fef3c7" border="#f59e0b" w={130} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#1d4ed8", fontStyle: "italic" }}>⚡ Fast but imprecise — casts a wide net. Gets many potentially relevant chunks.</div>
            </div>

            <AD color="#3b82f6" label="pass chunks to reranker" />

            {/* Stage 2 */}
            <div style={{ background: "#d1fae5", borderRadius: 12, padding: 16, marginBottom: 6, border: "3px solid #10b981", boxShadow: "0 0 20px #10b98120" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ background: "#10b981", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>STAGE 2</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#065f46" }}>Reranking (Slow & Precise)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
                <Box icon="📄" label="20-50 Chunks" desc="From Stage 1" bg="#fef3c7" border="#f59e0b" w={120} />
                <AR color="#10b981" label="query + each chunk" />
                <Box icon="🏆" label="Bedrock Reranker" desc="Analyzes query-chunk relevance deeply" bg="#fff" border="#10b981" w={160} highlight />
                <AR color="#10b981" label="reordered" />
                <Box icon="✅" label="Top 3-5 Chunks" desc="Truly relevant, properly ranked!" bg="#d1fae5" border="#10b981" w={130} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#065f46", fontStyle: "italic" }}>🧠 Slow but precise — reads query + each chunk as a pair, scores true relevance. Outputs best chunks only.</div>
            </div>

            <AD color="#8b5cf6" label="top chunks + query → LLM" />

            <div style={{ background: "#ede9fe", borderRadius: 12, padding: 12, border: "2px solid #8b5cf6", textAlign: "center" }}>
              <span style={{ background: "#8b5cf6", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>STAGE 3</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#5b21b6", marginLeft: 8 }}>LLM Generation — Claude generates answer from top relevant chunks</span>
            </div>
          </div>

          {/* Interactive reranking demo */}
          <div style={{ background: "#fff", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>🔄 See Reranking in Action</div>
              <button onClick={() => setShowReranked(!showReranked)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: showReranked ? "#ef4444" : "#10b981", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                {showReranked ? "Show Original Order" : "Apply Reranker →"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: showReranked ? "#94a3b8" : "#1d4ed8", marginBottom: 8 }}>
                  {showReranked ? "❌ Before (Vector Similarity)" : "📊 Current: Vector Similarity Order"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: showReranked ? 0.4 : 1, transition: "opacity 0.3s" }}>
                  <ChunkCard rank={1} score="sim: 0.92" text="🏭 Aspirin history — synthesized in 1897 by Bayer..." />
                  <ChunkCard rank={2} score="sim: 0.89" text="💊 Common side effects: stomach upset, heartburn..." highlight={!showReranked} />
                  <ChunkCard rank={3} score="sim: 0.87" text="🧪 Aspirin is an NSAID, inhibits COX enzymes..." />
                  <ChunkCard rank={4} score="sim: 0.85" text="⚠️ Rare serious side effects: GI bleeding, allergic..." highlight={!showReranked} />
                  <ChunkCard rank={5} score="sim: 0.82" text="📋 Recommended dosage: 325-650mg every 4-6 hours..." />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: showReranked ? "#059669" : "#94a3b8", marginBottom: 8 }}>
                  {showReranked ? "✅ After Reranking (True Relevance)" : "→ Click 'Apply Reranker' to see"}
                </div>
                {showReranked ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <ChunkCard rank={1} score="rel: 0.97" text="💊 Common side effects: stomach upset, heartburn..." highlight />
                    <ChunkCard rank={2} score="rel: 0.94" text="⚠️ Rare serious side effects: GI bleeding, allergic..." highlight />
                    <ChunkCard rank={3} score="rel: 0.41" text="🧪 Aspirin is an NSAID, inhibits COX enzymes..." faded />
                    <ChunkCard rank={4} score="rel: 0.23" text="🏭 Aspirin history — synthesized in 1897 by Bayer..." faded />
                    <ChunkCard rank={5} score="rel: 0.12" text="📋 Recommended dosage: 325-650mg every 4-6 hours..." faded />
                    <div style={{ background: "#d1fae5", borderRadius: 8, padding: 10, marginTop: 4, fontSize: 11, color: "#065f46", fontWeight: 600 }}>
                      ✅ Now Top-2 are BOTH about side effects! History chunk dropped to #4. LLM gets the right context.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, background: "#f8fafc", borderRadius: 12, border: "2px dashed #cbd5e1" }}>
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>Click the button to see the difference →</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== PIPELINE ========== */}
      {tab === "pipeline" && (
        <div>
          <div style={{ background: "#f0f9ff", border: "2px solid #0ea5e9", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0369a1", marginBottom: 8 }}>📐 Exact Order of Operations</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>Here's the precise sequence, step by step. The reranker is step 4 of 6.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { step: 1, icon: "💬", title: "User asks a question", desc: '"What are the side effects of aspirin?"', detail: "Natural language query enters the system", color: "#3b82f6", bg: "#dbeafe" },
              { step: 2, icon: "🧠", title: "Embed the query", desc: "Query → Vector (e.g., Titan Embeddings)", detail: "Same embedding model used during indexing", color: "#8b5cf6", bg: "#ede9fe" },
              { step: 3, icon: "🔍", title: "Search OpenSearch", desc: "k-NN vector search → returns Top 20-50 chunks", detail: "Fast approximate nearest neighbor search. Wide net, includes some irrelevant chunks.", color: "#0ea5e9", bg: "#e0f2fe" },
              { step: 4, icon: "🏆", title: "RERANKER (Bedrock)", desc: "Takes query + 20-50 chunks → reorders by true relevance → returns Top 3-5", detail: "THIS IS WHERE THE RERANKER SITS. Cross-encoder model reads query-chunk pairs. Much more accurate than vector similarity.", color: "#10b981", bg: "#d1fae5", highlight: true },
              { step: 5, icon: "📝", title: "Build prompt", desc: "Top reranked chunks + original query → prompt template", detail: "Only the most relevant chunks go into the LLM context window", color: "#f59e0b", bg: "#fef3c7" },
              { step: 6, icon: "🤖", title: "LLM generates answer", desc: "Claude reads context + query → generates grounded answer", detail: "Better chunks = better, more accurate answer", color: "#ef4444", bg: "#fef2f2" },
            ].map((s, i) => (
              <div key={s.step}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 22, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: s.highlight ? "3px solid #065f46" : "none", boxShadow: s.highlight ? "0 0 16px #10b98140" : "none" }}>{s.icon}</div>
                    {i < 5 && <div style={{ width: 2, height: 30, background: "#cbd5e1" }} />}
                  </div>
                  <div style={{ background: s.bg, borderRadius: 12, padding: 14, border: `${s.highlight ? 3 : 2}px solid ${s.color}`, flex: 1, marginBottom: 4, boxShadow: s.highlight ? `0 0 20px ${s.color}30` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: s.color, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>Step {s.step}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: s.color }}>{s.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#0f172a", marginTop: 6, fontWeight: 600 }}>{s.desc}</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{s.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, background: "#fef3c7", borderRadius: 12, border: "2px solid #f59e0b", padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>🧠 Memory Trick: Reranker sits at Step 4 — <strong>AFTER</strong> getting chunks from OpenSearch (Step 3), <strong>BEFORE</strong> sending to LLM (Step 6). It's the bouncer at the door — only lets the truly relevant chunks through.</div>
          </div>
        </div>
      )}

      {/* ========== HYBRID SEARCH ========== */}
      {tab === "hybrid" && (
        <div>
          <div style={{ background: "#ede9fe", border: "2px solid #8b5cf6", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#5b21b6", marginBottom: 8 }}>🔀 What is Hybrid Search?</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
              Hybrid search combines <strong>two types of search</strong> and merges their results. This catches things that either search alone would miss.
            </div>
          </div>

          {/* The two search types */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ background: "#dbeafe", borderRadius: 14, border: "2px solid #3b82f6", padding: 18 }}>
              <div style={{ fontSize: 26, textAlign: "center" }}>📝</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1d4ed8", textAlign: "center" }}>Keyword Search (BM25)</div>
              <div style={{ fontSize: 12, color: "#1e3a5f", lineHeight: 1.8, marginTop: 10 }}>
                <div><strong>How:</strong> Exact word matching + TF-IDF scoring</div>
                <div><strong>Engine:</strong> OpenSearch's built-in full-text search</div>
                <div><strong>Good at:</strong> Exact terms, product names, codes, IDs, acronyms</div>
                <div><strong>Bad at:</strong> Synonyms, paraphrases, meaning</div>
              </div>
              <div style={{ marginTop: 10, background: "#fff", borderRadius: 8, padding: 10, fontSize: 11, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }}>Example:</div>
                <div>Query: "aspirin side effects"</div>
                <div style={{ color: "#059669" }}>✅ Finds: "side effects of aspirin include..."</div>
                <div style={{ color: "#dc2626" }}>❌ Misses: "adverse reactions to acetylsalicylic acid..."</div>
              </div>
            </div>
            <div style={{ background: "#ede9fe", borderRadius: 14, border: "2px solid #8b5cf6", padding: 18 }}>
              <div style={{ fontSize: 26, textAlign: "center" }}>🧠</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#5b21b6", textAlign: "center" }}>Semantic Search (k-NN)</div>
              <div style={{ fontSize: 12, color: "#3b0764", lineHeight: 1.8, marginTop: 10 }}>
                <div><strong>How:</strong> Vector embeddings + cosine similarity</div>
                <div><strong>Engine:</strong> OpenSearch k-NN plugin</div>
                <div><strong>Good at:</strong> Meaning, synonyms, paraphrases, intent</div>
                <div><strong>Bad at:</strong> Exact names, numbers, codes, acronyms</div>
              </div>
              <div style={{ marginTop: 10, background: "#fff", borderRadius: 8, padding: 10, fontSize: 11, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: "#5b21b6", marginBottom: 4 }}>Example:</div>
                <div>Query: "aspirin side effects"</div>
                <div style={{ color: "#059669" }}>✅ Finds: "adverse reactions to acetylsalicylic acid..."</div>
                <div style={{ color: "#dc2626" }}>❌ Misses: Exact match for "ASA-100mg" product code</div>
              </div>
            </div>
          </div>

          {/* Hybrid flow */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #f59e0b", padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 16, textAlign: "center" }}>🔀 How Hybrid Search Merges Results</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Box icon="💬" label="User Query" desc='"aspirin side effects"' bg="#fff" border="#0f172a" w={200} />
              <div style={{ fontSize: 14, color: "#64748b", fontWeight: 700 }}>↓ sent to BOTH searches simultaneously ↓</div>
              <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Box icon="📝" label="Keyword (BM25)" desc="Exact word matching" bg="#dbeafe" border="#3b82f6" w={160} />
                  <div style={{ fontSize: 12, color: "#3b82f6", fontWeight: 700 }}>↓</div>
                  <div style={{ background: "#dbeafe", borderRadius: 8, padding: 8, fontSize: 10, color: "#1d4ed8", textAlign: "center", width: 160 }}>
                    <div>Result A: score 8.5</div>
                    <div>Result B: score 7.2</div>
                    <div>Result C: score 6.1</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Box icon="🧠" label="Semantic (k-NN)" desc="Meaning-based vectors" bg="#ede9fe" border="#8b5cf6" w={160} />
                  <div style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 700 }}>↓</div>
                  <div style={{ background: "#ede9fe", borderRadius: 8, padding: 8, fontSize: 10, color: "#5b21b6", textAlign: "center", width: 160 }}>
                    <div>Result D: score 0.95</div>
                    <div>Result A: score 0.88</div>
                    <div>Result E: score 0.82</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#f59e0b", fontWeight: 900 }}>↓ Normalize + Merge ↓</div>
              <div style={{ background: "#fef3c7", borderRadius: 12, padding: 14, border: "2px solid #f59e0b", textAlign: "center", width: 300 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#92400e", marginBottom: 6 }}>Score Normalization</div>
                <div style={{ fontSize: 11, color: "#78350f", lineHeight: 1.6 }}>
                  BM25 scores (0-∞) and k-NN scores (0-1) are on different scales.
                  OpenSearch normalizes both to 0-1, then combines with configurable weights.
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 11, marginTop: 6, color: "#92400e", fontWeight: 700 }}>
                  final = (w₁ × keyword_score) + (w₂ × semantic_score)
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#10b981", fontWeight: 900 }}>↓</div>
              <Box icon="🏆" label="Merged Results" desc="Best of both worlds — then optionally reranked!" bg="#d1fae5" border="#10b981" w={280} highlight />
            </div>
          </div>

          {/* OpenSearch hybrid query */}
          <div style={{ background: "#1e293b", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>OpenSearch Hybrid Query Structure</div>
            <div style={{ fontFamily: "monospace", fontSize: 11, lineHeight: 1.8, color: "#e2e8f0" }}>
              <div>{"{"}</div>
              <div style={{ paddingLeft: 16, color: "#fcd34d" }}>"query": {"{"}</div>
              <div style={{ paddingLeft: 32, color: "#93c5fd" }}>"hybrid": {"{"}</div>
              <div style={{ paddingLeft: 48 }}>"queries": [</div>
              <div style={{ paddingLeft: 64, color: "#6ee7b7" }}>{"{"} "match": {"{"} "text": "aspirin side effects" {"}"} {"}"},  <span style={{ color: "#94a3b8" }}>// ← BM25 keyword</span></div>
              <div style={{ paddingLeft: 64, color: "#c4b5fd" }}>{"{"} "neural": {"{"} "embedding": {"{"} "query_text": "aspirin side effects", "model_id": "..." {"}"} {"}"} {"}"}  <span style={{ color: "#94a3b8" }}>// ← k-NN semantic</span></div>
              <div style={{ paddingLeft: 48 }}>]</div>
              <div style={{ paddingLeft: 32, color: "#93c5fd" }}>{"}"}</div>
              <div style={{ paddingLeft: 16, color: "#fcd34d" }}>{"}"}</div>
              <div>{"}"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========== FULL FLOW ========== */}
      {tab === "fullflow" && (
        <div>
          <div style={{ background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: 14, padding: 14, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e" }}>🚀 Complete Production RAG Pipeline: Hybrid Search + Reranker</div>
          </div>

          {/* Full pipeline */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #0f172a", padding: 20 }}>
            {[
              { step: "1", icon: "💬", title: "User Query", desc: '"What are aspirin side effects?"', bg: "#f8fafc", border: "#0f172a", w: "100%" },
              { step: "2", icon: "🧠", title: "Embed Query", desc: "Bedrock Titan Embeddings → query vector", bg: "#ede9fe", border: "#8b5cf6", w: "100%" },
              { step: "3a+3b", icon: "🔀", title: "Hybrid Search (Parallel)", desc: "BM25 keyword match + k-NN vector search run simultaneously in OpenSearch", bg: "#dbeafe", border: "#3b82f6", w: "100%", special: "hybrid" },
              { step: "4", icon: "⚖️", title: "Score Normalization & Merge", desc: "Normalize scores → combine with weights → get Top 20-50 chunks", bg: "#fef3c7", border: "#f59e0b", w: "100%" },
              { step: "5", icon: "🏆", title: "Bedrock Reranker", desc: "Cross-encoder deeply scores query-chunk pairs → reorders by true relevance → Top 3-5 chunks", bg: "#d1fae5", border: "#10b981", w: "100%", highlight: true },
              { step: "6", icon: "📝", title: "Build Prompt", desc: "Top reranked chunks + query → structured prompt template", bg: "#f8fafc", border: "#94a3b8", w: "100%" },
              { step: "7", icon: "🤖", title: "Bedrock LLM (Claude)", desc: "Generates grounded answer using relevant context", bg: "#fef2f2", border: "#ef4444", w: "100%" },
            ].map((s, i, arr) => (
              <div key={s.step}>
                <div style={{ background: s.bg, border: `${s.highlight ? 3 : 2}px solid ${s.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: s.highlight ? `0 0 16px ${s.border}40` : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: s.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: s.border }}>Step {s.step}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{s.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{s.desc}</div>
                  </div>
                  {s.special === "hybrid" && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <span style={{ background: "#dbeafe", border: "1px solid #3b82f6", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#1d4ed8" }}>BM25</span>
                      <span style={{ fontSize: 12 }}>+</span>
                      <span style={{ background: "#ede9fe", border: "1px solid #8b5cf6", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#5b21b6" }}>k-NN</span>
                    </div>
                  )}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ textAlign: "center", fontSize: 14, color: "#94a3b8", fontWeight: 900, padding: "2px 0" }}>↓</div>
                )}
              </div>
            ))}
          </div>

          {/* What Bedrock KB does natively */}
          <div style={{ marginTop: 20, background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 8 }}>✅ In Bedrock Knowledge Bases, You Just Configure This</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Search Strategy", value: "HYBRID", desc: "Combines semantic + keyword" },
                { label: "Reranking", value: "BEDROCK_RERANKING_MODEL", desc: "Enable reranker model" },
                { label: "numberOfResults", value: "Top K (e.g., 5)", desc: "Final chunks sent to LLM" },
              ].map(c => (
                <div key={c.label} style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #86efac", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{c.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#065f46", marginTop: 4 }}>{c.value}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#166534", fontStyle: "italic" }}>Bedrock Knowledge Bases handles the entire pipeline — you just set these options in the console or API!</div>
          </div>
        </div>
      )}

      {/* ========== COMPARE ========== */}
      {tab === "compare" && (
        <div>
          <div style={{ overflowX: "auto", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#fff" }}>
                  <th style={{ padding: 10, textAlign: "left", borderRadius: "10px 0 0 0" }}>Aspect</th>
                  <th style={{ padding: 10, textAlign: "center" }}><span style={{ color: "#93c5fd" }}>📝 Keyword (BM25)</span></th>
                  <th style={{ padding: 10, textAlign: "center" }}><span style={{ color: "#c4b5fd" }}>🧠 Semantic (k-NN)</span></th>
                  <th style={{ padding: 10, textAlign: "center" }}><span style={{ color: "#fcd34d" }}>🔀 Hybrid</span></th>
                  <th style={{ padding: 10, textAlign: "center", borderRadius: "0 10px 0 0" }}><span style={{ color: "#6ee7b7" }}>🏆 + Reranker</span></th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["How it works", "Exact word match + TF-IDF", "Vector similarity (cosine)", "Both combined", "Cross-encoder re-scores results"],
                  ["Good at", "Exact terms, names, codes", "Meaning, synonyms, intent", "Both strengths", "True relevance ranking"],
                  ["Bad at", "Synonyms, paraphrases", "Exact codes, acronyms", "Still noisy ordering", "Slower (reads each chunk)"],
                  ["Speed", "⚡ Very fast", "⚡ Fast", "⚡ Fast (parallel)", "🐢 Slower (per-chunk scoring)"],
                  ["Accuracy", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
                  ["When in pipeline", "Stage 1 (retrieval)", "Stage 1 (retrieval)", "Stage 1 (retrieval)", "Stage 2 (after retrieval)"],
                  ["Needs embedding?", "❌ No", "✅ Yes", "✅ Yes (for k-NN part)", "❌ No (uses raw text)"],
                ].map(([label, ...vals], i) => (
                  <tr key={label} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, borderBottom: "1px solid #e2e8f0", color: "#334155" }}>{label}</td>
                    {vals.map((v, j) => (
                      <td key={j} style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e2e8f0", color: "#475569", lineHeight: 1.5 }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: "#0f172a", borderRadius: 14, padding: 20, color: "#e2e8f0" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fcd34d", marginBottom: 10 }}>🧠 Exam Decision Tree</div>
            <div style={{ fontSize: 13, lineHeight: 2.4 }}>
              <div>Need to find <strong>exact product codes / names</strong>? → <span style={{ background: "#1e40af", padding: "2px 10px", borderRadius: 6 }}>📝 Keyword</span></div>
              <div>Need to understand <strong>meaning / intent</strong>? → <span style={{ background: "#5b21b6", padding: "2px 10px", borderRadius: 6 }}>🧠 Semantic</span></div>
              <div>Need <strong>both exact + meaning</strong>? → <span style={{ background: "#92400e", padding: "2px 10px", borderRadius: 6 }}>🔀 Hybrid</span></div>
              <div>Need <strong>highest accuracy, best chunk ranking</strong>? → <span style={{ background: "#065f46", padding: "2px 10px", borderRadius: 6 }}>🔀 Hybrid + 🏆 Reranker</span></div>
              <div>Using <strong>Bedrock Knowledge Bases</strong>? → All of the above is configurable in settings!</div>
            </div>
          </div>
        </div>
      )}

      {/* ========== QUIZ ========== */}
      {tab === "quiz" && (
        <div>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px", textAlign: "center" }}>Test yourself!</p>
          <QuizCard q="When in the RAG pipeline is the reranker called?" opts={["Before embedding the query", "After getting chunks from OpenSearch, before LLM", "After the LLM generates a response", "During indexing"]} ans="After getting chunks from OpenSearch, before LLM"
            explanation="Reranker sits between retrieval (Stage 1) and generation (Stage 3). It reorders retrieved chunks by true relevance." />
          <QuizCard q="What does a reranker model actually do?" opts={["Embeds documents into vectors", "Re-orders chunks by true query-chunk relevance", "Generates the final answer", "Splits documents into chunks"]} ans="Re-orders chunks by true query-chunk relevance"
            explanation="A reranker is a cross-encoder that reads query + each chunk as a pair and scores how relevant each chunk truly is." />
          <QuizCard q="Why is vector similarity alone not enough?" opts={["It's too slow", "Semantically close ≠ actually relevant to the question", "It can't handle large documents", "It requires GPUs"]} ans="Semantically close ≠ actually relevant to the question"
            explanation="A chunk about 'aspirin history' is semantically close to 'aspirin side effects' but doesn't answer the question." />
          <QuizCard q="Hybrid search combines which two methods?" opts={["Reranker + LLM", "Keyword (BM25) + Semantic (k-NN)", "Embedding + Chunking", "Indexing + Retrieval"]} ans="Keyword (BM25) + Semantic (k-NN)"
            explanation="Hybrid search runs BM25 keyword matching and k-NN vector search in parallel, then merges results." />
          <QuizCard q="What is keyword (BM25) search good at that semantic search isn't?" opts={["Understanding synonyms", "Exact terms, product codes, acronyms", "Understanding user intent", "Handling long documents"]} ans="Exact terms, product codes, acronyms"
            explanation="BM25 excels at exact matching. Semantic search might miss exact codes or acronyms that don't have strong vector representations." />
          <QuizCard q="In the two-stage retrieval, Stage 1 retrieves how many chunks?" opts={["3-5 (final amount)", "20-50 (wide net)", "All chunks in the index", "1 (the best match)"]} ans="20-50 (wide net)"
            explanation="Stage 1 casts a wide net (20-50 chunks), then the reranker in Stage 2 narrows it down to the truly relevant 3-5." />
          <QuizCard q="Does the reranker need vector embeddings to work?" opts={["Yes, it uses cosine similarity", "No, it reads raw text (query + chunk pairs)"]} ans="No, it reads raw text (query + chunk pairs)"
            explanation="Rerankers are cross-encoders — they take raw text (query, chunk) as input and output a relevance score. No embedding needed." />
          <QuizCard q="In Bedrock Knowledge Bases, how do you enable hybrid search + reranking?" opts={["Write custom Lambda code", "Configure searchStrategy=HYBRID and enable reranking in settings", "Deploy a separate reranker endpoint", "It's not supported"]} ans="Configure searchStrategy=HYBRID and enable reranking in settings"
            explanation="Bedrock Knowledge Bases supports hybrid search and reranking as built-in configuration options — no custom code needed." />
        </div>
      )}
    </div>
  );
}