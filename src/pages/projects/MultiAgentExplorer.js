import { useState } from "react";
import Layout from "../../components/Layout";

const agentTypes = [
  {
    id: "llm",
    icon: "🧠",
    name: "LLM Agent",
    color: "from-purple-600 to-violet-600",
    border: "border-purple-500",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    desc: "A large language model (GPT-4, Claude, Llama, Mistral) that reasons, plans, and generates text. It's the 'brain' that decides WHAT to do.",
    examples: ["Claude (Anthropic)", "GPT-4 / GPT-4o (OpenAI)", "Gemini (Google)", "Llama 3 (Meta)", "Mistral / Mixtral"],
    capabilities: ["Reasoning & planning", "Natural language understanding", "Code generation", "Summarization", "Decision making"],
    limitation: "Can only generate text — can't actually execute code, call APIs, or access real-time data on its own."
  },
  {
    id: "tool",
    icon: "🔧",
    name: "External Tool",
    color: "from-amber-600 to-orange-600",
    border: "border-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    desc: "Any external capability the LLM can invoke: APIs, databases, code interpreters, search engines, file systems. These are the 'hands' that DO things.",
    examples: ["Web Search (Google, Tavily)", "Code Executor (Python sandbox)", "Database (SQL, Vector DB)", "REST API calls", "File read/write", "Browser automation"],
    capabilities: ["Real-time data access", "Code execution", "CRUD operations", "Web browsing", "File manipulation"],
    limitation: "No reasoning — just executes what it's told. Needs an LLM to decide when and how to use it."
  },
  {
    id: "agent",
    icon: "🤖",
    name: "Agent (LLM + Tools)",
    color: "from-cyan-600 to-blue-600",
    border: "border-cyan-500",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    desc: "An Agent = LLM (brain) + Tools (hands) + Memory (context) + System Prompt (role/personality). The LLM reasons about the task, decides which tool to call, interprets the result, and loops until done.",
    examples: ["Research Agent = Claude + Web Search + Note-taking", "Code Agent = GPT-4 + Code Executor + File System", "Data Agent = Llama + SQL DB + Charting tool", "Support Agent = Claude + CRM API + Knowledge Base"],
    capabilities: ["Autonomous task completion", "Tool selection & chaining", "Self-correction via feedback loops", "Multi-step reasoning with action"],
    limitation: "Only as good as its LLM + tools. Can hallucinate, choose wrong tools, or get stuck in loops."
  }
];

const agentAnatomy = {
  layers: [
    { name: "System Prompt", icon: "📋", desc: "Role, personality, rules. E.g., 'You are a senior Python developer. Always write tests.'", color: "bg-indigo-600" },
    { name: "LLM (Brain)", icon: "🧠", desc: "Claude / GPT-4 / Llama — reasons about the task, plans steps, decides which tool to call next.", color: "bg-purple-600" },
    { name: "Memory", icon: "💾", desc: "Conversation history, scratchpad, vector store for long-term recall. Keeps context across steps.", color: "bg-blue-600" },
    { name: "Tool Belt", icon: "🔧", desc: "Available tools: search, code exec, APIs, DB, file I/O. LLM picks which one to use and with what inputs.", color: "bg-amber-600" },
    { name: "Observation Loop", icon: "🔄", desc: "LLM calls tool → reads result → decides next action → repeats until task is done (ReAct pattern).", color: "bg-green-600" },
  ]
};

const patterns = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    icon: "🎯",
    tagline: "One LLM boss, many specialist agents",
    color: "from-blue-600 to-cyan-600",
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    description: "A central Orchestrator agent (powered by a strong LLM like Claude/GPT-4) receives the task, decomposes it, and delegates subtasks to specialist agents — each with their own LLM + tools.",
    agents: [
      { role: "Orchestrator", llm: "Claude / GPT-4 (strong reasoner)", tools: ["Task planner", "Result merger"], purpose: "Decomposes task, delegates, merges results" },
      { role: "Research Agent", llm: "Claude / GPT-4", tools: ["Web Search", "Scraper"], purpose: "Finds information online" },
      { role: "Code Agent", llm: "GPT-4 / Codestral", tools: ["Code Executor", "File System"], purpose: "Writes and runs code" },
      { role: "Data Agent", llm: "Llama / Mistral (cheaper)", tools: ["SQL DB", "CSV Parser"], purpose: "Queries and processes data" },
    ],
    howItWorks: [
      "User sends complex task to Orchestrator Agent (strong LLM)",
      "Orchestrator LLM reasons about subtasks needed",
      "Each subtask → specialist agent (own LLM + tools)",
      "Specialist LLMs use their tools autonomously",
      "Results flow back → Orchestrator LLM merges final answer"
    ],
    pros: ["Can mix LLM providers (strong for orchestrator, cheap for workers)", "Clear control flow", "Easy to debug"],
    cons: ["Orchestrator LLM is a single point of failure", "Strong LLM needed for orchestrator = expensive", "Workers can't talk to each other directly"],
    useCases: [
      { name: "AI Code Review System", desc: "Orchestrator (Claude) receives PR → delegates to: Security Agent (GPT-4 + SAST tool), Style Agent (Llama + linter), Test Agent (Codestral + pytest executor) → merges into one review." },
      { name: "Research Report Generator", desc: "Orchestrator (GPT-4) plans sections → Research Agent (Claude + Tavily search), Data Agent (Mistral + SQL), Writer Agent (Claude + Markdown) → final report." },
      { name: "Customer Support", desc: "Orchestrator (Claude) classifies ticket → routes to Billing Agent (Llama + Stripe API), Tech Agent (GPT-4 + docs search), Escalation Agent (Claude + Slack API)." }
    ],
    diagram: {
      nodes: [
        { id: "user", label: "User", x: 250, y: 20, type: "user" },
        { id: "orch", label: "Orchestrator\n(Claude)", x: 250, y: 115, type: "orchestrator" },
        { id: "a1", label: "Research\n(GPT-4 + Search)", x: 70, y: 240, type: "agent" },
        { id: "a2", label: "Coder\n(Codestral + Exec)", x: 250, y: 240, type: "agent" },
        { id: "a3", label: "Data\n(Llama + SQL)", x: 430, y: 240, type: "agent" },
      ],
      edges: [
        { from: "user", to: "orch", label: "task" },
        { from: "orch", to: "a1", label: "research" },
        { from: "orch", to: "a2", label: "code" },
        { from: "orch", to: "a3", label: "data" },
        { from: "a1", to: "orch", label: "", dashed: true },
        { from: "a2", to: "orch", label: "", dashed: true },
        { from: "a3", to: "orch", label: "", dashed: true },
      ]
    }
  },
  {
    id: "pipeline",
    name: "Sequential Pipeline",
    icon: "🔗",
    tagline: "Assembly line of LLMs + Tools",
    color: "from-green-600 to-emerald-600",
    border: "border-green-500",
    bg: "bg-green-500/10",
    text: "text-green-400",
    description: "Agents are chained sequentially. Each agent (LLM + tools) processes and transforms the output, passing it to the next. Each step can use a different LLM optimized for that specific task.",
    agents: [
      { role: "Extractor Agent", llm: "Llama (fast/cheap)", tools: ["Web Scraper", "File Reader"], purpose: "Pulls raw data from sources" },
      { role: "Analyzer Agent", llm: "Claude (strong reasoning)", tools: ["Code Executor", "Math lib"], purpose: "Analyzes and processes data" },
      { role: "Writer Agent", llm: "GPT-4 (creative)", tools: ["Markdown", "Template engine"], purpose: "Writes human-readable output" },
      { role: "Reviewer Agent", llm: "Claude (careful)", tools: ["Fact-check API", "Grammarly API"], purpose: "Reviews and polishes final output" },
    ],
    howItWorks: [
      "Input enters Agent 1 (LLM + tools optimized for extraction)",
      "Agent 1's output becomes Agent 2's input (different LLM for analysis)",
      "Each agent transforms data with its specialized LLM + tools",
      "Final agent produces polished output",
      "Key: each LLM can be chosen for cost/quality tradeoff per step"
    ],
    pros: ["Each step uses the optimal LLM (cheap vs strong)", "Simple to build and test each stage", "Easy to swap out one agent without breaking others"],
    cons: ["Slow — must wait for each step sequentially", "One agent failure blocks everything downstream", "Can't parallelize independent tasks"],
    useCases: [
      { name: "Content Pipeline", desc: "Researcher (Claude + Tavily) → Outliner (Llama + templates) → Writer (GPT-4 + Markdown) → Editor (Claude + Grammarly) → SEO Agent (Mistral + SEO tools)." },
      { name: "ETL Data Pipeline", desc: "Extractor (Llama + API clients) → Cleaner (Python script tool) → Transformer (Claude + Pandas executor) → Loader (Mistral + DB writer)." },
      { name: "Legal Document Review", desc: "OCR Agent (tool-only + Tesseract) → Parser (Llama + regex) → Clause Analyzer (Claude + legal DB) → Risk Summarizer (GPT-4)." }
    ],
    diagram: {
      nodes: [
        { id: "in", label: "Input", x: 20, y: 140, type: "user" },
        { id: "a1", label: "Extract\n(Llama+Scraper)", x: 140, y: 140, type: "agent" },
        { id: "a2", label: "Analyze\n(Claude+Code)", x: 280, y: 140, type: "agent" },
        { id: "a3", label: "Write\n(GPT-4+MD)", x: 420, y: 140, type: "agent" },
        { id: "out", label: "Output", x: 530, y: 140, type: "orchestrator" },
      ],
      edges: [
        { from: "in", to: "a1", label: "raw" },
        { from: "a1", to: "a2", label: "" },
        { from: "a2", to: "a3", label: "" },
        { from: "a3", to: "out", label: "final" },
      ]
    }
  },
  {
    id: "hierarchical",
    name: "Hierarchical",
    icon: "🏛️",
    tagline: "Manager LLMs managing worker LLMs",
    color: "from-purple-600 to-violet-600",
    border: "border-purple-500",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    description: "Like a corporate org chart of LLMs. A top-level Supervisor (strong LLM) delegates to Manager agents (mid-tier LLMs), who in turn coordinate their own team of worker agents (can be cheaper LLMs or tool-only).",
    agents: [
      { role: "Supervisor", llm: "Claude Opus / GPT-4 (strongest)", tools: ["Planner", "Aggregator"], purpose: "High-level strategy and delegation" },
      { role: "Frontend Manager", llm: "Claude Sonnet (mid-tier)", tools: ["Task router"], purpose: "Manages UI/UX team of agents" },
      { role: "UI Worker", llm: "Codestral (code-focused)", tools: ["React builder", "CSS gen"], purpose: "Generates frontend code" },
      { role: "Backend Manager", llm: "Claude Sonnet", tools: ["Task router"], purpose: "Manages API/DB team" },
      { role: "API Worker", llm: "Llama (fast)", tools: ["FastAPI scaffold", "OpenAPI gen"], purpose: "Generates backend code" },
    ],
    howItWorks: [
      "Supervisor (strongest LLM) receives complex task",
      "Breaks into domains → delegates to Manager agents (mid-tier LLMs)",
      "Each Manager decomposes further for their Worker agents",
      "Workers (cheapest LLMs + specialized tools) execute subtasks",
      "Results bubble up: Workers → Managers → Supervisor assembles final output"
    ],
    pros: ["Scales to very complex tasks", "Cost-optimized: strong LLMs only where needed", "Domain isolation between teams"],
    cons: ["Most complex to build and debug", "Multiple LLM calls = high latency", "Communication overhead between layers"],
    useCases: [
      { name: "Full-Stack App Builder", desc: "Supervisor (Claude Opus) → Frontend Mgr (Sonnet: UI Agent with React tools, Style Agent with Tailwind) + Backend Mgr (Sonnet: API Agent with FastAPI, DB Agent with Prisma)." },
      { name: "Investment Analysis", desc: "Chief Analyst (GPT-4) → Market Mgr (Claude: Equity Agent + Yahoo API, Bond Agent + FRED API) + Risk Mgr (Llama: VaR calculator, Stress tester)." },
      { name: "Game Development", desc: "Director (Claude Opus) → Art Mgr (DALL-E tool agents) + Code Mgr (Codestral agents) + Story Mgr (GPT-4 narrative agents)." }
    ],
    diagram: {
      nodes: [
        { id: "sup", label: "Supervisor\n(Claude Opus)", x: 250, y: 20, type: "orchestrator" },
        { id: "m1", label: "Frontend Mgr\n(Sonnet)", x: 120, y: 130, type: "manager" },
        { id: "m2", label: "Backend Mgr\n(Sonnet)", x: 380, y: 130, type: "manager" },
        { id: "w1", label: "UI\n(Codestral)", x: 50, y: 250, type: "agent" },
        { id: "w2", label: "Style\n(Llama)", x: 190, y: 250, type: "agent" },
        { id: "w3", label: "API\n(Llama)", x: 310, y: 250, type: "agent" },
        { id: "w4", label: "DB\n(Mistral)", x: 450, y: 250, type: "agent" },
      ],
      edges: [
        { from: "sup", to: "m1", label: "" },
        { from: "sup", to: "m2", label: "" },
        { from: "m1", to: "w1", label: "" },
        { from: "m1", to: "w2", label: "" },
        { from: "m2", to: "w3", label: "" },
        { from: "m2", to: "w4", label: "" },
      ]
    }
  },
  {
    id: "collaborative",
    name: "Collaborative (Debate)",
    icon: "💬",
    tagline: "LLMs critique each other's work",
    color: "from-orange-600 to-amber-600",
    border: "border-orange-500",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    description: "Multiple LLM agents with different system prompts (roles/perspectives) work on the same problem. They review each other's outputs, debate, and iterate until reaching high-quality consensus.",
    agents: [
      { role: "Generator Agent", llm: "GPT-4 (creative)", tools: ["Code executor"], purpose: "Proposes initial solution" },
      { role: "Critic Agent", llm: "Claude (careful/analytical)", tools: ["Test runner", "Linter"], purpose: "Finds flaws and suggests improvements" },
      { role: "Devil's Advocate", llm: "Different LLM (diverse perspective)", tools: ["Fact-checker"], purpose: "Challenges assumptions" },
      { role: "Judge Agent", llm: "Claude Opus (strongest)", tools: ["Evaluation rubric"], purpose: "Picks the best final answer" },
    ],
    howItWorks: [
      "All agents (different LLMs/prompts) receive the same problem",
      "Generator LLM proposes a solution using its tools",
      "Critic LLM reviews, finds issues, suggests fixes",
      "Multiple rounds of refinement between agents",
      "Judge LLM (strongest model) evaluates and picks final answer"
    ],
    pros: ["Highest output quality through multi-LLM review", "Different LLMs catch different mistakes", "Reduces hallucination through cross-checking"],
    cons: ["Most expensive — many LLM calls per task", "Slow — multiple debate rounds", "LLMs may agree on wrong answers (groupthink)"],
    useCases: [
      { name: "Bulletproof Code Generation", desc: "Coder (GPT-4 + executor) writes → Reviewer (Claude + pytest) tests → Security (Llama + Bandit) audits → iterate until all pass." },
      { name: "Medical Diagnosis Support", desc: "Diagnostician (GPT-4 + medical DB) proposes → Skeptic (Claude + drug interactions API) challenges → Specialist (domain-tuned LLM) validates." },
      { name: "Contract Negotiation", desc: "Pro-Client Agent (Claude + legal DB) drafts → Pro-Company Agent (GPT-4 + risk DB) objects → Mediator (Claude Opus) synthesizes balanced terms." }
    ],
    diagram: {
      nodes: [
        { id: "j", label: "Judge\n(Claude Opus)", x: 250, y: 20, type: "orchestrator" },
        { id: "a1", label: "Generator\n(GPT-4)", x: 90, y: 140, type: "agent" },
        { id: "a2", label: "Critic\n(Claude)", x: 410, y: 140, type: "agent" },
        { id: "a3", label: "Advocate\n(Llama)", x: 250, y: 250, type: "agent" },
      ],
      edges: [
        { from: "a1", to: "a2", label: "propose", dashed: false },
        { from: "a2", to: "a3", label: "critique", dashed: true },
        { from: "a3", to: "a1", label: "challenge", dashed: true },
        { from: "a1", to: "j", label: "", dashed: true },
        { from: "a2", to: "j", label: "", dashed: true },
        { from: "a3", to: "j", label: "", dashed: true },
      ]
    }
  },
  {
    id: "router",
    name: "Router / Dispatcher",
    icon: "🔀",
    tagline: "Classify → route to right LLM + tool",
    color: "from-rose-600 to-pink-600",
    border: "border-rose-500",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    description: "A lightweight Router (can be a small LLM or even a classifier model) classifies the request and routes it to a single specialist agent with the right LLM + tools for that task type.",
    agents: [
      { role: "Router", llm: "Small/fast LLM or classifier (Haiku, Llama-8B)", tools: ["Intent classifier"], purpose: "Classifies and routes — no heavy reasoning" },
      { role: "Code Agent", llm: "Codestral / GPT-4", tools: ["Code Executor", "Debugger"], purpose: "Handles coding tasks" },
      { role: "Math Agent", llm: "Any LLM + tool", tools: ["Wolfram Alpha", "Calculator"], purpose: "Solves math problems" },
      { role: "Creative Agent", llm: "GPT-4 / Claude (creative)", tools: ["Image gen API", "Template engine"], purpose: "Creative content generation" },
    ],
    howItWorks: [
      "User request hits the Router (small, fast, cheap LLM)",
      "Router classifies intent: code? math? creative? general?",
      "Routes to the ONE best specialist agent",
      "Specialist (optimized LLM + relevant tools) handles end-to-end",
      "Response goes directly back — no merging step needed"
    ],
    pros: ["Fastest pattern — minimal overhead", "Cost-efficient: cheap router + specialized agents", "Easy to add new specialist agents"],
    cons: ["Misclassification → wrong agent handles request", "Can't handle tasks needing multiple agents", "No collaboration between specialists"],
    useCases: [
      { name: "Multi-Modal AI Assistant", desc: "Router (Haiku, fast) classifies → Code (Codestral + sandbox), Math (Llama + Wolfram), Creative (GPT-4 + DALL-E), General (Claude + search)." },
      { name: "Cost-Optimized Chatbot", desc: "Router (tiny classifier) → Simple Q&A (Llama-8B, cheapest), Complex reasoning (Claude Opus, expensive), Code (Codestral, specialized)." },
      { name: "Support Ticket Triage", desc: "Router (Haiku + classifier) → Billing (Llama + Stripe API), Technical (GPT-4 + docs), Urgent (Claude + PagerDuty API + Slack)." }
    ],
    diagram: {
      nodes: [
        { id: "user", label: "User", x: 250, y: 20, type: "user" },
        { id: "router", label: "Router\n(Haiku/fast)", x: 250, y: 115, type: "orchestrator" },
        { id: "a1", label: "Code\n(Codestral+Exec)", x: 50, y: 250, type: "agent" },
        { id: "a2", label: "Math\n(Llama+Wolfram)", x: 190, y: 250, type: "agent" },
        { id: "a3", label: "Creative\n(GPT-4+DALL-E)", x: 330, y: 250, type: "agent" },
        { id: "a4", label: "General\n(Claude+Search)", x: 470, y: 250, type: "agent" },
      ],
      edges: [
        { from: "user", to: "router", label: "" },
        { from: "router", to: "a1", label: "" },
        { from: "router", to: "a2", label: "" },
        { from: "router", to: "a3", label: "" },
        { from: "router", to: "a4", label: "" },
      ]
    }
  },
  {
    id: "swarm",
    name: "Swarm / Decentralized",
    icon: "🐝",
    tagline: "LLMs self-organize with shared state",
    color: "from-teal-600 to-cyan-600",
    border: "border-teal-500",
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    description: "No central LLM controller. Multiple agents (each with their own LLM + tools) share a common state (blackboard) and autonomously pick up tasks. Each agent can also hand off to another agent dynamically.",
    agents: [
      { role: "Bug Detector", llm: "Claude (analytical)", tools: ["Static analyzer", "AST parser"], purpose: "Scans code and posts bugs to shared board" },
      { role: "Bug Fixer", llm: "Codestral (code-focused)", tools: ["Code editor", "Git"], purpose: "Picks bugs from board, writes fixes" },
      { role: "Tester", llm: "Llama (fast)", tools: ["Pytest", "Coverage tool"], purpose: "Validates fixes, posts results" },
      { role: "Any agent can hand off", llm: "Dynamic — via handoff()", tools: ["Shared state"], purpose: "Agents decide who goes next" },
    ],
    howItWorks: [
      "Shared blackboard/state holds current tasks and progress",
      "Each agent (LLM + tools) monitors for tasks it can handle",
      "Agent autonomously picks up task → LLM reasons → tools execute",
      "Posts results to shared state → triggers other agents",
      "No boss: agents use handoff() to pass control to each other"
    ],
    pros: ["Most resilient — no single point of failure", "Agents can be added/removed dynamically", "Handles unpredictable, emergent workflows"],
    cons: ["Hardest to debug (no clear control flow)", "Risk of infinite loops between agents", "Hard to guarantee task completion"],
    useCases: [
      { name: "Autonomous Codebase Maintenance", desc: "Detector (Claude + linter) finds issues → Fixer (Codestral + editor) patches → Tester (Llama + pytest) validates → all via shared board. No central coordinator." },
      { name: "Distributed Data Collection", desc: "Crawler agents (Llama + HTTP) find URLs → Scraper agents (Mistral + BeautifulSoup) extract → Dedup agents (embedding model + vector DB) clean — all via shared queue." },
      { name: "OpenAI Swarm-style Handoffs", desc: "Triage Agent → hands off to Sales Agent or Support Agent dynamically. Each agent decides when to hand off and to whom. Very lightweight." }
    ],
    diagram: {
      nodes: [
        { id: "bb", label: "Shared State\n(Blackboard)", x: 250, y: 145, type: "blackboard" },
        { id: "a1", label: "Detector\n(Claude)", x: 100, y: 40, type: "agent" },
        { id: "a2", label: "Fixer\n(Codestral)", x: 400, y: 40, type: "agent" },
        { id: "a3", label: "Tester\n(Llama)", x: 80, y: 265, type: "agent" },
        { id: "a4", label: "Deployer\n(Mistral)", x: 420, y: 265, type: "agent" },
      ],
      edges: [
        { from: "a1", to: "bb", label: "", dashed: true },
        { from: "a2", to: "bb", label: "", dashed: true },
        { from: "a3", to: "bb", label: "", dashed: true },
        { from: "a4", to: "bb", label: "", dashed: true },
        { from: "a1", to: "a2", label: "handoff", dashed: true },
        { from: "a3", to: "a4", label: "handoff", dashed: true },
      ]
    }
  }
];

const frameworks = [
  { name: "LangGraph", lang: "Python", best: "Orchestrator, Pipeline, Router", desc: "Graph-based workflows. Define agents as nodes, edges as transitions. Most flexible.", install: "pip install langgraph" },
  { name: "CrewAI", lang: "Python", best: "Orchestrator, Hierarchical, Collaborative", desc: "Role-based agents with delegation. Assigns LLM + tools + role to each agent.", install: "pip install crewai" },
  { name: "AutoGen (Microsoft)", lang: "Python", best: "Collaborative, Swarm", desc: "Multi-agent conversations. Agents debate and iterate in chat format.", install: "pip install autogen-agentchat" },
  { name: "Swarm (OpenAI)", lang: "Python", best: "Swarm, Router", desc: "Lightweight handoff framework. Agents transfer control via handoff().", install: "pip install openai-swarm" },
  { name: "Anthropic Tool Use", lang: "Python", best: "Single Agent (LLM + Tools)", desc: "Not multi-agent, but the foundation: Claude + tool calling. Build agents from scratch.", install: "pip install anthropic" },
];

const DiagramSVG = ({ diagram }) => {
  const nodeMap = {};
  diagram.nodes.forEach(n => { nodeMap[n.id] = n; });
  const typeColors = {
    user: { fill: "#374151", stroke: "#6B7280", text: "#D1D5DB" },
    orchestrator: { fill: "#7C3AED", stroke: "#A78BFA", text: "#F3F4F6" },
    manager: { fill: "#D97706", stroke: "#FBBF24", text: "#F3F4F6" },
    agent: { fill: "#0891B2", stroke: "#22D3EE", text: "#F3F4F6" },
    worker: { fill: "#059669", stroke: "#34D399", text: "#F3F4F6" },
    blackboard: { fill: "#1E40AF", stroke: "#60A5FA", text: "#F3F4F6" },
  };
  return (
    <svg viewBox="0 0 540 310" className="w-full" style={{ maxHeight: 280 }}>
      <defs>
        <marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" /></marker>
        <marker id="ahd" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#6B7280" /></marker>
      </defs>
      {diagram.edges.map((e, i) => {
        const f = nodeMap[e.from], t = nodeMap[e.to];
        const dx = t.x - f.x, dy = t.y - f.y, d = Math.sqrt(dx*dx+dy*dy);
        const nx = dx/d, ny = dy/d;
        const x1 = f.x + nx*38, y1 = f.y + ny*25, x2 = t.x - nx*38, y2 = t.y - ny*25;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={e.dashed?"#6B7280":"#9CA3AF"} strokeWidth="1.5"
              strokeDasharray={e.dashed?"5,4":"none"} markerEnd={e.dashed?"url(#ahd)":"url(#ah)"} />
            {e.label && <text x={(x1+x2)/2} y={(y1+y2)/2-6} textAnchor="middle" fill="#9CA3AF" fontSize="8" fontFamily="monospace">{e.label}</text>}
          </g>
        );
      })}
      {diagram.nodes.map(n => {
        const c = typeColors[n.type] || typeColors.agent;
        const isB = n.type === "blackboard";
        const lines = n.label.split("\n");
        return (
          <g key={n.id}>
            {isB ? <rect x={n.x-55} y={n.y-25} width={110} height={50} rx={6} fill={c.fill} stroke={c.stroke} strokeWidth="2" strokeDasharray="4,3"/>
              : <rect x={n.x-48} y={n.y-22} width={96} height={44} rx={22} fill={c.fill} stroke={c.stroke} strokeWidth="2"/>}
            {lines.map((l, i) => (
              <text key={i} x={n.x} y={n.y + (lines.length === 1 ? 4 : (i === 0 ? -4 : 10))} textAnchor="middle" fill={c.text}
                fontSize={lines.length > 1 ? "9" : "10"} fontWeight="600" fontFamily="system-ui">{l}</text>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

const StepWalker = ({ steps }) => {
  const [s, setS] = useState(0);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {steps.map((_, i) => (
          <button key={i} onClick={() => setS(i)}
            className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${i===s?"bg-white text-gray-900 scale-110":i<s?"bg-gray-600 text-gray-300":"bg-gray-800 text-gray-500"}`}>{i+1}</button>
        ))}
      </div>
      <div className="bg-gray-800/60 rounded-lg p-3 min-h-[50px] flex items-center">
        <p className="text-gray-200 text-sm">{steps[s]}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setS(p => Math.max(0, p-1))} disabled={s===0} className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 disabled:opacity-30">←</button>
        <button onClick={() => setS(p => Math.min(steps.length-1, p+1))} disabled={s===steps.length-1} className="px-2 py-1 text-xs rounded bg-indigo-600 text-white disabled:opacity-30">→</button>
      </div>
    </div>
  );
};

const PatternDetail = ({ pattern: p, onBack }) => {
  const [ucIdx, setUcIdx] = useState(0);
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="mb-2 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm">← Back to all patterns</button>
      <div className={`bg-gradient-to-r ${p.color} rounded-xl p-5`}>
        <h2 className="text-2xl font-bold text-white">{p.icon} {p.name} Pattern</h2>
        <p className="text-white/80 text-sm">{p.tagline}</p>
        <p className="text-white/90 leading-relaxed mt-2 text-sm">{p.description}</p>
      </div>

      {/* Agent Composition */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-3">🤖 Agents in this Pattern (LLM + Tools)</h3>
        <div className="space-y-2">
          {p.agents.map((a, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
              <div><span className="text-gray-500 text-xs block">Role</span><span className="text-white font-semibold">{a.role}</span></div>
              <div><span className="text-gray-500 text-xs block">LLM (Brain)</span><span className="text-purple-300">{a.llm}</span></div>
              <div><span className="text-gray-500 text-xs block">Tools (Hands)</span><span className="text-amber-300">{a.tools.join(", ")}</span></div>
              <div><span className="text-gray-500 text-xs block">Purpose</span><span className="text-gray-300">{a.purpose}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="font-bold text-white mb-3">Architecture</h3>
          <DiagramSVG diagram={p.diagram} />
          <div className="flex gap-3 mt-2 flex-wrap text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span> Controller LLM</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block"></span> Agent (LLM+Tools)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span> Manager LLM</span>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="font-bold text-white mb-3">Step-by-Step Flow</h3>
          <StepWalker steps={p.howItWorks} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <h3 className="text-green-400 font-bold mb-2">✅ Pros</h3>
          {p.pros.map((x, i) => <p key={i} className="text-gray-300 text-sm py-1 border-b border-gray-700/50 last:border-0">{x}</p>)}
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <h3 className="text-red-400 font-bold mb-2">❌ Cons</h3>
          {p.cons.map((x, i) => <p key={i} className="text-gray-300 text-sm py-1 border-b border-gray-700/50 last:border-0">{x}</p>)}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="font-bold text-white mb-3">Real-World Use Cases</h3>
        <div className="flex gap-2 mb-3 flex-wrap">
          {p.useCases.map((uc, i) => (
            <button key={i} onClick={() => setUcIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${i===ucIdx?"bg-indigo-600 text-white":"bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>{uc.name}</button>
          ))}
        </div>
        <div className={`${p.bg} ${p.border} border rounded-lg p-4`}>
          <h4 className={`font-bold ${p.text} mb-1`}>{p.useCases[ucIdx].name}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{p.useCases[ucIdx].desc}</p>
        </div>
      </div>
    </div>
  );
};

const AnatomyTab = () => {
  const [selType, setSelType] = useState(0);
  const t = agentTypes[selType];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">What IS an Agent?</h2>
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <p className="text-yellow-300 font-bold text-lg">Agent = LLM (Brain) + Tools (Hands) + Memory + System Prompt</p>
        <p className="text-gray-300 text-sm mt-1">The LLM decides WHAT to do. Tools actually DO it. Memory keeps context. The prompt defines the role.</p>
      </div>

      {/* Three types */}
      <div className="flex gap-2 flex-wrap">
        {agentTypes.map((a, i) => (
          <button key={a.id} onClick={() => setSelType(i)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${i===selType?`bg-gradient-to-r ${a.color} text-white`:"bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
            {a.icon} {a.name}
          </button>
        ))}
      </div>

      <div className={`${t.bg} ${t.border} border rounded-xl p-5 space-y-3`}>
        <h3 className={`text-xl font-bold ${t.text}`}>{t.icon} {t.name}</h3>
        <p className="text-gray-300">{t.desc}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Examples</p>
            {t.examples.map((e, i) => <p key={i} className="text-gray-300 text-sm py-0.5">{e}</p>)}
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Capabilities</p>
            {t.capabilities.map((c, i) => <p key={i} className="text-green-300 text-sm py-0.5">✓ {c}</p>)}
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-300 text-sm"><strong>Limitation:</strong> {t.limitation}</p>
        </div>
      </div>

      {/* Anatomy layers */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">🔬 Anatomy of a Full Agent</h3>
        <div className="space-y-2">
          {agentAnatomy.layers.map((l, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-900 rounded-lg p-3">
              <div className={`${l.color} w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0`}>{l.icon}</div>
              <div>
                <p className="text-white font-semibold text-sm">{l.name}</p>
                <p className="text-gray-400 text-xs">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-2">🔄 The ReAct Loop (How an Agent Thinks)</h3>
        <div className="font-mono text-sm space-y-1 bg-gray-900 rounded-lg p-4">
          <p className="text-gray-500"># Every agent runs this loop:</p>
          <p className="text-purple-300">while task_not_done:</p>
          <p className="text-blue-300 pl-4">thought = LLM.reason(task, memory)     <span className="text-gray-600"># 🧠 Think</span></p>
          <p className="text-amber-300 pl-4">action  = LLM.pick_tool(thought)       <span className="text-gray-600"># 🔧 Act</span></p>
          <p className="text-green-300 pl-4">result  = tool.execute(action)          <span className="text-gray-600"># ⚡ Execute</span></p>
          <p className="text-cyan-300 pl-4">memory.add(result)                      <span className="text-gray-600"># 💾 Remember</span></p>
          <p className="text-pink-300 pl-4">observation = LLM.evaluate(result)      <span className="text-gray-600"># 🔄 Observe</span></p>
        </div>
      </div>
    </div>
  );
};

const CompareTab = () => {
  const [sel, setSel] = useState(["orchestrator","router"]);
  const toggle = id => setSel(p => p.includes(id)?(p.length>1?p.filter(x=>x!==id):p):p.length<3?[...p,id]:[...p.slice(1),id]);
  const selected = patterns.filter(p => sel.includes(p.id));
  const attrs = [
    { l: "# of LLMs needed", v: { orchestrator:"2-5", pipeline:"2-4", hierarchical:"5-10+", collaborative:"3-5", router:"2-5", swarm:"3-6+" }},
    { l: "Best LLM for controller", v: { orchestrator:"Strong (Opus/GPT-4)", pipeline:"N/A (no controller)", hierarchical:"Strongest available", collaborative:"Strong (Judge)", router:"Cheapest/fastest", swarm:"N/A (no controller)" }},
    { l: "LLM cost", v: { orchestrator:"Medium-High", pipeline:"Medium", hierarchical:"High", collaborative:"Highest", router:"Low-Medium", swarm:"Medium" }},
    { l: "Tool diversity", v: { orchestrator:"High", pipeline:"Medium", hierarchical:"Very High", collaborative:"Medium", router:"High", swarm:"High" }},
    { l: "Complexity", v: { orchestrator:"Medium", pipeline:"Low", hierarchical:"High", collaborative:"High", router:"Low", swarm:"Very High" }},
    { l: "Latency", v: { orchestrator:"Medium", pipeline:"High", hierarchical:"High", collaborative:"Very High", router:"Low", swarm:"Variable" }},
    { l: "Fault tolerance", v: { orchestrator:"Low", pipeline:"Low", hierarchical:"Medium", collaborative:"Medium", router:"Medium", swarm:"High" }},
  ];
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-white">Compare Patterns</h2>
      <p className="text-gray-400 text-sm">Select 2–3 to compare (focus on LLM + tool requirements):</p>
      <div className="flex gap-2 flex-wrap">
        {patterns.map(p => (
          <button key={p.id} onClick={() => toggle(p.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sel.includes(p.id)?`bg-gradient-to-r ${p.color} text-white`:"bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
            {p.icon} {p.name}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-700">
            <th className="py-2 pr-4 text-left text-gray-500">Attribute</th>
            {selected.map(p => <th key={p.id} className={`py-2 px-3 text-left ${p.text}`}>{p.icon} {p.name}</th>)}
          </tr></thead>
          <tbody>{attrs.map(a => (
            <tr key={a.l} className="border-b border-gray-800">
              <td className="py-2 pr-4 text-gray-400 font-medium">{a.l}</td>
              {selected.map(p => <td key={p.id} className="py-2 px-3 text-gray-300">{a.v[p.id]}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

const FrameworksTab = () => (
  <div className="space-y-5">
    <h2 className="text-2xl font-bold text-white">Python Frameworks for Multi-Agent</h2>
    {frameworks.map((f, i) => (
      <div key={i} className="bg-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h3 className="text-lg font-bold text-white">{f.name}</h3>
          <code className="text-xs bg-gray-900 text-green-400 px-2 py-0.5 rounded">{f.install}</code>
        </div>
        <p className="text-gray-300 text-sm mb-2">{f.desc}</p>
        <p className="text-gray-500 text-xs"><strong className="text-gray-400">Best for:</strong> {f.best}</p>
      </div>
    ))}
    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
      <p className="text-indigo-300 font-bold mb-1">🚀 Learning Path</p>
      <p className="text-gray-300 text-sm">
        <strong>Step 1:</strong> Build a single agent (LLM + tools) with Anthropic/OpenAI SDK<br/>
        <strong>Step 2:</strong> Try <strong className="text-white">CrewAI</strong> for your first multi-agent system<br/>
        <strong>Step 3:</strong> Graduate to <strong className="text-white">LangGraph</strong> for complex state machines<br/>
        <strong>Step 4:</strong> Explore <strong className="text-white">Swarm</strong> for lightweight handoff patterns
      </p>
    </div>
  </div>
);

const mainTabs = ["What's an Agent?", "Patterns", "Compare", "Frameworks"];

export default function MultiAgentExplorer() {
  const [tab, setTab] = useState(0);
  const [selPat, setSelPat] = useState(null);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-1 bg-gradient-to-r from-purple-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
          Multi-Agent Architecture
        </h1>
        <p className="text-center text-gray-500 mb-5 text-sm">LLMs + Tools + Patterns — Interactive Deep Dive</p>

        <div className="flex gap-1 mb-5 overflow-x-auto pb-2">
          {mainTabs.map((t, i) => (
            <button key={t} onClick={() => { setTab(i); setSelPat(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab===i?"bg-indigo-600 text-white":"bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{t}</button>
          ))}
        </div>

        {tab === 0 && <AnatomyTab />}

        {tab === 1 && !selPat && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white">6 Multi-Agent Patterns</h2>
            <p className="text-gray-400 text-sm">Each pattern shows which LLMs and tools go where. Click to explore:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map(p => (
                <button key={p.id} onClick={() => setSelPat(p)}
                  className={`bg-gradient-to-br ${p.color} rounded-xl p-5 text-left transition-all hover:scale-105`}>
                  <span className="text-3xl">{p.icon}</span>
                  <h3 className="text-lg font-bold text-white mt-2">{p.name}</h3>
                  <p className="text-white/70 text-sm">{p.tagline}</p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    <span className="text-xs bg-black/20 text-white/80 px-1.5 py-0.5 rounded">🧠 LLM</span>
                    <span className="text-xs bg-black/20 text-white/80 px-1.5 py-0.5 rounded">🔧 Tools</span>
                    <span className="text-xs bg-black/20 text-white/80 px-1.5 py-0.5 rounded">💾 Memory</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === 1 && selPat && <PatternDetail pattern={selPat} onBack={() => setSelPat(null)} />}

        {tab === 2 && <CompareTab />}
        {tab === 3 && <FrameworksTab />}
      </div>
    </div>
    </Layout>
  );
}