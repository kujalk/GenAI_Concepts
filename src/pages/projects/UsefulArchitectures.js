import { useState } from "react";

const archTabs = [
  { id: "s3-opensearch", label: "S3 → OpenSearch Ingestion", icon: "📄" },
  { id: "bedrock-rag-kb", label: "Serverless RAG with Bedrock KB", icon: "📚" },
  { id: "genai-chat", label: "Real-Time GenAI Chat App", icon: "💬" },
];

const CodeBlock = ({ code }) => (
  <div style={{ background: "#0f172a", borderRadius: 10, padding: 14, fontSize: 11, fontFamily: "'Fira Code', 'Cascadia Code', monospace", color: "#a5b4fc", overflowX: "auto", lineHeight: 1.6, whiteSpace: "pre", marginTop: 8 }}>
    {code}
  </div>
);

// ─── S3 → OpenSearch Architecture SVG ───
const IngestionArchSVG = ({ highlight, onHighlight }) => {
  const services = [
    // Row 1: S3 Source
    { id: "s3", x: 20, y: 30, w: 120, h: 60, label: "Amazon S3", sub: "80M Documents", fill: "#d1fae5", stroke: "#059669", icon: "🪣" },
    // Row 1: EventBridge
    { id: "eventbridge", x: 180, y: 30, w: 120, h: 60, label: "EventBridge", sub: "s3:ObjectCreated", fill: "#fef3c7", stroke: "#d97706", icon: "📡" },

    // Bulk path
    { id: "batch", x: 20, y: 160, w: 140, h: 60, label: "AWS Batch", sub: "Array Job (1000 tasks)", fill: "#dbeafe", stroke: "#2563eb", icon: "📦" },
    { id: "retry", x: 20, y: 240, w: 140, h: 40, label: "Retry Strategy", sub: "3 attempts, exp backoff", fill: "#fee2e2", stroke: "#dc2626", icon: "🔄" },

    // Real-time path
    { id: "sqs", x: 350, y: 30, w: 120, h: 60, label: "Amazon SQS", sub: "New Doc Queue", fill: "#ede9fe", stroke: "#7c3aed", icon: "📬" },
    { id: "lambda", x: 350, y: 130, w: 120, h: 60, label: "AWS Lambda", sub: "Embedding Function", fill: "#fef3c7", stroke: "#d97706", icon: "⚡" },
    { id: "dlq", x: 510, y: 30, w: 110, h: 60, label: "DLQ", sub: "Failed Messages", fill: "#fee2e2", stroke: "#dc2626", icon: "🚨" },

    // Shared: Embedding model
    { id: "bedrock", x: 200, y: 320, w: 160, h: 60, label: "Bedrock / SageMaker", sub: "Embedding Model", fill: "#fce7f3", stroke: "#ec4899", icon: "🧠" },

    // Destination
    { id: "opensearch", x: 450, y: 280, w: 170, h: 80, label: "Amazon OpenSearch", sub: "Vector Database\n(k-NN index)", fill: "#d1fae5", stroke: "#059669", icon: "🔍" },
  ];

  const arrows = [
    // Bulk ingestion path
    { from: "s3", to: "batch", label: "LIST 80M objects", color: "#2563eb", path: "M80,90 L80,160" },
    { from: "batch", to: "bedrock", label: "embed batch", color: "#ec4899", path: "M90,220 L280,320" },

    // Real-time path
    { from: "eventbridge", to: "sqs", label: "new doc event", color: "#7c3aed", path: "M300,60 L350,60" },
    { from: "sqs", to: "lambda", label: "triggers", color: "#d97706", path: "M410,90 L410,130" },
    { from: "sqs", to: "dlq", label: "failures", color: "#dc2626", path: "M470,60 L510,60" },
    { from: "lambda", to: "bedrock", label: "embed", color: "#ec4899", path: "M380,190 L320,320" },

    // To OpenSearch
    { from: "bedrock", to: "opensearch", label: "vectors", color: "#059669", path: "M360,350 L450,330" },
    { from: "batch", to: "opensearch", label: "bulk index", color: "#059669", path: "M160,190 C350,190 350,300 450,310" },
  ];

  return (
    <svg viewBox="0 0 650 400" style={{ width: "100%", maxWidth: 650, display: "block", margin: "0 auto" }}>
      <defs>
        <marker id="arch-arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
        {["#2563eb", "#7c3aed", "#d97706", "#ec4899", "#059669", "#dc2626"].map(c => (
          <marker key={c} id={`arch-arrow-${c.slice(1)}`} viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" fill={c} />
          </marker>
        ))}
      </defs>

      {/* Background sections */}
      <rect x="5" y="140" width="170" height="160" rx="12" fill="#dbeafe" opacity="0.15" stroke="#2563eb" strokeWidth="1" strokeDasharray="4" />
      <text x="15" y="158" fontSize="9" fill="#2563eb" fontWeight="700">BULK INGESTION PATH</text>

      <rect x="330" y="15" width="300" height="200" rx="12" fill="#ede9fe" opacity="0.15" stroke="#7c3aed" strokeWidth="1" strokeDasharray="4" />
      <text x="340" y="28" fontSize="9" fill="#7c3aed" fontWeight="700">REAL-TIME INGESTION PATH</text>

      {/* Arrows */}
      {arrows.map((a, i) => (
        <g key={i}>
          <path d={a.path} fill="none" stroke={a.color} strokeWidth={2} markerEnd={`url(#arch-arrow-${a.color.slice(1)})`} opacity={0.6} />
          {a.label && (() => {
            const pts = a.path.match(/[\d.]+/g).map(Number);
            const mx = (pts[0] + pts[pts.length - 2]) / 2;
            const my = (pts[1] + pts[pts.length - 1]) / 2;
            return <text x={mx} y={my - 6} textAnchor="middle" fontSize={8} fill={a.color} fontWeight="600">{a.label}</text>;
          })()}
        </g>
      ))}

      {/* Service boxes */}
      {services.map(s => {
        const isHighlighted = highlight === s.id;
        return (
          <g key={s.id} onClick={() => onHighlight && onHighlight(s.id)} style={{ cursor: "pointer" }}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={10}
              fill={isHighlighted ? s.stroke : s.fill} stroke={s.stroke} strokeWidth={isHighlighted ? 2.5 : 1.5} />
            <text x={s.x + s.w / 2} y={s.y + 20} textAnchor="middle" fontSize={10} fill={isHighlighted ? "#fff" : s.stroke} fontWeight="700">
              {s.icon} {s.label}
            </text>
            {s.sub.split("\n").map((line, i) => (
              <text key={i} x={s.x + s.w / 2} y={s.y + 34 + i * 13} textAnchor="middle" fontSize={8} fill={isHighlighted ? "#e2e8f0" : "#64748b"}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

// ─── Serverless RAG Architecture SVG ───
const RAGArchSVG = () => {
  const services = [
    { id: "s3", x: 20, y: 20, w: 120, h: 55, label: "Amazon S3", sub: "PDF, HTML, CSV, TXT", fill: "#d1fae5", stroke: "#059669", icon: "🪣" },
    { id: "kb", x: 200, y: 20, w: 160, h: 55, label: "Bedrock Knowledge Base", sub: "Chunk → Embed → Index", fill: "#ede9fe", stroke: "#7c3aed", icon: "📚" },
    { id: "oss", x: 420, y: 20, w: 170, h: 55, label: "OpenSearch Serverless", sub: "Vector Store (k-NN)", fill: "#dbeafe", stroke: "#2563eb", icon: "🔍" },
    { id: "user", x: 20, y: 150, w: 100, h: 55, label: "User / App", sub: "Query via API", fill: "#fef3c7", stroke: "#d97706", icon: "👤" },
    { id: "agent", x: 180, y: 150, w: 140, h: 55, label: "Bedrock Agent", sub: "Orchestration (optional)", fill: "#fce7f3", stroke: "#ec4899", icon: "🤖" },
    { id: "retrieve", x: 380, y: 150, w: 130, h: 55, label: "Retrieve API", sub: "Top-K vector search", fill: "#dbeafe", stroke: "#2563eb", icon: "🔎" },
    { id: "fm", x: 200, y: 260, w: 160, h: 55, label: "Foundation Model", sub: "Claude / Titan / Llama", fill: "#fce7f3", stroke: "#ec4899", icon: "🧠" },
    { id: "response", x: 430, y: 260, w: 140, h: 55, label: "Cited Response", sub: "Answer + S3 citations", fill: "#d1fae5", stroke: "#059669", icon: "📋" },
  ];
  const arrows = [
    { path: "M140,47 L200,47", color: "#7c3aed", label: "sync" },
    { path: "M360,47 L420,47", color: "#2563eb", label: "vectors" },
    { path: "M120,177 L180,177", color: "#ec4899", label: "query" },
    { path: "M320,177 L380,177", color: "#2563eb", label: "search" },
    { path: "M445,205 L445,260", color: "#2563eb", label: "chunks" },
    { path: "M280,205 L280,260", color: "#ec4899", label: "context + query" },
    { path: "M360,287 L430,287", color: "#059669", label: "answer" },
  ];
  return (
    <svg viewBox="0 0 620 340" style={{ width: "100%", maxWidth: 620, display: "block", margin: "0 auto" }}>
      <defs>
        {["#7c3aed","#2563eb","#ec4899","#059669","#d97706"].map(c=>(
          <marker key={c} id={`rag-arr-${c.slice(1)}`} viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" fill={c}/>
          </marker>
        ))}
      </defs>
      <rect x="5" y="5" width="600" height="80" rx="10" fill="#ede9fe" opacity="0.12" stroke="#7c3aed" strokeWidth="1" strokeDasharray="4"/>
      <text x="15" y="16" fontSize="8" fill="#7c3aed" fontWeight="700">INGESTION PIPELINE (MANAGED)</text>
      <rect x="5" y="130" width="600" height="190" rx="10" fill="#fce7f3" opacity="0.1" stroke="#ec4899" strokeWidth="1" strokeDasharray="4"/>
      <text x="15" y="143" fontSize="8" fill="#ec4899" fontWeight="700">QUERY FLOW (RetrieveAndGenerate)</text>
      {arrows.map((a,i)=>{
        const pts=a.path.match(/[\d.]+/g).map(Number);
        const mx=(pts[0]+pts[pts.length-2])/2, my=(pts[1]+pts[pts.length-1])/2;
        return(<g key={i}><path d={a.path} fill="none" stroke={a.color} strokeWidth={2} markerEnd={`url(#rag-arr-${a.color.slice(1)})`} opacity={0.6}/><text x={mx} y={my-6} textAnchor="middle" fontSize={8} fill={a.color} fontWeight="600">{a.label}</text></g>);
      })}
      {services.map(s=>(
        <g key={s.id}><rect x={s.x} y={s.y} width={s.w} height={s.h} rx={10} fill={s.fill} stroke={s.stroke} strokeWidth={1.5}/><text x={s.x+s.w/2} y={s.y+20} textAnchor="middle" fontSize={10} fill={s.stroke} fontWeight="700">{s.icon} {s.label}</text><text x={s.x+s.w/2} y={s.y+34} textAnchor="middle" fontSize={8} fill="#64748b">{s.sub}</text></g>
      ))}
    </svg>
  );
};

// ─── Real-Time GenAI Chat Architecture SVG ───
const ChatArchSVG = () => {
  const services = [
    { id: "client", x: 20, y: 30, w: 110, h: 55, label: "React SPA", sub: "CloudFront + S3", fill: "#dbeafe", stroke: "#2563eb", icon: "🌐" },
    { id: "cognito", x: 170, y: 30, w: 110, h: 55, label: "Cognito", sub: "JWT Auth", fill: "#fef3c7", stroke: "#d97706", icon: "🔐" },
    { id: "apigw", x: 320, y: 30, w: 130, h: 55, label: "API Gateway", sub: "REST / WebSocket", fill: "#ede9fe", stroke: "#7c3aed", icon: "🔗" },
    { id: "lambda", x: 320, y: 140, w: 130, h: 55, label: "Lambda", sub: "Chat Handler", fill: "#fef3c7", stroke: "#d97706", icon: "⚡" },
    { id: "guardrail", x: 500, y: 30, w: 120, h: 55, label: "Guardrails", sub: "Content Safety", fill: "#fee2e2", stroke: "#dc2626", icon: "🛡️" },
    { id: "bedrock", x: 500, y: 140, w: 120, h: 55, label: "Bedrock FM", sub: "Claude / Titan", fill: "#fce7f3", stroke: "#ec4899", icon: "🧠" },
    { id: "dynamo", x: 140, y: 140, w: 130, h: 55, label: "DynamoDB", sub: "Conversation Memory", fill: "#d1fae5", stroke: "#059669", icon: "💾" },
    { id: "cloudwatch", x: 320, y: 250, w: 130, h: 50, label: "CloudWatch", sub: "Logs + Metrics", fill: "#e0e7ff", stroke: "#4f46e5", icon: "📊" },
    { id: "stream", x: 20, y: 140, w: 80, h: 55, label: "Stream", sub: "Response tokens", fill: "#fce7f3", stroke: "#ec4899", icon: "📡" },
  ];
  const arrows = [
    { path: "M130,57 L170,57", color: "#d97706", label: "auth" },
    { path: "M280,57 L320,57", color: "#7c3aed", label: "request" },
    { path: "M385,85 L385,140", color: "#d97706", label: "invoke" },
    { path: "M450,167 L500,167", color: "#ec4899", label: "prompt" },
    { path: "M500,57 L450,57", color: "#dc2626", label: "check" },
    { path: "M560,85 L560,140", color: "#dc2626", label: "filter" },
    { path: "M320,167 L270,167", color: "#059669", label: "load/save" },
    { path: "M385,195 L385,250", color: "#4f46e5", label: "logs" },
    { path: "M140,167 L100,167", color: "#ec4899", label: "tokens" },
  ];
  return (
    <svg viewBox="0 0 650 320" style={{ width: "100%", maxWidth: 650, display: "block", margin: "0 auto" }}>
      <defs>
        {["#7c3aed","#2563eb","#ec4899","#059669","#d97706","#dc2626","#4f46e5"].map(c=>(
          <marker key={c} id={`chat-arr-${c.slice(1)}`} viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" fill={c}/>
          </marker>
        ))}
      </defs>
      {arrows.map((a,i)=>{
        const pts=a.path.match(/[\d.]+/g).map(Number);
        const mx=(pts[0]+pts[pts.length-2])/2, my=(pts[1]+pts[pts.length-1])/2;
        return(<g key={i}><path d={a.path} fill="none" stroke={a.color} strokeWidth={2} markerEnd={`url(#chat-arr-${a.color.slice(1)})`} opacity={0.6}/><text x={mx} y={my-6} textAnchor="middle" fontSize={8} fill={a.color} fontWeight="600">{a.label}</text></g>);
      })}
      {services.map(s=>(
        <g key={s.id}><rect x={s.x} y={s.y} width={s.w} height={s.h} rx={10} fill={s.fill} stroke={s.stroke} strokeWidth={1.5}/><text x={s.x+s.w/2} y={s.y+20} textAnchor="middle" fontSize={10} fill={s.stroke} fontWeight="700">{s.icon} {s.label}</text><text x={s.x+s.w/2} y={s.y+34} textAnchor="middle" fontSize={8} fill="#64748b">{s.sub}</text></g>
      ))}
    </svg>
  );
};

// ─── Batch Array Detail ───
const batchSteps = [
  { icon: "📋", label: "List S3 Objects", desc: "Paginate through 80M object keys, split into chunks of ~80K objects each" },
  { icon: "📦", label: "Create Array Job", desc: "Submit AWS Batch array job with 1,000 child tasks. Each task processes ~80K documents" },
  { icon: "⬇️", label: "Download Batch", desc: "Each child task downloads its assigned chunk of S3 objects in parallel" },
  { icon: "🧠", label: "Generate Embeddings", desc: "Call Bedrock Titan Embeddings or SageMaker endpoint to embed each document" },
  { icon: "📤", label: "Bulk Index", desc: "Use OpenSearch _bulk API to index vectors + metadata. Batch 500-1000 docs per request" },
  { icon: "🔄", label: "Retry on Failure", desc: "AWS Batch retries failed tasks up to 3 times with exponential backoff" },
];

const lambdaSteps = [
  { icon: "📬", label: "SQS Receives Event", desc: "EventBridge forwards s3:ObjectCreated events. SQS batches up to 10 messages" },
  { icon: "⚡", label: "Lambda Triggered", desc: "SQS triggers Lambda with batch of new document S3 keys (batch size: 10)" },
  { icon: "⬇️", label: "Download Document", desc: "Lambda downloads each document from S3 and extracts text content" },
  { icon: "🧠", label: "Generate Embedding", desc: "Call Bedrock embedding model (Titan Embeddings V2 — 1024 dimensions)" },
  { icon: "📤", label: "Index to OpenSearch", desc: "PUT vector + metadata to OpenSearch k-NN index" },
  { icon: "🚨", label: "DLQ for Failures", desc: "Failed messages go to Dead Letter Queue after 3 retries. CloudWatch alarm triggers" },
];

export default function UsefulArchitectures() {
  const [activeArch, setActiveArch] = useState("s3-opensearch");
  const [highlight, setHighlight] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [activePathTab, setActivePathTab] = useState("bulk");

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 920, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, textAlign: "center" }}>
        Useful AWS Architectures
      </h1>
      <p style={{ color: "#64748b", textAlign: "center", margin: "4px 0 20px", fontSize: 14 }}>
        Production-ready reference architectures for common AWS ML & data workflows
      </p>

      {/* Architecture Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {archTabs.map(t => (
          <button key={t.id} onClick={() => setActiveArch(t.id)}
            style={{ padding: "10px 18px", borderRadius: 10, border: `2px solid ${activeArch === t.id ? "#2563eb" : "#e2e8f0"}`, background: activeArch === t.id ? "#dbeafe" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12, color: activeArch === t.id ? "#1d4ed8" : "#64748b" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ═══ S3 → OpenSearch Architecture ═══ */}
      {activeArch === "s3-opensearch" && (
        <div>
          {/* Overview Banner */}
          <div style={{ background: "#d1fae5", border: "2px solid #059669", borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#065f46" }}>80M Document Ingestion to OpenSearch Vector DB</div>
            <div style={{ fontSize: 12, color: "#064e3b", marginTop: 4, lineHeight: 1.6 }}>
              Two-path architecture: <strong>AWS Batch</strong> for bulk historical ingestion (80M docs), <strong>SQS + Lambda</strong> for continuous real-time embedding of new documents. Both paths use a shared embedding model and index to OpenSearch.
            </div>
          </div>

          {/* Architecture Diagram */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #cbd5e1", padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 10, textAlign: "center" }}>ARCHITECTURE DIAGRAM — Click any service to highlight</div>
            <IngestionArchSVG highlight={highlight} onHighlight={(id) => setHighlight(highlight === id ? null : id)} />
          </div>

          {/* Key Numbers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Documents", value: "80M", icon: "📄", color: "#2563eb" },
              { label: "Batch Array Tasks", value: "1,000", icon: "📦", color: "#8b5cf6" },
              { label: "Docs per Task", value: "~80K", icon: "⚙️", color: "#10b981" },
              { label: "Embedding Dims", value: "1,024", icon: "🧠", color: "#ec4899" },
              { label: "Bulk Index Size", value: "500-1K", icon: "📤", color: "#f59e0b" },
              { label: "Lambda Batch", value: "10 msgs", icon: "⚡", color: "#ef4444" },
            ].map(n => (
              <div key={n.label} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>{n.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: n.color, marginTop: 2 }}>{n.value}</div>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{n.label}</div>
              </div>
            ))}
          </div>

          {/* Path Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[
              { id: "bulk", label: "Bulk Path (AWS Batch)", color: "#2563eb" },
              { id: "realtime", label: "Real-Time Path (SQS + Lambda)", color: "#7c3aed" },
            ].map(p => (
              <button key={p.id} onClick={() => setActivePathTab(p.id)}
                style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: `2px solid ${activePathTab === p.id ? p.color : "#e2e8f0"}`, background: activePathTab === p.id ? (p.id === "bulk" ? "#dbeafe" : "#ede9fe") : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: activePathTab === p.id ? p.color : "#64748b" }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* BULK PATH */}
          {activePathTab === "bulk" && (
            <div>
              <div style={{ background: "#dbeafe", borderRadius: 14, border: "2px solid #2563eb", padding: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 6 }}>AWS Batch Array Job — Bulk Ingestion</div>
                <div style={{ fontSize: 12, color: "#1e3a5f", lineHeight: 1.7 }}>
                  For the initial backfill of 80M documents, use an <strong>AWS Batch Array Job</strong> with 1,000 child tasks. Each child processes ~80K documents. Batch handles parallelism, retry, and resource allocation automatically. Array jobs let you fan out work without managing individual containers.
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10, marginBottom: 14 }}>
                {batchSteps.map((s, i) => (
                  <div key={i} onClick={() => setExpandedStep(expandedStep === `b${i}` ? null : `b${i}`)}
                    style={{ background: "#fff", border: "2px solid #93c5fd", borderRadius: 12, padding: 14, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e40af" }}>Step {i + 1}: {s.label}</div>
                        {expandedStep === `b${i}` && (
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{s.desc}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Retry mechanism */}
              <div style={{ background: "#fee2e2", borderRadius: 12, border: "2px solid #ef4444", padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", marginBottom: 6 }}>Retry Mechanism</div>
                <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.8 }}>
                  <div><strong>AWS Batch retryStrategy:</strong> <code style={{ background: "#fff", padding: "1px 6px", borderRadius: 4 }}>attempts: 3</code></div>
                  <div><strong>evaluateOnExit rules:</strong> Retry on SPOT interruptions, transient errors (exit code 1), and throttling</div>
                  <div><strong>Application-level:</strong> Exponential backoff for OpenSearch bulk indexing (429 Too Many Requests)</div>
                  <div><strong>Dead letter:</strong> Failed document keys logged to S3 manifest for manual re-processing</div>
                </div>
              </div>

              <CodeBlock code={`# AWS Batch Job Definition (simplified)
{
  "jobDefinitionName": "doc-embedding-job",
  "type": "container",
  "containerProperties": {
    "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/embed-worker:latest",
    "vcpus": 4,
    "memory": 8192,
    "environment": [
      {"name": "OPENSEARCH_ENDPOINT", "value": "https://my-domain.es.amazonaws.com"},
      {"name": "EMBEDDING_MODEL", "value": "amazon.titan-embed-text-v2:0"}
    ]
  },
  "retryStrategy": {
    "attempts": 3,
    "evaluateOnExit": [
      {"onStatusReason": "Host EC2*", "action": "RETRY"},
      {"onExitCode": "1", "action": "RETRY"},
      {"onExitCode": "0", "action": "EXIT"}
    ]
  }
}

# Submit Array Job — fans out to 1,000 parallel tasks
aws batch submit-job \\
  --job-name "embed-80m-docs" \\
  --job-definition "doc-embedding-job" \\
  --job-queue "high-priority-queue" \\
  --array-properties size=1000`} />
            </div>
          )}

          {/* REAL-TIME PATH */}
          {activePathTab === "realtime" && (
            <div>
              <div style={{ background: "#ede9fe", borderRadius: 14, border: "2px solid #7c3aed", padding: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6", marginBottom: 6 }}>SQS + Lambda — Continuous Real-Time Ingestion</div>
                <div style={{ fontSize: 12, color: "#4c1d95", lineHeight: 1.7 }}>
                  After the bulk backfill, new documents uploaded to S3 are automatically embedded and indexed. <strong>EventBridge</strong> captures S3 upload events, <strong>SQS</strong> buffers them, and <strong>Lambda</strong> processes each batch — calling the embedding model and indexing to OpenSearch. A <strong>Dead Letter Queue (DLQ)</strong> catches persistent failures.
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10, marginBottom: 14 }}>
                {lambdaSteps.map((s, i) => (
                  <div key={i} onClick={() => setExpandedStep(expandedStep === `r${i}` ? null : `r${i}`)}
                    style={{ background: "#fff", border: "2px solid #c4b5fd", borderRadius: 12, padding: 14, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#5b21b6" }}>Step {i + 1}: {s.label}</div>
                        {expandedStep === `r${i}` && (
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{s.desc}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SQS Config */}
              <div style={{ background: "#fee2e2", borderRadius: 12, border: "2px solid #ef4444", padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", marginBottom: 6 }}>Retry & Error Handling</div>
                <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.8 }}>
                  <div><strong>SQS Visibility Timeout:</strong> 5 minutes (matches Lambda timeout)</div>
                  <div><strong>SQS maxReceiveCount:</strong> 3 — after 3 failures, message moves to DLQ</div>
                  <div><strong>Lambda retries:</strong> Built-in 2 retries on async invocation failures</div>
                  <div><strong>DLQ alarm:</strong> CloudWatch alarm triggers SNS notification when DLQ depth &gt; 0</div>
                </div>
              </div>

              <CodeBlock code={`# Lambda handler (simplified)
import boto3, json

bedrock = boto3.client("bedrock-runtime")
opensearch = OpenSearchClient(host=OPENSEARCH_ENDPOINT)

def handler(event, context):
    for record in event["Records"]:
        body = json.loads(record["body"])
        bucket = body["detail"]["bucket"]["name"]
        key = body["detail"]["object"]["key"]

        # 1. Download document
        s3 = boto3.client("s3")
        doc = s3.get_object(Bucket=bucket, Key=key)
        text = extract_text(doc["Body"].read())

        # 2. Generate embedding
        response = bedrock.invoke_model(
            modelId="amazon.titan-embed-text-v2:0",
            body=json.dumps({
                "inputText": text[:8192],  # Titan V2 max
                "dimensions": 1024
            })
        )
        embedding = json.loads(
            response["body"].read()
        )["embedding"]

        # 3. Index to OpenSearch
        opensearch.index(
            index="documents",
            body={
                "embedding": embedding,
                "text": text[:10000],
                "s3_key": key,
                "timestamp": body["time"]
            }
        )`} />
            </div>
          )}

          {/* OpenSearch Config */}
          <div style={{ background: "#d1fae5", borderRadius: 14, border: "2px solid #059669", padding: 16, marginTop: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>OpenSearch Vector Index Configuration</div>
            <div style={{ fontSize: 12, color: "#064e3b", lineHeight: 1.8, marginBottom: 8 }}>
              <div><strong>Engine:</strong> nmslib or faiss (faiss recommended for large scale)</div>
              <div><strong>Algorithm:</strong> HNSW (Hierarchical Navigable Small World)</div>
              <div><strong>Dimensions:</strong> 1,024 (Titan Embeddings V2)</div>
              <div><strong>Distance:</strong> cosine similarity (space_type: cosinesimil)</div>
              <div><strong>Instance type:</strong> r6g.4xlarge.search (memory-optimized for vectors)</div>
              <div><strong>Shards:</strong> 20+ for 80M documents (aim for ~4M vectors per shard)</div>
            </div>
            <CodeBlock code={`PUT /documents
{
  "settings": {
    "index": {
      "knn": true,
      "knn.algo_param.ef_search": 512,
      "number_of_shards": 20,
      "number_of_replicas": 1
    }
  },
  "mappings": {
    "properties": {
      "embedding": {
        "type": "knn_vector",
        "dimension": 1024,
        "method": {
          "name": "hnsw",
          "space_type": "cosinesimil",
          "engine": "faiss",
          "parameters": {
            "ef_construction": 256,
            "m": 16
          }
        }
      },
      "text": { "type": "text" },
      "s3_key": { "type": "keyword" },
      "timestamp": { "type": "date" }
    }
  }
}`} />
          </div>

          {/* Cost & Time Estimates */}
          <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>Design Decisions & Tradeoffs</div>
            <div style={{ fontSize: 12, color: "#78350f", lineHeight: 2 }}>
              <div><strong>Why AWS Batch over Lambda for bulk?</strong> Lambda has 15-min timeout and 10GB memory limit. Batch containers can run for hours with larger resources, ideal for processing 80K+ docs per task.</div>
              <div><strong>Why SQS between EventBridge and Lambda?</strong> SQS provides buffering during traffic spikes, built-in retry with DLQ, and batch processing (10 messages per Lambda invoke).</div>
              <div><strong>Why Array Jobs?</strong> Single submit fans out to 1,000 parallel containers. AWS Batch handles scheduling, retry, and SPOT instance management. No need to build your own parallelism.</div>
              <div><strong>Why FAISS over nmslib?</strong> FAISS performs better at large scale (80M+ vectors) and supports efficient memory-mapped indexing.</div>
              <div><strong>Monitoring:</strong> CloudWatch metrics on Batch job success rate, Lambda errors, SQS queue depth, DLQ depth, and OpenSearch indexing latency.</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Serverless RAG with Bedrock Knowledge Bases ═══ */}
      {activeArch === "bedrock-rag-kb" && (
        <div>
          {/* Overview Banner */}
          <div style={{ background: "#ede9fe", border: "2px solid #7c3aed", borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#5b21b6" }}>Serverless RAG with Bedrock Knowledge Bases</div>
            <div style={{ fontSize: 12, color: "#4c1d95", marginTop: 4, lineHeight: 1.6 }}>
              Fully managed RAG pipeline: upload documents to S3, Bedrock Knowledge Bases handles chunking, embedding, and vector storage automatically. Query via Bedrock Agent or RetrieveAndGenerate API — no infrastructure to manage.
            </div>
          </div>

          {/* Architecture Diagram */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #cbd5e1", padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 10, textAlign: "center" }}>ARCHITECTURE DIAGRAM</div>
            <RAGArchSVG />
          </div>

          {/* Key Components */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 20 }}>
            {[
              { label: "S3 Data Source", value: "Documents", icon: "🪣", color: "#059669", desc: "PDF, HTML, CSV, TXT, DOCX — auto-synced to KB" },
              { label: "Bedrock KB", value: "Managed", icon: "📚", color: "#7c3aed", desc: "Auto chunking, embedding, and indexing" },
              { label: "Vector Store", value: "OSS / Aurora / Pinecone", icon: "🗄️", color: "#2563eb", desc: "OpenSearch Serverless, Aurora PostgreSQL, or Pinecone" },
              { label: "Foundation Model", value: "Claude / Titan", icon: "🧠", color: "#ec4899", desc: "Generates answers grounded in retrieved context" },
            ].map(n => (
              <div key={n.label} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 12, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>{n.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: n.color, marginTop: 2 }}>{n.value}</div>
                <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, marginTop: 2 }}>{n.label}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{n.desc}</div>
              </div>
            ))}
          </div>

          {/* Ingestion Pipeline Detail */}
          <div style={{ background: "#dbeafe", borderRadius: 14, border: "2px solid #2563eb", padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 8 }}>Ingestion Pipeline (Fully Managed)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
              {[
                { step: "1", icon: "📤", title: "Upload to S3", desc: "Drop documents (PDF, HTML, CSV, TXT) into designated S3 bucket" },
                { step: "2", icon: "🔄", title: "Start Sync Job", desc: "KB sync crawls S3, detects new/changed/deleted docs" },
                { step: "3", icon: "✂️", title: "Chunking", desc: "Fixed-size, semantic, or hierarchical chunking with overlap" },
                { step: "4", icon: "🧠", title: "Embedding", desc: "Titan Embeddings V2 or Cohere Embed — 1024 dimensions" },
                { step: "5", icon: "📥", title: "Index Vectors", desc: "Vectors stored in OpenSearch Serverless (or Aurora/Pinecone)" },
              ].map(s => (
                <div key={s.step} style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #93c5fd" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#2563eb", marginBottom: 4 }}>STEP {s.step}</div>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af" }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Query Flow Detail */}
          <div style={{ background: "#fce7f3", borderRadius: 14, border: "2px solid #ec4899", padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#9d174d", marginBottom: 8 }}>Query Flow (RetrieveAndGenerate)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
              {[
                { step: "1", icon: "💬", title: "User Query", desc: "Natural language question sent via API or Bedrock Agent" },
                { step: "2", icon: "🔢", title: "Query Embedding", desc: "Question converted to vector using same embedding model" },
                { step: "3", icon: "🔍", title: "Vector Search", desc: "k-NN search in vector store returns top-k relevant chunks" },
                { step: "4", icon: "🧠", title: "FM Generation", desc: "Retrieved chunks + query sent to Claude/Titan as context" },
                { step: "5", icon: "📋", title: "Cited Response", desc: "Answer with source citations (S3 URI + chunk location)" },
              ].map(s => (
                <div key={s.step} style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #f9a8d4" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#ec4899", marginBottom: 4 }}>STEP {s.step}</div>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#9d174d" }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* API Code Examples */}
          <div style={{ background: "#d1fae5", borderRadius: 14, border: "2px solid #059669", padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>Create Knowledge Base & Query</div>
            <CodeBlock code={`# 1. Create Knowledge Base
import boto3
bedrock_agent = boto3.client("bedrock-agent")

kb = bedrock_agent.create_knowledge_base(
    name="product-docs-kb",
    roleArn="arn:aws:iam::role/BedrockKBRole",
    knowledgeBaseConfiguration={
        "type": "VECTOR",
        "vectorKnowledgeBaseConfiguration": {
            "embeddingModelArn":
              "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0"
        }
    },
    storageConfiguration={
        "type": "OPENSEARCH_SERVERLESS",
        "opensearchServerlessConfiguration": {
            "collectionArn": "arn:aws:aoss:us-east-1::collection/abc123",
            "vectorIndexName": "product-docs-index",
            "fieldMapping": {
                "vectorField": "embedding",
                "textField": "text",
                "metadataField": "metadata"
            }
        }
    }
)

# 2. Add S3 data source
bedrock_agent.create_data_source(
    knowledgeBaseId=kb["knowledgeBase"]["knowledgeBaseId"],
    name="s3-product-docs",
    dataSourceConfiguration={
        "type": "S3",
        "s3Configuration": {
            "bucketArn": "arn:aws:s3:::my-product-docs"
        }
    },
    vectorIngestionConfiguration={
        "chunkingConfiguration": {
            "chunkingStrategy": "SEMANTIC",
            "semanticChunkingConfiguration": {
                "maxTokens": 512,
                "bufferSize": 0,
                "breakpointPercentileThreshold": 95
            }
        }
    }
)

# 3. Query with RetrieveAndGenerate
bedrock_rt = boto3.client("bedrock-agent-runtime")

response = bedrock_rt.retrieve_and_generate(
    input={"text": "How do I configure auto-scaling?"},
    retrieveAndGenerateConfiguration={
        "type": "KNOWLEDGE_BASE",
        "knowledgeBaseConfiguration": {
            "knowledgeBaseId": kb["knowledgeBase"]["knowledgeBaseId"],
            "modelArn":
              "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
            "retrievalConfiguration": {
                "vectorSearchConfiguration": {
                    "numberOfResults": 5
                }
            }
        }
    }
)
print(response["output"]["text"])
# Includes citations with S3 source URIs`} />
          </div>

          {/* Tradeoffs */}
          <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>Design Decisions & Tradeoffs</div>
            <div style={{ fontSize: 12, color: "#78350f", lineHeight: 2 }}>
              <div><strong>Why Bedrock KB over custom pipeline?</strong> Zero infrastructure management. Chunking, embedding, indexing, and retrieval are all handled. Ideal for teams that want RAG without building plumbing.</div>
              <div><strong>Why OpenSearch Serverless?</strong> Auto-scales, no cluster management. Supports both vector search and metadata filtering. Cost scales with usage.</div>
              <div><strong>When NOT to use Bedrock KB?</strong> If you need custom chunking logic, hybrid search with BM25, or more than 5 data sources per KB. Build your own pipeline (see S3 → OpenSearch tab).</div>
              <div><strong>Chunking strategy choice:</strong> Semantic chunking preserves context better than fixed-size. Use hierarchical for long structured docs (parent-child retrieval).</div>
              <div><strong>Vector store options:</strong> OpenSearch Serverless (default, best integration), Aurora PostgreSQL (if you already use Aurora), Pinecone (managed, multi-cloud), Redis Enterprise.</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Real-Time GenAI Chat Application ═══ */}
      {activeArch === "genai-chat" && (
        <div>
          {/* Overview Banner */}
          <div style={{ background: "#fce7f3", border: "2px solid #ec4899", borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#9d174d" }}>Real-Time GenAI Chat Application</div>
            <div style={{ fontSize: 12, color: "#831843", marginTop: 4, lineHeight: 1.6 }}>
              Serverless chat application with streaming responses, conversation memory, content safety guardrails, and multi-turn context. Built entirely on AWS managed services — no servers to manage.
            </div>
          </div>

          {/* Architecture Diagram */}
          <div style={{ background: "#f8fafc", borderRadius: 16, border: "2px solid #cbd5e1", padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 10, textAlign: "center" }}>ARCHITECTURE DIAGRAM</div>
            <ChatArchSVG />
          </div>

          {/* Key Components Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Frontend", value: "React SPA", icon: "🌐", color: "#2563eb", desc: "CloudFront + S3 static hosting" },
              { label: "API Layer", value: "API Gateway", icon: "🔗", color: "#7c3aed", desc: "REST or WebSocket API with auth" },
              { label: "Compute", value: "Lambda", icon: "⚡", color: "#d97706", desc: "Streaming via response URL or WebSocket" },
              { label: "LLM", value: "Bedrock", icon: "🧠", color: "#ec4899", desc: "Claude / Titan with InvokeModelWithResponseStream" },
              { label: "Safety", value: "Guardrails", icon: "🛡️", color: "#dc2626", desc: "Content filters, PII redaction, topic denial" },
              { label: "Memory", value: "DynamoDB", icon: "💾", color: "#059669", desc: "Conversation history & session state" },
            ].map(n => (
              <div key={n.label} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>{n.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: n.color, marginTop: 2 }}>{n.value}</div>
                <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, marginTop: 2 }}>{n.label}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{n.desc}</div>
              </div>
            ))}
          </div>

          {/* Request Flow */}
          <div style={{ background: "#dbeafe", borderRadius: 14, border: "2px solid #2563eb", padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 8 }}>Request Flow — User Message to Streaming Response</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
              {[
                { step: "1", icon: "👤", title: "User Sends Message", desc: "React frontend sends message via API Gateway (REST POST or WebSocket)" },
                { step: "2", icon: "🔐", title: "Auth & Rate Limit", desc: "Cognito JWT validation + API Gateway throttling (per-user rate limits)" },
                { step: "3", icon: "💾", title: "Load History", desc: "Lambda fetches conversation history from DynamoDB (last N turns)" },
                { step: "4", icon: "🛡️", title: "Guardrail Check", desc: "Bedrock Guardrails scans input for PII, harmful content, denied topics" },
                { step: "5", icon: "🧠", title: "LLM Inference", desc: "InvokeModelWithResponseStream with system prompt + history + user message" },
                { step: "6", icon: "📡", title: "Stream Response", desc: "Lambda streams tokens back to client; saves full response to DynamoDB" },
              ].map(s => (
                <div key={s.step} style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #93c5fd" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#2563eb", marginBottom: 4 }}>STEP {s.step}</div>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af" }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Memory Pattern */}
          <div style={{ background: "#d1fae5", borderRadius: 14, border: "2px solid #059669", padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>Conversation Memory — DynamoDB Schema</div>
            <div style={{ fontSize: 12, color: "#064e3b", lineHeight: 1.8, marginBottom: 8 }}>
              <div><strong>Partition key:</strong> <code style={{ background: "#fff", padding: "1px 6px", borderRadius: 4 }}>session_id</code> (UUID per conversation)</div>
              <div><strong>Sort key:</strong> <code style={{ background: "#fff", padding: "1px 6px", borderRadius: 4 }}>turn_number</code> (integer, auto-increment)</div>
              <div><strong>TTL:</strong> <code style={{ background: "#fff", padding: "1px 6px", borderRadius: 4 }}>expires_at</code> — auto-delete conversations after 24h</div>
              <div><strong>Context window:</strong> Load last 10 turns (or until token budget ~80% exhausted)</div>
            </div>
            <CodeBlock code={`# DynamoDB Table Schema
{
  "TableName": "chat-conversations",
  "KeySchema": [
    {"AttributeName": "session_id", "KeyType": "HASH"},
    {"AttributeName": "turn_number", "KeyType": "RANGE"}
  ],
  "AttributeDefinitions": [
    {"AttributeName": "session_id", "AttributeType": "S"},
    {"AttributeName": "turn_number", "AttributeType": "N"}
  ],
  "TimeToLiveSpecification": {
    "AttributeName": "expires_at", "Enabled": true
  },
  "BillingMode": "PAY_PER_REQUEST"
}

# Each item stores one turn:
{
  "session_id": "abc-123-def",
  "turn_number": 3,
  "role": "user",          # or "assistant"
  "content": "How do I configure auto-scaling?",
  "timestamp": "2025-01-15T10:30:00Z",
  "token_count": 12,
  "expires_at": 1737020000  # TTL epoch
}`} />
          </div>

          {/* Streaming + Guardrails Code */}
          <div style={{ background: "#ede9fe", borderRadius: 14, border: "2px solid #7c3aed", padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6", marginBottom: 8 }}>Lambda Handler — Streaming with Guardrails</div>
            <CodeBlock code={`import boto3, json
from datetime import datetime, timedelta

bedrock = boto3.client("bedrock-runtime")
dynamodb = boto3.resource("dynamodb").Table("chat-conversations")

def handler(event, context):
    body = json.loads(event["body"])
    session_id = body["session_id"]
    user_msg = body["message"]

    # 1. Load conversation history (last 10 turns)
    history = dynamodb.query(
        KeyConditionExpression="session_id = :sid",
        ExpressionAttributeValues={":sid": session_id},
        ScanIndexForward=True, Limit=20  # last 10 pairs
    )["Items"]

    messages = [{"role": h["role"], "content": h["content"]}
                for h in history]
    messages.append({"role": "user", "content": user_msg})

    # 2. Save user message to DynamoDB
    turn = len(history) + 1
    ttl = int((datetime.now() + timedelta(hours=24)).timestamp())
    dynamodb.put_item(Item={
        "session_id": session_id, "turn_number": turn,
        "role": "user", "content": user_msg,
        "timestamp": datetime.now().isoformat(),
        "expires_at": ttl
    })

    # 3. Call Bedrock with streaming + guardrails
    response = bedrock.invoke_model_with_response_stream(
        modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
        guardrailIdentifier="my-guardrail-id",
        guardrailVersion="DRAFT",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "system": "You are a helpful assistant...",
            "messages": messages
        })
    )

    # 4. Stream chunks back to client
    full_response = ""
    for event in response["body"]:
        chunk = json.loads(event["chunk"]["bytes"])
        if chunk["type"] == "content_block_delta":
            text = chunk["delta"]["text"]
            full_response += text
            yield text  # stream to client

    # 5. Save assistant response
    dynamodb.put_item(Item={
        "session_id": session_id, "turn_number": turn + 1,
        "role": "assistant", "content": full_response,
        "timestamp": datetime.now().isoformat(),
        "expires_at": ttl
    })`} />
          </div>

          {/* Guardrails Detail */}
          <div style={{ background: "#fee2e2", borderRadius: 14, border: "2px solid #ef4444", padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", marginBottom: 8 }}>Bedrock Guardrails Configuration</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              {[
                { icon: "🚫", title: "Content Filters", desc: "Block hate, violence, sexual content, insults. Configurable thresholds (LOW/MED/HIGH) for each category" },
                { icon: "🔒", title: "PII Redaction", desc: "Detect and mask SSN, credit card, phone, email, addresses in both input and output" },
                { icon: "📋", title: "Denied Topics", desc: "Define topics the model must refuse (competitor products, medical advice, financial advice)" },
                { icon: "📝", title: "Word Filters", desc: "Block profanity and custom word lists. Managed + custom wordlists combined" },
                { icon: "🎯", title: "Contextual Grounding", desc: "Ensures responses are grounded in source material — reduces hallucination in RAG" },
                { icon: "📊", title: "ApplyGuardrail API", desc: "Can also apply guardrails independently (without model call) for input/output validation" },
              ].map(g => (
                <div key={g.title} style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #fca5a5" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{g.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b" }}>{g.title}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tradeoffs */}
          <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>Design Decisions & Tradeoffs</div>
            <div style={{ fontSize: 12, color: "#78350f", lineHeight: 2 }}>
              <div><strong>REST vs WebSocket API?</strong> REST with Lambda response streaming URL is simpler. WebSocket is better if you need bi-directional communication (typing indicators, real-time status).</div>
              <div><strong>Why DynamoDB for memory?</strong> Single-digit millisecond reads, auto-scales, TTL for auto-cleanup, pay-per-request pricing. No session server to manage.</div>
              <div><strong>Why Guardrails at inference time?</strong> Applied on both input (pre-processing) and output (post-processing). Adds ~200ms latency but ensures content safety without custom code.</div>
              <div><strong>Context window management:</strong> Load last N turns, not all history. Summarize older turns if needed. Monitor token count to stay within model limits and budget.</div>
              <div><strong>Cost optimization:</strong> Use Prompt Caching for system prompts (reduces cost by 90% for cached tokens). Use Prompt Router to route simple queries to Haiku, complex to Sonnet.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
