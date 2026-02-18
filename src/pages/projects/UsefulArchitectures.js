import { useState } from "react";

const archTabs = [
  { id: "s3-opensearch", label: "S3 → OpenSearch Ingestion", icon: "📄" },
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
    </div>
  );
}
