import { useState } from "react";

const tabs = ["capabilities", "lambda", "monitoring", "quiz"];
const tabLabels = { capabilities: "🛡️ Capabilities", lambda: "🔧 Custom Lambda", monitoring: "📊 Monitoring", quiz: "🧪 Quiz" };

const QuizCard = ({ q, opts, ans, explanation }) => {
  const [p, setP] = useState(null);
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "2px solid #e2e8f0", padding: 16, marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 }}>{"❓ "}{q}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map(o => (
          <button key={o} onClick={() => setP(o)} style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${!p ? "#cbd5e1" : o === ans ? "#10b981" : p === o ? "#ef4444" : "#cbd5e1"}`, background: !p ? "#f1f5f9" : o === ans ? "#d1fae5" : p === o ? "#fee2e2" : "#f1f5f9", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>{o}</button>
        ))}
      </div>
      {p && <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
        <span style={{ color: p === ans ? "#059669" : "#dc2626", fontWeight: 700 }}>{p === ans ? "✅ Correct!" : "❌ Answer: " + ans}</span>
        {explanation && <div style={{ color: "#64748b", marginTop: 4 }}>{explanation}</div>}
      </div>}
    </div>
  );
};

const Box = ({ icon, label, desc, bg, border, w = 140, highlight }) => (
  <div style={{ background: bg || "#fff", border: `${highlight ? 3 : 2}px solid ${border || "#cbd5e1"}`, borderRadius: 12, padding: "12px 14px", width: w, textAlign: "center", flexShrink: 0, boxShadow: highlight ? `0 0 16px ${border}40` : "none" }}>
    <div style={{ fontSize: 24 }}>{icon}</div>
    <div style={{ fontWeight: 700, fontSize: 11, color: "#0f172a", marginTop: 4 }}>{label}</div>
    {desc && <div style={{ fontSize: 10, color: "#475569", marginTop: 3, lineHeight: 1.4 }}>{desc}</div>}
  </div>
);

const AD = ({ color = "#94a3b8", label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0" }}>
    {label && <div style={{ fontSize: 9, color, fontWeight: 700 }}>{label}</div>}
    <div style={{ fontSize: 16, color, fontWeight: 900 }}>{"↓"}</div>
  </div>
);

const MetricCard = ({ name, desc, dimensions, color, icon }) => (
  <div style={{ background: "#fff", borderRadius: 12, border: `2px solid ${color}`, padding: 14, marginBottom: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: 13, color }}>{name}</span>
    </div>
    <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, marginBottom: 8 }}>{desc}</div>
    {dimensions && (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {dimensions.map(d => (
          <span key={d} style={{ background: `${color}15`, border: `1px solid ${color}50`, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600, color }}>{d}</span>
        ))}
      </div>
    )}
  </div>
);

const LogRow = ({ field, value, indent = 0, isComment }) => (
  <div style={{ paddingLeft: indent * 20, fontFamily: "monospace", fontSize: 11, lineHeight: 1.9, color: isComment ? "#6ee7b7" : "#e2e8f0" }}>
    {field && <span style={{ color: "#93c5fd" }}>{field}</span>}
    {field && ": "}
    <span style={{ color: value === "BLOCKED" ? "#fca5a5" : value === "ANONYMIZED" ? "#f9a8d4" : "#fcd34d" }}>{value}</span>
  </div>
);

const SectionDivider = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 16px" }}>
    <div style={{ flex: 1, height: 2, background: "#e2e8f0" }} />
    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>{icon}{" "}{title}</div>
    <div style={{ flex: 1, height: 2, background: "#e2e8f0" }} />
  </div>
);

export default function App() {
  const [tab, setTab] = useState("capabilities");

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 920, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, textAlign: "center" }}>{"🛡️ Bedrock Guardrail Concepts"}</h1>
      <p style={{ color: "#64748b", textAlign: "center", margin: "4px 0 16px", fontSize: 13 }}>Capabilities, custom filtering, and full observability</p>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 12px", borderRadius: 10, border: `2px solid ${tab === t ? "#2563eb" : "#e2e8f0"}`, background: tab === t ? "#dbeafe" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 11, color: tab === t ? "#1d4ed8" : "#64748b" }}>{tabLabels[t]}</button>
        ))}
      </div>

      {/* ========== CAPABILITIES ========== */}
      {tab === "capabilities" && (
        <div>
          {/* Intro */}
          <div style={{ background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1d4ed8", marginBottom: 6 }}>{"🛡️ What Are Bedrock Guardrails?"}</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
              Bedrock Guardrails provide <strong>configurable safeguards</strong> for generative AI applications. Apply content filters, topic restrictions, PII detection, and grounding checks — all without writing code. Guardrails evaluate both <strong>input</strong> (user prompts) and <strong>output</strong> (model responses).
            </div>
          </div>

          {/* 7 Policy Types */}
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>{"📋 7 Built-in Policy Types"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { icon: "⚠️", name: "Content Filters", color: "#ef4444", bg: "#fef2f2", desc: "Filter harmful content across 6 categories with configurable strength levels.", items: ["Hate & Discrimination", "Insults", "Sexual Content", "Violence", "Misconduct", "Prompt Attacks (Jailbreaks)"], config: "Set strength per category: NONE → LOW → MEDIUM → HIGH" },
              { icon: "🏷️", name: "Denied Topics", color: "#8b5cf6", bg: "#ede9fe", desc: "Block entire conversation topics using natural language definitions.", items: ["Define topics in plain English", "Provide example phrases", "Auto-detects variations & paraphrases", "Great for compliance restrictions"], config: "Add custom topics with descriptions + sample phrases" },
              { icon: "🚩", name: "Word Filters", color: "#f59e0b", bg: "#fef3c7", desc: "Block exact words, phrases, or enable profanity filtering.", items: ["Custom word blocklist", "Custom phrase blocklist", "Built-in profanity filter", "Exact match detection"], config: "Add words/phrases to block + enable/disable profanity" },
              { icon: "🔒", name: "Sensitive Information (PII)", color: "#ec4899", bg: "#fdf2f8", desc: "Detect and handle PII with 50+ built-in entity types + custom regex.", items: ["SSN, Credit Cards, Phone Numbers", "Email, Address, Driver's License", "Custom regex patterns", "Actions: BLOCK or ANONYMIZE (mask)"], config: "Select PII types + action per type (block/anonymize)" },
              { icon: "🎯", name: "Contextual Grounding", color: "#10b981", bg: "#d1fae5", desc: "Verify model responses are grounded in the provided source/context (for RAG).", items: ["Grounding: response matches source", "Relevance: response is relevant to query", "Configurable thresholds (0–1)", "Reduces hallucinations in RAG"], config: "Set grounding threshold + relevance threshold" },
              { icon: "🧠", name: "Automated Reasoning", color: "#3b82f6", bg: "#dbeafe", desc: "Validate responses against formal logical rules and organizational policies.", items: ["Define policies as logical rules", "Verify factual consistency", "Check compliance with regulations", "Mathematical / logical validation"], config: "Define reasoning policies with rules and constraints" },
              { icon: "🖼️", name: "Image Content Filters", color: "#64748b", bg: "#f1f5f9", desc: "Filter harmful image content in multimodal applications.", items: ["Hate & discrimination imagery", "Violence & graphic content", "Sexual content", "Works with multimodal models"], config: "Set strength per image category: NONE → HIGH" },
            ].map(p => (
              <div key={p.name} style={{ background: p.bg, borderRadius: 14, border: `2px solid ${p.color}`, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{p.icon}</span>
                  <div style={{ fontWeight: 800, fontSize: 14, color: p.color }}>{p.name}</div>
                </div>
                <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.6, marginBottom: 10 }}>{p.desc}</div>
                <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.8, marginBottom: 8 }}>
                  {p.items.map(it => <div key={it}>{"• "}{it}</div>)}
                </div>
                <div style={{ background: "#fff", borderRadius: 8, padding: 8, fontSize: 11, fontWeight: 600, color: p.color }}>
                  {"⚙️ "}{p.config}
                </div>
              </div>
            ))}
          </div>

          {/* Evaluation Flow */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #cbd5e1", padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14, textAlign: "center" }}>{"🔄 Guardrail Evaluation Flow"}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Box icon="👨‍💻" label="User Prompt" desc="Input text" bg="#fff" border="#0f172a" w={200} />
              <AD label="evaluate input" color="#ef4444" />
              <Box icon="🛡️" label="Input Guardrail" desc="Content + Topic + Word + PII filters" bg="#fef2f2" border="#ef4444" w={280} highlight />
              <AD label="passed?" color="#10b981" />
              <Box icon="🤖" label="Foundation Model" desc="Generates response" bg="#dbeafe" border="#3b82f6" w={200} />
              <AD label="evaluate output" color="#ef4444" />
              <Box icon="🛡️" label="Output Guardrail" desc="Content + Grounding + PII masking" bg="#fef2f2" border="#ef4444" w={280} highlight />
              <AD color="#0f172a" />
              <Box icon="✅" label="Safe Response" desc="Delivered to user" bg="#d1fae5" border="#10b981" w={200} />
            </div>
            <div style={{ marginTop: 16, background: "#fef3c7", borderRadius: 10, padding: 12, fontSize: 12, color: "#92400e", fontWeight: 600, textAlign: "center" }}>
              {"⚠️ If guardrail blocks: response.stopReason = 'guardrail_intervened' — your app receives a configurable blocked message"}
            </div>
          </div>

          {/* Filter Strength Levels */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>{"⚙️ Content Filter Strength Levels"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { level: "NONE", color: "#64748b", desc: "No filtering applied", icon: "⬜" },
                { level: "LOW", color: "#f59e0b", desc: "Block only high-confidence harmful content", icon: "🟡" },
                { level: "MEDIUM", color: "#f97316", desc: "Block medium + high confidence", icon: "🟠" },
                { level: "HIGH", color: "#ef4444", desc: "Block low + medium + high confidence", icon: "🔴" },
              ].map(l => (
                <div key={l.level} style={{ background: "#fff", borderRadius: 10, padding: 12, border: `2px solid ${l.color}`, textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{l.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: l.color, marginTop: 4 }}>{l.level}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Methods */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>{"🔗 How to Attach Guardrails"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {[
                { method: "Converse API", desc: "Pass guardrailConfig in Converse / ConverseStream calls", icon: "💬", color: "#3b82f6" },
                { method: "InvokeModel API", desc: "Pass guardrailIdentifier + guardrailVersion", icon: "🔧", color: "#8b5cf6" },
                { method: "Bedrock Agents", desc: "Attach guardrail in Agent config — automatic evaluation", icon: "🤖", color: "#10b981" },
                { method: "ApplyGuardrail API", desc: "Evaluate any text independently — no model needed", icon: "🛡️", color: "#f59e0b" },
              ].map(m => (
                <div key={m.method} style={{ background: "#fff", borderRadius: 10, padding: 14, border: `2px solid ${m.color}30` }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <div style={{ fontWeight: 700, fontSize: 12, color: m.color, marginTop: 6 }}>{m.method}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* API Trace */}
          <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 8 }}>{"🔑 Get Trace in API Response"}</div>
            <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.8 }}>
              <div>{"Set "}<strong>{"trace: 'enabled'"}</strong>{" inside guardrailConfig when calling Converse / InvokeModel API"}</div>
              <div>{"Check "}<strong>{"response.stopReason"}</strong>{" — if it says "}<strong>{"guardrail_intervened"}</strong>{", the guardrail blocked or modified content"}</div>
              <div>{"Inspect "}<strong>{"response.trace.guardrail"}</strong>{" for full breakdown: which topic, filter, PII entity triggered"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========== CUSTOM LAMBDA FILTERS ========== */}
      {tab === "lambda" && (
        <div>
          {/* Intro */}
          <div style={{ background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#92400e", marginBottom: 6 }}>{"🔧 Custom Lambda Filters + Guardrails"}</div>
            <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.8 }}>
              Bedrock Guardrails provides <strong>7 built-in policy types</strong> but no native Lambda hooks. For more sophisticated filtering (domain-specific rules, custom PII, role-based access), you architect <strong>custom Lambda functions around guardrails</strong> using the <strong>ApplyGuardrail API</strong>.
            </div>
          </div>

          {/* Built-in vs Custom */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ background: "#dbeafe", borderRadius: 14, border: "2px solid #3b82f6", padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1d4ed8", marginBottom: 10 }}>{"🛡️ Built-in Guardrail Policies"}</div>
              {[
                { name: "Content Filters", desc: "Hate, violence, sexual, misconduct, prompt attacks", icon: "⚠️" },
                { name: "Denied Topics", desc: "Block specific topics (e.g., investment advice)", icon: "🏷️" },
                { name: "Word Filters", desc: "Exact word/phrase blocklist + profanity", icon: "🚩" },
                { name: "Sensitive Information", desc: "PII detection (SSN, email, phone) + custom regex", icon: "🔒" },
                { name: "Contextual Grounding", desc: "Detect hallucinations in RAG responses", icon: "🎯" },
                { name: "Automated Reasoning", desc: "Validate against logical rules and policies", icon: "🧠" },
                { name: "Image Content", desc: "Filter harmful image content", icon: "🖼️" },
              ].map(p => (
                <div key={p.name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{p.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 10, background: "#fff", borderRadius: 8, padding: 8, fontSize: 11, fontWeight: 700, color: "#1d4ed8", textAlign: "center" }}>
                {"✅ Configuration-only — no code needed"}
              </div>
            </div>
            <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e", marginBottom: 10 }}>{"🔧 Custom Lambda Filters (You Build)"}</div>
              {[
                { name: "Domain-Specific Rules", desc: "Industry compliance, brand guidelines, tone enforcement", icon: "📋" },
                { name: "Role-Based Filtering", desc: "Different rules per user role, department, or tier", icon: "👥" },
                { name: "Rate Limiting", desc: "Per-user/session throttling, abuse detection", icon: "⏱️" },
                { name: "Custom PII Patterns", desc: "Internal IDs, project codes, proprietary formats", icon: "🔐" },
                { name: "Context-Aware Logic", desc: "Time-of-day rules, geo-fencing, session history", icon: "🌐" },
                { name: "External Lookups", desc: "Check against DynamoDB, blocklists, or third-party APIs", icon: "🗄️" },
                { name: "Response Enrichment", desc: "Add disclaimers, citations, confidence scores", icon: "📎" },
              ].map(p => (
                <div key={p.name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{p.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 10, background: "#fff", borderRadius: 8, padding: 8, fontSize: 11, fontWeight: 700, color: "#92400e", textAlign: "center" }}>
                {"⚡ Requires Lambda code — unlimited flexibility"}
              </div>
            </div>
          </div>

          {/* Architecture Patterns */}
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>{"🏗️ Architecture Patterns"}</div>

          {/* Pattern 1: API Gateway + Lambda Wrapper */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #cbd5e1", padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{"Pattern 1: API Gateway + Lambda Wrapper"}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Most common production pattern — Lambda wraps Bedrock calls with pre/post custom validation</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Box icon="👨‍💻" label="Client App" desc="Sends request" bg="#fff" border="#0f172a" w={200} />
              <AD color="#0f172a" />
              <Box icon="🌐" label="API Gateway" desc="REST / WebSocket endpoint" bg="#dbeafe" border="#3b82f6" w={200} />
              <AD color="#3b82f6" />
              <Box icon="⚡" label="Pre-Filter Lambda" desc="Custom validation, rate limit, role check" bg="#fef3c7" border="#f59e0b" w={260} highlight />
              <AD label="passes?" color="#f59e0b" />
              <Box icon="🛡️" label="Bedrock + Guardrail" desc="Built-in content/topic/PII filters" bg="#d1fae5" border="#10b981" w={260} highlight />
              <AD label="response" color="#10b981" />
              <Box icon="⚡" label="Post-Filter Lambda" desc="Custom output validation, enrichment" bg="#fef3c7" border="#f59e0b" w={260} highlight />
              <AD color="#0f172a" />
              <Box icon="👨‍💻" label="Client App" desc="Receives filtered response" bg="#fff" border="#0f172a" w={200} />
            </div>
            <div style={{ marginTop: 16, background: "#d1fae5", borderRadius: 10, padding: 12, fontSize: 12, color: "#065f46", fontWeight: 600, textAlign: "center" }}>
              {"Best for: Production APIs, multi-tenant apps, complex business rules"}
            </div>
          </div>

          {/* Pattern 2: ApplyGuardrail API */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #8b5cf6", padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6", marginBottom: 6 }}>{"Pattern 2: ApplyGuardrail API (Independent Evaluation)"}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Call guardrails independently from Lambda — evaluate any text without invoking a model</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Box icon="⚡" label="Your Lambda Function" desc="Orchestrates entire pipeline" bg="#ede9fe" border="#8b5cf6" w={260} highlight />
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <AD label="Step 1" color="#ef4444" />
                  <Box icon="🔍" label="Custom Pre-Check" desc="Your business rules" bg="#fef3c7" border="#f59e0b" w={160} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <AD label="Step 2" color="#3b82f6" />
                  <Box icon="🛡️" label="ApplyGuardrail" desc="Check input text" bg="#dbeafe" border="#3b82f6" w={160} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <AD label="Step 3" color="#10b981" />
                  <Box icon="🤖" label="InvokeModel" desc="Call Bedrock LLM" bg="#d1fae5" border="#10b981" w={160} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <AD label="Step 4" color="#3b82f6" />
                  <Box icon="🛡️" label="ApplyGuardrail" desc="Check output text" bg="#dbeafe" border="#3b82f6" w={160} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <AD label="Step 5" color="#f59e0b" />
                  <Box icon="🔍" label="Custom Post-Check" desc="Final validation" bg="#fef3c7" border="#f59e0b" w={160} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, background: "#ede9fe", borderRadius: 10, padding: 12, fontSize: 12, color: "#5b21b6", fontWeight: 600, textAlign: "center" }}>
              {"Best for: Maximum control, custom orchestration, evaluate text from any source (not just LLM)"}
            </div>
          </div>

          {/* Pattern 3: Bedrock Agents */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #10b981", padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 6 }}>{"Pattern 3: Bedrock Agents + Action Group Lambda"}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Agents support pre/post-processing Lambda and guardrails natively as separate layers</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Box icon="👨‍💻" label="User" desc="Sends message" bg="#fff" border="#0f172a" w={200} />
              <AD color="#0f172a" />
              <Box icon="🤖" label="Bedrock Agent" desc="Orchestration + guardrail attached" bg="#d1fae5" border="#10b981" w={260} highlight />
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <AD label="pre-process" color="#f59e0b" />
                  <Box icon="⚡" label="Pre-Processing λ" desc="Validate & classify input" bg="#fef3c7" border="#f59e0b" w={140} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <AD label="guardrail" color="#ef4444" />
                  <Box icon="🛡️" label="Guardrail" desc="Built-in policies" bg="#fef2f2" border="#ef4444" w={140} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <AD label="action group" color="#3b82f6" />
                  <Box icon="⚡" label="Action Group λ" desc="Custom business logic" bg="#dbeafe" border="#3b82f6" w={140} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <AD label="post-process" color="#8b5cf6" />
                  <Box icon="⚡" label="Post-Processing λ" desc="Format & validate output" bg="#ede9fe" border="#8b5cf6" w={140} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, background: "#d1fae5", borderRadius: 10, padding: 12, fontSize: 12, color: "#065f46", fontWeight: 600, textAlign: "center" }}>
              {"Best for: Agent-based apps with action groups, conversational AI, multi-step workflows"}
            </div>
          </div>

          {/* ApplyGuardrail API detail */}
          <div style={{ background: "#0f172a", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>{"💻 ApplyGuardrail API — Key Details"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "API", value: "bedrock-runtime:ApplyGuardrail", color: "#93c5fd" },
                { label: "What it does", value: "Evaluate any text against a guardrail — independent of model invocation", color: "#fcd34d" },
                { label: "Input", value: "guardrailId, guardrailVersion, source (INPUT/OUTPUT), content (text array)", color: "#6ee7b7" },
                { label: "Output", value: "action (GUARDRAIL_INTERVENED or NONE), outputs, assessments (which policies triggered)", color: "#f9a8d4" },
                { label: "Use from Lambda", value: "boto3.client('bedrock-runtime').apply_guardrail(...)", color: "#c4b5fd" },
                { label: "Supports", value: "Sync evaluation, works with any text source (not just LLM output)", color: "#fca5a5" },
              ].map(d => (
                <div key={d.label} style={{ background: "#1e293b", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 12, color: d.color, fontWeight: 600, lineHeight: 1.5 }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Lambda code */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{"💻 Sample Lambda: Custom Pre/Post Filter + ApplyGuardrail"}</div>
            <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, overflowX: "auto" }}>
              <pre style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#e2e8f0", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{`import boto3, json

bedrock = boto3.client('bedrock-runtime')
GUARDRAIL_ID = 'abc123'
GUARDRAIL_VER = '1'

def lambda_handler(event, context):
    user_input = event['body']['message']
    user_role = event['requestContext']['authorizer']['role']

    # ── Step 1: Custom pre-filter (your business rules) ──
    if user_role == 'free_tier' and len(user_input) > 500:
        return {"statusCode": 429, "body": "Free tier: max 500 chars"}

    # ── Step 2: ApplyGuardrail on input ──
    gr_input = bedrock.apply_guardrail(
        guardrailIdentifier=GUARDRAIL_ID,
        guardrailVersion=GUARDRAIL_VER,
        source='INPUT',
        content=[{'text': {'text': user_input}}]
    )
    if gr_input['action'] == 'GUARDRAIL_INTERVENED':
        return {"statusCode": 400, "body": gr_input['outputs'][0]['text']}

    # ── Step 3: Call LLM ──
    response = bedrock.converse(
        modelId='anthropic.claude-3-sonnet-20240229-v1:0',
        messages=[{'role': 'user', 'content': [{'text': user_input}]}]
    )
    output_text = response['output']['message']['content'][0]['text']

    # ── Step 4: ApplyGuardrail on output ──
    gr_output = bedrock.apply_guardrail(
        guardrailIdentifier=GUARDRAIL_ID,
        guardrailVersion=GUARDRAIL_VER,
        source='OUTPUT',
        content=[{'text': {'text': output_text}}]
    )
    if gr_output['action'] == 'GUARDRAIL_INTERVENED':
        output_text = gr_output['outputs'][0]['text']

    # ── Step 5: Custom post-filter ──
    output_text += "\\n\\n_Disclaimer: This is AI-generated._"

    return {"statusCode": 200, "body": output_text}`}</pre>
            </div>
          </div>

          {/* When to use which pattern */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>{"🎯 When to Use Which Pattern"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { pattern: "API GW + Lambda", color: "#3b82f6", when: ["Multi-tenant SaaS", "REST API backends", "Custom auth/rate limiting", "Complex routing logic"], icon: "🌐" },
                { pattern: "ApplyGuardrail API", color: "#8b5cf6", when: ["Maximum orchestration control", "Non-LLM text evaluation", "Custom pipeline ordering", "Batch processing"], icon: "🔧" },
                { pattern: "Agents + Action λ", color: "#10b981", when: ["Conversational AI", "Multi-step workflows", "Tool-using agents", "Built-in agent features"], icon: "🤖" },
              ].map(p => (
                <div key={p.pattern} style={{ background: `${p.color}08`, borderRadius: 12, border: `2px solid ${p.color}30`, padding: 14 }}>
                  <div style={{ fontSize: 22, textAlign: "center", marginBottom: 4 }}>{p.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: p.color, textAlign: "center", marginBottom: 8 }}>{p.pattern}</div>
                  {p.when.map(w => (
                    <div key={w} style={{ fontSize: 11, color: "#475569", marginBottom: 4, paddingLeft: 8, lineHeight: 1.5 }}>{"• "}{w}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, background: "#d1fae5", borderRadius: 12, border: "2px solid #10b981", padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>{"🧠 Key Takeaway: Bedrock Guardrails handles content/topic/PII filtering. Lambda handles everything else — business rules, role-based access, custom validation, external lookups. Combine both for defense-in-depth."}</div>
          </div>
        </div>
      )}

      {/* ========== MONITORING (Consolidated) ========== */}
      {tab === "monitoring" && (
        <div>
          {/* ── 3 Levels Overview ── */}
          <div style={{ background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e", marginBottom: 8 }}>{"💡 3 Levels of Guardrail Monitoring"}</div>
            <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.8 }}>
              AWS gives you <strong>three complementary ways</strong> to monitor guardrails — from high-level counts to full blocked-content traces.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { icon: "📊", title: "CloudWatch Metrics", color: "#3b82f6", bg: "#dbeafe", question: "How many times was content blocked?", items: ["Invocation counts", "Block counts per policy type", "Latency metrics", "Filter by guardrail ID, topic, action"], best: "Dashboards, Alarms, Trends", setup: "✅ AUTOMATIC — no setup needed" },
              { icon: "📝", title: "CloudWatch Logs", color: "#8b5cf6", bg: "#ede9fe", question: "What exactly was blocked and why?", items: ["Full request/response logged", "Which policy triggered", "Which topic matched", "Guardrail action (BLOCKED/MASKED)"], best: "Investigation, Debugging, Audit", setup: "🔧 Enable in Model Logging settings" },
              { icon: "🪣", title: "S3 Invocation Logs", color: "#10b981", bg: "#d1fae5", question: "Full trace with original content", items: ["Complete guardrail trace", "Original blocked input/output text", "Every assessment detail", "Long-term storage for compliance"], best: "Compliance, Full Audit, Athena Queries", setup: "🔧 Enable in Model Logging settings" },
            ].map(c => (
              <div key={c.title} style={{ background: c.bg, borderRadius: 14, border: `2px solid ${c.color}`, padding: 18 }}>
                <div style={{ fontSize: 28, textAlign: "center" }}>{c.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: c.color, textAlign: "center" }}>{c.title}</div>
                <div style={{ fontSize: 11, color: c.color, textAlign: "center", marginTop: 6, fontStyle: "italic" }}>{c.question}</div>
                <div style={{ marginTop: 10, fontSize: 12, color: "#334155", lineHeight: 1.8 }}>
                  {c.items.map(it => <div key={it}>{"• "}{it}</div>)}
                </div>
                <div style={{ marginTop: 10, background: "#fff", borderRadius: 8, padding: 8, fontSize: 11, fontWeight: 700, color: c.color, textAlign: "center" }}>
                  {"Best for: "}{c.best}
                </div>
                <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: c.color, textAlign: "center", background: "#fff", borderRadius: 6, padding: 4 }}>
                  {c.setup}
                </div>
              </div>
            ))}
          </div>

          {/* How to Enable */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #cbd5e1", padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16, textAlign: "center" }}>{"🔧 How to Enable Each"}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Box icon="🛡️" label="Bedrock Guardrail" desc="Your configured guardrail" bg="#fff" border="#0f172a" w={220} />
              <AD label="automatic" color="#3b82f6" />
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <Box icon="📊" label="CloudWatch Metrics" desc="✅ Always ON automatically" bg="#dbeafe" border="#3b82f6" w={190} />
                  <div style={{ fontSize: 10, color: "#1d4ed8", fontWeight: 700, marginTop: 4 }}>No setup needed</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Box icon="📝" label="CloudWatch Logs" desc="🔧 Enable in Model Logging" bg="#ede9fe" border="#8b5cf6" w={190} />
                  <div style={{ fontSize: 10, color: "#5b21b6", fontWeight: 700, marginTop: 4 }}>{"Bedrock → Settings → Model Logging"}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Box icon="🪣" label="S3 Invocation Logs" desc="🔧 Enable in Model Logging" bg="#d1fae5" border="#10b981" w={190} />
                  <div style={{ fontSize: 10, color: "#065f46", fontWeight: 700, marginTop: 4 }}>{"Bedrock → Settings → Model Logging"}</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, background: "#fef3c7", borderRadius: 10, padding: 12, fontSize: 12, color: "#92400e", fontWeight: 600, textAlign: "center" }}>
              {"⚠️ CloudWatch Metrics are free and automatic. Logs require enabling Model Invocation Logging in Bedrock Settings."}
            </div>
          </div>

          {/* ── CloudWatch Metrics ── */}
          <SectionDivider icon="📊" title="CloudWatch Metrics" />

          <div style={{ background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              {"Namespace: "}<strong>AWS/Bedrock</strong>{" — Emitted "}<strong>automatically</strong>{" with no setup required."}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <MetricCard name="Invocations" desc="Total times guardrail was invoked (passed + blocked)" dimensions={["GuardrailId", "GuardrailVersion"]} color="#3b82f6" icon="📈" />
            <MetricCard name="InvocationBlockedCount" desc="Number of times content was BLOCKED by the guardrail" dimensions={["GuardrailId", "GuardrailVersion"]} color="#ef4444" icon="🚫" />
            <MetricCard name="TopicPolicyMatch" desc="A configured TOPIC policy was triggered — THIS tells you WHICH topic!" dimensions={["GuardrailId", "TopicName", "TopicType", "Action"]} color="#10b981" icon="🏷️" />
            <MetricCard name="ContentPolicyViolation" desc="Content filter triggered (hate, violence, sexual, misconduct)" dimensions={["GuardrailId", "FilterType", "FilterConfidence", "Action"]} color="#8b5cf6" icon="⚠️" />
            <MetricCard name="SensitiveInformationPolicyViolation" desc="PII detected (SSN, credit card, email, phone)" dimensions={["GuardrailId", "PIIType", "Action"]} color="#ec4899" icon="🔒" />
            <MetricCard name="WordPolicyViolation" desc="A denied word or phrase was detected" dimensions={["GuardrailId", "Action"]} color="#64748b" icon="🚩" />
            <MetricCard name="GuardrailLatency" desc="Time taken by guardrail evaluation (milliseconds)" dimensions={["GuardrailId"]} color="#0ea5e9" icon="⏱️" />
          </div>

          <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 10 }}>{"🎯 Dimensions = How You Filter & Drill Down"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              {[
                { dim: "GuardrailId", ex: "abc123def", desc: "Which guardrail" },
                { dim: "TopicName", ex: "InvestmentAdvice", desc: "Which topic was matched" },
                { dim: "FilterType", ex: "HATE / VIOLENCE / SEXUAL", desc: "Which content filter" },
                { dim: "PIIType", ex: "SSN / EMAIL / PHONE", desc: "Which PII type detected" },
                { dim: "Action", ex: "BLOCKED / ANONYMIZED", desc: "What action was taken" },
                { dim: "FilterConfidence", ex: "HIGH / MEDIUM / LOW", desc: "Confidence of detection" },
              ].map(d => (
                <div key={d.dim} style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #fcd34d" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#92400e" }}>{d.dim}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{"e.g., "}{d.ex}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{d.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CloudWatch Logs ── */}
          <SectionDivider icon="📝" title="CloudWatch Logs" />

          <div style={{ background: "#ede9fe", border: "2px solid #8b5cf6", borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              When you enable <strong>Model Invocation Logging</strong>, every guardrail evaluation is logged with full details.
              {"  Enable: Bedrock → Settings → Model Invocation Logging → Toggle ON → Select destination."}
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{"📋 What a Guardrail Log Entry Contains"}</div>
          <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, lineHeight: 1.9 }}>
              <LogRow field="schemaType" value="ModelInvocationLog" />
              <LogRow field="operation" value="Converse" />
              <LogRow field="modelId" value="anthropic.claude-3-sonnet..." />
              <LogRow field="guardrailId" value="abc123def456" />
              <div style={{ color: "#6ee7b7", marginTop: 8, marginBottom: 4 }}>{"  // ─── THE KEY PART: guardrailTrace ───"}</div>
              <LogRow field="guardrailAction" value="GUARDRAIL_INTERVENED" />
              <div style={{ color: "#94a3b8", marginTop: 8, marginLeft: 8 }}>{"guardrailTrace:"}</div>
              <div style={{ marginLeft: 20, marginTop: 4, background: "#334155", borderRadius: 10, padding: 12 }}>
                <div style={{ color: "#6ee7b7", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{"topicPolicy:"}</div>
                <LogRow field="  name" value="InvestmentAdvice" indent={1} />
                <LogRow field="  type" value="DENY" indent={1} />
                <LogRow field="  action" value="BLOCKED" indent={1} />
              </div>
              <div style={{ marginLeft: 20, marginTop: 8, background: "#334155", borderRadius: 10, padding: 12 }}>
                <div style={{ color: "#c4b5fd", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{"contentPolicy:"}</div>
                <LogRow field="  type" value="HATE" indent={1} />
                <LogRow field="  confidence" value="HIGH" indent={1} />
                <LogRow field="  action" value="BLOCKED" indent={1} />
              </div>
              <div style={{ marginLeft: 20, marginTop: 8, background: "#334155", borderRadius: 10, padding: 12 }}>
                <div style={{ color: "#f9a8d4", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{"sensitiveInformationPolicy:"}</div>
                <LogRow field="  type" value="US_SSN" indent={1} />
                <LogRow field="  match" value="123-45-****" indent={1} />
                <LogRow field="  action" value="ANONYMIZED" indent={1} />
              </div>
            </div>
          </div>

          {/* Logs Insights */}
          <div style={{ background: "#f0f9ff", borderRadius: 14, border: "2px solid #0ea5e9", padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0369a1", marginBottom: 10 }}>{"🔍 CloudWatch Logs Insights — Find Top Blocked Topics"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { step: "1", desc: "Filter by guardrailAction = GUARDRAIL_INTERVENED" },
                { step: "2", desc: "Extract topicPolicy.topics[0].name as topicName" },
                { step: "3", desc: "Group by topicName, count occurrences" },
                { step: "4", desc: "Sort by count descending" },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 14, background: "#0ea5e9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
                  <div style={{ fontSize: 12, color: "#334155" }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── S3 + Athena ── */}
          <SectionDivider icon="🪣" title="S3 + Athena" />

          <div style={{ background: "#d1fae5", border: "2px solid #10b981", borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              Same data as CloudWatch Logs but stored in S3 for <strong>long-term retention, Athena queries, and compliance</strong>.
            </div>
          </div>

          <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>S3 Bucket Structure</div>
            {[
              { depth: 0, icon: "📁", name: "s3://my-bedrock-logs/", color: "#e2e8f0" },
              { depth: 1, icon: "📁", name: "AWSLogs/", color: "#e2e8f0" },
              { depth: 2, icon: "📁", name: "123456789012/", color: "#e2e8f0" },
              { depth: 3, icon: "📁", name: "BedrockModelInvocationLogs/", color: "#93c5fd" },
              { depth: 4, icon: "📁", name: "us-east-1/", color: "#fcd34d" },
              { depth: 5, icon: "📁", name: "2025/02/10/", color: "#c4b5fd" },
              { depth: 6, icon: "📄", name: "invocation-log-001.json.gz", color: "#6ee7b7" },
            ].map((f, i) => (
              <div key={i} style={{ paddingLeft: f.depth * 24, fontFamily: "monospace", fontSize: 12, lineHeight: 2, color: f.color }}>
                {f.icon}{" "}{f.name}
              </div>
            ))}
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #8b5cf6", padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6", marginBottom: 12 }}>{"🔍 Analyze with Amazon Athena"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { step: "1", title: "Create Athena Table", desc: "Point Athena at your S3 bucket path, define schema matching the log JSON structure" },
                { step: "2", title: "Query Blocked Topics", desc: "Use SQL to extract topicPolicy.topics[0].name, filter by guardrail_action = GUARDRAIL_INTERVENED" },
                { step: "3", title: "Aggregate & Rank", desc: "GROUP BY topic name, COUNT blocks, ORDER BY count DESC to see top blocked topics" },
                { step: "4", title: "Time-Series Analysis", desc: "Add date_trunc to see trends — are blocks increasing? Which topics spike?" },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: "#8b5cf6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#5b21b6" }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div style={{ background: "#ede9fe", borderRadius: 12, padding: 16, border: "2px solid #8b5cf6" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#5b21b6", marginBottom: 8 }}>{"📝 CloudWatch Logs — Best for:"}</div>
              <div style={{ fontSize: 12, color: "#3b0764", lineHeight: 1.8 }}>
                {"• Real-time investigation"}<br/>
                {"• Quick Logs Insights queries"}<br/>
                {"• Shorter retention (days/weeks)"}<br/>
                {"• Alert → investigate flow"}
              </div>
            </div>
            <div style={{ background: "#d1fae5", borderRadius: 12, padding: 16, border: "2px solid #10b981" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>{"🪣 S3 Logs — Best for:"}</div>
              <div style={{ fontSize: 12, color: "#065f46", lineHeight: 1.8 }}>
                {"• Long-term compliance retention"}<br/>
                {"• Large-scale Athena SQL analysis"}<br/>
                {"• Cross-account aggregation"}<br/>
                {"• Cost-effective archival"}
              </div>
            </div>
          </div>

          {/* ── Dashboard & Alarms ── */}
          <SectionDivider icon="📈" title="Dashboard & Alarms" />

          {/* Mock dashboard */}
          <div style={{ background: "#0f172a", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>{"🖥️ Sample CloudWatch Dashboard"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Total Invocations", value: "12,450", change: "+8%", color: "#3b82f6", good: true },
                { label: "Blocked Requests", value: "847", change: "+23%", color: "#ef4444", good: false },
                { label: "Avg Latency", value: "45ms", change: "-5%", color: "#10b981", good: true },
              ].map(m => (
                <div key={m.label} style={{ background: "#1e293b", borderRadius: 12, padding: 14, borderLeft: `4px solid ${m.color}` }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: m.color, marginTop: 4 }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: m.good ? "#6ee7b7" : "#fca5a5" }}>{m.change}{" vs last week"}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 10 }}>Top Blocked Topics (Last 7 Days)</div>
              {[
                { topic: "InvestmentAdvice", count: 312, pct: 100 },
                { topic: "MedicalDiagnosis", count: 245, pct: 78 },
                { topic: "PersonalData", count: 156, pct: 50 },
                { topic: "PoliticalContent", count: 89, pct: 28 },
                { topic: "CompetitorInfo", count: 45, pct: 14 },
              ].map(t => (
                <div key={t.topic} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 130, fontSize: 11, color: "#e2e8f0", fontWeight: 600, flexShrink: 0 }}>{t.topic}</div>
                  <div style={{ flex: 1, background: "#334155", borderRadius: 4, height: 20 }}>
                    <div style={{ width: `${t.pct}%`, height: "100%", background: "linear-gradient(90deg, #ef4444, #f59e0b)", borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#fcd34d", fontWeight: 700, width: 40, textAlign: "right" }}>{t.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alarms */}
          <div style={{ background: "#fef2f2", borderRadius: 14, border: "2px solid #ef4444", padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", marginBottom: 10 }}>{"🚨 CloudWatch Alarms — Get Alerted"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { name: "High Block Rate", config: "InvocationBlockedCount > 100/hr", action: "SNS to Slack / PagerDuty", why: "Spike in blocked content" },
                { name: "Specific Topic Spike", config: "TopicPolicyMatch(InvestmentAdvice) > 50/hr", action: "SNS to Email", why: "Users probing a specific topic" },
                { name: "Guardrail Latency", config: "GuardrailLatency p99 > 200ms", action: "SNS to Ops team", why: "Guardrail slowing responses" },
                { name: "PII Detection Spike", config: "SensitiveInfoViolation > 20/hr", action: "SNS to Security team", why: "Possible data exfiltration" },
              ].map(a => (
                <div key={a.name} style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #fca5a5" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#991b1b" }}>{"🔔 "}{a.name}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4, lineHeight: 1.6 }}>
                    <div><strong>Condition:</strong>{" "}{a.config}</div>
                    <div><strong>Action:</strong>{" "}{a.action}</div>
                    <div><strong>Why:</strong>{" "}{a.why}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Monitoring Architecture */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14, textAlign: "center" }}>{"🏗️ Complete Monitoring Architecture"}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Box icon="👨‍💻" label="User Request" desc="Calls Bedrock with guardrail" bg="#fff" border="#0f172a" w={220} />
              <AD color="#0f172a" />
              <Box icon="🛡️" label="Bedrock Guardrail" desc="Evaluates content against policies" bg="#fef3c7" border="#f59e0b" w={220} />
              <div style={{ fontSize: 14, color: "#64748b", fontWeight: 700 }}>{"↓ emits data to 3 destinations ↓"}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Box icon="📊" label="CW Metrics" desc="Counts & latency" bg="#dbeafe" border="#3b82f6" w={140} />
                  <AD color="#3b82f6" />
                  <Box icon="🚨" label="CW Alarms" desc="Alert on thresholds" bg="#fef2f2" border="#ef4444" w={140} />
                  <AD color="#ef4444" />
                  <Box icon="📱" label="SNS" desc="Slack / Email / PagerDuty" bg="#fef2f2" border="#ef4444" w={140} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Box icon="📝" label="CW Logs" desc="Full trace details" bg="#ede9fe" border="#8b5cf6" w={140} />
                  <AD color="#8b5cf6" />
                  <Box icon="🔍" label="Logs Insights" desc="Ad-hoc queries" bg="#ede9fe" border="#8b5cf6" w={140} />
                  <AD color="#8b5cf6" />
                  <Box icon="📈" label="Dashboard" desc="Visual widgets" bg="#ede9fe" border="#8b5cf6" w={140} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Box icon="🪣" label="S3 Logs" desc="Long-term archive" bg="#d1fae5" border="#10b981" w={140} />
                  <AD color="#10b981" />
                  <Box icon="🔎" label="Athena" desc="SQL at scale" bg="#d1fae5" border="#10b981" w={140} />
                  <AD color="#10b981" />
                  <Box icon="📊" label="QuickSight" desc="BI dashboards" bg="#d1fae5" border="#10b981" w={140} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#d1fae5", borderRadius: 12, border: "2px solid #10b981", padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>{"🧠 Exam Tip: To know WHICH TOPIC was blocked → use TopicPolicyMatch metric with TopicName dimension. To know HOW MANY were blocked → use InvocationBlockedCount."}</div>
          </div>
        </div>
      )}

      {/* ========== QUIZ ========== */}
      {tab === "quiz" && (
        <div>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px", textAlign: "center" }}>Test yourself!</p>
          <QuizCard q="Which guardrail monitoring is automatically enabled with no setup?" opts={["CloudWatch Logs", "S3 Invocation Logs", "CloudWatch Metrics", "All of them"]} ans="CloudWatch Metrics"
            explanation="CloudWatch Metrics under AWS/Bedrock namespace are emitted automatically. Logs require enabling Model Invocation Logging." />
          <QuizCard q="Where do you enable Model Invocation Logging?" opts={["IAM Console", "Bedrock Settings - Model Invocation Logging", "CloudWatch Console", "CloudTrail"]} ans="Bedrock Settings - Model Invocation Logging"
            explanation="Go to Bedrock console, Settings, Enable Model Invocation Logging, Select CloudWatch Logs and/or S3 as destination." />
          <QuizCard q="To find WHICH specific topic was blocked, you need:" opts={["CloudWatch Metrics with TopicName dimension", "Just the API response", "Only S3 logs", "CloudTrail events"]} ans="CloudWatch Metrics with TopicName dimension"
            explanation="CloudWatch Metrics with the TopicName dimension show exactly which topic policies were triggered." />
          <QuizCard q="How do you get guardrail trace in the API response?" opts={["Always included", "Set trace: enabled in guardrailConfig", "Call a separate GetTrace API", "Check CloudTrail"]} ans="Set trace: enabled in guardrailConfig"
            explanation="Set trace to enabled in the guardrailConfig parameter of the Converse or InvokeModel API call." />
          <QuizCard q="stopReason = guardrail_intervened means:" opts={["Guardrail passed", "Guardrail blocked or modified content", "Guardrail errored", "Model timed out"]} ans="Guardrail blocked or modified content"
            explanation="guardrail_intervened means the guardrail took action — blocking the request or masking content." />
          <QuizCard q="For long-term compliance audit, the best approach is:" opts={["CloudWatch Metrics only", "CloudWatch Logs 30-day retention", "S3 Invocation Logs + Athena", "Manual API trace"]} ans="S3 Invocation Logs + Athena"
            explanation="S3 provides cost-effective long-term storage. Athena lets you run SQL queries at scale for compliance." />
          <QuizCard q="Which alarm detects possible data exfiltration?" opts={["High InvocationBlockedCount", "SensitiveInformationPolicyViolation spike", "High GuardrailLatency", "TopicPolicyMatch spike"]} ans="SensitiveInformationPolicyViolation spike"
            explanation="A spike in PII detection (SSN, credit cards) could indicate someone trying to extract sensitive data." />
          <QuizCard q="Which API lets you evaluate text against a guardrail without invoking a model?" opts={["InvokeModel", "ApplyGuardrail", "Converse", "CreateGuardrail"]} ans="ApplyGuardrail"
            explanation="The ApplyGuardrail API evaluates any text against guardrail policies independently — no model invocation needed. Great for Lambda-based custom pipelines." />
          <QuizCard q="For role-based filtering (different rules per user role), you should:" opts={["Configure it in Bedrock Guardrail settings", "Use a custom Lambda pre-filter before the guardrail", "Use CloudWatch Alarms", "Create multiple Bedrock accounts"]} ans="Use a custom Lambda pre-filter before the guardrail"
            explanation="Bedrock Guardrails don't support role-based rules natively. Use a Lambda function to apply custom business logic (role checks, rate limits) before passing to the guardrail." />
          <QuizCard q="What are the 7 built-in Bedrock Guardrail policy types?" opts={["Content, Topics, Words, PII, Grounding, Reasoning, Image", "Content, Topics, Words, PII only", "Content, Topics, Words, PII, Grounding only", "Just Content and PII"]} ans="Content, Topics, Words, PII, Grounding, Reasoning, Image"
            explanation="Bedrock Guardrails provides 7 built-in policy types: Content Filters, Denied Topics, Word Filters, Sensitive Information (PII), Contextual Grounding, Automated Reasoning, and Image Content Filters." />
        </div>
      )}
    </div>
  );
}
