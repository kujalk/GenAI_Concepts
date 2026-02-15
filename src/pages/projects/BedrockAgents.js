import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";

const sections = [
  "overview",
  "architecture",
  "actionGroups",
  "sdk",
  "vsMCP",
  "useCases",
  "memory",
];
const sectionLabels = {
  overview: "What is Bedrock Agent?",
  architecture: "Architecture Diagram",
  actionGroups: "Action Groups",
  sdk: "Agent SDK & Deploy",
  vsMCP: "Bedrock Agent vs MCP",
  useCases: "Real-World Use Cases",
  memory: "Memory Management",
};

const Pulse = ({ color = "#6366f1", size = 10, style = {} }) => {
  const [op, setOp] = useState(1);
  useEffect(() => {
    const i = setInterval(() => setOp((p) => (p === 1 ? 0.3 : 1)), 700);
    return () => clearInterval(i);
  }, []);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity: op,
        transition: "opacity 0.6s",
        ...style,
      }}
    />
  );
};

const Card = ({ title, children, accent = "#6366f1", icon, onClick, active }) => (
  <div
    onClick={onClick}
    style={{
      background: active ? `${accent}18` : "rgba(255,255,255,0.04)",
      border: `1.5px solid ${active ? accent : "rgba(255,255,255,0.1)"}`,
      borderRadius: 16,
      padding: "20px 22px",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.3s",
      transform: active ? "scale(1.02)" : "scale(1)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
      <h3 style={{ margin: 0, color: accent, fontSize: 16, fontWeight: 700 }}>{title}</h3>
    </div>
    <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7 }}>{children}</div>
  </div>
);

const Tag = ({ children, color = "#6366f1" }) => (
  <span
    style={{
      display: "inline-block",
      background: `${color}25`,
      color,
      borderRadius: 8,
      padding: "3px 10px",
      fontSize: 12,
      fontWeight: 600,
      margin: "2px 4px",
      border: `1px solid ${color}40`,
    }}
  >
    {children}
  </span>
);

const FlowArrow = ({ label, color = "#6366f1" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "6px 0" }}>
    <div style={{ width: 2, height: 18, background: `${color}60` }} />
    <div style={{ color, fontSize: 11, fontWeight: 600, padding: "2px 8px", background: `${color}15`, borderRadius: 6 }}>{label}</div>
    <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `8px solid ${color}` }} />
  </div>
);

const ArchBox = ({ title, items, color, icon }) => (
  <div style={{ background: `${color}12`, border: `1.5px solid ${color}50`, borderRadius: 14, padding: "14px 16px", minWidth: 180, flex: 1 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ color, fontWeight: 700, fontSize: 14 }}>{title}</span>
    </div>
    {items.map((it, i) => (
      <div key={i} style={{ color: "#94a3b8", fontSize: 12, padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
        <Pulse color={color} size={6} />
        {it}
      </div>
    ))}
  </div>
);

const CompareRow = ({ feature, bedrock, mcp, highlight }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.5fr", gap: 8, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{feature}</div>
    <div style={{ color: "#818cf8", fontSize: 13, lineHeight: 1.6 }}>{bedrock}</div>
    <div style={{ color: "#34d399", fontSize: 13, lineHeight: 1.6 }}>{mcp}</div>
  </div>
);

const MemoryBlock = ({ type, color, icon, title, desc, items }) => (
  <div style={{ background: `${color}10`, border: `1.5px solid ${color}40`, borderRadius: 14, padding: 18, flex: 1, minWidth: 240 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ color, fontWeight: 700, fontSize: 15 }}>{title}</span>
      <Tag color={color}>{type}</Tag>
    </div>
    <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, margin: "8px 0" }}>{desc}</p>
    {items.map((it, i) => (
      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0" }}>
        <span style={{ color, fontSize: 14, marginTop: 2 }}>▸</span>
        <span style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 }}>{it}</span>
      </div>
    ))}
  </div>
);

export default function BedrockAgents() {
  const [tab, setTab] = useState("overview");
  const [expandedUC, setExpandedUC] = useState(null);
  const [agHover, setAgHover] = useState(null);

  const actionGroups = [
    { id: "api", icon: "🔌", title: "API Schema (OpenAPI)", color: "#f59e0b", desc: "Define your agent's capabilities using OpenAPI 3.0 schemas. The agent reads the schema to understand what APIs it can call, their parameters, and expected responses.", details: ["Supports REST APIs", "Auto-generates tool descriptions for FM", "Parameter validation built-in", "Maps to Lambda or return-control"] },
    { id: "lambda", icon: "⚡", title: "Lambda Functions", color: "#10b981", desc: "Each action group can be backed by an AWS Lambda function that executes the actual business logic when the agent decides to invoke an action.", details: ["Serverless execution", "Access any AWS service", "Custom business logic", "Error handling & retries"] },
    { id: "rc", icon: "🎮", title: "Return Control", color: "#ec4899", desc: "Instead of executing via Lambda, the agent can return control to your application with the action details, letting your app handle execution.", details: ["Client-side execution", "Hybrid architectures", "Human-in-the-loop flows", "Custom orchestration"] },
    { id: "kb", icon: "📚", title: "Knowledge Bases", color: "#6366f1", desc: "Attach vector knowledge bases (powered by OpenSearch, Pinecone, etc.) for RAG. The agent auto-retrieves relevant context before responding.", details: ["S3, Web Crawlers, Confluence sources", "Chunking strategies", "Embedding models (Titan, Cohere)", "Metadata filtering"] },
    { id: "gc", icon: "🛡️", title: "Guardrails", color: "#ef4444", desc: "Apply content filters, denied topics, PII redaction, and custom word filters to control what the agent can say or process.", details: ["Content filters (hate, violence, etc.)", "Denied topic detection", "PII auto-redaction", "Contextual grounding checks"] },
  ];

  const useCases = [
    { id: "cs", icon: "🎧", title: "Customer Service Bot", color: "#6366f1", desc: "An insurance company deploys a Bedrock Agent that can look up policy details, file claims, check claim status, and escalate to humans — all conversationally.", flow: ["Customer asks 'What's my claim status?'", "Agent extracts claim ID from conversation", "Calls ClaimLookup action group (Lambda → DynamoDB)", "Retrieves policy docs from Knowledge Base", "Responds with status + next steps", "If complex → Return Control to human agent"] },
    { id: "da", icon: "📊", title: "Data Analytics Assistant", color: "#10b981", desc: "A retail company uses a Bedrock Agent to let business users query sales data, generate reports, and get insights in natural language.", flow: ["User: 'Show me Q4 sales by region'", "Agent parses intent → calls QueryBuilder action group", "Lambda generates SQL → runs against Redshift", "Results formatted into natural language summary", "Agent proactively suggests: 'Want me to compare with Q3?'", "Knowledge Base provides business context/definitions"] },
    { id: "hr", icon: "👥", title: "HR Onboarding Agent", color: "#f59e0b", desc: "Automates employee onboarding — answers policy questions, schedules orientation, provisions accounts, and tracks completion.", flow: ["New hire asks about benefits enrollment", "Agent retrieves HR policy from Knowledge Base (RAG)", "Calls BenefitsEnrollment action (Lambda → Workday API)", "Schedules orientation via CalendarBooking action", "Tracks onboarding progress in DynamoDB", "Long-term memory remembers employee preferences"] },
  ];

  return (
    <Layout>
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "28px 24px 16px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, background: "linear-gradient(90deg,#818cf8,#c084fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AWS Bedrock Agents
          </h1>
        </div>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Interactive Deep-Dive · Architecture · Comparisons · Memory</p>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 6, padding: "12px 16px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            style={{
              background: tab === s ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)",
              color: tab === s ? "#fff" : "#94a3b8",
              border: "none",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {sectionLabels[s]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 40px", maxWidth: 900, margin: "0 auto" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "linear-gradient(135deg,#6366f120,#8b5cf610)", border: "1.5px solid #6366f140", borderRadius: 18, padding: 24 }}>
              <h2 style={{ color: "#a5b4fc", margin: "0 0 12px", fontSize: 20, fontWeight: 800 }}>🧠 What is AWS Bedrock Agent?</h2>
              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                <strong style={{ color: "#818cf8" }}>Amazon Bedrock Agents</strong> is a fully managed service that lets you build autonomous AI agents powered by foundation models (Claude, Titan, Llama, etc.). These agents can <strong style={{ color: "#c084fc" }}>reason, plan, and execute multi-step tasks</strong> by breaking down user requests, calling APIs, querying knowledge bases, and maintaining conversation context — all without you writing orchestration logic.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                {["Fully Managed", "Multi-Step Reasoning", "API Orchestration", "RAG Built-in", "Memory & Sessions", "Guardrails", "Code Interpreter", "Multi-Agent Collaboration"].map((t) => (
                  <Tag key={t} color="#818cf8">{t}</Tag>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
              <Card title="Foundation Model" accent="#818cf8" icon="🧬">
                Choose from Claude (Anthropic), Titan (Amazon), Llama (Meta), Mistral, and more. The FM handles reasoning and language generation.
              </Card>
              <Card title="Instructions" accent="#a78bfa" icon="📝">
                Natural language instructions that define the agent's persona, goals, and behavioral guidelines. Think of it as the agent's "system prompt."
              </Card>
              <Card title="Action Groups" accent="#f59e0b" icon="⚙️">
                Collections of APIs/tools the agent can invoke. Defined via OpenAPI schemas and backed by Lambda functions or return-control.
              </Card>
              <Card title="Knowledge Bases" accent="#10b981" icon="📚">
                RAG-powered retrieval from your data sources (S3, web crawlers, databases). Vector embeddings + semantic search.
              </Card>
              <Card title="Guardrails" accent="#ef4444" icon="🛡️">
                Content filtering, PII redaction, denied topics, and grounding checks to keep the agent safe and compliant.
              </Card>
              <Card title="Memory & Sessions" accent="#ec4899" icon="💾">
                Short-term (within session) and long-term (across sessions) memory to maintain context and personalize interactions.
              </Card>
            </div>
          </div>
        )}

        {/* ARCHITECTURE DIAGRAM */}
        {tab === "architecture" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ color: "#a5b4fc", margin: 0, fontSize: 18, fontWeight: 800, textAlign: "center" }}>🏗️ Bedrock Agent Architecture Flow</h2>
            
            {/* User */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ArchBox title="User / Application" icon="👤" color="#60a5fa" items={["Chat UI / API call", "Sends natural language request", "Receives agent response"]} />
            </div>
            <FlowArrow label="InvokeAgent API" color="#60a5fa" />

            {/* Agent Runtime */}
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1.5px solid #6366f140", borderRadius: 18, padding: 18 }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <span style={{ color: "#818cf8", fontWeight: 800, fontSize: 15 }}>🤖 Bedrock Agent Runtime</span>
                <p style={{ color: "#64748b", fontSize: 11, margin: "4px 0 0" }}>Managed orchestration layer — you don't write this logic</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <ArchBox title="Pre-Processing" icon="🔍" color="#f59e0b" items={["Input validation", "Guardrails check", "Context enrichment"]} />
                <ArchBox title="Orchestration" icon="🧠" color="#8b5cf6" items={["ReAct / Chain-of-Thought", "Plan multi-step actions", "Decide tool vs. respond"]} />
                <ArchBox title="Post-Processing" icon="✅" color="#10b981" items={["Response formatting", "Guardrails output check", "Citation injection"]} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <FlowArrow label="Invoke Tool" color="#f59e0b" />
                <ArchBox title="Action Groups" icon="⚡" color="#f59e0b" items={["OpenAPI Schema", "Lambda Functions", "Return Control", "Code Interpreter"]} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <FlowArrow label="RAG Query" color="#10b981" />
                <ArchBox title="Knowledge Bases" icon="📚" color="#10b981" items={["Vector Store (OpenSearch, Pinecone)", "S3 / Confluence / Web", "Embedding Models", "Metadata Filtering"]} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <FlowArrow label="Load / Save" color="#ec4899" />
                <ArchBox title="Memory Store" icon="💾" color="#ec4899" items={["Session attributes (short-term)", "DynamoDB (long-term)", "Conversation summaries", "User preferences"]} />
              </div>
            </div>

            <FlowArrow label="Final Response" color="#60a5fa" />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ArchBox title="User Receives Response" icon="💬" color="#60a5fa" items={["Natural language answer", "With citations & sources", "Action confirmations"]} />
            </div>
          </div>
        )}

        {/* ACTION GROUPS */}
        {tab === "actionGroups" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <h2 style={{ color: "#a5b4fc", margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>⚙️ Action Groups & Components</h2>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Click each component to explore details</p>
            </div>
            {actionGroups.map((ag) => (
              <Card
                key={ag.id}
                title={ag.title}
                accent={ag.color}
                icon={ag.icon}
                active={agHover === ag.id}
                onClick={() => setAgHover(agHover === ag.id ? null : ag.id)}
              >
                <p style={{ margin: "0 0 8px" }}>{ag.desc}</p>
                {agHover === ag.id && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, animation: "fadeIn 0.3s" }}>
                    {ag.details.map((d, i) => (
                      <Tag key={i} color={ag.color}>{d}</Tag>
                    ))}
                  </div>
                )}
              </Card>
            ))}

            <div style={{ background: "rgba(139,92,246,0.08)", border: "1.5px solid #8b5cf640", borderRadius: 14, padding: 18, marginTop: 6 }}>
              <h3 style={{ color: "#a78bfa", margin: "0 0 8px", fontSize: 15 }}>📐 How Action Groups Work Together</h3>
              <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8 }}>
                <strong style={{ color: "#c084fc" }}>1.</strong> You define an <Tag color="#f59e0b">OpenAPI Schema</Tag> describing available operations.{" "}
                <strong style={{ color: "#c084fc" }}>2.</strong> The agent reads the schema and understands what tools it has.{" "}
                <strong style={{ color: "#c084fc" }}>3.</strong> When a user asks something, the agent's <Tag color="#8b5cf6">orchestration</Tag> decides which action to call.{" "}
                <strong style={{ color: "#c084fc" }}>4.</strong> The action executes via <Tag color="#10b981">Lambda</Tag> or returns control to your app.{" "}
                <strong style={{ color: "#c084fc" }}>5.</strong> Results feed back into the agent for further reasoning or final response.
              </div>
            </div>
          </div>
        )}

        {/* SDK */}
        {tab === "sdk" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "linear-gradient(135deg,#10b98120,#6366f110)", border: "1.5px solid #10b98140", borderRadius: 18, padding: 24 }}>
              <h2 style={{ color: "#34d399", margin: "0 0 12px", fontSize: 20, fontWeight: 800 }}>🚀 Bedrock Agent SDK & Infrastructure as Code</h2>
              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.8 }}>
                AWS provides <strong style={{ color: "#34d399" }}>CDK Constructs</strong> and <strong style={{ color: "#34d399" }}>CloudFormation templates</strong> that let you define and deploy entire Bedrock Agent stacks — agent config, action groups, knowledge bases, Lambda functions, IAM roles — <strong style={{ color: "#a78bfa" }}>without writing orchestration code from scratch</strong>. You just declare what you want.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
              <Card title="AWS CDK (L2 Constructs)" accent="#34d399" icon="🏗️">
                <p style={{ margin: "0 0 8px" }}>High-level CDK constructs in <Tag color="#34d399">@cdklabs/generative-ai-cdk-constructs</Tag> let you define agents in TypeScript/Python.</p>
                <div style={{ background: "#0f172a", borderRadius: 10, padding: 12, fontSize: 12, fontFamily: "monospace", color: "#a5b4fc", lineHeight: 1.6, overflowX: "auto" }}>
                  {`const agent = new bedrock.Agent(this, 'MyAgent', {\n  foundationModel: bedrock.BedrockFoundationModel\n    .ANTHROPIC_CLAUDE_SONNET_V2,\n  instruction: 'You are a helpful assistant...',\n});\nagent.addActionGroup(new bedrock.AgentActionGroup({\n  actionGroupName: 'OrderLookup',\n  apiSchema: bedrock.ApiSchema\n    .fromAsset('schemas/orders.json'),\n  executor: orderLambda,\n}));`}
                </div>
              </Card>
              <Card title="AWS SDK (Boto3 / JS)" accent="#818cf8" icon="📦">
                <p style={{ margin: "0 0 8px" }}>Use the <Tag color="#818cf8">bedrock-agent</Tag> and <Tag color="#818cf8">bedrock-agent-runtime</Tag> SDKs to create, configure, and invoke agents programmatically.</p>
                <div style={{ background: "#0f172a", borderRadius: 10, padding: 12, fontSize: 12, fontFamily: "monospace", color: "#a5b4fc", lineHeight: 1.6, overflowX: "auto" }}>
                  {`# Create agent\nclient.create_agent(\n  agentName='MyAgent',\n  foundationModel='anthropic.claude-3-sonnet',\n  instruction='...',\n)\n# Invoke agent\nruntime.invoke_agent(\n  agentId='XXXXX',\n  sessionId='user-123',\n  inputText='Check my order status'\n)`}
                </div>
              </Card>
            </div>

            <Card title="What You DON'T Have to Write" accent="#f59e0b" icon="🎯">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginTop: 4 }}>
                {[
                  { t: "Orchestration Loop", d: "ReAct/CoT reasoning loop is fully managed" },
                  { t: "Tool Routing", d: "Agent auto-selects which action to call" },
                  { t: "Context Management", d: "Session & memory handled automatically" },
                  { t: "Prompt Engineering", d: "Internal prompts optimized by AWS" },
                  { t: "Error Recovery", d: "Retries and fallback logic built-in" },
                  { t: "RAG Pipeline", d: "Embedding, chunking, retrieval all managed" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "rgba(245,158,11,0.08)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13 }}>{item.t}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{item.d}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* VS MCP */}
        {tab === "vsMCP" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ color: "#a5b4fc", margin: 0, fontSize: 18, fontWeight: 800, textAlign: "center" }}>⚖️ Bedrock Agent vs MCP Server</h2>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "4px 16px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CompareRow feature={<strong style={{ color: "#94a3b8" }}>Feature</strong>} bedrock={<strong>🟣 Bedrock Agent</strong>} mcp={<strong>🟢 MCP Server</strong>} />
              <CompareRow feature="What it is" bedrock="Fully managed AI agent service with built-in orchestration, memory, and tool execution" mcp="An open protocol (by Anthropic) that standardizes how LLMs connect to external tools/data" />
              <CompareRow feature="Orchestration" bedrock="Built-in ReAct loop — agent plans & executes multi-step tasks autonomously" mcp="No orchestration — MCP just exposes tools. The LLM client handles orchestration" />
              <CompareRow feature="Hosting" bedrock="Fully managed on AWS. No infra to manage." mcp="You host MCP servers yourself (local, Docker, cloud). You manage the infra." />
              <CompareRow feature="Tool Definition" bedrock="OpenAPI schemas → Lambda functions" mcp="MCP protocol (JSON-RPC) with tool schemas, resources, and prompts" />
              <CompareRow feature="Memory" bedrock="Built-in session memory + long-term memory (DynamoDB)" mcp="No built-in memory. Must be implemented by the client." />
              <CompareRow feature="Knowledge / RAG" bedrock="Native Knowledge Base integration with vector stores" mcp="Can expose data as 'resources' but no built-in RAG pipeline" />
              <CompareRow feature="Guardrails" bedrock="Native content filtering, PII redaction, denied topics" mcp="No built-in guardrails — must be added at client or server level" />
              <CompareRow feature="Vendor Lock-in" bedrock="AWS-specific (uses Bedrock FMs, Lambda, S3, etc.)" mcp="Vendor-agnostic open standard — works with any LLM that supports it" />
              <CompareRow feature="Best For" bedrock="Production enterprise apps that need managed, secure, end-to-end agent infra" mcp="Developer tooling, IDE integrations, lightweight tool connectivity, multi-provider flexibility" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#6366f112", border: "1.5px solid #6366f140", borderRadius: 14, padding: 16 }}>
                <h3 style={{ color: "#818cf8", margin: "0 0 8px", fontSize: 15 }}>🟣 Choose Bedrock Agent when...</h3>
                {["You want zero-infra managed agents", "You need built-in memory & guardrails", "Your stack is already on AWS", "You need enterprise security & compliance", "You want multi-agent collaboration"].map((t, i) => (
                  <div key={i} style={{ color: "#cbd5e1", fontSize: 13, padding: "4px 0", display: "flex", gap: 8 }}>
                    <span style={{ color: "#818cf8" }}>✓</span>{t}
                  </div>
                ))}
              </div>
              <div style={{ background: "#10b98112", border: "1.5px solid #10b98140", borderRadius: 14, padding: 16 }}>
                <h3 style={{ color: "#34d399", margin: "0 0 8px", fontSize: 15 }}>🟢 Choose MCP when...</h3>
                {["You want vendor-agnostic tool protocol", "Building IDE/dev tool integrations", "You need maximum flexibility", "Connecting to many diverse data sources", "Using non-AWS LLM providers"].map((t, i) => (
                  <div key={i} style={{ color: "#cbd5e1", fontSize: 13, padding: "4px 0", display: "flex", gap: 8 }}>
                    <span style={{ color: "#34d399" }}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>

            <Card title="Can They Work Together?" accent="#c084fc" icon="🤝">
              <strong style={{ color: "#e9d5ff" }}>Yes!</strong> You can use MCP servers as tool backends that a Bedrock Agent calls via its action groups. For example, a Bedrock Agent could invoke a Lambda that acts as an MCP client, connecting to MCP servers for GitHub, Slack, or databases. This gives you managed orchestration (Bedrock) + standardized tool connectivity (MCP).
            </Card>
          </div>
        )}

        {/* USE CASES */}
        {tab === "useCases" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ color: "#a5b4fc", margin: 0, fontSize: 18, fontWeight: 800, textAlign: "center" }}>🌍 Real-World Use Cases</h2>
            {useCases.map((uc) => (
              <div key={uc.id} onClick={() => setExpandedUC(expandedUC === uc.id ? null : uc.id)} style={{ background: `${uc.color}08`, border: `1.5px solid ${uc.color}40`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{uc.icon}</span>
                  <div>
                    <h3 style={{ color: uc.color, margin: 0, fontSize: 16, fontWeight: 700 }}>{uc.title}</h3>
                    <p style={{ color: "#94a3b8", margin: "4px 0 0", fontSize: 13 }}>{uc.desc}</p>
                  </div>
                  <span style={{ marginLeft: "auto", color: uc.color, fontSize: 18, transform: expandedUC === uc.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>▼</span>
                </div>
                {expandedUC === uc.id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${uc.color}30` }}>
                    <h4 style={{ color: uc.color, margin: "0 0 10px", fontSize: 14 }}>📋 Agent Flow — Step by Step</h4>
                    {uc.flow.map((step, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0" }}>
                        <div style={{ minWidth: 28, height: 28, borderRadius: "50%", background: `${uc.color}25`, color: uc.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
                        <p style={{ color: "#cbd5e1", fontSize: 13, margin: 0, lineHeight: 1.7 }}>{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MEMORY */}
        {tab === "memory" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ color: "#a5b4fc", margin: 0, fontSize: 18, fontWeight: 800, textAlign: "center" }}>💾 Memory Management in Bedrock Agents</h2>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <MemoryBlock
                type="Short-Term"
                color="#60a5fa"
                icon="⏱️"
                title="Session Memory"
                desc="Maintained automatically within a single conversation session. Tied to a sessionId. Lasts until the session ends or times out (default idle timeout is configurable)."
                items={[
                  "Conversation history: Full message history kept in context window automatically",
                  "Session Attributes: Key-value pairs you can set/read during a session (e.g. userId, cartItems). Passed in sessionState on each InvokeAgent call.",
                  "Prompt Session Attributes: Injected into the agent's prompt template dynamically. Useful for per-turn context.",
                  "Automatically cleared when session ends. No extra infra needed.",
                ]}
              />
              <MemoryBlock
                type="Long-Term"
                color="#c084fc"
                icon="🏛️"
                title="Persistent Memory"
                desc="Survives across sessions. AWS introduced memory_type='LONG_TERM' which uses a managed DynamoDB table to store conversation summaries and user preferences."
                items={[
                  "Conversation Summaries: Agent auto-summarizes each session and stores it. Retrieved in future sessions for continuity.",
                  "User Preferences: Extracted facts like 'User prefers email over SMS' are persisted and auto-injected into future prompts.",
                  "Backed by DynamoDB: AWS manages the table. Data is keyed by memoryId (usually mapped to userId).",
                  "Configurable retention: Set how long memories persist. Supports deletion via DeleteAgentMemory API.",
                ]}
              />
            </div>

            {/* Memory Flow Diagram */}
            <div style={{ background: "rgba(99,102,241,0.06)", border: "1.5px solid #6366f130", borderRadius: 18, padding: 20 }}>
              <h3 style={{ color: "#818cf8", margin: "0 0 14px", fontSize: 15, textAlign: "center" }}>🔄 Memory Flow — How It All Connects</h3>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ background: "#60a5fa18", border: "1px solid #60a5fa40", borderRadius: 12, padding: "10px 20px", textAlign: "center" }}>
                  <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: 13 }}>📨 User sends message</span>
                  <div style={{ color: "#64748b", fontSize: 11 }}>with sessionId + optional sessionState</div>
                </div>
                <FlowArrow label="InvokeAgent" color="#60a5fa" />

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                  <div style={{ background: "#c084fc15", border: "1px solid #c084fc40", borderRadius: 12, padding: "10px 16px", textAlign: "center", minWidth: 180 }}>
                    <span style={{ color: "#c084fc", fontWeight: 700, fontSize: 12 }}>🏛️ Load Long-Term Memory</span>
                    <div style={{ color: "#64748b", fontSize: 11 }}>DynamoDB → summaries + preferences</div>
                  </div>
                  <div style={{ background: "#60a5fa15", border: "1px solid #60a5fa40", borderRadius: 12, padding: "10px 16px", textAlign: "center", minWidth: 180 }}>
                    <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: 12 }}>⏱️ Load Session Context</span>
                    <div style={{ color: "#64748b", fontSize: 11 }}>Conversation history + attributes</div>
                  </div>
                </div>
                <FlowArrow label="Context assembled" color="#818cf8" />

                <div style={{ background: "#8b5cf618", border: "1px solid #8b5cf640", borderRadius: 12, padding: "10px 20px", textAlign: "center" }}>
                  <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 13 }}>🧠 Agent Reasons & Responds</span>
                  <div style={{ color: "#64748b", fontSize: 11 }}>FM has full context: history + memories + tools</div>
                </div>
                <FlowArrow label="After response" color="#10b981" />

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                  <div style={{ background: "#10b98115", border: "1px solid #10b98140", borderRadius: 12, padding: "10px 16px", textAlign: "center", minWidth: 180 }}>
                    <span style={{ color: "#34d399", fontWeight: 700, fontSize: 12 }}>💾 Update Session Memory</span>
                    <div style={{ color: "#64748b", fontSize: 11 }}>Append to conversation history</div>
                  </div>
                  <div style={{ background: "#c084fc15", border: "1px solid #c084fc40", borderRadius: 12, padding: "10px 16px", textAlign: "center", minWidth: 180 }}>
                    <span style={{ color: "#c084fc", fontWeight: 700, fontSize: 12 }}>🏛️ Persist Long-Term</span>
                    <div style={{ color: "#64748b", fontSize: 11 }}>Summarize session → DynamoDB on end</div>
                  </div>
                </div>
              </div>
            </div>

            <Card title="Code Example — Using Memory" accent="#34d399" icon="💻">
              <div style={{ background: "#0f172a", borderRadius: 10, padding: 14, fontSize: 12, fontFamily: "monospace", color: "#a5b4fc", lineHeight: 1.7, overflowX: "auto" }}>
{`# Enable long-term memory on agent
client.update_agent(
    agentId='XXXXX',
    memoryConfiguration={
        'enabledMemoryTypes': ['SESSION_SUMMARY'],
        'storageDays': 30
    }
)

# Invoke with session state (short-term)
runtime.invoke_agent(
    agentId='XXXXX',
    agentAliasId='YYYYY',
    sessionId='session-abc-123',
    memoryId='user-john-doe',       # Links to long-term memory
    inputText='What did we discuss last time?',
    sessionState={
        'sessionAttributes': {
            'userId': 'john-doe',
            'plan': 'premium'
        }
    }
)

# Retrieve stored memories
runtime.get_agent_memory(
    agentId='XXXXX',
    agentAliasId='YYYYY',
    memoryId='user-john-doe',
    memoryType='SESSION_SUMMARY'
)`}
              </div>
            </Card>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}