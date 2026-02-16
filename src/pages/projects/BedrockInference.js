import { useState } from "react";


const tabs = ["overview", "profiles", "crossregion", "routing", "provisioned", "compare", "quiz"];
const tabLabels = { overview: "🗺️ Big Picture", profiles: "📋 Inference Profiles", crossregion: "🌍 Cross-Region", routing: "🧠 Intelligent Routing", provisioned: "⚡ Provisioned Throughput", compare: "📊 Compare All", quiz: "🧪 Quiz" };

const QuizCard = ({ q, opts, ans, explanation }) => {
  const [picked, setPicked] = useState(null);
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "2px solid #e2e8f0", padding: 16, marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 }}>❓ {q}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map(o => {
          const correct = o === ans;
          const bg = !picked ? "#f1f5f9" : correct ? "#d1fae5" : picked === o ? "#fee2e2" : "#f1f5f9";
          const bd = !picked ? "#cbd5e1" : correct ? "#10b981" : picked === o ? "#ef4444" : "#cbd5e1";
          return <button key={o} onClick={() => setPicked(o)} style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${bd}`, background: bg, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>{o}</button>;
        })}
      </div>
      {picked && <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
        <span style={{ color: picked === ans ? "#059669" : "#dc2626", fontWeight: 700 }}>{picked === ans ? "✅ Correct!" : `❌ Answer: ${ans}`}</span>
        {explanation && <div style={{ color: "#64748b", marginTop: 4 }}>{explanation}</div>}
      </div>}
    </div>
  );
};

const FlowBox = ({ icon, label, desc, bg, border, w = 130 }) => (
  <div style={{ background: bg || "#fff", border: `2px solid ${border || "#cbd5e1"}`, borderRadius: 12, padding: "12px 14px", width: w, textAlign: "center", flexShrink: 0 }}>
    <div style={{ fontSize: 24 }}>{icon}</div>
    <div style={{ fontWeight: 700, fontSize: 11, color: "#0f172a", marginTop: 4 }}>{label}</div>
    {desc && <div style={{ fontSize: 10, color: "#475569", marginTop: 3, lineHeight: 1.4 }}>{desc}</div>}
  </div>
);

const Arrow = ({ color = "#94a3b8", label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, padding: "0 2px" }}>
    {label && <div style={{ fontSize: 9, color, fontWeight: 700, marginBottom: 2 }}>{label}</div>}
    <div style={{ fontSize: 18, color, fontWeight: 900 }}>→</div>
  </div>
);

const ArrowDown = ({ color = "#94a3b8", label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}>
    {label && <div style={{ fontSize: 9, color, fontWeight: 700 }}>{label}</div>}
    <div style={{ fontSize: 18, color, fontWeight: 900 }}>↓</div>
  </div>
);

const SectionBanner = ({ bg, border, color, icon, title, subtitle }) => (
  <div style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 14, alignItems: "center" }}>
    <div style={{ fontSize: 36 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{title}</div>
      <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{subtitle}</div>
    </div>
  </div>
);

export default function App() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 920, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ fontSize: 21, fontWeight: 800, color: "#0f172a", margin: 0, textAlign: "center" }}>🤖 AWS Bedrock Inference Concepts</h1>
      <p style={{ color: "#64748b", textAlign: "center", margin: "4px 0 16px", fontSize: 13 }}>Inference Profiles • Cross-Region • Intelligent Routing • Provisioned Throughput</p>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 14px", borderRadius: 10, border: `2px solid ${tab === t ? "#2563eb" : "#e2e8f0"}`, background: tab === t ? "#dbeafe" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 11, color: tab === t ? "#1d4ed8" : "#64748b" }}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* ============ BIG PICTURE ============ */}
      {tab === "overview" && (
        <div>
          <div style={{ background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: 14, padding: 18, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e" }}>💡 The ONE thing to understand first:</div>
            <div style={{ fontSize: 13, color: "#78350f", marginTop: 6, lineHeight: 1.6 }}>
              <strong>Inference Profile</strong> is the foundation concept. Cross-Region Inference and Intelligent Prompt Routing are <strong>features built ON TOP of</strong> inference profiles. Provisioned Throughput is a separate pricing/capacity model.
            </div>
          </div>

          {/* Hierarchy diagram */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #cbd5e1", padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 16, textAlign: "center" }}>HOW THEY ALL RELATE</div>

            {/* Your App */}
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-block", background: "#0f172a", color: "#fff", padding: "12px 28px", borderRadius: 14, fontWeight: 800, fontSize: 14 }}>👨‍💻 Your Application</div>
            </div>
            <ArrowDown label="calls" color="#0f172a" />

            {/* Inference Profile */}
            <div style={{ background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: 14, padding: 18, textAlign: "center", marginBottom: 4 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1d4ed8" }}>📋 Inference Profile</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>The abstraction layer — your app points here, NOT directly at a model</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px 16px", border: "2px solid #93c5fd" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8" }}>System-Defined</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>AWS creates these</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px 16px", border: "2px solid #93c5fd" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8" }}>Application</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>You create these</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 60, marginTop: 4 }}>
              <ArrowDown label="enables" color="#8b5cf6" />
              <ArrowDown label="enables" color="#10b981" />
            </div>

            {/* Features row */}
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 4 }}>
              <div style={{ background: "#ede9fe", border: "2px solid #8b5cf6", borderRadius: 14, padding: 16, width: 280, textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>🌍</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#5b21b6" }}>Cross-Region Inference</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Route to multiple regions for availability & throughput</div>
              </div>
              <div style={{ background: "#d1fae5", border: "2px solid #10b981", borderRadius: 14, padding: 16, width: 280, textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>🧠</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#065f46" }}>Intelligent Prompt Routing</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Route to optimal model based on prompt complexity</div>
              </div>
            </div>

            <div style={{ textAlign: "center", margin: "12px 0 4px", color: "#64748b", fontSize: 12, fontWeight: 700 }}>↓ Ultimately hits ↓</div>

            {/* Models row */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "On-Demand", desc: "Pay per token, shared capacity", icon: "💳", bg: "#f1f5f9", border: "#94a3b8" },
                { label: "Provisioned Throughput", desc: "Reserved capacity, guaranteed speed", icon: "⚡", bg: "#fef3c7", border: "#f59e0b" },
              ].map(m => (
                <div key={m.label} style={{ background: m.bg, border: `2px solid ${m.border}`, borderRadius: 14, padding: 14, width: 220, textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>{m.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* One-liner cheat sheet */}
          <div style={{ marginTop: 20, background: "#0f172a", borderRadius: 14, padding: 20, color: "#e2e8f0" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fcd34d", marginBottom: 12 }}>🧠 One-Liner Cheat Sheet</div>
            <div style={{ fontSize: 13, lineHeight: 2.2 }}>
              <div><strong style={{ color: "#93c5fd" }}>Inference Profile</strong> = "An abstraction layer between your app and models" (indirection!)</div>
              <div><strong style={{ color: "#c4b5fd" }}>Cross-Region Inference</strong> = "Same model, multiple regions — for availability & throughput"</div>
              <div><strong style={{ color: "#6ee7b7" }}>Intelligent Prompt Routing</strong> = "Right model for the right prompt — save cost, keep quality"</div>
              <div><strong style={{ color: "#fcd34d" }}>Provisioned Throughput</strong> = "Reserved capacity — guaranteed speed, pay upfront"</div>
            </div>
          </div>
        </div>
      )}

      {/* ============ INFERENCE PROFILES ============ */}
      {tab === "profiles" && (
        <div>
          <SectionBanner bg="#dbeafe" border="#3b82f6" color="#1d4ed8" icon="📋" title="Inference Profiles" subtitle="The abstraction layer that makes everything else work" />

          <div style={{ background: "#f0f9ff", border: "2px solid #0ea5e9", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0369a1", marginBottom: 8 }}>What IS an Inference Profile?</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
              Instead of calling a model directly (e.g., <code style={{ background: "#e0f2fe", padding: "2px 6px", borderRadius: 4 }}>anthropic.claude-3-sonnet</code>), you call an <strong>Inference Profile ID</strong>. The profile decides WHERE and HOW the request is actually processed. Think of it as a <strong>smart pointer</strong> to one or more models.
            </div>
          </div>

          {/* Two types */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ background: "#fff", borderRadius: 14, border: "2px solid #3b82f6", padding: 18 }}>
              <div style={{ background: "#dbeafe", borderRadius: 10, padding: "8px 14px", display: "inline-block", marginBottom: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#1d4ed8" }}>Type 1: System-Defined</span>
              </div>
              <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.8 }}>
                <div style={{ marginBottom: 6 }}>Created <strong>by AWS</strong> — you just use them</div>
                <div>• Predefined per model + region group</div>
                <div>• Enable <strong>cross-region inference</strong></div>
                <div>• Format: <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>us.anthropic.claude-3-sonnet...</code></div>
                <div style={{ marginTop: 6, fontStyle: "italic", color: "#64748b" }}>The <code>us.</code> prefix means "route across US regions"</div>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 14, border: "2px solid #f59e0b", padding: 18 }}>
              <div style={{ background: "#fef3c7", borderRadius: 10, padding: "8px 14px", display: "inline-block", marginBottom: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#92400e" }}>Type 2: Application</span>
              </div>
              <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.8 }}>
                <div style={{ marginBottom: 6 }}>Created <strong>by you</strong> — for tracking & governance</div>
                <div>• Wraps a system-defined profile or model</div>
                <div>• Add <strong>tags</strong> for cost tracking</div>
                <div>• Assign to teams/apps</div>
                <div style={{ marginTop: 6, fontStyle: "italic", color: "#64748b" }}>Think: "Marketing team's Claude profile" with cost tags</div>
              </div>
            </div>
          </div>

          {/* Flow diagram */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 14 }}>WITHOUT vs WITH Inference Profiles</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#fef2f2", borderRadius: 12, padding: 14, border: "2px solid #fca5a5" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 10 }}>❌ Without (Direct model call)</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <FlowBox icon="👨‍💻" label="Your App" desc="Hardcoded model ID" bg="#fff" border="#ef4444" w={150} />
                  <div style={{ fontSize: 16, color: "#ef4444", fontWeight: 900 }}>↓</div>
                  <FlowBox icon="🤖" label="Claude Sonnet" desc="us-east-1 ONLY" bg="#fef2f2" border="#ef4444" w={150} />
                  <div style={{ fontSize: 10, color: "#991b1b", marginTop: 4, textAlign: "center" }}>❌ Stuck in one region<br/>❌ No cost tracking per team<br/>❌ Can't switch models easily</div>
                </div>
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 14, border: "2px solid #86efac" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 10 }}>✅ With Inference Profile</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <FlowBox icon="👨‍💻" label="Your App" desc="Calls profile ID" bg="#fff" border="#22c55e" w={150} />
                  <div style={{ fontSize: 16, color: "#22c55e", fontWeight: 900 }}>↓</div>
                  <FlowBox icon="📋" label="Inference Profile" desc="Smart routing layer" bg="#dbeafe" border="#3b82f6" w={150} />
                  <div style={{ fontSize: 16, color: "#22c55e", fontWeight: 900 }}>↓</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <FlowBox icon="🤖" label="us-east-1" bg="#f0fdf4" border="#22c55e" w={80} />
                    <FlowBox icon="🤖" label="us-west-2" bg="#f0fdf4" border="#22c55e" w={80} />
                    <FlowBox icon="🤖" label="eu-west-1" bg="#f0fdf4" border="#22c55e" w={80} />
                  </div>
                  <div style={{ fontSize: 10, color: "#166534", marginTop: 4, textAlign: "center" }}>✅ Multi-region routing<br/>✅ Cost tags per team<br/>✅ Change models without code changes</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, background: "#fef3c7", borderRadius: 12, border: "2px solid #f59e0b", padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>🧠 Exam Tip: When you see "Inference Profile" think <strong>"indirection layer"</strong>. Your app never talks to models directly — it talks to profiles, and profiles decide where requests go.</div>
          </div>
        </div>
      )}

      {/* ============ CROSS-REGION ============ */}
      {tab === "crossregion" && (
        <div>
          <SectionBanner bg="#ede9fe" border="#8b5cf6" color="#5b21b6" icon="🌍" title="Cross-Region Inference" subtitle="Same model across multiple AWS regions — more throughput, higher availability" />

          <div style={{ background: "#f5f3ff", border: "2px solid #8b5cf6", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6", marginBottom: 8 }}>What Problem Does It Solve?</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
              In a single region, you might hit <strong>throttling limits</strong> during peak traffic. Cross-region inference automatically routes your request to <strong>whichever region has available capacity</strong>. You get the same model, same response — just routed to the least busy region.
            </div>
          </div>

          {/* How it works */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #8b5cf6", padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#5b21b6", marginBottom: 16, textAlign: "center" }}>HOW CROSS-REGION INFERENCE WORKS</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <FlowBox icon="👨‍💻" label="Your App (us-east-1)" desc='Calls: us.anthropic.claude-3-sonnet...' bg="#fff" border="#0f172a" w={260} />
              <ArrowDown color="#8b5cf6" label="API call to system-defined profile" />
              <FlowBox icon="📋" label="System-Defined Profile" desc='Prefix "us." = all US regions' bg="#ede9fe" border="#8b5cf6" w={260} />
              <ArrowDown color="#8b5cf6" label="routes to region with best availability" />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {[
                  { r: "us-east-1", status: "🔴 Busy" },
                  { r: "us-west-2", status: "🟢 Available" },
                  { r: "us-east-2", status: "🟡 Moderate" },
                ].map(x => (
                  <div key={x.r} style={{ background: x.status.includes("🟢") ? "#d1fae5" : "#fff", border: `2px solid ${x.status.includes("🟢") ? "#10b981" : "#cbd5e1"}`, borderRadius: 12, padding: "10px 18px", textAlign: "center", transform: x.status.includes("🟢") ? "scale(1.05)" : "scale(1)" }}>
                    <div style={{ fontSize: 20 }}>🤖</div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a" }}>{x.r}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{x.status}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#5b21b6", fontWeight: 700, marginTop: 6 }}>↑ Request goes to us-west-2 (least busy) — same model, same response!</div>
            </div>
          </div>

          {/* Region prefixes */}
          <div style={{ background: "#fff", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Profile ID Prefixes → Region Groups</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
              {[
                { prefix: "us.", regions: "US East, US West", color: "#3b82f6", bg: "#dbeafe" },
                { prefix: "eu.", regions: "EU regions (Frankfurt, Ireland, Paris...)", color: "#8b5cf6", bg: "#ede9fe" },
                { prefix: "ap.", regions: "Asia Pacific regions", color: "#10b981", bg: "#d1fae5" },
              ].map(p => (
                <div key={p.prefix} style={{ background: p.bg, borderRadius: 10, padding: 14, border: `2px solid ${p.color}`, textAlign: "center" }}>
                  <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 18, color: p.color }}>{p.prefix}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{p.regions}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key points */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#d1fae5", borderRadius: 12, padding: 16, border: "2px solid #10b981" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>✅ Key Facts</div>
              <div style={{ fontSize: 12, color: "#065f46", lineHeight: 1.8 }}>
                <div>• Data may leave your region</div>
                <div>• Same model & quality everywhere</div>
                <div>• AWS handles routing automatically</div>
                <div>• No code changes — just use profile ID</div>
                <div>• Higher effective throughput</div>
                <div>• Better availability during peaks</div>
              </div>
            </div>
            <div style={{ background: "#fef2f2", borderRadius: 12, padding: 16, border: "2px solid #ef4444" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 8 }}>⚠️ Watch Out</div>
              <div style={{ fontSize: 12, color: "#991b1b", lineHeight: 1.8 }}>
                <div>• Data crosses region boundaries</div>
                <div>• May have compliance implications</div>
                <div>• You can't control WHICH region</div>
                <div>• Latency may vary slightly</div>
                <div>• Not all models support it</div>
                <div>• CloudWatch metrics are per-profile</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ INTELLIGENT ROUTING ============ */}
      {tab === "routing" && (
        <div>
          <SectionBanner bg="#d1fae5" border="#10b981" color="#065f46" icon="🧠" title="Intelligent Prompt Routing" subtitle="Right model for the right prompt — save cost without losing quality" />

          <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 8 }}>The Core Idea</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
              Not every prompt needs the most powerful (expensive) model. "What's 2+2?" doesn't need Claude Opus.
              Intelligent Prompt Routing <strong>analyzes the complexity of each prompt</strong> and routes it to the most cost-effective model that can handle it well.
            </div>
          </div>

          {/* Visual flow */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #10b981", padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46", marginBottom: 16, textAlign: "center" }}>HOW INTELLIGENT ROUTING DECIDES</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <FlowBox icon="👨‍💻" label="Your App" desc="Sends prompt to routing profile" bg="#fff" border="#0f172a" w={220} />
              <ArrowDown color="#10b981" />
              <div style={{ background: "#d1fae5", border: "2px solid #10b981", borderRadius: 14, padding: 16, width: 280, textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>🧠</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#065f46" }}>Bedrock Prompt Router</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Analyzes prompt complexity in milliseconds</div>
              </div>
              <div style={{ display: "flex", gap: 40, marginTop: 4 }}>
                <ArrowDown color="#22c55e" label="Simple prompt" />
                <ArrowDown color="#f59e0b" label="Complex prompt" />
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid #22c55e", width: 200 }}>
                  <div style={{ background: "#d1fae5", padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#065f46" }}>🐇 Smaller Model</div>
                    <div style={{ fontSize: 11, color: "#065f46" }}>e.g., Claude Haiku</div>
                  </div>
                  <div style={{ padding: 12, background: "#fff", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 700, color: "#22c55e" }}>💰 Cheaper</div>
                      <div style={{ fontWeight: 700, color: "#22c55e" }}>⚡ Faster</div>
                      <div>"What's the capital of France?"</div>
                      <div>"Translate hello to Spanish"</div>
                    </div>
                  </div>
                </div>
                <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid #f59e0b", width: 200 }}>
                  <div style={{ background: "#fef3c7", padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#92400e" }}>🦁 Larger Model</div>
                    <div style={{ fontSize: 11, color: "#92400e" }}>e.g., Claude Sonnet</div>
                  </div>
                  <div style={{ padding: 12, background: "#fff", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 700, color: "#f59e0b" }}>🧠 More capable</div>
                      <div style={{ fontWeight: 700, color: "#f59e0b" }}>📝 Better quality</div>
                      <div>"Analyze this legal contract"</div>
                      <div>"Write a complex algorithm"</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to set up */}
          <div style={{ background: "#fff", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>How You Configure It</div>
            <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
              {[
                { icon: "1️⃣", label: "Create Prompt Router", desc: "In Bedrock console, create a new prompt router", bg: "#dbeafe", border: "#3b82f6" },
                { icon: "2️⃣", label: "Select Model Pair", desc: "Pick a small model (Haiku) + large model (Sonnet)", bg: "#ede9fe", border: "#8b5cf6" },
                { icon: "3️⃣", label: "Set Fallback %", desc: "Set how often to route to the larger model (cost vs quality tradeoff)", bg: "#fef3c7", border: "#f59e0b" },
                { icon: "4️⃣", label: "Use Router ID", desc: "Call the router ID instead of model ID in your app", bg: "#d1fae5", border: "#10b981" },
              ].map((s, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <FlowBox icon={s.icon} label={s.label} desc={s.desc} bg={s.bg} border={s.border} w={160} />
                  {i < arr.length - 1 && <Arrow color="#64748b" />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>🧠 Exam Tip: Intelligent Prompt Routing is about <strong>COST OPTIMIZATION</strong>. If you see "reduce cost without sacrificing quality" or "route simple queries to cheaper models" → this is the answer.</div>
          </div>
        </div>
      )}

      {/* ============ PROVISIONED THROUGHPUT ============ */}
      {tab === "provisioned" && (
        <div>
          <SectionBanner bg="#fef3c7" border="#f59e0b" color="#92400e" icon="⚡" title="Provisioned Throughput" subtitle="Reserved model capacity — guaranteed speed, predictable cost" />

          <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>What Problem Does It Solve?</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
              On-demand inference is <strong>shared capacity</strong> — during peak times, you compete with everyone else and may get throttled. Provisioned Throughput gives you <strong>dedicated model units</strong> that are reserved for YOU — guaranteed throughput, consistent latency, no throttling.
            </div>
          </div>

          {/* On-demand vs Provisioned */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #94a3b8", padding: 18 }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 30 }}>💳</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#475569" }}>On-Demand</div>
              </div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8, textAlign: "center" }}>
                <div>Pay per input/output token</div>
                <div>Shared capacity with others</div>
                <div>May get throttled at peak</div>
                <div>No commitment</div>
                <div>Variable latency</div>
                <div style={{ marginTop: 8, fontStyle: "italic" }}>🏠 Think: Renting an Uber</div>
              </div>
            </div>
            <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 18 }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 30 }}>⚡</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#92400e" }}>Provisioned Throughput</div>
              </div>
              <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.8, textAlign: "center" }}>
                <div>Pay per Model Unit (time-based)</div>
                <div>Dedicated capacity just for you</div>
                <div>Guaranteed — never throttled</div>
                <div>1-month or 6-month commitment</div>
                <div>Consistent low latency</div>
                <div style={{ marginTop: 8, fontStyle: "italic" }}>🏠 Think: Leasing your own car</div>
              </div>
            </div>
          </div>

          {/* Model Units */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>What's a Model Unit (MU)?</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8, marginBottom: 14 }}>
              A Model Unit is a unit of throughput capacity. Each MU gives you a certain number of input/output tokens per minute. More MUs = more throughput. You provision the number of MUs you need.
            </div>
            <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
              {[
                { icon: "📋", label: "Choose Model", desc: "Select base or custom model", bg: "#dbeafe", border: "#3b82f6" },
                { icon: "🔢", label: "Set Model Units", desc: "How much throughput you need", bg: "#ede9fe", border: "#8b5cf6" },
                { icon: "📅", label: "Choose Commitment", desc: "No commitment, 1-month, or 6-month", bg: "#fef3c7", border: "#f59e0b" },
                { icon: "⚡", label: "Provisioned!", desc: "Dedicated capacity live", bg: "#d1fae5", border: "#10b981" },
              ].map((s, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <FlowBox icon={s.icon} label={s.label} desc={s.desc} bg={s.bg} border={s.border} />
                  {i < arr.length - 1 && <Arrow />}
                </div>
              ))}
            </div>
          </div>

          {/* When to use */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#d1fae5", borderRadius: 12, padding: 16, border: "2px solid #10b981" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>✅ Use Provisioned When</div>
              <div style={{ fontSize: 12, color: "#065f46", lineHeight: 1.8 }}>
                <div>• Consistent, high-volume workloads</div>
                <div>• Latency-sensitive applications</div>
                <div>• Can't afford throttling</div>
                <div>• Using custom/fine-tuned models</div>
                <div>• Predictable monthly budget needed</div>
              </div>
            </div>
            <div style={{ background: "#fef2f2", borderRadius: 12, padding: 16, border: "2px solid #ef4444" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 8 }}>❌ Don't Use When</div>
              <div style={{ fontSize: 12, color: "#991b1b", lineHeight: 1.8 }}>
                <div>• Traffic is unpredictable / bursty</div>
                <div>• Low volume (on-demand is cheaper)</div>
                <div>• Just experimenting / prototyping</div>
                <div>• Can tolerate occasional throttling</div>
                <div>• Don't want long-term commitment</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, background: "#fef3c7", borderRadius: 12, border: "2px solid #f59e0b", padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>🧠 Exam Tip: Provisioned Throughput = <strong>"guaranteed, dedicated, no throttling, commitment-based"</strong>. Also required for <strong>custom/fine-tuned models</strong> in Bedrock.</div>
          </div>
        </div>
      )}

      {/* ============ COMPARISON ============ */}
      {tab === "compare" && (
        <div>
          <div style={{ overflowX: "auto", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#fff" }}>
                  <th style={{ padding: 10, textAlign: "left", borderRadius: "10px 0 0 0" }}>Aspect</th>
                  <th style={{ padding: 10, textAlign: "center" }}><span style={{ color: "#93c5fd" }}>📋 Inference Profile</span></th>
                  <th style={{ padding: 10, textAlign: "center" }}><span style={{ color: "#c4b5fd" }}>🌍 Cross-Region</span></th>
                  <th style={{ padding: 10, textAlign: "center" }}><span style={{ color: "#6ee7b7" }}>🧠 Prompt Routing</span></th>
                  <th style={{ padding: 10, textAlign: "center", borderRadius: "0 10px 0 0" }}><span style={{ color: "#fcd34d" }}>⚡ Provisioned</span></th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["What is it?", "Abstraction layer over models", "Route requests across regions", "Route to optimal model per prompt", "Reserved dedicated capacity"],
                  ["Main goal", "Indirection & governance", "Availability & throughput", "Cost optimization", "Guaranteed performance"],
                  ["Solves", "Hardcoded model IDs, cost tracking", "Regional throttling, availability", "Overpaying for simple prompts", "Throttling, latency spikes"],
                  ["How to use", "Use profile ID instead of model ID", "Use system-defined profile with region prefix", "Create prompt router, select model pair", "Provision Model Units with commitment"],
                  ["Cost impact", "No extra cost", "No extra cost (same token pricing)", "Saves 30-50% (routes simple to cheaper model)", "Upfront commitment, predictable cost"],
                  ["Models involved", "One model", "One model, multiple regions", "Two models (small + large)", "One model, dedicated"],
                  ["Who creates it?", "AWS (system) or You (application)", "AWS (system-defined profiles)", "You (prompt router config)", "You (provision capacity)"],
                  ["Exam keyword", '"abstraction", "cost tags"', '"multi-region", "availability"', '"cost optimization", "complexity"', '"guaranteed", "dedicated", "no throttle"'],
                ].map(([label, ...vals], i) => (
                  <tr key={label} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, borderBottom: "1px solid #e2e8f0", color: "#334155", whiteSpace: "nowrap" }}>{label}</td>
                    {vals.map((v, j) => (
                      <td key={j} style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #e2e8f0", color: "#475569", lineHeight: 1.5 }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Decision tree */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>🌳 Quick Decision Tree for Exams</div>
            <div style={{ fontSize: 13, lineHeight: 2.4, color: "#334155" }}>
              <div>Need to <strong>track costs per team/app</strong>? → <span style={{ background: "#dbeafe", padding: "2px 10px", borderRadius: 6, fontWeight: 700, color: "#1d4ed8" }}>📋 Application Inference Profile</span></div>
              <div>Need <strong>higher availability across regions</strong>? → <span style={{ background: "#ede9fe", padding: "2px 10px", borderRadius: 6, fontWeight: 700, color: "#5b21b6" }}>🌍 Cross-Region Inference</span></div>
              <div>Want to <strong>reduce cost by routing simple prompts cheaper</strong>? → <span style={{ background: "#d1fae5", padding: "2px 10px", borderRadius: 6, fontWeight: 700, color: "#065f46" }}>🧠 Intelligent Prompt Routing</span></div>
              <div>Need <strong>guaranteed throughput, no throttling</strong>? → <span style={{ background: "#fef3c7", padding: "2px 10px", borderRadius: 6, fontWeight: 700, color: "#92400e" }}>⚡ Provisioned Throughput</span></div>
              <div>Using a <strong>custom / fine-tuned model</strong>? → <span style={{ background: "#fef3c7", padding: "2px 10px", borderRadius: 6, fontWeight: 700, color: "#92400e" }}>⚡ Provisioned Throughput (required)</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ============ QUIZ ============ */}
      {tab === "quiz" && (
        <div>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px", textAlign: "center" }}>Exam-style questions — test yourself!</p>
          <QuizCard q='You want your Bedrock app to route requests across US regions for better availability. What do you use?' opts={["Provisioned Throughput", "Cross-Region Inference", "Intelligent Prompt Routing", "Application Inference Profile"]} ans="Cross-Region Inference"
            explanation="Cross-region uses system-defined profiles with region prefix (us.) to route across regions." />
          <QuizCard q='Your company wants to reduce Bedrock costs. Many prompts are simple but all go to Claude Sonnet. What should you implement?' opts={["Cross-Region Inference", "Provisioned Throughput", "Intelligent Prompt Routing", "Batch Inference"]} ans="Intelligent Prompt Routing"
            explanation="Prompt routing sends simple prompts to cheaper models (Haiku) and complex ones to Sonnet — saving 30-50%." />
          <QuizCard q='You need guaranteed, consistent latency for a production chatbot with steady high traffic. What do you use?' opts={["On-Demand", "Cross-Region Inference", "Provisioned Throughput", "Intelligent Prompt Routing"]} ans="Provisioned Throughput"
            explanation="Provisioned Throughput = dedicated capacity, guaranteed performance, no throttling." />
          <QuizCard q='What does the "us." prefix in a system-defined inference profile ID indicate?' opts={["US-only data residency", "Routes across US regions", "US pricing tier", "US compliance standard"]} ans="Routes across US regions"
            explanation="The region prefix (us., eu., ap.) indicates the cross-region routing group." />
          <QuizCard q='Your org has 5 teams using Bedrock. You need to track costs per team. What do you create?' opts={["5 AWS accounts", "Application Inference Profiles with tags", "5 Provisioned Throughput reservations", "IAM policies"]} ans="Application Inference Profiles with tags"
            explanation="Application inference profiles let you create tagged profiles per team for cost allocation." />
          <QuizCard q='To deploy a custom fine-tuned model in Bedrock, what is REQUIRED?' opts={["Cross-Region Inference", "Intelligent Prompt Routing", "Provisioned Throughput", "Application Inference Profile"]} ans="Provisioned Throughput"
            explanation="Custom/fine-tuned models in Bedrock require Provisioned Throughput — they can't run on-demand." />
          <QuizCard q='Intelligent Prompt Routing requires you to select:' opts={["One model + one region", "Two models (small + large)", "Three regions minimum", "A provisioned throughput reservation"]} ans="Two models (small + large)"
            explanation="You configure a model pair — a cost-effective model for simple prompts and a capable model for complex ones." />
          <QuizCard q='Which is the foundational concept that Cross-Region Inference is built on?' opts={["Provisioned Throughput", "Inference Profiles", "Model Customization", "Bedrock Agents"]} ans="Inference Profiles"
            explanation="Inference Profiles are the abstraction layer. Cross-Region Inference uses system-defined inference profiles." />
        </div>
      )}
    </div>
  );
}