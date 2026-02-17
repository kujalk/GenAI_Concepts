import { useState, useMemo } from "react";

const stores = [
  {
    id: "opensearch",
    name: "OpenSearch Serverless",
    short: "OpenSearch",
    icon: "🔍",
    color: "#3B82F6",
    managed: "Serverless (auto-scales)",
    category: "Purpose-Built Vector DB",
    tagline: "The default choice for most Bedrock Knowledge Base workloads",
    description: "Amazon OpenSearch Serverless with vector engine (AOSS) is the most tightly integrated vector store for Bedrock Knowledge Bases. It provides a fully managed, auto-scaling vector search experience with no cluster management.",
    architecture: "Serverless collection → vector index → Bedrock KB connector. Bedrock manages index creation, schema, and ingestion automatically when you select OpenSearch Serverless as your storage.",
    maxDimensions: 16000,
    maxMetadataBytes: "24 KB per doc",
    indexAlgorithms: ["HNSW", "IVF"],
    distanceMetrics: ["Cosine", "L2 (Euclidean)", "Inner Product"],
    filtering: "Full metadata filtering with bool, range, term, and nested queries. Supports pre-filter and post-filter modes.",
    hybridSearch: true,
    bedrockIntegration: "Native — first-class support. Bedrock auto-provisions collection, creates index, manages sync jobs. Zero manual setup.",
    integrationLevel: 5,
    scalability: 5,
    queryPerf: 4,
    costEfficiency: 3,
    easeOfSetup: 5,
    featureRichness: 5,
    pricing: {
      model: "OCU-hours (OpenSearch Compute Units)",
      detail: "Minimum 2 OCUs for indexing + 2 OCUs for search = ~$0.24/hr baseline (~$175/mo minimum). Scales with data volume and query load.",
      free: "No free tier for serverless vector collections"
    },
    pros: [
      "Zero-config with Bedrock — fully automated provisioning",
      "Auto-scales compute and storage independently",
      "Hybrid search (vector + keyword BM25) out of the box",
      "Rich filtering and aggregation capabilities",
      "Built-in security with encryption & IAM/SAML"
    ],
    cons: [
      "Minimum cost ~$175/mo even at idle (4 OCU minimum)",
      "Cold start latency on idle collections (~10-20s)",
      "Serverless pricing can be unpredictable at scale",
      "Limited control over index tuning vs. self-managed"
    ],
    bestFor: ["Production RAG workloads", "Multi-modal search", "Hybrid keyword + vector search", "Enterprise compliance requirements"],
    notIdeal: ["Low-budget prototyping", "Simple single-collection use cases", "Cost-sensitive batch-only workloads"],
    terraform: `resource "aws_opensearchserverless_collection" "kb" {
  name = "bedrock-kb-store"
  type = "VECTORSEARCH"
}

resource "aws_bedrockagent_knowledge_base" "main" {
  name     = "my-knowledge-base"
  role_arn = aws_iam_role.bedrock_kb.arn

  knowledge_base_configuration {
    type = "VECTOR"
    vector_knowledge_base_configuration {
      embedding_model_arn = "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0"
    }
  }

  storage_configuration {
    type = "OPENSEARCH_SERVERLESS"
    opensearch_serverless_configuration {
      collection_arn    = aws_opensearchserverless_collection.kb.arn
      vector_index_name = "bedrock-kb-index"
      field_mapping {
        vector_field   = "embedding"
        text_field     = "text"
        metadata_field = "metadata"
      }
    }
  }
}`
  },
  {
    id: "aurora",
    name: "Aurora PostgreSQL (pgvector)",
    short: "Aurora pgvector",
    icon: "🐘",
    color: "#8B5CF6",
    managed: "Managed RDS / Aurora Serverless v2",
    category: "Relational + Vector Extension",
    tagline: "Best when you already run PostgreSQL and want vectors alongside relational data",
    description: "Amazon Aurora PostgreSQL with the pgvector extension lets you store embeddings directly in your relational database. Ideal for teams already invested in PostgreSQL who want to avoid a separate vector store.",
    architecture: "Aurora cluster → pgvector extension enabled → Bedrock KB connector. You create the table with a vector column, and Bedrock handles embedding + sync. Supports Aurora Serverless v2 for auto-scaling.",
    maxDimensions: 16000,
    maxMetadataBytes: "Limited by row size (8 KB TOAST threshold, extendable)",
    indexAlgorithms: ["HNSW", "IVFFlat"],
    distanceMetrics: ["Cosine", "L2 (Euclidean)", "Inner Product"],
    filtering: "Full SQL WHERE clause filtering. Leverage existing PostgreSQL indexes on metadata columns for fast pre-filtering.",
    hybridSearch: false,
    bedrockIntegration: "Supported — requires manual table/index creation and IAM configuration. Bedrock connects via Secrets Manager credentials.",
    integrationLevel: 3,
    scalability: 3,
    queryPerf: 3,
    costEfficiency: 4,
    easeOfSetup: 3,
    featureRichness: 4,
    pricing: {
      model: "Aurora instance hours + storage",
      detail: "Aurora Serverless v2 starts at ~$0.12/ACU-hr (scales 0.5–128 ACUs). Storage at $0.10/GB-mo. Can pause to zero with Serverless v2.",
      free: "RDS free tier available (db.t3.micro, 12 months)"
    },
    pros: [
      "Unify vectors with relational data — no separate store",
      "Full SQL power for complex joins, aggregations, filtering",
      "Aurora Serverless v2 can scale to zero (cost savings)",
      "Familiar PostgreSQL ecosystem and tooling",
      "Transaction support — ACID guarantees on vector data"
    ],
    cons: [
      "Manual table and index setup required for Bedrock",
      "pgvector HNSW index build can be slow on large datasets",
      "Not optimized for vector-only workloads at massive scale",
      "Recall accuracy can degrade without careful index tuning (lists, probes)",
      "No native hybrid search — must implement keyword search separately"
    ],
    bestFor: ["Existing PostgreSQL workloads", "Vectors + relational joins", "Small-to-medium vector collections (<10M)", "Cost-sensitive with Serverless v2"],
    notIdeal: ["Massive vector-only workloads (100M+)", "Hybrid keyword+vector search", "Teams unfamiliar with PostgreSQL"],
    terraform: `resource "aws_rds_cluster" "aurora_pg" {
  cluster_identifier = "bedrock-pgvector"
  engine             = "aurora-postgresql"
  engine_version     = "15.4"
  engine_mode        = "provisioned"
  master_username    = "admin"
  master_password    = var.db_password
  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 16
  }
}

# Then in SQL:
# CREATE EXTENSION vector;
# CREATE TABLE kb_embeddings (
#   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
#   embedding vector(1024),
#   content TEXT,
#   metadata JSONB
# );
# CREATE INDEX ON kb_embeddings
#   USING hnsw (embedding vector_cosine_ops);`
  },
  {
    id: "redis",
    name: "Amazon MemoryDB (Redis)",
    short: "MemoryDB Redis",
    icon: "⚡",
    color: "#EF4444",
    managed: "Managed MemoryDB for Redis",
    category: "In-Memory Vector Store",
    tagline: "Ultra-low latency vector search for real-time applications",
    description: "Amazon MemoryDB for Redis with vector search provides sub-millisecond vector queries from an in-memory data store. Best for latency-critical applications like real-time recommendations and conversational AI where every millisecond counts.",
    architecture: "MemoryDB cluster → Redis vector index (FT.CREATE) → Bedrock KB connector. Data is durably stored with multi-AZ transaction log while served from memory.",
    maxDimensions: 32768,
    maxMetadataBytes: "Bounded by Redis hash field limits (~512 MB theoretical, practical ~1 MB)",
    indexAlgorithms: ["HNSW", "FLAT (brute force)"],
    distanceMetrics: ["Cosine", "L2 (Euclidean)", "Inner Product"],
    filtering: "Tag and numeric range filters via Redis query syntax. Supports pre-filtering with FILTER clause in FT.SEARCH.",
    hybridSearch: true,
    bedrockIntegration: "Supported — requires manual MemoryDB cluster setup, index creation via Redis CLI, and Secrets Manager config.",
    integrationLevel: 2,
    scalability: 3,
    queryPerf: 5,
    costEfficiency: 2,
    easeOfSetup: 2,
    featureRichness: 3,
    pricing: {
      model: "Node hours (in-memory)",
      detail: "MemoryDB pricing starts at ~$0.068/hr for db.t4g.small. Data must fit in memory — cost scales linearly with dataset size. Multi-AZ replication doubles cost.",
      free: "No free tier for MemoryDB"
    },
    pros: [
      "Sub-millisecond query latency (in-memory)",
      "Durable with multi-AZ transaction log",
      "Excellent for real-time, latency-sensitive workloads",
      "Supports hybrid vector + full-text search",
      "Can serve as cache layer + vector store simultaneously"
    ],
    cons: [
      "Data must fit in memory — expensive for large datasets",
      "Manual and complex setup for Bedrock integration",
      "Limited query expressiveness compared to OpenSearch/SQL",
      "Redis vector search API is less mature than alternatives",
      "Cluster management complexity (sharding, replication)"
    ],
    bestFor: ["Real-time recommendations", "Conversational AI with <10ms SLA", "Caching + vector search in one store", "Datasets that fit in memory (<100 GB)"],
    notIdeal: ["Large document collections", "Complex metadata filtering", "Budget-constrained projects", "Teams without Redis expertise"],
    terraform: `resource "aws_memorydb_cluster" "vector" {
  cluster_name       = "bedrock-vectors"
  node_type          = "db.r7g.large"
  num_shards         = 2
  num_replicas_per_shard = 1
  acl_name           = aws_memorydb_acl.kb.name
  engine_version     = "7.1"
  tls_enabled        = true
  subnet_group_name  = aws_memorydb_subnet_group.kb.name
}

# Then via Redis CLI:
# FT.CREATE kb_idx ON HASH PREFIX 1 doc:
#   SCHEMA
#     embedding VECTOR HNSW 6
#       TYPE FLOAT32 DIM 1024
#       DISTANCE_METRIC COSINE
#     content TEXT
#     metadata TAG`
  },
  {
    id: "neptune",
    name: "Amazon Neptune Analytics",
    short: "Neptune",
    icon: "🔗",
    color: "#10B981",
    managed: "Serverless graph analytics",
    category: "Graph + Vector Database",
    tagline: "When relationships between your data matter as much as the content",
    description: "Amazon Neptune Analytics combines graph database capabilities with vector search, enabling you to query data based on both semantic similarity and graph relationships. Ideal for knowledge graphs, entity resolution, and relationship-aware RAG.",
    architecture: "Neptune Analytics graph → vector index on node properties → Bedrock KB connector. Vectors are stored as node properties alongside graph edges and attributes.",
    maxDimensions: 65535,
    maxMetadataBytes: "Rich — full graph node/edge properties",
    indexAlgorithms: ["HNSW"],
    distanceMetrics: ["Cosine", "L2 (Euclidean)"],
    filtering: "Graph traversal + vector search combined. Use openCypher or Gremlin queries with vector similarity conditions.",
    hybridSearch: true,
    bedrockIntegration: "Supported — requires Neptune Analytics graph creation and configuration. Less automated than OpenSearch path.",
    integrationLevel: 2,
    scalability: 4,
    queryPerf: 4,
    costEfficiency: 3,
    easeOfSetup: 2,
    featureRichness: 5,
    pricing: {
      model: "Memory-optimized processing units (m-NCUs)",
      detail: "Neptune Analytics pricing based on graph memory provisioned. Starts at ~$0.11/m-NCU-hr. Storage included. Scales based on graph size.",
      free: "No free tier for Neptune Analytics"
    },
    pros: [
      "Unique: combine graph traversal with vector similarity",
      "Relationship-aware retrieval (multi-hop reasoning)",
      "Excellent for knowledge graphs and entity-rich domains",
      "Supports very high dimensionality (65,535)",
      "Graph context enriches RAG responses significantly"
    ],
    cons: [
      "Steepest learning curve — requires graph modeling expertise",
      "Most complex Bedrock integration setup",
      "Overkill if you don't have relationship-rich data",
      "Smaller community and fewer tutorials vs. OpenSearch/pgvector",
      "Query optimization for graph+vector is non-trivial"
    ],
    bestFor: ["Knowledge graphs + RAG", "Entity resolution", "Fraud detection with semantic search", "Multi-hop reasoning over connected data"],
    notIdeal: ["Simple document Q&A", "Flat document collections", "Teams new to graph databases", "Quick prototyping"],
    terraform: `resource "aws_neptune_graph" "kb" {
  graph_name               = "bedrock-kg"
  provisioned_memory       = 128  # m-NCUs
  deletion_protection      = false
  public_connectivity      = false
  replica_count            = 0
  vector_search_configuration {
    dimension = 1024
  }
}

# Load data via openCypher:
# CREATE (d:Document {
#   content: "...",
#   embedding: [0.12, -0.34, ...],
#   source: "s3://bucket/doc.pdf"
# })
# CREATE (d)-[:MENTIONS]->(e:Entity {name: "Bedrock"})`
  },
  {
    id: "s3",
    name: "Amazon S3 Vectors",
    short: "S3 Vectors",
    icon: "🪣",
    color: "#F59E0B",
    managed: "Serverless (fully managed, pay-per-use)",
    category: "Cloud Object Store + Native Vector",
    tagline: "The first cloud object store with native vector support — up to 90% cheaper than alternatives",
    description: "Amazon S3 Vectors is the first cloud object store with native support to store and query vectors. It delivers cost-optimized vector storage for AI applications, reducing costs by up to 90% compared to traditional vector databases while maintaining sub-second query performance. Supports up to 2 billion vectors per index with 10,000 indexes per bucket. Uses the s3vectors service namespace (separate from standard S3).",
    architecture: "S3 Vector Bucket → Vector Indexes (up to 10,000) → Vectors with metadata. Bedrock Knowledge Bases can use vector indexes directly as a vector store. Also integrates with OpenSearch for tiered strategies (hot in OpenSearch, warm/cold in S3 Vectors).",
    maxDimensions: "Not publicly specified",
    maxMetadataBytes: "Key-value pairs per vector (string, number, boolean, list). All metadata filterable by default.",
    indexAlgorithms: ["Managed (auto-optimized)"],
    distanceMetrics: ["Cosine", "L2 (Euclidean)", "Inner Product"],
    filtering: "All metadata filterable by default. Attach key-value pairs (string, number, boolean, list) to vectors. Mark fields as non-filterable to optimize storage.",
    hybridSearch: false,
    bedrockIntegration: "Native — Bedrock Knowledge Bases supports S3 vector indexes as a vector store. Also integrates with SageMaker Unified Studio for development and testing.",
    integrationLevel: 4,
    scalability: 5,
    queryPerf: 3,
    costEfficiency: 5,
    easeOfSetup: 4,
    featureRichness: 3,
    pricing: {
      model: "Pay-per-use (storage + queries)",
      detail: "Pay only for what you use — no minimum OCUs, no idle costs, no infrastructure provisioning. Up to 90% cheaper than traditional vector databases. Elastic storage scales automatically.",
      free: "Pricing details on AWS pricing page"
    },
    pros: [
      "Up to 90% cost reduction vs traditional vector stores",
      "Massive scale: 2B vectors/index, 10K indexes/bucket",
      "Zero infrastructure management — fully serverless",
      "Strongly consistent writes — immediate data availability",
      "Native Bedrock Knowledge Bases integration",
      "Auto-optimizes vector data for best price-performance over time"
    ],
    cons: [
      "Sub-second latency (not sub-millisecond like in-memory stores)",
      "Best for infrequent query patterns, not real-time high-throughput",
      "Newer service — smaller community and fewer examples",
      "No hybrid keyword + vector search natively",
      "Block Public Access always enabled (by design)"
    ],
    bestFor: ["Cost-sensitive RAG at scale", "Long-term vector archival with infrequent queries", "Tiered strategy: OpenSearch (hot) + S3 Vectors (warm/cold)", "Large-scale vector storage (billions of vectors)", "AI agent memory and context"],
    notIdeal: ["Sub-10ms latency requirements", "High-frequency real-time queries", "Hybrid keyword + vector search needs"],
    terraform: `# S3 Vectors uses the s3vectors API namespace
# Create vector bucket, then index, then store vectors

# AWS CLI example:
# aws s3vectors create-vector-bucket \\
#   --vector-bucket-name my-kb-vectors

# aws s3vectors create-index \\
#   --vector-bucket-name my-kb-vectors \\
#   --index-name embeddings \\
#   --dimension 1024 \\
#   --distance-metric cosine

# aws s3vectors put-vectors \\
#   --vector-bucket-name my-kb-vectors \\
#   --index-name embeddings \\
#   --vectors '[{"key":"doc1","data":{"float32":[0.12,-0.34,...]},"metadata":{"source":"report.pdf"}}]'

# aws s3vectors query-vectors \\
#   --vector-bucket-name my-kb-vectors \\
#   --index-name embeddings \\
#   --query-vector '{"float32":[0.15,-0.32,...]}' \\
#   --top-k 10`
  },
];

const radarDims = [
  { key: "integrationLevel", label: "Bedrock\nIntegration" },
  { key: "scalability", label: "Scalability" },
  { key: "queryPerf", label: "Query\nPerformance" },
  { key: "costEfficiency", label: "Cost\nEfficiency" },
  { key: "easeOfSetup", label: "Ease of\nSetup" },
  { key: "featureRichness", label: "Feature\nRichness" },
];

const compDims = [
  { key: "integrationLevel", label: "Bedrock Integration" },
  { key: "scalability", label: "Scalability" },
  { key: "queryPerf", label: "Query Latency" },
  { key: "costEfficiency", label: "Cost Efficiency" },
  { key: "easeOfSetup", label: "Ease of Setup" },
  { key: "featureRichness", label: "Feature Richness" },
];

const decisionQuestions = [
  { q: "What's your primary data model?", opts: [
    { label: "Flat documents / text", leads: "docs" },
    { label: "Relational tables + text", leads: "relational" },
    { label: "Graph / knowledge graph", leads: "graph" },
    { label: "Not sure — just want fastest setup", leads: "easy" },
  ]},
  { q: "What's your latency requirement?", opts: [
    { label: "< 10ms (real-time)", leads: "redis" },
    { label: "< 100ms (interactive)", leads: "fast" },
    { label: "< 1s (batch/async OK)", leads: "relaxed" },
  ]},
  { q: "How large is your vector collection?", opts: [
    { label: "< 1M vectors", leads: "small" },
    { label: "1M – 50M vectors", leads: "medium" },
    { label: "50M+ vectors", leads: "large" },
  ]},
  { q: "What's your cost priority?", opts: [
    { label: "Lowest possible cost", leads: "cheap" },
    { label: "Balanced cost & performance", leads: "balanced" },
    { label: "Performance first, cost secondary", leads: "perf" },
  ]},
];

function Bar5({ value, color, max = 5 }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width: 20, height: 8, borderRadius: 3, background: i <= value ? color : "rgba(255,255,255,0.07)", transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

function Pill({ children, color }) {
  return <span style={{ background: `${color}22`, color, fontSize: 11, padding: "3px 10px", borderRadius: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}

function RadarChart({ store, size = 220 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const n = radarDims.length;
  const angleStep = (2 * Math.PI) / n;
  const getPoint = (i, val) => {
    const a = angleStep * i - Math.PI / 2;
    const dist = (val / 5) * r;
    return [cx + dist * Math.cos(a), cy + dist * Math.sin(a)];
  };
  const pts = radarDims.map((d, i) => getPoint(i, store[d.key]));
  const poly = pts.map(p => p.join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[1,2,3,4,5].map(level => {
        const lpts = radarDims.map((_, i) => getPoint(i, level));
        return <polygon key={level} points={lpts.map(p=>p.join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}
      {radarDims.map((_, i) => {
        const [ex, ey] = getPoint(i, 5);
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}
      <polygon points={poly} fill={`${store.color}25`} stroke={store.color} strokeWidth={2} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill={store.color} />
      ))}
      {radarDims.map((d, i) => {
        const [lx, ly] = getPoint(i, 6.2);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#9CA3AF" fontSize={9} fontWeight={600}>
          {d.label.split("\n").map((line, li) => <tspan key={li} x={lx} dy={li === 0 ? 0 : 11}>{line}</tspan>)}
        </text>;
      })}
    </svg>
  );
}

function PipelineDiagram() {
  const steps = [
    { icon: "🪣", label: "S3 Bucket", sub: "Raw docs", color: "#F59E0B" },
    { icon: "✂️", label: "Chunking", sub: "Split & overlap", color: "#6B7280" },
    { icon: "🧠", label: "Embedding", sub: "Titan / Cohere", color: "#8B5CF6" },
    { icon: "📦", label: "Vector Store", sub: "Index & store", color: "#3B82F6" },
    { icon: "🔍", label: "Retrieval", sub: "Similarity search", color: "#10B981" },
    { icon: "💬", label: "LLM", sub: "Generate answer", color: "#EC4899" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "wrap", padding: "8px 0" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ background: `${s.color}15`, border: `1.5px solid ${s.color}35`, borderRadius: 10, padding: "10px 12px", textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 22, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#6B7280" }}>{s.sub}</div>
          </div>
          {i < steps.length - 1 && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 14 }}>→</span>}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("explore");
  const [activeStore, setActiveStore] = useState("opensearch");
  const [compareStores, setCompareStores] = useState(["opensearch", "aurora"]);
  const [showTF, setShowTF] = useState(false);
  const [decisionPath, setDecisionPath] = useState([]);
  const [recommendation, setRecommendation] = useState(null);

  const s = stores.find(x => x.id === activeStore);

  const toggleCompare = (id) => {
    setCompareStores(prev => {
      if (prev.includes(id)) return prev.length > 1 ? prev.filter(x => x !== id) : prev;
      return prev.length >= 4 ? [...prev.slice(1), id] : [...prev, id];
    });
  };

  const handleDecision = (stepIdx, optIdx) => {
    const newPath = [...decisionPath.slice(0, stepIdx), optIdx];
    setDecisionPath(newPath);
    setRecommendation(null);

    if (newPath.length >= 4) {
      const [dataModel, latency, scale, cost] = [
        decisionQuestions[0].opts[newPath[0]].leads,
        decisionQuestions[1].opts[newPath[1]].leads,
        decisionQuestions[2].opts[newPath[2]].leads,
        decisionQuestions[3].opts[newPath[3]].leads,
      ];
      if (dataModel === "graph") setRecommendation("neptune");
      else if (latency === "redis") setRecommendation("redis");
      else if (cost === "cheap" && latency === "relaxed") setRecommendation("s3");
      else if (scale === "large" && cost === "cheap") setRecommendation("s3");
      else if (dataModel === "relational" && scale === "small") setRecommendation("aurora");
      else if (dataModel === "easy") setRecommendation("opensearch");
      else if (scale === "large") setRecommendation("opensearch");
      else if (dataModel === "relational") setRecommendation("aurora");
      else if (cost === "cheap" && scale !== "small") setRecommendation("s3");
      else setRecommendation("opensearch");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", color: "#E5E7EB", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f3460 0%, #1a1a2e 40%, #16213e 100%)", padding: "36px 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <span style={{ background: "linear-gradient(135deg,#FF9900,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 14, letterSpacing: 1.5 }}>AWS BEDROCK</span>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0", letterSpacing: -0.5 }}>Vector Store Comparison</h1>
          <p style={{ color: "#9CA3AF", marginTop: 8, fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
            Bedrock Knowledge Bases support multiple vector stores. Each has distinct strengths in latency, cost, scalability, and integration depth. Choose the right one for your workload.
          </p>
          {/* Pipeline overview */}
          <div style={{ marginTop: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "12px 8px" }}>
            <PipelineDiagram />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
        {/* Tab nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4 }}>
          {[["explore","Deep Dive"],["compare","Side-by-Side"],["decide","Recommend"]].map(([k,l]) => (
            <button key={k} onClick={() => { setTab(k); if (k === "decide") { setDecisionPath([]); setRecommendation(null); } }}
              style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
                background: tab === k ? "rgba(255,255,255,0.1)" : "transparent",
                color: tab === k ? "#fff" : "#6B7280", transition: "all 0.2s" }}>
              {l}
            </button>
          ))}
        </div>

        {/* ===== DEEP DIVE ===== */}
        {tab === "explore" && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 20 }}>
            {stores.map(st => (
              <button key={st.id} onClick={() => { setActiveStore(st.id); setShowTF(false); }}
                style={{
                  background: activeStore === st.id ? `${st.color}12` : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${activeStore === st.id ? `${st.color}40` : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12, padding: "14px 6px", cursor: "pointer", textAlign: "center", transition: "all 0.25s"
                }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{st.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: activeStore === st.id ? st.color : "#9CA3AF", lineHeight: 1.3 }}>{st.short}</div>
              </button>
            ))}
          </div>

          <div style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 16, padding: 28 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 300 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 32 }}>{s.icon}</span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: s.color }}>{s.name}</h2>
                    <Pill color={s.color}>{s.category}</Pill>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#F59E0B", fontStyle: "italic", margin: "10px 0 0" }}>{s.tagline}</p>
              </div>
              <RadarChart store={s} size={200} />
            </div>

            <p style={{ fontSize: 14, color: "#B0B7C3", lineHeight: 1.7, margin: "0 0 20px" }}>{s.description}</p>

            {/* Bedrock integration note */}
            <div style={{ background: "rgba(255,153,0,0.08)", border: "1px solid rgba(255,153,0,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#F59E0B", lineHeight: 1.6 }}>
              <strong>Bedrock Integration:</strong> {s.bedrockIntegration}
            </div>

            {/* Technical specs grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Max Dimensions", value: typeof s.maxDimensions === "number" ? s.maxDimensions.toLocaleString() : s.maxDimensions },
                { label: "Index Algorithms", value: s.indexAlgorithms.join(", ") },
                { label: "Distance Metrics", value: s.distanceMetrics.join(", ") },
                { label: "Hybrid Search", value: s.hybridSearch ? "✓ Supported" : "✗ Not native" },
                { label: "Metadata", value: s.maxMetadataBytes },
                { label: "Managed", value: s.managed },
              ].map((spec, i) => (
                <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{spec.label}</div>
                  <div style={{ fontSize: 13, color: "#D1D5DB", fontWeight: 600 }}>{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Filtering */}
            <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 13, color: "#B0B7C3", lineHeight: 1.6 }}>
              <strong style={{ color: "#fff" }}>Filtering:</strong> {s.filtering}
            </div>

            {/* Pricing */}
            <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981", marginBottom: 6 }}>💰 Pricing — {s.pricing.model}</div>
              <div style={{ fontSize: 13, color: "#B0B7C3", lineHeight: 1.6 }}>{s.pricing.detail}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{s.pricing.free}</div>
            </div>

            {/* Pros / Cons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div style={{ background: "rgba(16,185,129,0.06)", borderRadius: 10, padding: 16 }}>
                <h4 style={{ color: "#10B981", fontSize: 13, marginTop: 0, marginBottom: 8 }}>✓ Strengths</h4>
                {s.pros.map((t,i) => <div key={i} style={{ fontSize: 12, color: "#D1D5DB", marginBottom: 5, paddingLeft: 8, lineHeight: 1.5 }}>• {t}</div>)}
              </div>
              <div style={{ background: "rgba(239,68,68,0.06)", borderRadius: 10, padding: 16 }}>
                <h4 style={{ color: "#EF4444", fontSize: 13, marginTop: 0, marginBottom: 8 }}>✗ Trade-offs</h4>
                {s.cons.map((t,i) => <div key={i} style={{ fontSize: 12, color: "#D1D5DB", marginBottom: 5, paddingLeft: 8, lineHeight: 1.5 }}>• {t}</div>)}
              </div>
            </div>

            {/* Best for / Not ideal */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Best For</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.bestFor.map((b,i) => <Pill key={i} color="#10B981">{b}</Pill>)}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Not Ideal For</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.notIdeal.map((b,i) => <Pill key={i} color="#EF4444">{b}</Pill>)}
                </div>
              </div>
            </div>

            {/* Terraform */}
            <button onClick={() => setShowTF(!showTF)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 18px", color: "#D1D5DB", cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%" }}>
              {showTF ? "▾" : "▸"} Terraform / Setup Example
            </button>
            {showTF && (
              <div style={{ background: "#0d1117", borderRadius: 10, padding: 18, fontSize: 11, fontFamily: "'Fira Code',monospace", color: "#c9d1d9", overflowX: "auto", lineHeight: 1.7, marginTop: 10, whiteSpace: "pre" }}>
                {s.terraform}
              </div>
            )}
          </div>
        </>}

        {/* ===== SIDE-BY-SIDE ===== */}
        {tab === "compare" && (
          <div>
            {/* Selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, lineHeight: "34px" }}>Select (2–4):</span>
              {stores.map(st => (
                <button key={st.id} onClick={() => toggleCompare(st.id)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${compareStores.includes(st.id) ? `${st.color}60` : "rgba(255,255,255,0.08)"}`,
                    background: compareStores.includes(st.id) ? `${st.color}15` : "transparent",
                    color: compareStores.includes(st.id) ? st.color : "#6B7280"
                  }}>
                  {st.icon} {st.short}
                </button>
              ))}
            </div>

            {/* Radar charts side by side */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {compareStores.map(id => {
                const st = stores.find(x => x.id === id);
                return (
                  <div key={id} style={{ textAlign: "center" }}>
                    <RadarChart store={st} size={180} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: st.color, marginTop: -4 }}>{st.short}</div>
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "#6B7280", fontWeight: 600, fontSize: 12 }}>Dimension</th>
                    {compareStores.map(id => {
                      const st = stores.find(x => x.id === id);
                      return <th key={id} style={{ textAlign: "center", padding: "10px 12px", color: st.color, fontWeight: 700, fontSize: 12 }}>{st.icon} {st.short}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {compDims.map((dim, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "12px", color: "#D1D5DB", fontWeight: 500 }}>{dim.label}</td>
                      {compareStores.map(id => {
                        const st = stores.find(x => x.id === id);
                        return <td key={id} style={{ padding: "12px", textAlign: "center" }}><Bar5 value={st[dim.key]} color={st.color} /></td>;
                      })}
                    </tr>
                  ))}
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "12px", color: "#D1D5DB", fontWeight: 500 }}>Hybrid Search</td>
                    {compareStores.map(id => {
                      const st = stores.find(x => x.id === id);
                      return <td key={id} style={{ padding: "12px", textAlign: "center" }}>
                        <Pill color={st.hybridSearch ? "#10B981" : "#EF4444"}>{st.hybridSearch ? "Yes" : "No"}</Pill>
                      </td>;
                    })}
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "12px", color: "#D1D5DB", fontWeight: 500 }}>Max Dimensions</td>
                    {compareStores.map(id => {
                      const st = stores.find(x => x.id === id);
                      return <td key={id} style={{ padding: "12px", textAlign: "center", color: "#9CA3AF", fontWeight: 600 }}>
                        {typeof st.maxDimensions === "number" ? st.maxDimensions.toLocaleString() : "N/A"}
                      </td>;
                    })}
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "12px", color: "#D1D5DB", fontWeight: 500 }}>Index Algorithms</td>
                    {compareStores.map(id => {
                      const st = stores.find(x => x.id === id);
                      return <td key={id} style={{ padding: "12px", textAlign: "center", fontSize: 11, color: "#9CA3AF" }}>{st.indexAlgorithms.join(", ")}</td>;
                    })}
                  </tr>
                  <tr>
                    <td style={{ padding: "12px", color: "#D1D5DB", fontWeight: 500 }}>Pricing Model</td>
                    {compareStores.map(id => {
                      const st = stores.find(x => x.id === id);
                      return <td key={id} style={{ padding: "12px", textAlign: "center", fontSize: 11, color: "#9CA3AF" }}>{st.pricing.model}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quick verdict */}
            <div style={{ marginTop: 20, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#A78BFA" }}>Quick Verdicts</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {stores.map(st => (
                  <div key={st.id} style={{ fontSize: 12, color: "#B0B7C3", lineHeight: 1.6 }}>
                    <span style={{ color: st.color, fontWeight: 700 }}>{st.icon} {st.short}:</span> {st.tagline}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== DECISION HELPER ===== */}
        {tab === "decide" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#fff" }}>Which Vector Store Should You Use?</h2>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Answer three questions to get a tailored recommendation.</p>

            {decisionQuestions.map((dq, qi) => (
              <div key={qi} style={{ marginBottom: 24, opacity: qi <= decisionPath.length ? 1 : 0.3, transition: "opacity 0.3s", pointerEvents: qi <= decisionPath.length ? "auto" : "none" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 12 }}>
                  <span style={{ background: "#8B5CF6", color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, marginRight: 8 }}>{qi + 1}</span>
                  {dq.q}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {dq.opts.map((opt, oi) => (
                    <button key={oi} onClick={() => handleDecision(qi, oi)}
                      style={{
                        padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${decisionPath[qi] === oi ? "#8B5CF640" : "rgba(255,255,255,0.08)"}`,
                        background: decisionPath[qi] === oi ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                        color: decisionPath[qi] === oi ? "#A78BFA" : "#9CA3AF",
                        transition: "all 0.2s"
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {recommendation && (() => {
              const rec = stores.find(x => x.id === recommendation);
              return (
                <div style={{ background: `${rec.color}10`, border: `2px solid ${rec.color}40`, borderRadius: 14, padding: 28, textAlign: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 44, marginBottom: 8 }}>{rec.icon}</div>
                  <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>Recommended Vector Store</div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: rec.color, margin: "0 0 8px" }}>{rec.name}</h3>
                  <p style={{ fontSize: 14, color: "#D1D5DB", maxWidth: 500, margin: "0 auto 16px", lineHeight: 1.6 }}>{rec.tagline}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 16 }}>
                    {rec.bestFor.map((b, i) => <Pill key={i} color={rec.color}>{b}</Pill>)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <RadarChart store={rec} size={200} />
                  </div>
                  <button onClick={() => { setDecisionPath([]); setRecommendation(null); }}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#9CA3AF", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Start Over
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: "#4B5563" }}>
          AWS Bedrock · Vector Store Comparison Reference
        </div>
      </div>
    </div>
  );
}