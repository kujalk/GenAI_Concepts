import { useState } from "react";

const tabs = ["Why Fine-Tune?", "Techniques", "AWS / Bedrock", "Compare", "Decision Guide"];

const whyReasons = [
  { icon: "🎯", title: "Domain Specialization", desc: "Base models are generalists. Fine-tuning makes them experts in your domain — legal, medical, finance, DevOps.", example: "A base model might say 'EC2 is a compute service.' A fine-tuned model says 'For your burst workload, use t3.medium with unlimited credits and a target tracking scaling policy at 70% CPU.'" },
  { icon: "💰", title: "Cost Reduction", desc: "Smaller fine-tuned models can match or beat larger base models on specific tasks. Less tokens, less cost.", example: "A fine-tuned 7B model for ticket classification can replace GPT-4 class models at 1/50th the cost per inference." },
  { icon: "🔒", title: "Data Privacy", desc: "Keep sensitive data in-house. Fine-tune on proprietary data without sending it to external APIs.", example: "A healthcare company fine-tunes on patient interaction patterns without exposing PHI to third-party services." },
  { icon: "⚡", title: "Latency & Control", desc: "Smaller fine-tuned models run faster. You control the model lifecycle, versioning, and deployment.", example: "Deploy a fine-tuned model on SageMaker with auto-scaling, A/B testing, and model monitoring built in." },
  { icon: "🧠", title: "Behavior Alignment", desc: "Teach the model YOUR tone, format, and reasoning style. Not just what to say, but how to say it.", example: "Fine-tune to always respond in your company's support style — empathetic, structured, with ticket references." },
];

const techniques = [
  {
    id: "full",
    name: "Full Fine-Tuning",
    icon: "🔥",
    color: "#EF4444",
    difficulty: "Expert",
    tagline: "Update every single weight",
    vram: "Very High (100s of GB)",
    params: "100%",
    speed: "Slow",
    quality: "Highest (if done right)",
    desc: "Retrain ALL parameters of the model on your dataset. The original approach — powerful but extremely resource-hungry. Every weight in every layer gets updated via backpropagation.",
    how: [
      "Prepare a large, high-quality labeled dataset (10K+ examples)",
      "Load the full model into GPU memory (need multiple A100/H100s)",
      "Train with small learning rate to avoid catastrophic forgetting",
      "Use gradient checkpointing to manage memory",
      "Evaluate on held-out set, save best checkpoint"
    ],
    pros: ["Maximum flexibility", "Can fundamentally change model behavior", "Best for large domain shifts"],
    cons: ["Enormous compute cost ($10K-$1M+)", "Risk of catastrophic forgetting", "Need massive datasets", "Creates full model copy per task"],
    when: "You have massive compute budget, large proprietary datasets, and need to fundamentally reshape model behavior. Think: building a new foundation model variant.",
    diagram: { layers: 12, trainable: [0,1,2,3,4,5,6,7,8,9,10,11] }
  },
  {
    id: "adapter",
    name: "Adapter Layers",
    icon: "🔌",
    color: "#8B5CF6",
    difficulty: "Intermediate",
    tagline: "Insert small trainable modules between frozen layers",
    vram: "Moderate",
    params: "~3-5%",
    speed: "Moderate",
    quality: "Very Good",
    desc: "Freeze the original model and insert small 'adapter' modules (typically bottleneck layers) between existing transformer layers. Only these adapters are trained. The original paper (Houlsby et al., 2019) showed near full fine-tuning performance with ~3% of parameters.",
    how: [
      "Freeze all original model weights",
      "Insert adapter modules (down-project → nonlinearity → up-project) after attention & FFN layers",
      "Bottleneck dimension controls adapter size (e.g., 64 or 128)",
      "Train only adapter parameters on your dataset",
      "At inference: original model + tiny adapter weights"
    ],
    pros: ["Original model unchanged", "Swap adapters for different tasks", "Modular & composable", "Much less compute than full FT"],
    cons: ["Adds inference latency (extra layers)", "Not as parameter-efficient as LoRA", "More complex architecture", "Less ecosystem support now"],
    when: "Multi-task scenarios where you want to swap task-specific modules without reloading the base model. Less popular now that LoRA exists.",
    diagram: { layers: 12, trainable: [], adapters: [1,3,5,7,9,11] }
  },
  {
    id: "lora",
    name: "LoRA",
    icon: "⚡",
    color: "#F59E0B",
    difficulty: "Intermediate",
    tagline: "Low-Rank Adaptation — the industry standard",
    vram: "Low-Moderate",
    params: "~0.1-1%",
    speed: "Fast",
    quality: "Excellent",
    desc: "Instead of updating full weight matrices, LoRA decomposes the update into two small low-rank matrices (A and B). For a weight matrix W (d×d), instead of learning ΔW (d×d), it learns A (d×r) and B (r×d) where r << d. The update is: W' = W + BA. Typically r = 4 to 64.",
    how: [
      "Choose target modules (usually query/value projection matrices in attention)",
      "Set rank r (4-64) and alpha scaling factor",
      "Freeze base model, train only A and B matrices",
      "Total trainable params ≈ 2 × r × d × num_layers",
      "At inference: merge BA into original weights (zero overhead!) or keep separate"
    ],
    pros: ["Tiny adapter files (MBs vs GBs)", "No inference latency (weights merge)", "Multiple LoRAs can be hot-swapped", "Industry standard, huge ecosystem"],
    cons: ["Rank r limits expressiveness", "Choosing target modules matters", "Not ideal for massive domain shifts", "Alpha/rank tuning required"],
    when: "The default choice for 90% of fine-tuning use cases. Especially when you need multiple task-specific adaptations with fast switching.",
    diagram: { layers: 12, trainable: [], lora: [0,2,4,6,8,10] },
    math: "W' = W + BA\nW: d×d (frozen)\nA: d×r (trainable)\nB: r×d (trainable)\nr << d (e.g., r=8, d=4096)"
  },
  {
    id: "qlora",
    name: "QLoRA",
    icon: "🗜️",
    color: "#10B981",
    difficulty: "Intermediate",
    tagline: "LoRA + 4-bit quantization = fine-tune on a single GPU",
    vram: "Very Low",
    params: "~0.1-1%",
    speed: "Fast",
    quality: "Very Good",
    desc: "Quantize the base model to 4-bit precision (NF4 format), then apply LoRA adapters in full precision on top. This lets you fine-tune a 65B parameter model on a single 48GB GPU. Uses double quantization and paged optimizers to minimize memory.",
    how: [
      "Load base model in 4-bit NF4 quantization (using bitsandbytes)",
      "Apply LoRA adapters to target modules (same as LoRA)",
      "LoRA adapters trained in BFloat16/Float16 precision",
      "Paged optimizers handle memory spikes via CPU offloading",
      "Result: 4-bit base model + small FP16 LoRA weights"
    ],
    pros: ["Fine-tune 70B models on single GPU", "Almost no quality loss vs full LoRA", "Dramatically lower hardware barrier", "Same ecosystem as LoRA"],
    cons: ["Slightly slower training (quantization overhead)", "4-bit base limits some operations", "Merging back is more complex", "Inference may need quantized runtime"],
    when: "You want LoRA but don't have multi-GPU setups. Perfect for experimentation, smaller teams, and cost-conscious fine-tuning.",
    diagram: { layers: 12, trainable: [], lora: [0,2,4,6,8,10], quantized: true }
  },
  {
    id: "prefix",
    name: "Prefix Tuning",
    icon: "🏷️",
    color: "#3B82F6",
    difficulty: "Intermediate",
    tagline: "Prepend trainable virtual tokens to the input",
    vram: "Very Low",
    params: "~0.01-0.1%",
    speed: "Very Fast",
    quality: "Good",
    desc: "Instead of modifying any model weights, prepend a sequence of trainable 'virtual tokens' (continuous embeddings) to the input at every transformer layer. The model learns to condition on these soft prompts to adapt its behavior.",
    how: [
      "Define prefix length (e.g., 20 virtual tokens per layer)",
      "Initialize trainable prefix embeddings",
      "Freeze entire model, train only prefix vectors",
      "At inference: prepend learned prefix to input",
      "Can reparameterize through a small MLP for stability"
    ],
    pros: ["Extremely parameter efficient", "No model modification", "Easy to swap prefixes", "Works well for generation tasks"],
    cons: ["Eats into context length", "Less effective for complex reasoning", "Training can be unstable", "Not mergeable like LoRA"],
    when: "When you need the absolute minimum trainable parameters and your task is primarily about style/format adaptation rather than new knowledge.",
    diagram: { layers: 12, trainable: [], prefix: true }
  },
  {
    id: "rlhf",
    name: "RLHF / DPO",
    icon: "👥",
    color: "#EC4899",
    difficulty: "Expert",
    tagline: "Align model behavior with human preferences",
    vram: "High",
    params: "Varies",
    speed: "Slow",
    quality: "Best for alignment",
    desc: "Reinforcement Learning from Human Feedback trains a reward model from human preference data, then uses PPO to optimize the LLM against that reward model. DPO (Direct Preference Optimization) simplifies this by directly optimizing on preference pairs without a separate reward model.",
    how: [
      "Collect preference data: human ranks output A > output B for each prompt",
      "RLHF: Train a reward model, then use PPO to fine-tune the LLM",
      "DPO: Skip reward model — directly optimize on preference pairs",
      "Typically applied AFTER supervised fine-tuning (SFT)",
      "Use KL divergence penalty to prevent reward hacking"
    ],
    pros: ["Best method for behavior alignment", "Captures nuanced human preferences", "DPO is much simpler than full RLHF", "How ChatGPT/Claude were trained"],
    cons: ["Needs expensive human preference data", "RLHF is complex (reward model + PPO)", "Can overoptimize for reward", "Requires careful evaluation"],
    when: "After SFT, when you need the model to be helpful, harmless, and follow instructions in the way humans prefer. The 'polish' step.",
    diagram: { layers: 12, trainable: [0,1,2,3,4,5,6,7,8,9,10,11], rlhf: true }
  },
];

const awsServices = [
  {
    id: "bedrock-ft",
    name: "Amazon Bedrock Fine-Tuning",
    icon: "🪨",
    color: "#F59E0B",
    category: "Managed Fine-Tuning",
    desc: "Fully managed fine-tuning for foundation models (Titan, Llama, Cohere, etc.) directly in Bedrock. No infrastructure to manage.",
    features: [
      { label: "Supported Models", value: "Titan Text, Llama 2/3, Cohere Command, Mistral" },
      { label: "Method", value: "Full fine-tuning or continued pre-training" },
      { label: "Data Format", value: "JSONL with prompt/completion pairs in S3" },
      { label: "Customization", value: "Epochs, batch size, learning rate, warmup steps" },
      { label: "Output", value: "Provisioned Throughput model (custom model endpoint)" },
    ],
    steps: [
      "Prepare training data as JSONL in S3",
      "Create a fine-tuning job in Bedrock console or API",
      "Select base model and hyperparameters",
      "Bedrock provisions infrastructure automatically",
      "Job outputs a custom model version",
      "Purchase Provisioned Throughput to serve it"
    ],
    code: `import boto3\n\nclient = boto3.client('bedrock')\n\nresponse = client.create_model_customization_job(\n    jobName='my-fine-tune-job',\n    customModelName='my-custom-llama',\n    roleArn='arn:aws:iam::role/BedrockFTRole',\n    baseModelIdentifier='meta.llama3-8b-instruct-v1',\n    trainingDataConfig={\n        's3Uri': 's3://my-bucket/training.jsonl'\n    },\n    outputDataConfig={\n        's3Uri': 's3://my-bucket/output/'\n    },\n    hyperParameters={\n        'epochCount': '3',\n        'batchSize': '8',\n        'learningRate': '0.00001'\n    }\n)`
  },
  {
    id: "bedrock-kb",
    name: "Bedrock Knowledge Bases (RAG)",
    icon: "📚",
    color: "#3B82F6",
    category: "Alternative to Fine-Tuning",
    desc: "Instead of fine-tuning, use Retrieval Augmented Generation to ground model responses in your data. Often the RIGHT first step before fine-tuning.",
    features: [
      { label: "How It Works", value: "Index docs → Vector search → Inject context → Generate" },
      { label: "Data Sources", value: "S3, Confluence, SharePoint, Salesforce, Web crawlers" },
      { label: "Vector Stores", value: "OpenSearch Serverless, Aurora, Pinecone, Redis" },
      { label: "Chunking", value: "Fixed-size, semantic, hierarchical, or custom" },
      { label: "Best For", value: "When your data changes frequently" },
    ],
    steps: [
      "Upload documents to S3 (PDF, MD, HTML, etc.)",
      "Create a Knowledge Base in Bedrock",
      "Configure chunking strategy and embedding model",
      "Bedrock indexes everything into a vector store",
      "Query with RetrieveAndGenerate API",
      "Model gets relevant context automatically"
    ],
    code: `# RAG Query\nclient = boto3.client('bedrock-agent-runtime')\n\nresponse = client.retrieve_and_generate(\n    input={'text': 'How do I configure VPC peering?'},\n    retrieveAndGenerateConfiguration={\n        'type': 'KNOWLEDGE_BASE',\n        'knowledgeBaseConfiguration': {\n            'knowledgeBaseId': 'KB_ID',\n            'modelArn': 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet'\n        }\n    }\n)`
  },
  {
    id: "sagemaker",
    name: "SageMaker (LoRA/QLoRA)",
    icon: "🧪",
    color: "#8B5CF6",
    category: "Full Control Fine-Tuning",
    desc: "Use SageMaker for complete control over training — LoRA, QLoRA, RLHF, custom training scripts. Maximum flexibility with managed infrastructure.",
    features: [
      { label: "Methods", value: "LoRA, QLoRA, Full FT, RLHF, DPO — anything" },
      { label: "Instances", value: "ml.p4d.24xlarge (A100), ml.p5.48xlarge (H100)" },
      { label: "Frameworks", value: "HuggingFace, PyTorch, PEFT, TRL, DeepSpeed" },
      { label: "JumpStart", value: "Pre-built LoRA notebooks for popular models" },
      { label: "Deployment", value: "Real-time, async, batch, serverless endpoints" },
    ],
    steps: [
      "Choose base model from HuggingFace or JumpStart",
      "Prepare dataset in instruction format",
      "Write training script using PEFT/TRL libraries",
      "Launch SageMaker Training Job with GPU instances",
      "Evaluate model with SageMaker Experiments",
      "Deploy to SageMaker endpoint with auto-scaling"
    ],
    code: `from sagemaker.huggingface import HuggingFace\n\n# LoRA fine-tuning on SageMaker\nestimator = HuggingFace(\n    entry_point='train.py',\n    instance_type='ml.p4d.24xlarge',\n    instance_count=1,\n    transformers_version='4.36',\n    pytorch_version='2.1',\n    py_version='py310',\n    hyperparameters={\n        'model_id': 'meta-llama/Llama-3-8B',\n        'lora_r': 16,\n        'lora_alpha': 32,\n        'epochs': 3,\n        'per_device_train_batch_size': 4,\n        'learning_rate': 2e-4,\n    }\n)\nestimator.fit({'train': 's3://my-bucket/train/'})`
  },
  {
    id: "bedrock-guardrails",
    name: "Bedrock Guardrails",
    icon: "🛡️",
    color: "#10B981",
    category: "Post-Training Safety",
    desc: "Apply safety filters and content policies to any model (base or fine-tuned). Essential layer for production deployments.",
    features: [
      { label: "Content Filters", value: "Hate, violence, sexual, misconduct, prompt attacks" },
      { label: "Denied Topics", value: "Define custom topics the model must refuse" },
      { label: "Word Filters", value: "Block specific words or patterns" },
      { label: "PII Detection", value: "Auto-redact SSN, email, phone, etc." },
      { label: "Grounding Checks", value: "Verify response is grounded in provided context" },
    ],
    steps: [
      "Create a Guardrail in Bedrock console or API",
      "Configure content filter strengths (LOW → HIGH)",
      "Define denied topics with example phrases",
      "Add PII detection rules",
      "Attach guardrail to your model invocations",
      "Monitor blocked/flagged requests in CloudWatch"
    ],
    code: `# Apply guardrail to model invocation\nclient = boto3.client('bedrock-runtime')\n\nresponse = client.invoke_model(\n    modelId='my-custom-model',\n    guardrailIdentifier='my-guardrail-id',\n    guardrailVersion='1',\n    body=json.dumps({\n        'prompt': user_input,\n        'max_tokens': 500\n    })\n)`
  }
];

const diffMap = { "Beginner": 1, "Intermediate": 2, "Expert": 3 };
const diffColor = { "Beginner": "#22C55E", "Intermediate": "#F59E0B", "Expert": "#EF4444" };

function LayerViz({ t }) {
  const frozen = "#334155", trained = "#EF4444", loraC = "#F59E0B", adapterC = "#8B5CF6", prefixC = "#3B82F6";
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", justifyContent: "center", marginTop: 12 }}>
      {t.prefix && <div style={{ width: 18, height: 50, borderRadius: 4, background: `repeating-linear-gradient(0deg, ${prefixC}, ${prefixC} 3px, transparent 3px, transparent 6px)`, border: `1px solid ${prefixC}`, marginRight: 6 }} title="Prefix tokens" />}
      {Array.from({ length: t.layers }).map((_, i) => {
        const isTrained = t.trainable?.includes(i);
        const hasLora = t.lora?.includes(i);
        const hasAdapter = t.adapters?.includes(i);
        let bg = frozen;
        if (isTrained) bg = t.rlhf ? `linear-gradient(135deg, ${trained}, #EC4899)` : trained;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            {hasAdapter && <div style={{ width: 8, height: 12, borderRadius: 2, background: adapterC }} title="Adapter" />}
            <div style={{ width: 18, height: 36, borderRadius: 4, background: bg, border: `1px solid ${isTrained ? trained : "#475569"}55`, position: "relative", opacity: t.quantized && !hasLora ? 0.5 : 1 }}>
              {hasLora && <div style={{ position: "absolute", inset: 0, borderRadius: 3, border: `2px solid ${loraC}`, background: `${loraC}22` }} />}
            </div>
            <span style={{ fontSize: 8, color: "#475569" }}>{i}</span>
          </div>
        );
      })}
      <div style={{ marginLeft: 12, fontSize: 10, color: "#64748B", lineHeight: 1.8 }}>
        <div><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: frozen, marginRight: 4, verticalAlign: "middle" }} />Frozen</div>
        {t.trainable?.length > 0 && <div><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: trained, marginRight: 4, verticalAlign: "middle" }} />Trained</div>}
        {t.lora && <div><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, border: `2px solid ${loraC}`, marginRight: 4, verticalAlign: "middle" }} />LoRA</div>}
        {t.adapters && <div><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: adapterC, marginRight: 4, verticalAlign: "middle" }} />Adapter</div>}
        {t.prefix && <div><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: prefixC, marginRight: 4, verticalAlign: "middle" }} />Prefix</div>}
        {t.quantized && <div style={{ color: "#10B981" }}>□ = 4-bit quantized</div>}
      </div>
    </div>
  );
}

export default function LLMTrainingGuide() {
  const [tab, setTab] = useState(tabs[0]);
  const [sel, setSel] = useState(null);
  const [awsSel, setAwsSel] = useState(null);
  const [cmpA, setCmpA] = useState("lora");
  const [cmpB, setCmpB] = useState("full");
  const [decStep, setDecStep] = useState(0);
  const [decResult, setDecResult] = useState(null);

  const t = sel ? techniques.find(x => x.id === sel) : null;
  const a = awsSel ? awsServices.find(x => x.id === awsSel) : null;

  const decisions = [
    { q: "Do you need the model to learn NEW knowledge or just adapt its behavior/format?", opts: [["New knowledge", 1], ["Behavior/format", 4]] },
    { q: "Does your data change frequently (weekly/monthly)?", opts: [["Yes, frequently", "rag"], ["No, relatively static", 2]] },
    { q: "How much compute budget do you have?", opts: [["Unlimited ($10K+)", "full"], ["Moderate ($100-1K)", 3], ["Minimal (<$100)", "qlora"]] },
    { q: "Do you need to fine-tune multiple tasks from one base model?", opts: [["Yes, multi-task", "lora"], ["No, single task", "lora"]] },
    { q: "What kind of adaptation?", opts: [["Tone/style/format", "prefix"], ["Task-specific behavior", "lora"], ["Human preference alignment", "rlhf"]] },
  ];

  const decResults = {
    rag: { name: "RAG (Knowledge Bases)", icon: "📚", color: "#3B82F6", tip: "Start with Bedrock Knowledge Bases. Index your docs, query with RAG. No training needed. If RAG isn't enough, THEN consider fine-tuning." },
    full: { name: "Full Fine-Tuning", icon: "🔥", color: "#EF4444", tip: "Use SageMaker with multi-GPU instances. Prepare large, high-quality datasets. Consider Bedrock fine-tuning if your base model is supported." },
    lora: { name: "LoRA", icon: "⚡", color: "#F59E0B", tip: "The sweet spot. Use SageMaker with PEFT library, or Bedrock if supported. Start with rank=16, alpha=32, target q_proj and v_proj modules." },
    qlora: { name: "QLoRA", icon: "🗜️", color: "#10B981", tip: "LoRA + 4-bit quantization. Fine-tune large models on a single GPU. Use SageMaker ml.g5.2xlarge (24GB) with bitsandbytes." },
    prefix: { name: "Prefix Tuning", icon: "🏷️", color: "#3B82F6", tip: "Minimal parameters to train. Great for style adaptation. Consider prompt engineering first — it might be enough!" },
    rlhf: { name: "RLHF / DPO", icon: "👥", color: "#EC4899", tip: "First do SFT (supervised fine-tuning with LoRA), then apply DPO on preference data. Use TRL library on SageMaker." },
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0F172A", color: "#E2E8F0", minHeight: "100vh", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #EF4444, #F59E0B, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
          LLM Training & Fine-Tuning
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 13, marginTop: 6 }}>LoRA, Adapters, RLHF, and AWS Bedrock/SageMaker strategies</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); setSel(null); setAwsSel(null); }}
            style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: tab === t ? "linear-gradient(135deg, #F59E0B, #EF4444)" : "#1E293B", color: tab === t ? "#fff" : "#94A3B8" }}>
            {t}
          </button>
        ))}
      </div>

      {/* ===== WHY FINE-TUNE ===== */}
      {tab === "Why Fine-Tune?" && (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ background: "#1E293B", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 6px", color: "#F1F5F9", fontSize: 18 }}>The Training Spectrum</h3>
            <p style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              Not every problem needs fine-tuning. Here's the progression from cheapest to most expensive:
            </p>
            <div style={{ display: "flex", gap: 4, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { l: "Prompt Engineering", c: "#22C55E", d: "Free" },
                { l: "Few-Shot Examples", c: "#3B82F6", d: "$" },
                { l: "RAG", c: "#8B5CF6", d: "$$" },
                { l: "LoRA / QLoRA", c: "#F59E0B", d: "$$$" },
                { l: "Full Fine-Tune", c: "#EF4444", d: "$$$$" },
                { l: "Pre-Training", c: "#DC2626", d: "$$$$$" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ background: `${s.c}22`, border: `1px solid ${s.c}44`, borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: s.c }}>{s.l}</div>
                    <div style={{ fontSize: 10, color: "#64748B" }}>{s.d}</div>
                  </div>
                  {i < 5 && <span style={{ color: "#334155" }}>→</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {whyReasons.map((r, i) => (
              <div key={i} style={{ background: "#1E293B", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>{r.desc}</div>
                  </div>
                </div>
                <div style={{ background: "#0F172A", borderRadius: 10, padding: 12, borderLeft: "3px solid #F59E0B" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", marginBottom: 2 }}>EXAMPLE</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}>{r.example}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TECHNIQUES ===== */}
      {tab === "Techniques" && !sel && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14, maxWidth: 1000, margin: "0 auto" }}>
          {techniques.map(t => (
            <div key={t.id} onClick={() => setSel(t.id)}
              style={{ background: "#1E293B", borderRadius: 14, padding: 18, cursor: "pointer", border: `1px solid ${t.color}22`, transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = t.color + "66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.color + "22"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <span style={{ fontSize: 28 }}>{t.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: diffColor[t.difficulty] + "22", color: diffColor[t.difficulty] }}>{t.difficulty}</span>
              </div>
              <h3 style={{ margin: "8px 0 4px", fontSize: 16, fontWeight: 700, color: t.color }}>{t.name}</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{t.tagline}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "#0F172A", color: "#64748B" }}>Params: {t.params}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "#0F172A", color: "#64748B" }}>VRAM: {t.vram}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Techniques" && sel && t && (
        <div style={{ maxWidth: 750, margin: "0 auto" }}>
          <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 14, padding: 0, marginBottom: 14 }}>← Back</button>
          <div style={{ background: "#1E293B", borderRadius: 18, padding: 24, border: `1px solid ${t.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 36 }}>{t.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.color }}>{t.name}</h2>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {[["Params", t.params], ["VRAM", t.vram], ["Speed", t.speed], ["Quality", t.quality]].map(([l, v]) => (
                    <span key={l} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "#0F172A", color: "#94A3B8" }}>{l}: {v}</span>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>{t.desc}</p>

            {t.math && (
              <pre style={{ background: "#0F172A", borderRadius: 10, padding: 14, margin: "12px 0", fontSize: 13, color: "#F59E0B", fontFamily: "'Fira Code', monospace", lineHeight: 1.6, borderLeft: `3px solid ${t.color}` }}>{t.math}</pre>
            )}

            <div style={{ background: "#0F172A", borderRadius: 12, padding: 14, margin: "12px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", marginBottom: 6 }}>LAYER VISUALIZATION</div>
              <LayerViz t={t.diagram} />
            </div>

            <div style={{ background: "#0F172A", borderRadius: 12, padding: 14, margin: "12px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>HOW TO DO IT</div>
              {t.how.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.color, minWidth: 18 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "12px 0" }}>
              <div style={{ background: "#0F172A", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", marginBottom: 6 }}>✅ PROS</div>
                {t.pros.map((p, i) => <div key={i} style={{ fontSize: 12, color: "#94A3B8", padding: "3px 0" }}>• {p}</div>)}
              </div>
              <div style={{ background: "#0F172A", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", marginBottom: 6 }}>⚠️ CONS</div>
                {t.cons.map((c, i) => <div key={i} style={{ fontSize: 12, color: "#94A3B8", padding: "3px 0" }}>• {c}</div>)}
              </div>
            </div>

            <div style={{ background: "#0F172A", borderRadius: 10, padding: 14, borderLeft: `3px solid ${t.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.color, marginBottom: 4 }}>WHEN TO USE</div>
              <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>{t.when}</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== AWS / BEDROCK ===== */}
      {tab === "AWS / Bedrock" && !awsSel && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, maxWidth: 900, margin: "0 auto" }}>
          {awsServices.map(s => (
            <div key={s.id} onClick={() => setAwsSel(s.id)}
              style={{ background: "#1E293B", borderRadius: 14, padding: 18, cursor: "pointer", border: `1px solid ${s.color}22`, transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = s.color + "66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = s.color + "22"}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: `${s.color}22`, color: s.color, fontWeight: 600 }}>{s.category}</span>
              </div>
              <h3 style={{ margin: "10px 0 4px", fontSize: 15, fontWeight: 700, color: s.color }}>{s.name}</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "AWS / Bedrock" && awsSel && a && (
        <div style={{ maxWidth: 750, margin: "0 auto" }}>
          <button onClick={() => setAwsSel(null)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 14, padding: 0, marginBottom: 14 }}>← Back</button>
          <div style={{ background: "#1E293B", borderRadius: 18, padding: 24, border: `1px solid ${a.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 36 }}>{a.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: a.color }}>{a.name}</h2>
                <span style={{ fontSize: 11, color: "#64748B" }}>{a.category}</span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>{a.desc}</p>

            <div style={{ background: "#0F172A", borderRadius: 12, padding: 14, margin: "14px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", marginBottom: 8 }}>KEY FEATURES</div>
              {a.features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: i < a.features.length - 1 ? "1px solid #1E293B" : "none" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: a.color, minWidth: 120 }}>{f.label}</span>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>{f.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#0F172A", borderRadius: 12, padding: 14, margin: "14px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>STEP-BY-STEP</div>
              {a.steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${a.color}22`, border: `1px solid ${a.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: a.color, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ margin: "14px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", marginBottom: 6 }}>CODE EXAMPLE</div>
              <pre style={{ background: "#0F172A", borderRadius: 10, padding: 14, margin: 0, fontSize: 11, color: "#CBD5E1", overflow: "auto", fontFamily: "'Fira Code', monospace", lineHeight: 1.5, borderLeft: `3px solid ${a.color}` }}>{a.code}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ===== COMPARE ===== */}
      {tab === "Compare" && (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            {[["A", cmpA, setCmpA], ["B", cmpB, setCmpB]].map(([label, val, setter]) => (
              <div key={label}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>Technique {label}</label>
                <select value={val} onChange={e => setter(e.target.value)}
                  style={{ background: "#1E293B", color: "#E2E8F0", border: "1px solid #334155", borderRadius: 10, padding: "8px 14px", fontSize: 13 }}>
                  {techniques.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                </select>
              </div>
            ))}
          </div>

          {(() => {
            const tA = techniques.find(x => x.id === cmpA);
            const tB = techniques.find(x => x.id === cmpB);
            const dims = [
              { label: "Compute Cost", fn: t => ({ full: 5, adapter: 3, lora: 2, qlora: 1, prefix: 1, rlhf: 5 })[t.id] || 3 },
              { label: "Parameter Efficiency", fn: t => ({ full: 1, adapter: 3, lora: 4, qlora: 4, prefix: 5, rlhf: 1 })[t.id] || 3 },
              { label: "Quality Ceiling", fn: t => ({ full: 5, adapter: 4, lora: 4, qlora: 4, prefix: 3, rlhf: 5 })[t.id] || 3 },
              { label: "Ease of Use", fn: t => ({ full: 1, adapter: 2, lora: 4, qlora: 4, prefix: 3, rlhf: 1 })[t.id] || 3 },
              { label: "Multi-Task Flexibility", fn: t => ({ full: 1, adapter: 4, lora: 5, qlora: 5, prefix: 4, rlhf: 1 })[t.id] || 3 },
              { label: "Inference Speed", fn: t => ({ full: 4, adapter: 3, lora: 5, qlora: 4, prefix: 3, rlhf: 4 })[t.id] || 3 },
            ];
            return (
              <div style={{ background: "#1E293B", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", gap: 0 }}>
                  <div style={{ padding: 10, fontWeight: 700, fontSize: 12, color: "#64748B" }}>Dimension</div>
                  <div style={{ padding: 10, fontWeight: 700, fontSize: 14, color: tA.color, textAlign: "center" }}>{tA.icon} {tA.name}</div>
                  <div style={{ padding: 10, fontWeight: 700, fontSize: 14, color: tB.color, textAlign: "center" }}>{tB.icon} {tB.name}</div>
                  {dims.map((d, i) => [
                    <div key={`l${i}`} style={{ padding: "12px 10px", fontSize: 12, fontWeight: 600, color: "#94A3B8", borderTop: "1px solid #334155" }}>{d.label}</div>,
                    ...[tA, tB].map((tech, j) => (
                      <div key={`${i}${j}`} style={{ padding: "12px 10px", borderTop: "1px solid #334155", display: "flex", justifyContent: "center" }}>
                        <div style={{ display: "flex", gap: 3 }}>
                          {[1,2,3,4,5].map(n => (
                            <div key={n} style={{ width: 22, height: 8, borderRadius: 4, background: n <= d.fn(tech) ? tech.color : "#334155", transition: "all .3s" }} />
                          ))}
                        </div>
                      </div>
                    ))
                  ])}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ===== DECISION GUIDE ===== */}
      {tab === "Decision Guide" && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {!decResult ? (
            <div style={{ background: "#1E293B", borderRadius: 18, padding: 28, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
                {decisions.map((_, i) => (
                  <div key={i} style={{ width: 30, height: 4, borderRadius: 2, background: i <= decStep ? "#F59E0B" : "#334155" }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#64748B" }}>Question {decStep + 1}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", margin: "12px 0 24px", lineHeight: 1.4 }}>{decisions[decStep].q}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400, margin: "0 auto" }}>
                {decisions[decStep].opts.map(([label, target], i) => (
                  <button key={i} onClick={() => typeof target === "string" ? setDecResult(target) : setDecStep(target)}
                    style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0", fontSize: 14, cursor: "pointer", transition: "all .2s", textAlign: "left" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#F59E0B"; e.currentTarget.style.background = "#F59E0B11"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.background = "#0F172A"; }}>
                    {label}
                  </button>
                ))}
              </div>
              {decStep > 0 && <button onClick={() => setDecStep(0)} style={{ marginTop: 16, background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 13 }}>← Start over</button>}
            </div>
          ) : (
            <div style={{ background: "#1E293B", borderRadius: 18, padding: 28, textAlign: "center", border: `1px solid ${decResults[decResult].color}44` }}>
              <span style={{ fontSize: 52 }}>{decResults[decResult].icon}</span>
              <h2 style={{ margin: "12px 0 8px", fontSize: 24, fontWeight: 800, color: decResults[decResult].color }}>{decResults[decResult].name}</h2>
              <p style={{ color: "#94A3B8", lineHeight: 1.7, fontSize: 14, maxWidth: 440, margin: "8px auto 20px" }}>{decResults[decResult].tip}</p>
              <button onClick={() => { setDecStep(0); setDecResult(null); }}
                style={{ background: `linear-gradient(135deg, ${decResults[decResult].color}, ${decResults[decResult].color}88)`, border: "none", color: "#fff", borderRadius: 12, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}