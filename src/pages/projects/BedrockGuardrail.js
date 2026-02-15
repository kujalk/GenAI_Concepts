import { useState } from "react";
import Layout from "../../components/Layout";

const tabs = ["overview", "cloudwatch", "logs", "s3trace", "dashboard", "quiz"];
const tabLabels = { overview: "🗺️ Overview", cloudwatch: "📊 CloudWatch Metrics", logs: "📝 CloudWatch Logs", s3trace: "🪣 S3 + Athena", dashboard: "📈 Dashboard", quiz: "🧪 Quiz" };

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

export default function App() {
  const [tab, setTab] = useState("overview");

  return (
    <Layout>
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 920, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, textAlign: "center" }}>{"🛡️ Bedrock Guardrail Monitoring"}</h1>
      <p style={{ color: "#64748b", textAlign: "center", margin: "4px 0 16px", fontSize: 13 }}>Track blocked content, topics, policies — full observability</p>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 12px", borderRadius: 10, border: `2px solid ${tab === t ? "#2563eb" : "#e2e8f0"}`, background: tab === t ? "#dbeafe" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 11, color: tab === t ? "#1d4ed8" : "#64748b" }}>{tabLabels[t]}</button>
        ))}
      </div>

      {/* ========== OVERVIEW ========== */}
      {tab === "overview" && (
        <div>
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

          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #cbd5e1", padding: 24 }}>
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

          {/* API Trace */}
          <div style={{ marginTop: 20, background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 8 }}>{"🔑 Bonus: Get Trace in API Response Itself"}</div>
            <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.8 }}>
              <div>{"Set "}<strong>{"trace: 'enabled'"}</strong>{" inside guardrailConfig when calling Converse / InvokeModel API"}</div>
              <div>{"Check "}<strong>{"response.stopReason"}</strong>{" — if it says "}<strong>{"guardrail_intervened"}</strong>{", the guardrail blocked or modified content"}</div>
              <div>{"Inspect "}<strong>{"response.trace.guardrail"}</strong>{" for full breakdown: which topic, filter, PII entity triggered"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========== CLOUDWATCH METRICS ========== */}
      {tab === "cloudwatch" && (
        <div>
          <div style={{ background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1d4ed8", marginBottom: 6 }}>{"📊 CloudWatch Metrics for Guardrails"}</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              {"Namespace: "}<strong>AWS/Bedrock</strong>{" — Emitted "}<strong>automatically</strong>{" with no setup required."}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>{"🔑 Key Guardrail Metrics"}</div>
            <MetricCard name="Invocations" desc="Total times guardrail was invoked (passed + blocked)" dimensions={["GuardrailId", "GuardrailVersion"]} color="#3b82f6" icon="📈" />
            <MetricCard name="InvocationBlockedCount" desc="Number of times content was BLOCKED by the guardrail" dimensions={["GuardrailId", "GuardrailVersion"]} color="#ef4444" icon="🚫" />
            <MetricCard name="TopicPolicyMatch" desc="A configured TOPIC policy was triggered — THIS tells you WHICH topic!" dimensions={["GuardrailId", "TopicName", "TopicType", "Action"]} color="#10b981" icon="🏷️" />
            <MetricCard name="ContentPolicyViolation" desc="Content filter triggered (hate, violence, sexual, misconduct)" dimensions={["GuardrailId", "FilterType", "FilterConfidence", "Action"]} color="#8b5cf6" icon="⚠️" />
            <MetricCard name="SensitiveInformationPolicyViolation" desc="PII detected (SSN, credit card, email, phone)" dimensions={["GuardrailId", "PIIType", "Action"]} color="#ec4899" icon="🔒" />
            <MetricCard name="WordPolicyViolation" desc="A denied word or phrase was detected" dimensions={["GuardrailId", "Action"]} color="#64748b" icon="🚩" />
            <MetricCard name="ContentFiltered" desc="Content was filtered (blocked or masked). Break down by filter type." dimensions={["GuardrailId", "FilterType", "Action"]} color="#f59e0b" icon="🔍" />
            <MetricCard name="GuardrailLatency" desc="Time taken by guardrail evaluation (milliseconds)" dimensions={["GuardrailId"]} color="#0ea5e9" icon="⏱️" />
          </div>

          <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 18 }}>
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

          <div style={{ marginTop: 16, background: "#d1fae5", borderRadius: 12, border: "2px solid #10b981", padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>{"🧠 Exam Tip: To know WHICH TOPIC was blocked → use TopicPolicyMatch metric with TopicName dimension. To know HOW MANY were blocked → use InvocationBlockedCount."}</div>
          </div>
        </div>
      )}

      {/* ========== CLOUDWATCH LOGS ========== */}
      {tab === "logs" && (
        <div>
          <div style={{ background: "#ede9fe", border: "2px solid #8b5cf6", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#5b21b6", marginBottom: 6 }}>{"📝 CloudWatch Logs — Full Guardrail Trace"}</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              When you enable <strong>Model Invocation Logging</strong>, every guardrail evaluation is logged with full details.
            </div>
          </div>

          {/* Enable steps */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>{"🔧 How to Enable (5 Steps)"}</div>
            <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
              {[
                { ic: "1️⃣", lb: "Bedrock Console", ds: "Open Bedrock service", bg: "#dbeafe", bd: "#3b82f6" },
                { ic: "2️⃣", lb: "Settings", ds: "Click Settings in sidebar", bg: "#ede9fe", bd: "#8b5cf6" },
                { ic: "3️⃣", lb: "Model Logging", ds: "Model invocation logging section", bg: "#fef3c7", bd: "#f59e0b" },
                { ic: "4️⃣", lb: "Toggle ON", ds: "Enable + select destination", bg: "#d1fae5", bd: "#10b981" },
                { ic: "5️⃣", lb: "Done!", ds: "Logs flowing to CW Logs / S3", bg: "#f0fdf4", bd: "#22c55e" },
              ].map((s, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <Box icon={s.ic} label={s.lb} desc={s.ds} bg={s.bg} border={s.bd} w={130} />
                  {i < arr.length - 1 && <div style={{ fontSize: 16, color: "#94a3b8", fontWeight: 900, padding: "0 3px" }}>{"→"}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Sample log - visual representation */}
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
          <div style={{ background: "#f0f9ff", borderRadius: 14, border: "2px solid #0ea5e9", padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0369a1", marginBottom: 10 }}>{"🔍 CloudWatch Logs Insights — Find Top Blocked Topics"}</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
              Use Logs Insights to query your guardrail logs:
            </div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
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
            <div style={{ marginTop: 12, background: "#e0f2fe", borderRadius: 8, padding: 10, fontSize: 12, color: "#0369a1", fontWeight: 600 }}>
              {"Result: A ranked list of the most frequently blocked topics — exactly what you need!"}
            </div>
          </div>
        </div>
      )}

      {/* ========== S3 TRACE ========== */}
      {tab === "s3trace" && (
        <div>
          <div style={{ background: "#d1fae5", border: "2px solid #10b981", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#065f46", marginBottom: 6 }}>{"🪣 S3 Invocation Logs — Full Audit Trail"}</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              Same data as CloudWatch Logs but stored in S3 for <strong>long-term retention, Athena queries, and compliance</strong>.
            </div>
          </div>

          {/* S3 structure visual */}
          <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>S3 Bucket Structure</div>
            {[
              { depth: 0, icon: "📁", name: "s3://my-bedrock-logs/", color: "#e2e8f0" },
              { depth: 1, icon: "📁", name: "AWSLogs/", color: "#e2e8f0" },
              { depth: 2, icon: "📁", name: "123456789012/", color: "#e2e8f0" },
              { depth: 3, icon: "📁", name: "BedrockModelInvocationLogs/", color: "#93c5fd" },
              { depth: 4, icon: "📁", name: "us-east-1/", color: "#fcd34d" },
              { depth: 5, icon: "📁", name: "2025/02/10/", color: "#c4b5fd" },
              { depth: 6, icon: "📄", name: "invocation-log-001.json.gz", color: "#6ee7b7" },
              { depth: 6, icon: "📄", name: "invocation-log-002.json.gz", color: "#6ee7b7" },
            ].map((f, i) => (
              <div key={i} style={{ paddingLeft: f.depth * 24, fontFamily: "monospace", fontSize: 12, lineHeight: 2, color: f.color }}>
                {f.icon}{" "}{f.name}
              </div>
            ))}
          </div>

          {/* Athena query steps */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #8b5cf6", padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6", marginBottom: 12 }}>{"🔍 Analyze with Amazon Athena"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { step: "1", title: "Create Athena Table", desc: "Point Athena at your S3 bucket path, define schema matching the log JSON structure" },
                { step: "2", title: "Query Blocked Topics", desc: "Use SQL to extract topicPolicy.topics[0].name, filter by guardrail_action = GUARDRAIL_INTERVENED" },
                { step: "3", title: "Aggregate & Rank", desc: "GROUP BY topic name, COUNT blocks, ORDER BY count DESC to see top blocked topics" },
                { step: "4", title: "Time-Series Analysis", desc: "Add date_trunc to see trends over time — are blocks increasing? Which topics spike on which days?" },
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
        </div>
      )}

      {/* ========== DASHBOARD ========== */}
      {tab === "dashboard" && (
        <div>
          <div style={{ background: "#f0f9ff", border: "2px solid #0ea5e9", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0369a1", marginBottom: 6 }}>{"📈 Building a Guardrail Dashboard"}</div>
            <div style={{ fontSize: 13, color: "#334155" }}>Combine CloudWatch Metrics + Alarms + Logs Insights for full observability</div>
          </div>

          {/* Mock dashboard */}
          <div style={{ background: "#0f172a", borderRadius: 16, padding: 20, marginBottom: 20 }}>
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
          <div style={{ background: "#fef2f2", borderRadius: 14, border: "2px solid #ef4444", padding: 18, marginBottom: 20 }}>
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

          {/* Full monitoring architecture */}
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

          <div style={{ background: "#fef3c7", borderRadius: 12, border: "2px solid #f59e0b", padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>{"🧠 Exam Pattern: \"monitor which topics blocked\" → CW Metrics + Alarms (counts & alerts) + CW Logs / S3 (details of what was blocked)"}</div>
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
          <QuizCard q="What does the TopicName dimension in CloudWatch Metrics tell you?" opts={["Which model was used", "Which specific topic triggered the guardrail", "Which user made the request", "Which region handled it"]} ans="Which specific topic triggered the guardrail"
            explanation="TopicName dimension on the TopicPolicyMatch metric shows exactly which configured topic (e.g., InvestmentAdvice) was matched." />
        </div>
      )}
    </div>
    </Layout>
  );
}