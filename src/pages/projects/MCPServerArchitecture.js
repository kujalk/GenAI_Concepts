import { useState, useEffect, useRef } from "react";

const tabs = ["Architecture", "Sequence", "Deep Dive", "Real Example"];

const layers = [
  {
    id: "host",
    label: "Host Application",
    sub: "Claude Desktop, IDE, AI App",
    color: "#3B82F6",
    desc: "The end-user application that wants AI capabilities. It embeds an LLM and creates MCP clients to connect to servers.",
    details: [
      "Manages the overall application lifecycle",
      "Creates and manages multiple MCP client instances",
      "Handles user authorization and consent",
      "Enforces security policies and permissions",
      "Coordinates between LLM and MCP servers"
    ]
  },
  {
    id: "client",
    label: "MCP Client",
    sub: "Protocol layer inside the host",
    color: "#8B5CF6",
    desc: "Lives inside the host app. Each client maintains a 1:1 stateful session with a single MCP server. Handles the JSON-RPC communication.",
    details: [
      "Maintains 1:1 connection with a single server",
      "Handles protocol negotiation & capability exchange",
      "Sends requests (tools/list, tools/call, etc.)",
      "Routes server responses back to the host/LLM",
      "Manages session lifecycle (init → use → close)"
    ]
  },
  {
    id: "server",
    label: "MCP Server",
    sub: "Lightweight service exposing tools/resources",
    color: "#F59E0B",
    desc: "A small, focused program that exposes specific capabilities (tools, resources, prompts) to clients via the MCP protocol over JSON-RPC 2.0.",
    details: [
      "Exposes tools (functions the LLM can call)",
      "Exposes resources (data the LLM can read)",
      "Exposes prompts (reusable prompt templates)",
      "Can connect to any data source or API",
      "Runs locally (stdio) or remotely (SSE/HTTP)"
    ]
  },
  {
    id: "data",
    label: "Data Sources",
    sub: "APIs, DBs, Files, SaaS tools",
    color: "#EF4444",
    desc: "The actual services the MCP server wraps — databases, REST APIs, file systems, SaaS platforms like Jira, Slack, GitHub, etc.",
    details: [
      "Databases (Postgres, DynamoDB, etc.)",
      "REST/GraphQL APIs",
      "Local file systems",
      "SaaS platforms (Jira, Slack, GitHub, Salesforce)",
      "Cloud services (AWS, GCP, Azure)"
    ]
  }
];

const sequenceSteps = [
  { from: "host", to: "client", label: "1. Initialize", desc: "Host app creates an MCP client and tells it which server to connect to. Think of this like creating a database connection pool.", color: "#3B82F6", direction: "right" },
  { from: "client", to: "server", label: "2. Handshake", desc: "Client sends `initialize` request with its capabilities. Server responds with its capabilities (which tools/resources it offers). Both agree on protocol version.", color: "#8B5CF6", direction: "right" },
  { from: "server", to: "client", label: "3. Capabilities", desc: "Server returns: tools (callable functions), resources (readable data), prompts (templates). Client now knows what's available.", color: "#F59E0B", direction: "left" },
  { from: "host", to: "llm", label: "4. User Query", desc: "User asks something like 'Create a Jira ticket for the login bug'. Host sends this to the LLM along with the list of available MCP tools.", color: "#3B82F6", direction: "right" },
  { from: "llm", to: "host", label: "5. Tool Selection", desc: "LLM analyzes the query and decides it needs the `create_issue` tool. Returns a tool_use response with the tool name and arguments (JSON).", color: "#10B981", direction: "left" },
  { from: "host", to: "client", label: "6. Execute Tool", desc: "Host takes the LLM's tool call and forwards it to the appropriate MCP client. Host may ask user for confirmation first (security).", color: "#3B82F6", direction: "right" },
  { from: "client", to: "server", label: "7. tools/call", desc: "Client sends JSON-RPC request: `tools/call` with tool name and arguments. This is the actual MCP protocol message over stdio or HTTP/SSE.", color: "#8B5CF6", direction: "right" },
  { from: "server", to: "data", label: "8. API Call", desc: "Server translates the MCP request into the actual API call — e.g., POST to Jira REST API with the ticket details.", color: "#F59E0B", direction: "right" },
  { from: "data", to: "server", label: "9. Response", desc: "External service returns the result (e.g., created ticket PROJ-123). Server formats this into MCP response format.", color: "#EF4444", direction: "left" },
  { from: "server", to: "client", label: "10. Result", desc: "Server sends the tool result back through JSON-RPC. Contains the content (text, images, or embedded resources).", color: "#F59E0B", direction: "left" },
  { from: "client", to: "host", label: "11. Forward", desc: "Client passes the result back to the host application, which adds it to the conversation context.", color: "#8B5CF6", direction: "left" },
  { from: "host", to: "llm", label: "12. Final Answer", desc: "Host sends the tool result back to the LLM. LLM generates a natural language response: 'Done! Created ticket PROJ-123.'", color: "#10B981", direction: "right" },
];

const transports = [
  { name: "stdio", desc: "Server runs as a child process. Communication via stdin/stdout. Best for local tools.", icon: "🖥️", pros: ["Simple setup", "No network needed", "Fast"], cons: ["Local only", "One client per process"] },
  { name: "HTTP + SSE", desc: "Server runs remotely. Client sends HTTP POST, server streams responses via Server-Sent Events.", icon: "🌐", pros: ["Remote access", "Scalable", "Firewall-friendly"], cons: ["More complex", "Needs auth", "Network latency"] },
  { name: "Streamable HTTP", desc: "Newest transport (2025). Single HTTP endpoint that can upgrade to SSE for streaming. Replacing SSE.", icon: "⚡", pros: ["Stateless friendly", "Simpler than SSE", "Modern"], cons: ["Very new", "Less tooling", "Still evolving"] },
];

const entities = [
  { id: "user", label: "User", x: 60, color: "#64748B" },
  { id: "host", label: "Host App", x: 190, color: "#3B82F6" },
  { id: "llm", label: "LLM", x: 320, color: "#10B981" },
  { id: "client", label: "MCP Client", x: 450, color: "#8B5CF6" },
  { id: "server", label: "MCP Server", x: 580, color: "#F59E0B" },
  { id: "data", label: "Jira API", x: 710, color: "#EF4444" },
];

export default function MCPGuide() {
  const [tab, setTab] = useState("Architecture");
  const [activeLayer, setActiveLayer] = useState(null);
  const [seqStep, setSeqStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [deepTab, setDeepTab] = useState("transports");
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing && seqStep < sequenceSteps.length - 1) {
      timerRef.current = setTimeout(() => setSeqStep(s => s + 1), 2200);
      return () => clearTimeout(timerRef.current);
    } else if (playing && seqStep >= sequenceSteps.length - 1) {
      setPlaying(false);
    }
  }, [playing, seqStep]);

  const playSeq = () => { setSeqStep(0); setPlaying(true); };
  const stopSeq = () => { setPlaying(false); clearTimeout(timerRef.current); };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0F172A", color: "#E2E8F0", minHeight: "100vh", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #F59E0B, #8B5CF6, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
          MCP Server Architecture
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 13, marginTop: 6 }}>Model Context Protocol — How AI apps connect to the world</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: tab === t ? "linear-gradient(135deg, #F59E0B, #8B5CF6)" : "#1E293B",
              color: tab === t ? "#fff" : "#94A3B8" }}>
            {t}
          </button>
        ))}
      </div>

      {/* ===== ARCHITECTURE TAB ===== */}
      {tab === "Architecture" && (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ background: "#1E293B", borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              MCP follows a <strong style={{ color: "#F59E0B" }}>client-server</strong> architecture where a <strong style={{ color: "#3B82F6" }}>Host</strong> application 
              contains one or more <strong style={{ color: "#8B5CF6" }}>MCP Clients</strong>, each connected to a separate <strong style={{ color: "#F59E0B" }}>MCP Server</strong>. 
              Think of it like USB — a universal protocol that lets any AI app plug into any data source.
            </p>
          </div>

          {/* Architecture Diagram */}
          <div style={{ background: "#1E293B", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
              {layers.map((l, i) => (
                <div key={l.id}>
                  <div onClick={() => setActiveLayer(activeLayer === l.id ? null : l.id)}
                    style={{ background: activeLayer === l.id ? `${l.color}15` : "#0F172A", border: `2px solid ${activeLayer === l.id ? l.color : l.color + "33"}`,
                      borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "all .3s", position: "relative", zIndex: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: l.color }}>{l.label}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{l.sub}</div>
                      </div>
                      <span style={{ color: "#475569", fontSize: 18 }}>{activeLayer === l.id ? "▲" : "▼"}</span>
                    </div>
                    {activeLayer === l.id && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${l.color}22` }}>
                        <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6, margin: "0 0 10px" }}>{l.desc}</p>
                        {l.details.map((d, j) => (
                          <div key={j} style={{ fontSize: 13, color: "#94A3B8", padding: "4px 0", paddingLeft: 12, borderLeft: `2px solid ${l.color}44` }}>{d}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  {i < layers.length - 1 && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", zIndex: 1 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 2, height: 12, background: "linear-gradient(to bottom, " + layers[i].color + "44, " + layers[i+1].color + "44)" }} />
                        <span style={{ fontSize: 10, color: "#475569" }}>
                          {i === 0 ? "creates" : i === 1 ? "JSON-RPC 2.0" : "native protocol"}
                        </span>
                        <div style={{ width: 2, height: 12, background: "linear-gradient(to bottom, " + layers[i].color + "44, " + layers[i+1].color + "44)" }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Key insight */}
            <div style={{ marginTop: 20, background: "#0F172A", borderRadius: 12, padding: 16, borderLeft: "3px solid #F59E0B" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", marginBottom: 4 }}>KEY INSIGHT</div>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>
                One Host → many Clients → many Servers. Each Client↔Server is a <strong style={{ color: "#E2E8F0" }}>1:1 stateful session</strong>. 
                The Host orchestrates everything and the LLM decides <em>which</em> tool to call based on the aggregated tool list from all connected servers.
              </p>
            </div>

            {/* Visual: Host with multiple clients */}
            <div style={{ marginTop: 20, background: "#0F172A", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 12, textAlign: "center" }}>TYPICAL SETUP: ONE HOST, MULTIPLE SERVERS</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ background: "#3B82F622", border: "1px solid #3B82F644", borderRadius: 10, padding: "10px 16px", textAlign: "center", minWidth: 100 }}>
                  <div style={{ fontSize: 20 }}>🖥️</div>
                  <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 600 }}>Host App</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>Claude Desktop</div>
                </div>
                <div style={{ color: "#475569", fontSize: 20 }}>→</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[["🗂️", "Files Server", "stdio", "#8B5CF6"], ["📊", "Postgres Server", "stdio", "#F59E0B"], ["🔧", "GitHub Server", "SSE", "#EF4444"], ["📋", "Jira Server", "SSE", "#10B981"]].map(([icon, name, transport, c]) => (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ background: "#8B5CF622", border: "1px solid #8B5CF633", borderRadius: 6, padding: "4px 8px", fontSize: 10, color: "#8B5CF6", fontWeight: 600, width: 56, textAlign: "center" }}>Client</div>
                      <span style={{ color: "#475569", fontSize: 10 }}>↔</span>
                      <div style={{ background: `${c}15`, border: `1px solid ${c}33`, borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, minWidth: 140 }}>
                        <span>{icon}</span>
                        <div>
                          <div style={{ fontSize: 11, color: c, fontWeight: 600 }}>{name}</div>
                          <div style={{ fontSize: 9, color: "#64748B" }}>{transport}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEQUENCE DIAGRAM TAB ===== */}
      {tab === "Sequence" && (
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ background: "#1E293B", borderRadius: 16, padding: 20, overflowX: "auto" }}>
            {/* Controls */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
              <button onClick={playSeq} disabled={playing}
                style={{ padding: "8px 20px", borderRadius: 10, border: "none", cursor: playing ? "default" : "pointer",
                  background: playing ? "#334155" : "linear-gradient(135deg, #F59E0B, #8B5CF6)", color: "#fff", fontSize: 13, fontWeight: 600, opacity: playing ? 0.5 : 1 }}>
                ▶ {playing ? "Playing..." : "Play Animation"}
              </button>
              {playing && <button onClick={stopSeq} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #475569", background: "none", color: "#94A3B8", cursor: "pointer", fontSize: 13 }}>⏹ Stop</button>}
              <button onClick={() => { stopSeq(); setSeqStep(-1); }} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #334155", background: "none", color: "#64748B", cursor: "pointer", fontSize: 13 }}>↺ Reset</button>
            </div>

            {/* Entity headers */}
            <div style={{ display: "flex", justifyContent: "space-between", minWidth: 700, marginBottom: 0 }}>
              {entities.map(e => (
                <div key={e.id} style={{ width: 90, textAlign: "center" }}>
                  <div style={{ background: `${e.color}22`, border: `2px solid ${e.color}`, borderRadius: 10, padding: "8px 4px", marginBottom: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: e.color }}>{e.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lifelines + Messages */}
            <div style={{ position: "relative", minWidth: 700, minHeight: sequenceSteps.length * 56 + 20 }}>
              {/* Lifelines */}
              {entities.map(e => {
                const idx = entities.findIndex(x => x.id === e.id);
                const left = (idx / (entities.length - 1)) * 100;
                return (
                  <div key={e.id} style={{ position: "absolute", left: `calc(${left}% + 0px)`, top: 0, bottom: 0, width: 2, background: `${e.color}22`, transform: "translateX(-1px)" }} />
                );
              })}

              {/* Messages */}
              {sequenceSteps.map((step, i) => {
                const fromIdx = entities.findIndex(e => e.id === step.from);
                const toIdx = entities.findIndex(e => e.id === step.to);
                const leftPct = (Math.min(fromIdx, toIdx) / (entities.length - 1)) * 100;
                const rightPct = (Math.max(fromIdx, toIdx) / (entities.length - 1)) * 100;
                const goingRight = toIdx > fromIdx;
                const isActive = i <= seqStep;
                const isCurrent = i === seqStep;

                return (
                  <div key={i} onClick={() => { stopSeq(); setSeqStep(i); }}
                    style={{ position: "absolute", top: i * 56 + 10, left: `${leftPct}%`, width: `${rightPct - leftPct}%`,
                      cursor: "pointer", height: 50, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                      opacity: seqStep === -1 ? 1 : isActive ? 1 : 0.2, transition: "opacity .4s" }}>
                    {/* Arrow line */}
                    <div style={{ width: "100%", height: 2, background: isCurrent ? step.color : isActive ? step.color + "88" : "#334155", position: "relative", transition: "all .3s" }}>
                      <div style={{ position: "absolute", [goingRight ? "right" : "left"]: -2, top: -4,
                        width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent",
                        [goingRight ? "borderLeft" : "borderRight"]: `8px solid ${isCurrent ? step.color : isActive ? step.color + "88" : "#334155"}` }} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? step.color : "#94A3B8",
                      marginTop: 2, whiteSpace: "nowrap", transition: "all .3s" }}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step detail */}
          {seqStep >= 0 && (
            <div style={{ background: "#1E293B", borderRadius: 14, padding: 20, marginTop: 12, borderLeft: `3px solid ${sequenceSteps[seqStep].color}`, animation: "fadeIn .3s" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: sequenceSteps[seqStep].color, marginBottom: 6 }}>{sequenceSteps[seqStep].label}</div>
              <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7, margin: 0 }}>{sequenceSteps[seqStep].desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <button disabled={seqStep <= 0} onClick={() => { stopSeq(); setSeqStep(s => s - 1); }}
                  style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #334155", background: "none", color: seqStep <= 0 ? "#334155" : "#94A3B8", cursor: seqStep <= 0 ? "default" : "pointer", fontSize: 12 }}>← Prev</button>
                <span style={{ fontSize: 12, color: "#475569" }}>{seqStep + 1} / {sequenceSteps.length}</span>
                <button disabled={seqStep >= sequenceSteps.length - 1} onClick={() => { stopSeq(); setSeqStep(s => s + 1); }}
                  style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #334155", background: "none", color: seqStep >= sequenceSteps.length - 1 ? "#334155" : "#94A3B8", cursor: seqStep >= sequenceSteps.length - 1 ? "default" : "pointer", fontSize: 12 }}>Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== DEEP DIVE TAB ===== */}
      {tab === "Deep Dive" && (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
            {[["transports", "🔌 Transports"], ["primitives", "🧩 Primitives"], ["jsonrpc", "📡 Protocol"]].map(([k, l]) => (
              <button key={k} onClick={() => setDeepTab(k)}
                style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: deepTab === k ? "#F59E0B22" : "#1E293B", color: deepTab === k ? "#F59E0B" : "#64748B", border: deepTab === k ? "1px solid #F59E0B44" : "1px solid transparent" }}>
                {l}
              </button>
            ))}
          </div>

          {deepTab === "transports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {transports.map(t => (
                <div key={t.name} style={{ background: "#1E293B", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: "#94A3B8" }}>{t.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                    <div style={{ background: "#0F172A", borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 600, marginBottom: 6 }}>✅ Pros</div>
                      {t.pros.map((p, i) => <div key={i} style={{ fontSize: 12, color: "#94A3B8", padding: "2px 0" }}>• {p}</div>)}
                    </div>
                    <div style={{ background: "#0F172A", borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 600, marginBottom: 6 }}>⚠️ Cons</div>
                      {t.cons.map((c, i) => <div key={i} style={{ fontSize: 12, color: "#94A3B8", padding: "2px 0" }}>• {c}</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {deepTab === "primitives" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { name: "Tools", icon: "🔧", color: "#EF4444", desc: "Functions the LLM can invoke. Like API endpoints the AI can call.",
                  example: `{\n  "name": "create_issue",\n  "description": "Create a Jira ticket",\n  "inputSchema": {\n    "type": "object",\n    "properties": {\n      "title": { "type": "string" },\n      "project": { "type": "string" }\n    }\n  }\n}` },
                { name: "Resources", icon: "📄", color: "#3B82F6", desc: "Data the LLM can read. URI-addressed content like files or database records.",
                  example: `{\n  "uri": "file:///project/README.md",\n  "name": "Project README",\n  "mimeType": "text/markdown"\n}` },
                { name: "Prompts", icon: "💬", color: "#8B5CF6", desc: "Reusable prompt templates with parameters. Like stored procedures for AI.",
                  example: `{\n  "name": "code_review",\n  "description": "Review code changes",\n  "arguments": [\n    { "name": "diff", "required": true }\n  ]\n}` },
              ].map(p => (
                <div key={p.name} style={{ background: "#1E293B", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: p.color }}>{p.name}</span>
                    <span style={{ fontSize: 13, color: "#94A3B8" }}>— {p.desc}</span>
                  </div>
                  <pre style={{ background: "#0F172A", borderRadius: 10, padding: 14, margin: 0, fontSize: 12, color: "#CBD5E1", overflow: "auto",
                    fontFamily: "'Fira Code', monospace", lineHeight: 1.5, borderLeft: `3px solid ${p.color}` }}>{p.example}</pre>
                </div>
              ))}
            </div>
          )}

          {deepTab === "jsonrpc" && (
            <div style={{ background: "#1E293B", borderRadius: 14, padding: 20 }}>
              <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.7, marginTop: 0 }}>
                MCP uses <strong style={{ color: "#F59E0B" }}>JSON-RPC 2.0</strong> as its wire protocol. Every message is a JSON object with a standardized structure.
              </p>
              {[
                { label: "Request (Client → Server)", color: "#8B5CF6",
                  code: `{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "tools/call",\n  "params": {\n    "name": "create_issue",\n    "arguments": {\n      "title": "Fix login bug",\n      "project": "BACKEND"\n    }\n  }\n}` },
                { label: "Response (Server → Client)", color: "#F59E0B",
                  code: `{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "result": {\n    "content": [{\n      "type": "text",\n      "text": "Created BACKEND-142: Fix login bug"\n    }]\n  }\n}` },
                { label: "Notification (no response expected)", color: "#10B981",
                  code: `{\n  "jsonrpc": "2.0",\n  "method": "notifications/tools/list_changed"\n}` },
              ].map(m => (
                <div key={m.label} style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginBottom: 6 }}>{m.label}</div>
                  <pre style={{ background: "#0F172A", borderRadius: 10, padding: 14, margin: 0, fontSize: 12, color: "#CBD5E1", overflow: "auto",
                    fontFamily: "'Fira Code', monospace", lineHeight: 1.5, borderLeft: `3px solid ${m.color}` }}>{m.code}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== REAL EXAMPLE TAB ===== */}
      {tab === "Real Example" && (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ background: "#1E293B", borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>Real-World Flow: "What Jira tickets are assigned to me?"</h3>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>How this question flows through the entire MCP stack</p>

            {[
              { step: 1, actor: "User", color: "#64748B", text: "Types: \"What Jira tickets are assigned to me?\"" },
              { step: 2, actor: "Host (Claude)", color: "#3B82F6", text: "Receives query. Knows it has a Jira MCP server connected. Sends the query + available tools list to the LLM." },
              { step: 3, actor: "LLM", color: "#10B981", text: "Sees tool: `search_issues(jql: string)`. Decides to call it with JQL: `assignee = currentUser() ORDER BY updated DESC`" },
              { step: 4, actor: "Host", color: "#3B82F6", text: "Takes the tool_use response. Finds the MCP client connected to the Jira server. Forwards the call." },
              { step: 5, actor: "MCP Client", color: "#8B5CF6", text: "Sends JSON-RPC: `{method: 'tools/call', params: {name: 'search_issues', arguments: {jql: '...'}}}`" },
              { step: 6, actor: "MCP Server", color: "#F59E0B", text: "Receives the request. Translates to Jira REST API call: `GET /rest/api/3/search?jql=...` with stored auth token." },
              { step: 7, actor: "Jira API", color: "#EF4444", text: "Returns JSON with 5 matching issues: PROJ-101, PROJ-98, PROJ-95, PROJ-87, PROJ-82" },
              { step: 8, actor: "MCP Server", color: "#F59E0B", text: "Formats response into MCP content blocks (text with issue summaries, statuses, priorities)." },
              { step: 9, actor: "LLM", color: "#10B981", text: "Receives tool results. Generates natural language summary:\n\"You have 5 tickets assigned. Top priority: PROJ-101 (Critical bug in auth service)...\"" },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: 14, marginBottom: 4 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 32 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${s.color}22`, border: `2px solid ${s.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: s.color, flexShrink: 0 }}>
                    {s.step}
                  </div>
                  {s.step < 9 && <div style={{ width: 2, height: 16, background: "#334155", flexGrow: 1 }} />}
                </div>
                <div style={{ background: "#0F172A", borderRadius: 10, padding: "12px 16px", flex: 1, marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.actor}</div>
                  <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{s.text}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 16, background: "#0F172A", borderRadius: 12, padding: 16, borderLeft: "3px solid #10B981" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>WHY THIS MATTERS</div>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>
                The user never thinks about APIs, auth, or JQL. The LLM never calls Jira directly. The MCP server never sees the user's question. 
                Each layer does one thing well — that's the power of MCP's separation of concerns. And the same Jira MCP server works with <em>any</em> host app that speaks MCP.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}