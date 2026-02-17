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

// ─── QUIZ DATA ───
const quizData = [
  { q: "Which lineage entity represents a URI-addressable object like an S3 dataset?", opts: ["Action", "Artifact", "Context", "Association"], ans: "Artifact" },
  { q: "What association type means 'source generated the destination'?", opts: ["ContributedTo", "Produced", "DerivedFrom", "AssociatedWith"], ans: "Produced" },
  { q: "Which entity provides logical grouping (e.g., Endpoints, Experiments)?", opts: ["Artifact", "Action", "Context", "TrialComponent"], ans: "Context" },
  { q: "What is the maximum depth for QueryLineage traversal?", opts: ["5", "10", "20", "50"], ans: "10" },
  { q: "How many manually-created Artifacts can you have per account/region?", opts: ["500", "3,000", "6,000", "Unlimited"], ans: "6,000" },
  { q: "Which pattern is recommended for full lineage automation?", opts: ["Manual boto3 calls", "Pipeline-Driven", "Hybrid", "CloudFormation"], ans: "Pipeline-Driven" },
  { q: "What does SageMaker auto-create for a Training Job?", opts: ["Only a Model artifact", "TrialComponent + Artifacts + Associations", "Only an Action", "Nothing — all manual"], ans: "TrialComponent + Artifacts + Associations" },
  { q: "Which direction finds what LED TO a given entity?", opts: ["Descendants", "Ascendants", "Both", "Lateral"], ans: "Ascendants" },
  { q: "What is the cross-account association type for the same entity?", opts: ["ContributedTo", "AssociatedWith", "DerivedFrom", "SameAs"], ans: "SameAs" },
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

// ─── MAIN COMPONENT ───
export default function SageMakerLineage() {
  const [tab, setTab] = useState("graph");
  const [expandedEntity, setExpandedEntity] = useState(null);
  const [expandedPattern, setExpandedPattern] = useState(null);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [graphHighlight, setGraphHighlight] = useState(null);
  const [showAutoDetails, setShowAutoDetails] = useState(null);

  const tabs = [
    ["graph", "Lineage Graph"],
    ["entities", "Entities"],
    ["auto", "Auto-Tracking"],
    ["patterns", "Architecture"],
    ["queries", "Query & Audit"],
    ["limits", "Limits"],
    ["quiz", "Quiz"],
  ];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 920, margin: "0 auto", padding: "20px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, textAlign: "center" }}>
        SageMaker Model Lineage Tracking
      </h1>
      <p style={{ color: "#64748b", textAlign: "center", margin: "4px 0 20px", fontSize: 14 }}>
        Automated tracking of data, models, metrics & deployments across the ML lifecycle
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

      {/* ─── LIMITS TAB ─── */}
      {tab === "limits" && (
        <div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", textAlign: "center" }}>
            Per-account, per-region limits. Auto-created entities have NO limits.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
            {limits.map(l => (
              <div key={l.entity} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 14, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>{l.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#334155", marginTop: 4 }}>{l.entity}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: l.limit === "Unlimited" ? "#059669" : "#2563eb", marginTop: 6 }}>{l.limit}</div>
              </div>
            ))}
          </div>

          {/* Important Notes */}
          <div style={{ background: "#fef3c7", borderRadius: 14, border: "2px solid #f59e0b", padding: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#92400e" }}>Key Constraints</h3>
            <div style={{ fontSize: 12, color: "#78350f", lineHeight: 2 }}>
              <div><strong>SourceUri uniqueness:</strong> SageMaker reuses artifacts with the same SourceUri (no duplicates)</div>
              <div><strong>Association constraint:</strong> Cannot create associations between two Experiment entities</div>
              <div><strong>QueryLineage StartArns:</strong> Only 1 ARN per query (must paginate for multiple starting points)</div>
              <div><strong>Regional availability:</strong> QueryLineage NOT available in af-south-1, ap-southeast-3, ap-northeast-3, eu-south-1, eu-south-2, il-central-1</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUIZ TAB ─── */}
      {tab === "quiz" && (
        <div>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px", textAlign: "center" }}>Test your understanding! Click an answer to check.</p>
          {quizData.map((q, i) => (
            <QuizCard key={i} q={q.q} opts={q.opts} ans={q.ans} />
          ))}
        </div>
      )}
    </div>
  );
}
