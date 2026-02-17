import { useState } from "react";

const data = [
  {
    id: "ai-services",
    name: "AI Services (Pre-built APIs)",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.25)",
    icon: "🧠",
    desc: "Fully managed AI capabilities via simple API calls — no ML expertise needed.",
    tools: [
      { name: "Amazon Transcribe", icon: "🎙️", desc: "Automatic speech-to-text. Supports real-time & batch transcription, custom vocabularies, speaker identification, and content redaction.", use: "Call center analytics, subtitle generation, meeting transcription", tier: "Speech" },
      { name: "Amazon Polly", icon: "🔊", desc: "Text-to-speech service with 60+ voices across 30+ languages. Supports SSML, Neural TTS, and custom lexicons.", use: "Voice assistants, e-learning narration, accessibility", tier: "Speech" },
      { name: "Amazon Comprehend", icon: "📝", desc: "NLP service for sentiment analysis, entity recognition, key phrase extraction, language detection, and topic modeling.", use: "Customer feedback analysis, document classification, content moderation", tier: "Language" },
      { name: "Amazon Rekognition", icon: "👁️", desc: "Image & video analysis — object detection, facial analysis, text in images, content moderation, celebrity recognition, and custom labels.", use: "Identity verification, content moderation, visual search", tier: "Vision" },
      { name: "Amazon Kendra", icon: "🔍", desc: "Intelligent enterprise search powered by ML. Understands natural language queries and returns precise answers from documents.", use: "Enterprise knowledge bases, internal search portals, FAQ bots", tier: "Search" },
      { name: "Amazon Textract", icon: "📄", desc: "Extract text, tables, and forms from scanned documents. Goes beyond OCR with layout-aware structured extraction.", use: "Invoice processing, ID extraction, form digitization", tier: "Vision" },
      { name: "Amazon Translate", icon: "🌐", desc: "Neural machine translation supporting 75+ languages. Real-time and batch modes with custom terminology support.", use: "Content localization, multilingual chat, document translation", tier: "Language" },
      { name: "Amazon Lex", icon: "🤖", desc: "Build conversational interfaces (chatbots & voice bots) using the same tech behind Alexa. Supports intents, slots, and fulfillment.", use: "Customer service bots, IVR systems, virtual assistants", tier: "Conversational" },
    ],
  },
  {
    id: "sagemaker",
    name: "SageMaker ML Platform",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    icon: "⚙️",
    desc: "End-to-end ML platform for building, training, deploying, and managing custom models.",
    tools: [
      { name: "Model Registry", icon: "📦", desc: "Central catalog to version, track, and manage ML models. Stores metadata, approval status, and lineage for governed deployments.", use: "Model versioning, CI/CD for ML, audit trails", tier: "Governance" },
      { name: "Model Cards", icon: "🪪", desc: "Documentation framework for ML models — captures intended use, training details, performance metrics, and ethical considerations.", use: "Model transparency, compliance documentation, responsible AI", tier: "Governance" },
      { name: "SageMaker Clarify", icon: "⚖️", desc: "Detect bias in data and models, and generate explainability reports (SHAP values). Pre-training and post-training bias metrics.", use: "Fairness auditing, regulatory compliance, model interpretability", tier: "Governance" },
      { name: "SageMaker Studio", icon: "💻", desc: "Fully integrated IDE for ML. Jupyter notebooks, experiment tracking, debugging, profiling, and visual pipeline builder.", use: "Model development, experimentation, collaborative ML", tier: "Development" },
      { name: "SageMaker Pipelines", icon: "🔗", desc: "CI/CD for ML workflows. Define, automate, and manage end-to-end ML pipelines with step caching and conditional execution.", use: "Automated retraining, ML workflow orchestration", tier: "MLOps" },
      { name: "Feature Store", icon: "🗄️", desc: "Centralized repository to store, share, and reuse ML features. Online (low-latency) and offline (batch) stores.", use: "Feature reuse, consistent training/inference data", tier: "Data" },
      { name: "Ground Truth", icon: "🏷️", desc: "Data labeling service with human annotators and active learning. Supports image, text, video, and 3D point cloud labeling.", use: "Training data preparation, annotation workflows", tier: "Data" },
      { name: "SageMaker Inference", icon: "🚀", desc: "Deploy models as real-time endpoints, batch transforms, async inference, or serverless endpoints. Auto-scaling built in.", use: "Model serving, A/B testing, production ML", tier: "Deployment" },
    ],
  },
  {
    id: "bedrock",
    name: "Bedrock (Generative AI)",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    icon: "🪨",
    desc: "Managed service for foundation models — build GenAI apps without managing infrastructure.",
    tools: [
      { name: "Bedrock Models", icon: "🏗️", desc: "Access foundation models from Anthropic (Claude), Meta (Llama), Mistral, Cohere, Amazon Titan, and more via a unified API.", use: "Text generation, summarization, code generation, chat", tier: "Core" },
      { name: "Bedrock Agents", icon: "🕵️", desc: "Build autonomous AI agents that plan, execute multi-step tasks, and call APIs. Supports action groups and knowledge base integration.", use: "Automated workflows, customer service agents, research assistants", tier: "Orchestration" },
      { name: "Bedrock Knowledge Bases", icon: "📚", desc: "RAG-as-a-service. Connect data sources, auto-chunk and embed documents into vector stores, and query with foundation models.", use: "Enterprise Q&A, document search, contextual chatbots", tier: "RAG" },
      { name: "Bedrock Guardrails", icon: "🛡️", desc: "Apply safety filters, topic blocking, PII redaction, content policies, and grounding checks to any model's input/output.", use: "Content safety, compliance, responsible AI deployment", tier: "Safety" },
      { name: "Bedrock Data Automation", icon: "📊", desc: "Extract structured data from unstructured documents (PDFs, images, audio, video) using foundation models.", use: "Document processing, media analysis, data extraction", tier: "Processing" },
      { name: "Bedrock Fine-tuning", icon: "🎯", desc: "Customize foundation models with your own data. Supports continued pre-training and instruction fine-tuning.", use: "Domain adaptation, custom tone/style, specialized tasks", tier: "Customization" },
    ],
  },
  {
    id: "infra",
    name: "ML Infrastructure & Ops",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    icon: "🏭",
    desc: "Compute, monitoring, and operational services powering ML workloads at scale.",
    tools: [
      { name: "AWS Inferentia / Trainium", icon: "🧮", desc: "Custom ML chips — Inferentia for inference, Trainium for training. Up to 50% cost savings vs GPU instances for supported models.", use: "Cost-effective model training/inference at scale", tier: "Compute" },
      { name: "Amazon CloudWatch ML", icon: "📈", desc: "Monitor model endpoints — latency, invocation count, error rates, data drift, and model quality metrics with automated alerts.", use: "Production monitoring, SLA tracking, anomaly detection", tier: "Monitoring" },
      { name: "SageMaker Model Monitor", icon: "🔬", desc: "Continuously monitor deployed models for data drift, model quality degradation, bias drift, and feature attribution drift.", use: "Model health monitoring, automated retraining triggers", tier: "Monitoring" },
      { name: "Amazon ECR + Lambda", icon: "🐳", desc: "Package models in containers (ECR) and serve via Lambda for serverless inference. Great for lightweight or intermittent workloads.", use: "Serverless ML, microservice inference, edge deployment", tier: "Deployment" },
    ],
  },
];

const tierColors = {
  Speech: "#818cf8", Language: "#a78bfa", Vision: "#c084fc", Search: "#e879f9",
  Conversational: "#f472b6", Governance: "#fbbf24", Development: "#34d399",
  MLOps: "#60a5fa", Data: "#fb923c", Deployment: "#f87171", Core: "#6ee7b7",
  Orchestration: "#93c5fd", RAG: "#86efac", Safety: "#fca5a5", Processing: "#fdba74",
  Customization: "#d8b4fe", Compute: "#f9a8d4", Monitoring: "#7dd3fc",
};

export default function AWSMLExplorer() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const allTools = data.flatMap(c => c.tools.map(t => ({ ...t, catId: c.id, catName: c.name, catColor: c.color })));
  const filtered = search
    ? allTools.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()) || t.tier.toLowerCase().includes(search.toLowerCase()))
    : [];

  const totalTools = allTools.length;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 14, letterSpacing: 4, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>Interactive Explorer</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(90deg, #6366f1, #f59e0b, #10b981, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AWS Machine Learning & AI Services
        </h1>
        <p style={{ color: "#94a3b8", marginTop: 8 }}>{totalTools} services across {data.length} categories</p>

        {/* Search */}
        <div style={{ maxWidth: 420, margin: "20px auto 0", position: "relative" }}>
          <input
            type="text"
            placeholder="Search services, features, or categories..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveTool(null); }}
            style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔎</span>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          {["grid", "list"].map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              style={{ padding: "6px 18px", borderRadius: 8, border: "1px solid", borderColor: viewMode === m ? "#6366f1" : "rgba(255,255,255,0.1)", background: viewMode === m ? "rgba(99,102,241,0.2)" : "transparent", color: viewMode === m ? "#a5b4fc" : "#64748b", cursor: "pointer", fontSize: 13, textTransform: "capitalize" }}>
              {m === "grid" ? "⊞" : "☰"} {m}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {search && (
        <div style={{ maxWidth: 900, margin: "0 auto 32px" }}>
          <div style={{ color: "#94a3b8", marginBottom: 12, fontSize: 13 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"</div>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 32, color: "#475569" }}>No services found. Try a different keyword.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(t => (
              <div key={t.name} onClick={() => setActiveTool(activeTool?.name === t.name ? null : t)}
                style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: t.catColor + "22", color: t.catColor, marginTop: 2, display: "inline-block" }}>{t.catName}</span>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 6, background: (tierColors[t.tier] || "#888") + "22", color: tierColors[t.tier] || "#888" }}>{t.tier}</span>
                </div>
                {activeTool?.name === t.name && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <p style={{ color: "#cbd5e1", fontSize: 13, margin: "0 0 8px", lineHeight: 1.6 }}>{t.desc}</p>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}><strong style={{ color: "#e2e8f0" }}>Use cases:</strong> {t.use}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {!search && (
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          {data.map(cat => {
            const isOpen = activeCategory === cat.id;
            return (
              <div key={cat.id} style={{ borderRadius: 16, border: `1px solid ${cat.border}`, background: cat.bg, overflow: "hidden", transition: "all 0.3s" }}>
                {/* Category Header */}
                <div onClick={() => { setActiveCategory(isOpen ? null : cat.id); setActiveTool(null); }}
                  style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 32 }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: cat.color }}>{cat.name}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>{cat.desc}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "#64748b", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 8 }}>{cat.tools.length} services</span>
                    <span style={{ fontSize: 20, color: cat.color, transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                  </div>
                </div>

                {/* Tools */}
                {isOpen && (
                  <div style={{ padding: "0 20px 20px" }}>
                    {/* Tier pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16, paddingLeft: 4 }}>
                      {[...new Set(cat.tools.map(t => t.tier))].map(tier => (
                        <span key={tier} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: (tierColors[tier] || "#888") + "22", color: tierColors[tier] || "#888", fontWeight: 600 }}>{tier}</span>
                      ))}
                    </div>

                    <div style={viewMode === "grid" ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 } : { display: "flex", flexDirection: "column", gap: 10 }}>
                      {cat.tools.map(tool => {
                        const isActive = activeTool?.name === tool.name;
                        return (
                          <div key={tool.name} onClick={() => setActiveTool(isActive ? null : tool)}
                            style={{
                              padding: 16, borderRadius: 12, cursor: "pointer", transition: "all 0.25s",
                              background: isActive ? `${cat.color}15` : "rgba(255,255,255,0.03)",
                              border: `1px solid ${isActive ? cat.color + "55" : "rgba(255,255,255,0.06)"}`,
                              transform: isActive ? "scale(1.01)" : "scale(1)",
                            }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 24, filter: isActive ? "none" : "grayscale(30%)" }}>{tool.icon}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: isActive ? "#f1f5f9" : "#cbd5e1" }}>{tool.name}</div>
                                <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 5, background: (tierColors[tool.tier] || "#888") + "22", color: tierColors[tool.tier] || "#888" }}>{tool.tier}</span>
                              </div>
                              <span style={{ fontSize: 16, color: "#475569", transition: "transform 0.2s", transform: isActive ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                            </div>

                            {isActive && (
                              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${cat.color}33` }}>
                                <p style={{ color: "#cbd5e1", fontSize: 13, margin: "0 0 10px", lineHeight: 1.65 }}>{tool.desc}</p>
                                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: 10 }}>
                                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Use Cases</div>
                                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{tool.use}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 40, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#475569", fontSize: 12 }}>
        AWS ML & AI Services Explorer • Click categories to expand • Click services for details
      </div>
    </div>
  );
}