import { useState } from "react";

// ─── LINEAGE ENTITY DATA ───
const entities = [
  {
    id: "artifact",
    title: "Artifact",
    icon: "📦",
    color: "#3b82f6",
    bg: "#dbeafe",
    border: "#2563eb",
    desc: "A URI-addressable object or data — datasets, images, models",
    examples: ["S3 dataset URIs", "ECR container images", "model.tar.gz archives", "Feature Store groups"],
    keyProps: ["SourceUri (must be unique)", "ArtifactType (DataSet, Model, Image, Code)", "Properties (key-value metadata)", "MetadataProperties (CommitId, Repository, GeneratedBy)"],
    autoCreated: "Training inputs/outputs, processing I/O, container images, model packages",
  },
  {
    id: "action",
    title: "Action",
    icon: "⚙️",
    color: "#8b5cf6",
    bg: "#ede9fe",
    border: "#7c3aed",
    desc: "A computation, transformation, or job step",
    examples: ["Training jobs", "Processing jobs", "Model deployment", "Model package approval"],
    keyProps: ["ActionType (ModelTraining, ModelDeployment)", "Status (InProgress, Completed, Failed)", "Source (job ARN)", "Properties (hyperparams, config)"],
    autoCreated: "Model deployment actions, model package version creation",
  },
  {
    id: "context",
    title: "Context",
    icon: "🏗️",
    color: "#10b981",
    bg: "#d1fae5",
    border: "#059669",
    desc: "A logical grouping of other tracking entities",
    examples: ["Endpoints", "Model package groups", "Experiments", "Trials"],
    keyProps: ["ContextType (Endpoint, ModelPackageGroup)", "Source (endpoint/group ARN)", "Properties (environment, version)"],
    autoCreated: "Endpoints, model package groups, experiments, trials",
  },
  {
    id: "association",
    title: "Association",
    icon: "🔗",
    color: "#f59e0b",
    bg: "#fef3c7",
    border: "#d97706",
    desc: "A directed edge linking two entities in the lineage graph",
    examples: ["Data → Training (ContributedTo)", "Training → Model (Produced)", "Model → Endpoint (AssociatedWith)", "ModelV2 → ModelV1 (DerivedFrom)"],
    keyProps: ["SourceArn", "DestinationArn", "AssociationType (ContributedTo, Produced, DerivedFrom, AssociatedWith, SameAs)"],
    autoCreated: "All associations between auto-created entities",
  },
  {
    id: "trialcomponent",
    title: "TrialComponent",
    icon: "🧪",
    color: "#ef4444",
    bg: "#fee2e2",
    border: "#dc2626",
    desc: "Dual-purpose: part of Experiments AND the lineage graph",
    examples: ["Training job runs", "Processing job runs", "Transform job runs"],
    keyProps: ["Parameters (hyperparameters)", "InputArtifacts (datasets)", "OutputArtifacts (models)", "Metrics (accuracy, loss)"],
    autoCreated: "Every SageMaker training, processing, and transform job",
  },
];

// ─── ASSOCIATION TYPES ───
const associationTypes = [
  { type: "ContributedTo", icon: "➡️", color: "#3b82f6", desc: "Source contributed to destination", example: "Training data → Training job" },
  { type: "Produced", icon: "🔨", color: "#10b981", desc: "Source generated the destination", example: "Training job → Model artifact" },
  { type: "DerivedFrom", icon: "🔄", color: "#8b5cf6", desc: "Destination is derived from source", example: "Fine-tuned model → Base model" },
  { type: "AssociatedWith", icon: "🤝", color: "#f59e0b", desc: "General connection between entities", example: "Model → Endpoint" },
  { type: "SameAs", icon: "🪞", color: "#ef4444", desc: "Same entity across accounts", example: "Account A artifact → Account B artifact" },
];

// ─── AUTO-TRACKED ITEMS ───
const autoTracked = [
  {
    job: "Training Job",
    icon: "🏋️",
    color: "#3b82f6",
    creates: [
      "TrialComponent for the job",
      "Artifact for training algorithm image",
      "Artifact for each input channel (S3Uri)",
      "Artifact for model output location",
      "Artifact for managed spot checkpoint data",
      "All linking Associations",
    ],
  },
  {
    job: "Processing Job",
    icon: "⚙️",
    color: "#8b5cf6",
    creates: [
      "TrialComponent for the job",
      "Artifact for container image (ImageUri)",
      "Artifact for each processing input/output",
      "All linking Associations",
    ],
  },
  {
    job: "Transform Job",
    icon: "🔄",
    color: "#10b981",
    creates: [
      "TrialComponent for the job",
      "Artifact for input data source",
      "Artifact for transform results",
      "All linking Associations",
    ],
  },
  {
    job: "Model Package",
    icon: "📦",
    color: "#f59e0b",
    creates: [
      "Context for each model package group",
      "Artifact for each model package version",
      "Action for version creation",
      "Artifacts for container images & models",
      "All linking Associations",
    ],
  },
  {
    job: "Endpoint",
    icon: "🌐",
    color: "#ef4444",
    creates: [
      "Context for each endpoint",
      "Action for model deployment",
      "Artifact for each deployed model",
      "Artifact for model image & model package",
      "All linking Associations",
    ],
  },
];

// ─── ARCHITECTURE PATTERNS ───
const patterns = [
  {
    id: "pipeline",
    title: "Pipeline-Driven Full Automation",
    icon: "🚀",
    color: "#3b82f6",
    bg: "#dbeafe",
    border: "#2563eb",
    recommended: true,
    desc: "SageMaker Pipelines handles lineage creation end-to-end. Each step auto-creates lineage entities.",
    pros: ["Zero manual lineage code", "Complete DAG from data to deployment", "Built-in experiment tracking", "Reproducible via pipeline definition"],
    cons: ["Requires full pipeline adoption", "Custom artifacts need manual enrichment", "Limited to SageMaker-native jobs"],
    flow: [
      { label: "S3 Data Upload", type: "data" },
      { label: "EventBridge Rule", type: "trigger" },
      { label: "Lambda Trigger", type: "compute" },
      { label: "SageMaker Pipeline", type: "pipeline" },
      { label: "ProcessingStep", type: "step" },
      { label: "TrainingStep", type: "step" },
      { label: "EvaluationStep", type: "step" },
      { label: "RegisterModelStep", type: "step" },
      { label: "Full Lineage Graph", type: "output" },
    ],
    code: `from sagemaker.workflow.pipeline import Pipeline
from sagemaker.workflow.steps import ProcessingStep, TrainingStep
from sagemaker.workflow.step_collections import RegisterModel

processing_step = ProcessingStep(
    name="PreprocessData",
    processor=sklearn_processor,
    inputs=[...], outputs=[...]
)

training_step = TrainingStep(
    name="TrainModel",
    estimator=estimator,
    inputs={"train": processing_step.properties
        .ProcessingOutputConfig.Outputs["train"]
        .S3Output.S3Uri}
)

register_step = RegisterModel(
    name="RegisterModel",
    estimator=estimator,
    model_data=training_step.properties
        .ModelArtifacts.S3ModelArtifacts,
    model_package_group_name="MyModelGroup"
)

pipeline = Pipeline(
    name="MyMLPipeline",
    steps=[processing_step, training_step, register_step]
)
pipeline.upsert(role_arn=role)
execution = pipeline.start()`,
  },
  {
    id: "hybrid",
    title: "Hybrid (Pipeline + Manual Enrichment)",
    icon: "🔧",
    color: "#8b5cf6",
    bg: "#ede9fe",
    border: "#7c3aed",
    recommended: false,
    desc: "Use Pipelines for core ML steps, then manually add custom artifacts (Feature Store, Git commits, external data).",
    pros: ["Best of both worlds", "Tracks custom artifacts", "Full provenance chain", "Flexible for mixed workflows"],
    cons: ["Requires post-pipeline enrichment code", "More maintenance overhead", "Must keep enrichment in sync"],
    flow: [
      { label: "Pipeline Execution", type: "pipeline" },
      { label: "Auto Lineage Created", type: "output" },
      { label: "Post-Pipeline Lambda", type: "compute" },
      { label: "Create Custom Artifacts", type: "step" },
      { label: "Link Feature Store", type: "step" },
      { label: "Link Git Commits", type: "step" },
      { label: "Enriched Lineage Graph", type: "output" },
    ],
    code: `# After pipeline completes, enrich lineage
from sagemaker.lineage import artifact, association

# Create Feature Store artifact
feature_artifact = artifact.Artifact.create(
    artifact_name="fraud-features-v3",
    artifact_type="FeatureGroup",
    source_uri="arn:aws:sagemaker:us-east-1:123456:feature-group/fraud-features",
    properties={"version": "3", "feature_count": "45"}
)

# Create Git commit artifact
git_artifact = artifact.Artifact.create(
    artifact_name="training-code-commit",
    artifact_type="CodeRepository",
    source_uri="https://github.com/org/repo/commit/abc123",
    properties={"branch": "main", "commit_hash": "abc123"}
)

# Link to training job's trial component
association.Association.create(
    source_arn=feature_artifact.artifact_arn,
    destination_arn=trial_component_arn,
    association_type="ContributedTo"
)
association.Association.create(
    source_arn=git_artifact.artifact_arn,
    destination_arn=trial_component_arn,
    association_type="ContributedTo"
)`,
  },
  {
    id: "manual",
    title: "Fully Manual Lineage",
    icon: "✍️",
    color: "#10b981",
    bg: "#d1fae5",
    border: "#059669",
    recommended: false,
    desc: "For non-SageMaker training (EKS, on-premise, other frameworks). Build the entire lineage graph yourself.",
    pros: ["Works with any ML platform", "Complete control over graph structure", "Can represent any workflow"],
    cons: ["Most code to write", "Must handle all entity creation", "Subject to manual entity limits (6K artifacts, 3K actions, 500 contexts)"],
    flow: [
      { label: "Create Dataset Artifact", type: "step" },
      { label: "Create Code Artifact", type: "step" },
      { label: "Create Training Action", type: "step" },
      { label: "Create Model Artifact", type: "step" },
      { label: "Wire Associations", type: "step" },
      { label: "Query Lineage Graph", type: "output" },
    ],
    code: `import boto3

sm = boto3.client("sagemaker")

# 1. Create dataset artifact
dataset = sm.create_artifact(
    ArtifactName="my-dataset-v1",
    Source={"SourceUri": "s3://bucket/data/train.csv"},
    ArtifactType="DataSet",
    Properties={"format": "csv", "rows": "10000"}
)

# 2. Create training action
training = sm.create_action(
    ActionName="training-run-001",
    Source={"SourceUri": "arn:aws:eks:...:job/train-001"},
    ActionType="ModelTraining",
    Status="Completed",
    Properties={"epochs": "100", "lr": "0.001"}
)

# 3. Create model artifact
model = sm.create_artifact(
    ArtifactName="model-v1",
    Source={"SourceUri": "s3://bucket/models/model.tar.gz"},
    ArtifactType="Model",
    Properties={"accuracy": "0.95"}
)

# 4. Wire associations
sm.add_association(
    SourceArn=dataset["ArtifactArn"],
    DestinationArn=training["ActionArn"],
    AssociationType="ContributedTo"
)
sm.add_association(
    SourceArn=training["ActionArn"],
    DestinationArn=model["ArtifactArn"],
    AssociationType="Produced"
)`,
  },
];

// ─── QUERY EXAMPLES ───
const queryExamples = [
  {
    title: "Find all datasets behind an endpoint",
    icon: "🔍",
    desc: "Traverse ascendants from endpoint to discover training data",
    code: `from sagemaker.lineage.query import (
    LineageQuery, LineageFilter,
    LineageEntityEnum, LineageSourceEnum,
    LineageQueryDirectionEnum
)
from sagemaker.lineage.context import EndpointContext

endpoint = EndpointContext.load(
    context_name="my-prod-endpoint"
)

query_filter = LineageFilter(
    entities=[LineageEntityEnum.ARTIFACT],
    sources=[LineageSourceEnum.DATASET]
)

result = LineageQuery(session).query(
    start_arns=[endpoint.context_arn],
    query_filter=query_filter,
    direction=LineageQueryDirectionEnum.ASCENDANTS,
    include_edges=False
)

for vertex in result.vertices:
    ds = vertex.to_lineage_object()
    print(f"Dataset: {ds.source.source_uri}")`,
  },
  {
    title: "Audit a model's full provenance",
    icon: "📋",
    desc: "Generate a compliance report: datasets, jobs, endpoints",
    code: `from sagemaker.lineage.artifact import ModelArtifact

model = ModelArtifact.load(artifact_arn="arn:...")

# Upstream: what trained this model?
datasets = model.dataset_artifacts()
for ds in datasets:
    print(f"Data: {ds.source.source_uri}")

# Downstream: where is this model deployed?
endpoints = model.endpoint_contexts()
for ep in endpoints:
    print(f"Endpoint: {ep.source.source_uri}")`,
  },
  {
    title: "Low-level boto3 query_lineage",
    icon: "🛠️",
    desc: "Direct API call with filters and depth control",
    code: `import boto3

sm = boto3.client("sagemaker")

response = sm.query_lineage(
    StartArns=["arn:aws:sagemaker:...:artifact/..."],
    Direction="Ascendants",
    IncludeEdges=True,
    Filters={
        "Types": ["DataSet"],
        "LineageTypes": ["Artifact"]
    },
    MaxDepth=10,
    MaxResults=50
)

for v in response["Vertices"]:
    print(f"Entity: {v['Arn']}")
    print(f"  Type: {v.get('Type')}")

for e in response.get("Edges", []):
    print(f"{e['SourceArn']}")
    print(f"  --{e['AssociationType']}-->")
    print(f"  {e['DestinationArn']}")`,
  },
  {
    title: "Visualize lineage as a table",
    icon: "📊",
    desc: "Use the SDK's LineageTableVisualizer for pandas DataFrames",
    code: `from sagemaker.lineage.visualizer import (
    LineageTableVisualizer
)

viz = LineageTableVisualizer(sagemaker_session)

# Returns a pandas DataFrame
df = viz.show(
    trial_component_name="my-training-job"
)
print(df.to_string())`,
  },
];

// ─── LIMITS DATA ───
const limits = [
  { entity: "Artifacts (manual)", limit: "6,000", icon: "📦" },
  { entity: "Actions (manual)", limit: "3,000", icon: "⚙️" },
  { entity: "Contexts (manual)", limit: "500", icon: "🏗️" },
  { entity: "Associations (manual)", limit: "6,000", icon: "🔗" },
  { entity: "Auto-created entities", limit: "Unlimited", icon: "♾️" },
  { entity: "QueryLineage MaxDepth", limit: "10", icon: "📏" },
  { entity: "QueryLineage MaxResults", limit: "50/page", icon: "📄" },
  { entity: "QueryLineage StartArns", limit: "1 ARN", icon: "🎯" },
];

// ═══════════════════════════════════════════
// ─── BEDROCK MODEL EVALUATION DATA ───
// ═══════════════════════════════════════════

const evalTypes = [
  {
    id: "automatic",
    title: "Automatic (Algorithmic)",
    icon: "🤖",
    color: "#3b82f6",
    bg: "#dbeafe",
    border: "#2563eb",
    desc: "Uses built-in or custom datasets with algorithmic metrics. Fully automated — no human involvement.",
    how: "Computes BERTScore, F1, classification accuracy, toxicity (Detoxify), and semantic robustness automatically.",
    bestFor: "Quick, repeatable benchmarking against standard NLP tasks",
    cost: "Free scoring — you only pay for model inference",
  },
  {
    id: "judge",
    title: "LLM-as-a-Judge",
    icon: "⚖️",
    color: "#8b5cf6",
    bg: "#ede9fe",
    border: "#7c3aed",
    desc: "A second LLM (evaluator/judge) scores the generator model's responses with explanations.",
    how: "11 built-in metrics plus custom metrics. Judge models: Claude 3.5/3.7, Nova Pro, Llama 3.1, Mistral Large.",
    bestFor: "Nuanced quality assessment with explanations — correctness, helpfulness, faithfulness, harmfulness",
    cost: "Pay for both generator and evaluator model inference",
  },
  {
    id: "human",
    title: "Human-Based",
    icon: "👥",
    color: "#10b981",
    bg: "#d1fae5",
    border: "#059669",
    desc: "Private work team (up to 50 workers via SageMaker Ground Truth) rates model responses.",
    how: "Workers use thumbs up/down, Likert scales, comparison choices, or ordinal ranking.",
    bestFor: "Subjective metrics like brand voice, style, friendliness — things algorithms can't judge",
    cost: "Model inference + $0.21 per completed human task",
  },
  {
    id: "rag",
    title: "RAG Evaluation",
    icon: "📚",
    color: "#f59e0b",
    bg: "#fef3c7",
    border: "#d97706",
    desc: "Evaluates retrieval quality and end-to-end retrieve-and-generate quality for Knowledge Bases.",
    how: "Retrieve-only: context relevance + coverage. Retrieve-and-generate: all 11 judge metrics + faithfulness.",
    bestFor: "Validating RAG pipelines before production — are retrieved contexts relevant and complete?",
    cost: "Pay for model inference (judge model for RAG metrics)",
  },
];

// ─── AUTOMATIC METRICS ───
const autoMetrics = [
  {
    metric: "Builtin.Accuracy",
    category: "Quality",
    color: "#3b82f6",
    desc: "Factual correctness — algorithm varies by task type",
    details: [
      { task: "Text Summarization", algo: "BERTScore", note: "Cosine similarity of BERT embeddings" },
      { task: "Question & Answer", algo: "F1 Score", note: "Token-level F1 between generated and ground truth" },
      { task: "Text Classification", algo: "Classification Accuracy", note: "Binary match: predicted vs ground truth" },
      { task: "General Text Generation", algo: "RWK Score", note: "Real World Knowledge encoding ability" },
    ],
  },
  {
    metric: "Builtin.Robustness",
    category: "Stability",
    color: "#f59e0b",
    desc: "Output stability under input perturbation (lower = better)",
    details: [
      { task: "Perturbation", algo: "5 methods applied", note: "Lowercase, typos, numbers-to-words, random case, whitespace" },
      { task: "Summarization", algo: "Delta BERTScore / BERTScore x 100", note: "% degradation in BERTScore" },
      { task: "Q&A", algo: "Delta F1 / F1 x 100", note: "% degradation in F1" },
      { task: "Classification", algo: "Delta Acc / Acc x 100", note: "% degradation in accuracy" },
    ],
  },
  {
    metric: "Builtin.Toxicity",
    category: "Safety",
    color: "#ef4444",
    desc: "Toxic content detection using Detoxify algorithm (lower = better)",
    details: [
      { task: "All task types", algo: "Detoxify", note: "0-1 scale toxicity score on generated output" },
    ],
  },
];

// ─── JUDGE METRICS (11 built-in) ───
const judgeMetrics = [
  { metric: "Correctness", cat: "Quality", color: "#3b82f6", desc: "Is the response factually correct? Uses reference response if supplied." },
  { metric: "Completeness", cat: "Quality", color: "#3b82f6", desc: "Does the response fully answer all aspects of the prompt?" },
  { metric: "Faithfulness", cat: "Quality", color: "#3b82f6", desc: "Does the response contain only information found in the provided context? (hallucination detection)" },
  { metric: "Helpfulness", cat: "User Experience", color: "#10b981", desc: "Instruction adherence, sensibility, coherence, and anticipation of implicit needs." },
  { metric: "Coherence", cat: "User Experience", color: "#10b981", desc: "Logical gaps, inconsistencies, and contradictions in the response." },
  { metric: "Relevance", cat: "User Experience", color: "#10b981", desc: "How relevant the answer is to the prompt." },
  { metric: "FollowingInstructions", cat: "Compliance", color: "#8b5cf6", desc: "How well the response follows exact directions in the prompt." },
  { metric: "ProfessionalStyleAndTone", cat: "Compliance", color: "#8b5cf6", desc: "Appropriateness of style, formatting, and tone for professional settings." },
  { metric: "Harmfulness", cat: "Responsible AI", color: "#ef4444", desc: "Whether the response contains harmful content." },
  { metric: "Stereotyping", cat: "Responsible AI", color: "#ef4444", desc: "Whether content contains stereotypes (positive or negative)." },
  { metric: "Refusal", cat: "Responsible AI", color: "#ef4444", desc: "Whether the response declines to answer or rejects the request." },
];

// ─── TASK TYPES & BUILT-IN DATASETS ───
const taskTypes = [
  {
    task: "General Text Generation",
    apiValue: "Generation",
    color: "#3b82f6",
    datasets: ["Builtin.T-Rex", "Builtin.Bold", "Builtin.Wikitext2", "Builtin.RealToxicityPrompts"],
    metrics: ["Accuracy (RWK)", "Robustness", "Toxicity"],
  },
  {
    task: "Text Summarization",
    apiValue: "Summarization",
    color: "#8b5cf6",
    datasets: ["Builtin.Gigaword"],
    metrics: ["Accuracy (BERTScore)", "Robustness", "Toxicity"],
  },
  {
    task: "Question & Answer",
    apiValue: "QuestionAndAnswer",
    color: "#10b981",
    datasets: ["Builtin.BoolQ", "Builtin.NaturalQuestions", "Builtin.TriviaQA"],
    metrics: ["Accuracy (F1)", "Robustness", "Toxicity"],
  },
  {
    task: "Text Classification",
    apiValue: "Classification",
    color: "#f59e0b",
    datasets: ["Builtin.WomensEcommerceClothingReviews"],
    metrics: ["Accuracy (ClassAcc)", "Robustness"],
  },
];

// ─── EVAL LIMITS ───
const evalLimits = [
  { item: "Concurrent auto eval jobs", limit: "20/region", icon: "🤖" },
  { item: "Concurrent human eval jobs", limit: "10/region", icon: "👥" },
  { item: "Total eval jobs", limit: "5,000/account", icon: "📊" },
  { item: "Datasets per auto job", limit: "5", icon: "📁" },
  { item: "Metrics per dataset", limit: "3", icon: "📏" },
  { item: "Models per auto job", limit: "1", icon: "🤖" },
  { item: "Prompts per dataset", limit: "1,000", icon: "💬" },
  { item: "Max prompt size", limit: "4 KB", icon: "📐" },
];

// ─── COMBINED QUIZ DATA ───
const quizData = [
  // Lineage questions
  { q: "Which lineage entity represents a URI-addressable object like an S3 dataset?", opts: ["Action", "Artifact", "Context", "Association"], ans: "Artifact" },
  { q: "What association type means 'source generated the destination'?", opts: ["ContributedTo", "Produced", "DerivedFrom", "AssociatedWith"], ans: "Produced" },
  { q: "Which entity provides logical grouping (e.g., Endpoints, Experiments)?", opts: ["Artifact", "Action", "Context", "TrialComponent"], ans: "Context" },
  { q: "What is the maximum depth for QueryLineage traversal?", opts: ["5", "10", "20", "50"], ans: "10" },
  { q: "How many manually-created Artifacts can you have per account/region?", opts: ["500", "3,000", "6,000", "Unlimited"], ans: "6,000" },
  { q: "Which pattern is recommended for full lineage automation?", opts: ["Manual boto3 calls", "Pipeline-Driven", "Hybrid", "CloudFormation"], ans: "Pipeline-Driven" },
  { q: "What does SageMaker auto-create for a Training Job?", opts: ["Only a Model artifact", "TrialComponent + Artifacts + Associations", "Only an Action", "Nothing — all manual"], ans: "TrialComponent + Artifacts + Associations" },
  { q: "Which direction finds what LED TO a given entity?", opts: ["Descendants", "Ascendants", "Both", "Lateral"], ans: "Ascendants" },
  { q: "What is the cross-account association type for the same entity?", opts: ["ContributedTo", "AssociatedWith", "DerivedFrom", "SameAs"], ans: "SameAs" },
  // Bedrock Evaluation questions
  { q: "Which algorithm does Bedrock use for Text Summarization accuracy?", opts: ["F1 Score", "BERTScore", "BLEU", "Classification Accuracy"], ans: "BERTScore" },
  { q: "What is the max number of prompts per Bedrock evaluation dataset?", opts: ["100", "500", "1,000", "10,000"], ans: "1,000" },
  { q: "Which Bedrock evaluation type uses a second LLM to score responses?", opts: ["Automatic", "LLM-as-a-Judge", "Human-Based", "RAG Evaluation"], ans: "LLM-as-a-Judge" },
  { q: "How many built-in judge metrics does Bedrock provide?", opts: ["3", "5", "11", "15"], ans: "11" },
  { q: "What algorithm does Bedrock use for toxicity detection?", opts: ["BERTScore", "Detoxify", "F1 Score", "ROUGE"], ans: "Detoxify" },
  { q: "What is the cost of algorithmic scoring in automatic evaluation?", opts: ["$0.21/task", "$0.01/prompt", "Free (pay inference only)", "$1.00/job"], ans: "Free (pay inference only)" },
  { q: "Which Bedrock eval metric detects hallucination in RAG responses?", opts: ["Correctness", "Faithfulness", "Relevance", "Completeness"], ans: "Faithfulness" },
  { q: "How many models can you evaluate per automatic evaluation job?", opts: ["1", "2", "5", "10"], ans: "1" },
];

// ─── COMPONENTS ───
const QuizCard = ({ q, opts, ans }) => {
  const [show, setShow] = useState(false);
  const [picked, setPicked] = useState(null);
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "2px solid #e2e8f0", padding: 16, marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 }}>{q}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map(o => {
          const isCorrect = o === ans;
          const bg = picked === null ? "#f1f5f9" : isCorrect ? "#d1fae5" : picked === o ? "#fee2e2" : "#f1f5f9";
          const border = picked === null ? "#cbd5e1" : isCorrect ? "#10b981" : picked === o ? "#ef4444" : "#cbd5e1";
          return (
            <button key={o} onClick={() => { setPicked(o); setShow(true); }}
              style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${border}`, background: bg, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>
              {o}
            </button>
          );
        })}
      </div>
      {show && <div style={{ marginTop: 8, fontSize: 13, color: picked === ans ? "#059669" : "#dc2626", fontWeight: 600 }}>
        {picked === ans ? "Correct!" : `Answer: ${ans}`}
      </div>}
    </div>
  );
};

const CodeBlock = ({ code }) => (
  <div style={{ background: "#0f172a", borderRadius: 10, padding: 14, fontSize: 12, fontFamily: "'Fira Code', 'Cascadia Code', monospace", color: "#a5b4fc", overflowX: "auto", lineHeight: 1.6, whiteSpace: "pre", marginTop: 8 }}>
    {code}
  </div>
);

// ─── LINEAGE GRAPH SVG ───
const LineageGraphSVG = ({ highlightNode, onNodeClick }) => {
  const nodes = [
    { id: "dataset1", label: "Training\nDataset", x: 60, y: 50, type: "artifact", icon: "📦" },
    { id: "dataset2", label: "Validation\nDataset", x: 60, y: 140, type: "artifact", icon: "📦" },
    { id: "image", label: "Container\nImage", x: 60, y: 230, type: "artifact", icon: "🐳" },
    { id: "code", label: "Training\nCode", x: 60, y: 320, type: "artifact", icon: "💻" },
    { id: "training", label: "Training\nJob", x: 300, y: 140, type: "trialcomponent", icon: "🧪" },
    { id: "model", label: "Model\nArtifact", x: 530, y: 140, type: "artifact", icon: "🤖" },
    { id: "metrics", label: "Metrics\n(acc: 0.95)", x: 300, y: 320, type: "action", icon: "📊" },
    { id: "register", label: "Register\nModel", x: 530, y: 300, type: "action", icon: "📝" },
    { id: "package", label: "Model\nPackage", x: 720, y: 220, type: "context", icon: "📦" },
    { id: "endpoint", label: "Production\nEndpoint", x: 720, y: 80, type: "context", icon: "🌐" },
  ];
  const edges = [
    { from: "dataset1", to: "training", type: "ContributedTo" },
    { from: "dataset2", to: "training", type: "ContributedTo" },
    { from: "image", to: "training", type: "ContributedTo" },
    { from: "code", to: "training", type: "ContributedTo" },
    { from: "training", to: "model", type: "Produced" },
    { from: "training", to: "metrics", type: "Produced" },
    { from: "model", to: "register", type: "AssociatedWith" },
    { from: "register", to: "package", type: "Produced" },
    { from: "model", to: "endpoint", type: "AssociatedWith" },
  ];
  const typeColors = {
    artifact: { fill: "#dbeafe", stroke: "#2563eb", text: "#1e40af" },
    trialcomponent: { fill: "#fee2e2", stroke: "#dc2626", text: "#991b1b" },
    action: { fill: "#ede9fe", stroke: "#7c3aed", text: "#5b21b6" },
    context: { fill: "#d1fae5", stroke: "#059669", text: "#065f46" },
  };
  const edgeColors = {
    ContributedTo: "#3b82f6",
    Produced: "#10b981",
    AssociatedWith: "#f59e0b",
  };
  const nodeW = 110, nodeH = 56;
  return (
    <svg viewBox="0 0 840 380" style={{ width: "100%", maxWidth: 840, display: "block", margin: "0 auto" }}>
      <defs>
        {Object.entries(edgeColors).map(([type, color]) => (
          <marker key={type} id={`arrow-${type}`} viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" fill={color} />
          </marker>
        ))}
      </defs>
      {edges.map((e, i) => {
        const from = nodes.find(n => n.id === e.from);
        const to = nodes.find(n => n.id === e.to);
        const x1 = from.x + nodeW / 2, y1 = from.y + nodeH / 2;
        const x2 = to.x + nodeW / 2, y2 = to.y + nodeH / 2;
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len, uy = dy / len;
        const sx = x1 + ux * (nodeW / 2 + 2), sy = y1 + uy * (nodeH / 2 + 2);
        const ex = x2 - ux * (nodeW / 2 + 10), ey = y2 - uy * (nodeH / 2 + 10);
        return (
          <g key={i}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={edgeColors[e.type]} strokeWidth={2} markerEnd={`url(#arrow-${e.type})`} opacity={0.7} />
            <text x={(sx + ex) / 2} y={(sy + ey) / 2 - 6} textAnchor="middle" fontSize={8} fill={edgeColors[e.type]} fontWeight="600">{e.type}</text>
          </g>
        );
      })}
      {nodes.map(n => {
        const c = typeColors[n.type];
        const isHighlighted = highlightNode === n.id;
        const lines = n.label.split("\n");
        return (
          <g key={n.id} onClick={() => onNodeClick && onNodeClick(n.id)} style={{ cursor: "pointer" }}>
            <rect x={n.x} y={n.y} width={nodeW} height={nodeH} rx={10} ry={10}
              fill={isHighlighted ? c.stroke : c.fill} stroke={c.stroke} strokeWidth={isHighlighted ? 3 : 1.5}
              opacity={isHighlighted ? 1 : 0.9} />
            <text x={n.x + 16} y={n.y + (lines.length === 1 ? 33 : 23)} fontSize={10} fill={isHighlighted ? "#fff" : c.text} fontWeight="700">
              {n.icon} {lines[0]}
            </text>
            {lines[1] && (
              <text x={n.x + 20} y={n.y + 40} fontSize={10} fill={isHighlighted ? "#e2e8f0" : c.text} fontWeight="600">
                {lines[1]}
              </text>
            )}
          </g>
        );
      })}
      {/* Legend */}
      <g transform="translate(10, 360)">
        {[
          { label: "Artifact", color: "#2563eb", fill: "#dbeafe" },
          { label: "TrialComponent", color: "#dc2626", fill: "#fee2e2" },
          { label: "Action", color: "#7c3aed", fill: "#ede9fe" },
          { label: "Context", color: "#059669", fill: "#d1fae5" },
        ].map((l, i) => (
          <g key={l.label} transform={`translate(${i * 160}, 0)`}>
            <rect width={12} height={12} rx={3} fill={l.fill} stroke={l.color} strokeWidth={1.5} />
            <text x={16} y={10} fontSize={9} fill="#64748b" fontWeight="600">{l.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

// ─── FLOW DIAGRAM ───
const FlowDiagram = ({ steps }) => {
  const typeColors = {
    data: { bg: "#dbeafe", border: "#2563eb", text: "#1e40af" },
    trigger: { bg: "#fef3c7", border: "#d97706", text: "#92400e" },
    compute: { bg: "#ede9fe", border: "#7c3aed", text: "#5b21b6" },
    pipeline: { bg: "#0f172a", border: "#0f172a", text: "#fff" },
    step: { bg: "#d1fae5", border: "#059669", text: "#065f46" },
    output: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center", justifyContent: "center", margin: "12px 0" }}>
      {steps.map((s, i) => {
        const c = typeColors[s.type] || typeColors.step;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, color: c.text, textAlign: "center", minWidth: 70 }}>
              {s.label}
            </div>
            {i < steps.length - 1 && <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 700 }}>→</span>}
          </div>
        );
      })}
    </div>
  );
};

// ─── EVALUATION ARCHITECTURE SVG ───
const EvalArchSVG = () => {
  const boxes = [
    { x: 20, y: 20, w: 140, h: 50, label: "Prompt Dataset", sub: "(S3 JSONL)", fill: "#dbeafe", stroke: "#2563eb", text: "#1e40af" },
    { x: 20, y: 100, w: 140, h: 50, label: "Generator Model", sub: "(Bedrock FM)", fill: "#ede9fe", stroke: "#7c3aed", text: "#5b21b6" },
    { x: 240, y: 20, w: 160, h: 50, label: "Inference Phase", sub: "Model generates responses", fill: "#fef3c7", stroke: "#d97706", text: "#92400e" },
    { x: 240, y: 100, w: 160, h: 50, label: "Evaluation Phase", sub: "Score each response", fill: "#d1fae5", stroke: "#059669", text: "#065f46" },
    { x: 480, y: 20, w: 150, h: 50, label: "Automatic", sub: "BERTScore/F1/Detoxify", fill: "#dbeafe", stroke: "#2563eb", text: "#1e40af" },
    { x: 480, y: 80, w: 150, h: 50, label: "LLM-as-a-Judge", sub: "11 built-in metrics", fill: "#ede9fe", stroke: "#7c3aed", text: "#5b21b6" },
    { x: 480, y: 140, w: 150, h: 50, label: "Human Workers", sub: "Ground Truth team", fill: "#d1fae5", stroke: "#059669", text: "#065f46" },
    { x: 700, y: 75, w: 140, h: 55, label: "Results (S3)", sub: "JSONL + Console Report", fill: "#0f172a", stroke: "#0f172a", text: "#fff" },
  ];
  return (
    <svg viewBox="0 0 860 210" style={{ width: "100%", maxWidth: 860, display: "block", margin: "0 auto" }}>
      <defs>
        <marker id="eval-arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
      </defs>
      {/* Arrows */}
      <line x1="160" y1="45" x2="235" y2="45" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#eval-arrow)" />
      <line x1="160" y1="125" x2="235" y2="125" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#eval-arrow)" />
      <line x1="400" y1="45" x2="475" y2="45" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#eval-arrow)" />
      <line x1="400" y1="125" x2="475" y2="105" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#eval-arrow)" />
      <line x1="400" y1="125" x2="475" y2="165" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#eval-arrow)" />
      <line x1="630" y1="45" x2="695" y2="90" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#eval-arrow)" />
      <line x1="630" y1="105" x2="695" y2="100" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#eval-arrow)" />
      <line x1="630" y1="165" x2="695" y2="110" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#eval-arrow)" />
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} fill={b.fill} stroke={b.stroke} strokeWidth={1.5} />
          <text x={b.x + b.w / 2} y={b.y + 20} textAnchor="middle" fontSize={10} fill={b.text} fontWeight="700">{b.label}</text>
          <text x={b.x + b.w / 2} y={b.y + 36} textAnchor="middle" fontSize={8} fill={b.text} opacity={0.7}>{b.sub}</text>
        </g>
      ))}
    </svg>
  );
};

// ─── MAIN COMPONENT ───
export default function SageMakerLineage() {
  const [tab, setTab] = useState("graph");
  const [expandedEntity, setExpandedEntity] = useState(null);
  const [expandedPattern, setExpandedPattern] = useState(null);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [graphHighlight, setGraphHighlight] = useState(null);
  const [showAutoDetails, setShowAutoDetails] = useState(null);
  const [expandedAutoMetric, setExpandedAutoMetric] = useState(null);
  const [expandedEvalType, setExpandedEvalType] = useState(null);

  const tabs = [
    ["graph", "Lineage Graph"],
    ["entities", "Entities"],
    ["auto", "Auto-Tracking"],
    ["patterns", "Architecture"],
    ["queries", "Query & Audit"],
    ["evalOverview", "Eval Overview"],
    ["evalMetrics", "Eval Metrics"],
    ["evalAPI", "Eval API"],
    ["limits", "Limits"],
    ["quiz", "Quiz"],
  ];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 920, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, textAlign: "center" }}>
        SageMaker Lineage & Bedrock Model Evaluation
      </h1>
      <p style={{ color: "#64748b", textAlign: "center", margin: "4px 0 20px", fontSize: 14 }}>
        ML provenance tracking & model quality assessment across the lifecycle
      </p>

      {/* Tab Nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: "10px 16px", borderRadius: 10, border: `2px solid ${tab === k ? "#2563eb" : "#e2e8f0"}`, background: tab === k ? "#dbeafe" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12, color: tab === k ? "#1d4ed8" : "#64748b" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ─── LINEAGE GRAPH TAB ─── */}
      {tab === "graph" && (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #e2e8f0", padding: 16, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Interactive Lineage DAG</h3>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>Click any node to highlight it. This shows a typical ML pipeline lineage graph.</p>
            <LineageGraphSVG highlightNode={graphHighlight} onNodeClick={(id) => setGraphHighlight(graphHighlight === id ? null : id)} />
          </div>

          {/* Concept summary */}
          <div style={{ background: "#fff", borderRadius: 14, border: "2px solid #e2e8f0", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>How It Works</h3>
            <div style={{ fontSize: 13, lineHeight: 2, color: "#334155" }}>
              <div><strong>What is ML Lineage?</strong> A directed acyclic graph (DAG) that records every step of your ML workflow — from raw data to production endpoint.</div>
              <div><strong>Why automate it?</strong> Reproducibility, compliance auditing, debugging model drift, and answering "what data trained the model serving customer X?"</div>
              <div><strong>SageMaker's approach:</strong> Automatically creates lineage entities (Artifacts, Actions, Contexts) and wires them together with Associations whenever you run training, processing, or deployment jobs.</div>
            </div>
          </div>

          {/* Direction explanation */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 16 }}>
            <div style={{ background: "#dbeafe", borderRadius: 12, border: "2px solid #2563eb", padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#1e40af", marginBottom: 6 }}>Ascendants</div>
              <div style={{ fontSize: 12, color: "#1e3a5f", lineHeight: 1.6 }}>Traverse backward to find what LED TO this entity. From Model → find Datasets, Code, Images that produced it.</div>
            </div>
            <div style={{ background: "#d1fae5", borderRadius: 12, border: "2px solid #059669", padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#065f46", marginBottom: 6 }}>Descendants</div>
              <div style={{ fontSize: 12, color: "#064e3b", lineHeight: 1.6 }}>Traverse forward to find what this entity PRODUCED. From Dataset → find Models and Endpoints using it.</div>
            </div>
            <div style={{ background: "#fef3c7", borderRadius: 12, border: "2px solid #d97706", padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#92400e", marginBottom: 6 }}>Both</div>
              <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6 }}>Traverse in both directions to see the complete graph around a focal entity — full upstream and downstream.</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ENTITIES TAB ─── */}
      {tab === "entities" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12, marginBottom: 20 }}>
            {entities.map(e => (
              <div key={e.id} onClick={() => setExpandedEntity(expandedEntity === e.id ? null : e.id)}
                style={{ background: e.bg, border: `2px solid ${e.border}`, borderRadius: 14, padding: 16, cursor: "pointer", transition: "transform 0.15s", transform: expandedEntity === e.id ? "scale(1.02)" : "scale(1)" }}>
                <div style={{ fontSize: 28, textAlign: "center" }}>{e.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: e.border, textAlign: "center", marginTop: 4 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", margin: "4px 0 8px" }}>{e.desc}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                  {e.examples.slice(0, 3).map(ex => (
                    <span key={ex} style={{ background: "#fff", border: `1px solid ${e.color}`, borderRadius: 6, padding: "2px 8px", fontSize: 10, color: e.border, fontWeight: 600 }}>{ex}</span>
                  ))}
                </div>
                {expandedEntity === e.id && (
                  <div style={{ marginTop: 12, borderTop: `2px dashed ${e.color}`, paddingTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: e.border, marginBottom: 6 }}>Key Properties</div>
                    {e.keyProps.map(p => (
                      <div key={p} style={{ fontSize: 11, color: "#334155", lineHeight: 1.8, paddingLeft: 8, borderLeft: `2px solid ${e.color}`, marginBottom: 2 }}>{p}</div>
                    ))}
                    <div style={{ fontSize: 12, fontWeight: 700, color: e.border, marginTop: 10, marginBottom: 4 }}>Auto-Created For</div>
                    <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}>{e.autoCreated}</div>
                  </div>
                )}
                <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#94a3b8" }}>
                  {expandedEntity === e.id ? "tap to collapse" : "tap for details"}
                </div>
              </div>
            ))}
          </div>

          {/* Association Types Table */}
          <div style={{ background: "#fff", borderRadius: 14, border: "2px solid #e2e8f0", padding: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Association Types (Edge Labels)</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#0f172a", color: "#fff" }}>
                    <th style={{ padding: 10, textAlign: "left", borderRadius: "8px 0 0 0" }}>Type</th>
                    <th style={{ padding: 10, textAlign: "left" }}>Meaning</th>
                    <th style={{ padding: 10, textAlign: "left", borderRadius: "0 8px 0 0" }}>Example</th>
                  </tr>
                </thead>
                <tbody>
                  {associationTypes.map((a, i) => (
                    <tr key={a.type} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                      <td style={{ padding: 10, fontWeight: 700, color: a.color, borderBottom: "1px solid #e2e8f0" }}>{a.icon} {a.type}</td>
                      <td style={{ padding: 10, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>{a.desc}</td>
                      <td style={{ padding: 10, color: "#64748b", borderBottom: "1px solid #e2e8f0", fontStyle: "italic" }}>{a.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── AUTO-TRACKING TAB ─── */}
      {tab === "auto" && (
        <div>
          <div style={{ background: "#d1fae5", borderRadius: 14, border: "2px solid #059669", padding: 16, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#065f46" }}>SageMaker Auto-Creates Lineage For You</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#064e3b", lineHeight: 1.6 }}>
              When you run training, processing, transform jobs, or deploy models, SageMaker automatically creates all lineage entities and wires them together. No extra code needed for standard workflows.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {autoTracked.map(a => (
              <div key={a.job} onClick={() => setShowAutoDetails(showAutoDetails === a.job ? null : a.job)}
                style={{ background: "#fff", border: `2px solid ${a.color}`, borderRadius: 14, padding: 16, cursor: "pointer" }}>
                <div style={{ fontSize: 28, textAlign: "center" }}>{a.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: a.color, textAlign: "center", marginTop: 4 }}>{a.job}</div>
                {showAutoDetails === a.job && (
                  <div style={{ marginTop: 12, borderTop: `2px dashed ${a.color}`, paddingTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Auto-Creates:</div>
                    {a.creates.map((c, i) => (
                      <div key={i} style={{ fontSize: 11, color: "#475569", lineHeight: 1.8, paddingLeft: 8, borderLeft: `2px solid ${a.color}`, marginBottom: 2 }}>{c}</div>
                    ))}
                  </div>
                )}
                <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#94a3b8" }}>
                  {showAutoDetails === a.job ? "tap to collapse" : "tap for details"}
                </div>
              </div>
            ))}
          </div>

          {/* Experiments Integration */}
          <div style={{ marginTop: 20, background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#92400e" }}>Experiments + Lineage Integration</h3>
            <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.8 }}>
              <div><strong>Experiment Hierarchy:</strong> Experiment → Trial → TrialComponent</div>
              <div><strong>In the Lineage Graph:</strong> Experiments and Trials are modeled as Contexts; TrialComponents participate in both systems</div>
              <div><strong>Auto-linking:</strong> Supply <code style={{ background: "#fff", padding: "1px 6px", borderRadius: 4 }}>experiment_config</code> to any job and SageMaker automatically creates the experiment hierarchy AND links it to lineage artifacts</div>
            </div>
            <CodeBlock code={`# Modern SDK: Run context manager
from sagemaker.experiments.run import Run

with Run(
    experiment_name="fraud-detection",
    run_name="run-001",
    sagemaker_session=session
) as run:
    run.log_parameter("learning_rate", 0.001)
    run.log_metric("train:accuracy", 0.95)

    # Automatically links to lineage
    estimator.fit(inputs={"train": "s3://..."})`} />
          </div>
        </div>
      )}

      {/* ─── ARCHITECTURE PATTERNS TAB ─── */}
      {tab === "patterns" && (
        <div>
          {patterns.map(p => (
            <div key={p.id} style={{ background: p.bg, border: `2px solid ${p.border}`, borderRadius: 14, padding: 18, marginBottom: 14, cursor: "pointer" }}
              onClick={() => setExpandedPattern(expandedPattern === p.id ? null : p.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>{p.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: p.border }}>
                    {p.title}
                    {p.recommended && <span style={{ marginLeft: 8, background: "#059669", color: "#fff", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>RECOMMENDED</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{p.desc}</div>
                </div>
              </div>

              {expandedPattern === p.id && (
                <div style={{ marginTop: 14, borderTop: `2px dashed ${p.color}`, paddingTop: 14 }}>
                  {/* Flow Diagram */}
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.border, marginBottom: 4 }}>Architecture Flow</div>
                  <FlowDiagram steps={p.flow} />

                  {/* Pros & Cons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                    <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #d1fae5" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 6 }}>Pros</div>
                      {p.pros.map((pr, i) => (
                        <div key={i} style={{ fontSize: 11, color: "#334155", lineHeight: 1.8 }}>+ {pr}</div>
                      ))}
                    </div>
                    <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #fee2e2" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>Cons</div>
                      {p.cons.map((cn, i) => (
                        <div key={i} style={{ fontSize: 11, color: "#334155", lineHeight: 1.8 }}>- {cn}</div>
                      ))}
                    </div>
                  </div>

                  {/* Code Example */}
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.border, marginTop: 14, marginBottom: 4 }}>Code Example</div>
                  <CodeBlock code={p.code} />
                </div>
              )}
              <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#94a3b8" }}>
                {expandedPattern === p.id ? "tap to collapse" : "tap for details, code & flow diagram"}
              </div>
            </div>
          ))}

          {/* Best Practices */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #cbd5e1", padding: 18, marginTop: 8 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Best Practices</h3>
            <div style={{ fontSize: 12, lineHeight: 2, color: "#334155" }}>
              <div><strong>1.</strong> Use SageMaker Pipelines as the primary automation layer</div>
              <div><strong>2.</strong> Enrich automatic lineage with custom metadata (Properties, MetadataProperties)</div>
              <div><strong>3.</strong> Adopt consistent naming: <code style={{ background: "#e2e8f0", padding: "1px 6px", borderRadius: 4 }}>{"{project}-{type}-{version}"}</code></div>
              <div><strong>4.</strong> Always register models to get full lineage chain from data to deployment</div>
              <div><strong>5.</strong> Schedule periodic lineage audits via Lambda or Step Functions</div>
              <div><strong>6.</strong> Track everything upstream: raw data, feature engineering, preprocessing scripts</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUERY & AUDIT TAB ─── */}
      {tab === "queries" && (
        <div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", textAlign: "center" }}>
            Click any query pattern to see the full code example
          </p>
          {queryExamples.map((q, i) => (
            <div key={i} onClick={() => setExpandedQuery(expandedQuery === i ? null : i)}
              style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 14, padding: 16, marginBottom: 12, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{q.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{q.desc}</div>
                </div>
              </div>
              {expandedQuery === i && (
                <div style={{ marginTop: 12 }}>
                  <CodeBlock code={q.code} />
                </div>
              )}
              <div style={{ textAlign: "right", marginTop: 6, fontSize: 10, color: "#94a3b8" }}>
                {expandedQuery === i ? "tap to collapse" : "tap for code"}
              </div>
            </div>
          ))}

          {/* Cross-Account */}
          <div style={{ background: "#ede9fe", borderRadius: 14, border: "2px solid #7c3aed", padding: 16, marginTop: 8 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#5b21b6" }}>Cross-Account Lineage</h3>
            <div style={{ fontSize: 12, color: "#4c1d95", lineHeight: 1.8 }}>
              <div><strong>Each account has one default lineage group</strong> (auto-created)</div>
              <div><strong>Sharing via AWS RAM:</strong> Share lineage group with target account</div>
              <div><strong>SameAs associations:</strong> Auto-created when same SourceUri appears across accounts</div>
              <div><strong>QueryLineage:</strong> Traverses seamlessly across account boundaries</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ─── EVAL OVERVIEW TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {tab === "evalOverview" && (
        <div>
          {/* What is it */}
          <div style={{ background: "#fff", borderRadius: 14, border: "2px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>What is Bedrock Model Evaluation?</h3>
            <div style={{ fontSize: 13, lineHeight: 2, color: "#334155" }}>
              <div><strong>Purpose:</strong> Assess foundation model quality, responsibility, and fitness-for-purpose before deploying to production.</div>
              <div><strong>Evaluates:</strong> Bedrock FMs, custom/imported models, marketplace models, prompt routers, provisioned throughput models, and even non-Bedrock models (bring your own inference responses).</div>
              <div><strong>Also evaluates:</strong> RAG pipelines — Amazon Bedrock Knowledge Bases or external RAG sources.</div>
            </div>
          </div>

          {/* Architecture SVG */}
          <div style={{ background: "#f8fafc", borderRadius: 14, border: "2px solid #e2e8f0", padding: 16, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Evaluation Architecture</h3>
            <EvalArchSVG />
          </div>

          {/* 4 Evaluation Types */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {evalTypes.map(et => (
              <div key={et.id} onClick={() => setExpandedEvalType(expandedEvalType === et.id ? null : et.id)}
                style={{ background: et.bg, border: `2px solid ${et.border}`, borderRadius: 14, padding: 16, cursor: "pointer", transition: "transform 0.15s", transform: expandedEvalType === et.id ? "scale(1.02)" : "scale(1)" }}>
                <div style={{ fontSize: 28, textAlign: "center" }}>{et.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: et.border, textAlign: "center", marginTop: 4 }}>{et.title}</div>
                <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", margin: "4px 0" }}>{et.desc}</div>
                {expandedEvalType === et.id && (
                  <div style={{ marginTop: 10, borderTop: `2px dashed ${et.color}`, paddingTop: 10 }}>
                    <div style={{ fontSize: 11, color: "#334155", lineHeight: 1.8 }}>
                      <div><strong>How:</strong> {et.how}</div>
                      <div><strong>Best for:</strong> {et.bestFor}</div>
                      <div><strong>Cost:</strong> {et.cost}</div>
                    </div>
                  </div>
                )}
                <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#94a3b8" }}>
                  {expandedEvalType === et.id ? "tap to collapse" : "tap for details"}
                </div>
              </div>
            ))}
          </div>

          {/* Task Types & Datasets */}
          <div style={{ marginTop: 16, background: "#fff", borderRadius: 14, border: "2px solid #e2e8f0", padding: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Task Types & Built-in Datasets</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#0f172a", color: "#fff" }}>
                    <th style={{ padding: 10, textAlign: "left", borderRadius: "8px 0 0 0" }}>Task Type</th>
                    <th style={{ padding: 10, textAlign: "left" }}>API Value</th>
                    <th style={{ padding: 10, textAlign: "left" }}>Built-in Datasets</th>
                    <th style={{ padding: 10, textAlign: "left", borderRadius: "0 8px 0 0" }}>Metrics</th>
                  </tr>
                </thead>
                <tbody>
                  {taskTypes.map((t, i) => (
                    <tr key={t.task} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                      <td style={{ padding: 10, fontWeight: 700, color: t.color, borderBottom: "1px solid #e2e8f0" }}>{t.task}</td>
                      <td style={{ padding: 10, color: "#475569", borderBottom: "1px solid #e2e8f0", fontFamily: "monospace", fontSize: 11 }}>{t.apiValue}</td>
                      <td style={{ padding: 10, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                        {t.datasets.map(d => (
                          <span key={d} style={{ display: "inline-block", background: "#f1f5f9", borderRadius: 4, padding: "1px 6px", margin: "1px 2px", fontSize: 10 }}>{d}</span>
                        ))}
                      </td>
                      <td style={{ padding: 10, color: "#475569", borderBottom: "1px solid #e2e8f0", fontSize: 11 }}>{t.metrics.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ─── EVAL METRICS TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {tab === "evalMetrics" && (
        <div>
          {/* Automatic Metrics */}
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Automatic (Algorithmic) Metrics</h3>
          {autoMetrics.map(m => (
            <div key={m.metric} onClick={() => setExpandedAutoMetric(expandedAutoMetric === m.metric ? null : m.metric)}
              style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 12, padding: 14, marginBottom: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: m.color, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{m.category}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{m.metric}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{m.desc}</div>
              {expandedAutoMetric === m.metric && (
                <div style={{ marginTop: 10, borderTop: "1px dashed #e2e8f0", paddingTop: 10 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={{ padding: 6, textAlign: "left", color: "#64748b" }}>Task / Method</th>
                        <th style={{ padding: 6, textAlign: "left", color: "#64748b" }}>Algorithm</th>
                        <th style={{ padding: 6, textAlign: "left", color: "#64748b" }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.details.map((d, i) => (
                        <tr key={i}>
                          <td style={{ padding: 6, fontWeight: 600, color: "#334155", borderTop: "1px solid #f1f5f9" }}>{d.task}</td>
                          <td style={{ padding: 6, color: "#475569", borderTop: "1px solid #f1f5f9", fontFamily: "monospace" }}>{d.algo}</td>
                          <td style={{ padding: 6, color: "#64748b", borderTop: "1px solid #f1f5f9" }}>{d.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ textAlign: "right", marginTop: 4, fontSize: 10, color: "#94a3b8" }}>
                {expandedAutoMetric === m.metric ? "collapse" : "tap for breakdown"}
              </div>
            </div>
          ))}

          {/* LLM-as-a-Judge Metrics */}
          <h3 style={{ margin: "20px 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>LLM-as-a-Judge Metrics (11 Built-in)</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#fff" }}>
                  <th style={{ padding: 10, textAlign: "left", borderRadius: "8px 0 0 0" }}>Metric</th>
                  <th style={{ padding: 10, textAlign: "left" }}>Category</th>
                  <th style={{ padding: 10, textAlign: "left", borderRadius: "0 8px 0 0" }}>What It Measures</th>
                </tr>
              </thead>
              <tbody>
                {judgeMetrics.map((jm, i) => (
                  <tr key={jm.metric} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    <td style={{ padding: 10, fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0", fontFamily: "monospace", fontSize: 11 }}>Builtin.{jm.metric}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ background: jm.color, color: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 600 }}>{jm.cat}</span>
                    </td>
                    <td style={{ padding: 10, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>{jm.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RAG Metrics */}
          <div style={{ marginTop: 16, background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#92400e" }}>RAG-Specific Metrics</h3>
            <div style={{ fontSize: 12, color: "#78350f", lineHeight: 2 }}>
              <div><strong>Retrieve-only evaluation:</strong></div>
              <div style={{ paddingLeft: 12 }}>Builtin.ContextRelevance — Are retrieved contexts relevant to the query?</div>
              <div style={{ paddingLeft: 12 }}>Builtin.ContextCoverage — Do retrieved contexts cover the information needed?</div>
              <div style={{ marginTop: 6 }}><strong>Retrieve-and-Generate evaluation:</strong></div>
              <div style={{ paddingLeft: 12 }}>All 11 judge metrics above + Faithfulness for hallucination detection on RAG responses</div>
            </div>
          </div>

          {/* Human Rating Methods */}
          <div style={{ marginTop: 16, background: "#d1fae5", borderRadius: 14, border: "2px solid #059669", padding: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#065f46" }}>Human Evaluation Rating Methods</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginTop: 8 }}>
              {[
                { name: "Thumbs Up/Down", desc: "Binary approval/rejection" },
                { name: "Likert Scale", desc: "5-point nuanced rating" },
                { name: "Comparison Choice", desc: "Select preferred response" },
                { name: "Ordinal Rank", desc: "Sequential ranking from 1" },
              ].map(r => (
                <div key={r.name} style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #059669" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#065f46" }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ─── EVAL API TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {tab === "evalAPI" && (
        <div>
          {/* API Operations */}
          <div style={{ background: "#fff", borderRadius: 14, border: "2px solid #e2e8f0", padding: 16, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>API Operations</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
              {[
                { api: "CreateEvaluationJob", desc: "Creates a new eval job", color: "#3b82f6" },
                { api: "GetEvaluationJob", desc: "Retrieves job details & status", color: "#10b981" },
                { api: "ListEvaluationJobs", desc: "Lists all jobs with filters", color: "#8b5cf6" },
                { api: "StopEvaluationJob", desc: "Stops a running job", color: "#ef4444" },
              ].map(a => (
                <div key={a.api} style={{ background: "#f8fafc", borderRadius: 8, padding: 10, borderLeft: `3px solid ${a.color}` }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: a.color, fontFamily: "monospace" }}>{a.api}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Automatic Eval Job */}
          <div style={{ background: "#dbeafe", borderRadius: 14, border: "2px solid #2563eb", padding: 16, marginBottom: 14 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#1e40af" }}>Create Automatic Evaluation Job (boto3)</h3>
            <CodeBlock code={`import boto3

client = boto3.client("bedrock", region_name="us-west-2")

response = client.create_evaluation_job(
    jobName="my-eval-qa-boolq",
    jobDescription="Evaluate Claude on Q&A with BoolQ",
    roleArn="arn:aws:iam::111122223333:role/BedrockEvalRole",
    inferenceConfig={
        "models": [{
            "bedrockModel": {
                "modelIdentifier": "anthropic.claude-3-haiku-20240307-v1:0",
                "inferenceParams": '{"max_tokens":512,"temperature":0.7}'
            }
        }]
    },
    outputDataConfig={
        "s3Uri": "s3://my-bucket/eval-outputs/"
    },
    evaluationConfig={
        "automated": {
            "datasetMetricConfigs": [{
                "taskType": "QuestionAndAnswer",
                "dataset": {"name": "Builtin.BoolQ"},
                "metricNames": [
                    "Builtin.Accuracy",
                    "Builtin.Robustness"
                ]
            }]
        }
    }
)

job_arn = response["jobArn"]`} />
          </div>

          {/* Monitor & Retrieve */}
          <div style={{ background: "#d1fae5", borderRadius: 14, border: "2px solid #059669", padding: 16, marginBottom: 14 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#065f46" }}>Monitor & Retrieve Results</h3>
            <CodeBlock code={`import time, json

# Poll for completion
while True:
    job = client.get_evaluation_job(jobIdentifier=job_arn)
    status = job["status"]
    print(f"Status: {status}")
    if status in ("Completed", "Failed", "Stopped"):
        break
    time.sleep(30)

# Parse results from S3 output
s3 = boto3.client("s3")
response = s3.get_object(
    Bucket="my-bucket",
    Key="eval-outputs/.../output.jsonl"
)

for line in response["Body"].iter_lines():
    result = json.loads(line)
    scores = result["automatedEvaluationResult"]["scores"]
    prompt = result["inputRecord"]["prompt"]
    for score in scores:
        print(f"Metric: {score['metricName']}")
        print(f"  Score: {score['result']}")`} />
          </div>

          {/* Custom Dataset Format */}
          <div style={{ background: "#ede9fe", borderRadius: 14, border: "2px solid #7c3aed", padding: 16, marginBottom: 14 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#5b21b6" }}>Custom Prompt Dataset (JSONL Format)</h3>
            <div style={{ fontSize: 12, color: "#4c1d95", lineHeight: 1.8, marginBottom: 8 }}>
              <div>Upload a <code style={{ background: "#fff", padding: "1px 6px", borderRadius: 4 }}>.jsonl</code> file to S3 (max 1,000 prompts, 4KB each)</div>
            </div>
            <CodeBlock code={`// For automatic + judge evaluation:
{"prompt": "What is ML?", "referenceResponse": "Machine learning is...", "category": "AI"}

// For Bring Your Own Inference Response (BYOIR):
{
  "prompt": "What is HIIT?",
  "referenceResponse": "High-Intensity Interval Training...",
  "category": "Fitness",
  "modelResponses": [{
    "response": "HIIT is a workout strategy...",
    "modelIdentifier": "my_external_model"
  }]
}`} />
          </div>

          {/* Judge Models */}
          <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#92400e" }}>Supported Judge Models</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                "Claude 3.5 Sonnet v1/v2",
                "Claude 3.7 Sonnet",
                "Claude 3 Haiku",
                "Claude 3.5 Haiku",
                "Amazon Nova Pro",
                "Llama 3.1 70B Instruct",
                "Mistral Large",
              ].map(m => (
                <span key={m} style={{ background: "#fff", border: "1px solid #d97706", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#92400e" }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── LIMITS TAB ─── */}
      {tab === "limits" && (
        <div>
          {/* Lineage Limits */}
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>SageMaker Lineage Limits</h3>
          <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>
            Per-account, per-region. Auto-created entities have NO limits.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
            {limits.map(l => (
              <div key={l.entity} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 14, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>{l.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 11, color: "#334155", marginTop: 4 }}>{l.entity}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: l.limit === "Unlimited" ? "#059669" : "#2563eb", marginTop: 4 }}>{l.limit}</div>
              </div>
            ))}
          </div>

          {/* Eval Limits */}
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Bedrock Evaluation Limits</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
            {evalLimits.map(l => (
              <div key={l.item} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 14, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>{l.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 11, color: "#334155", marginTop: 4 }}>{l.item}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#2563eb", marginTop: 4 }}>{l.limit}</div>
              </div>
            ))}
          </div>

          {/* Important Notes */}
          <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#92400e" }}>Key Constraints</h3>
            <div style={{ fontSize: 12, color: "#78350f", lineHeight: 2 }}>
              <div><strong>Lineage SourceUri uniqueness:</strong> SageMaker reuses artifacts with the same SourceUri (no duplicates)</div>
              <div><strong>Association constraint:</strong> Cannot create associations between two Experiment entities</div>
              <div><strong>QueryLineage StartArns:</strong> Only 1 ARN per query (must paginate for multiple starting points)</div>
              <div><strong>Eval pricing:</strong> Algorithmic scoring is free; LLM-as-a-Judge charges for both models; Human eval costs $0.21/task</div>
              <div><strong>Eval regions:</strong> Available in US East (N. Virginia) and US West (Oregon)</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUIZ TAB ─── */}
      {tab === "quiz" && (
        <div>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px", textAlign: "center" }}>Test your understanding of both Lineage and Evaluation! Click an answer to check.</p>
          {quizData.map((q, i) => (
            <QuizCard key={i} q={q.q} opts={q.opts} ans={q.ans} />
          ))}
        </div>
      )}
    </div>
  );
}
