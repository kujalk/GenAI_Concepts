<div align="center">

# 🧠 AWS GenAI Concepts

### An Interactive Learning Platform for AWS AI/ML & Multi-Agent Architectures

[![Live Site](https://img.shields.io/badge/🔗_Live_Site-Visit_Now-8B5CF6?style=for-the-badge)](https://kujalk.github.io/GenAI_Concepts)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/Deployed_on-GitHub_Pages-222?style=for-the-badge&logo=github&logoColor=white)](https://pages.github.com/)

<br/>

> Explore AWS GenAI services, multi-agent patterns, RAG pipelines, vector stores, and more — through interactive visualizations, step-by-step walkthroughs, and hands-on comparisons.

<br/>

[**Explore the Site**](https://kujalk.github.io/GenAI_Concepts) · [**Report a Bug**](../../issues) · [**Request a Topic**](../../issues)

</div>

---

## 📑 Table of Contents

- [Highlights](#-highlights)
- [Learning Modules](#-learning-modules)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Highlights

<table>
<tr>
<td width="50%">

### 🎯 Interactive Visualizations
Step-by-step architecture walkers, animated SVG diagrams, and tabbed deep dives that make complex topics click.

</td>
<td width="50%">

### 📐 6 Multi-Agent Patterns
Orchestrator, Pipeline, Hierarchical, Collaborative, Router, and Swarm — each with diagrams, pros/cons, and real-world use cases.

</td>
</tr>
<tr>
<td width="50%">

### ☁️ Deep AWS Coverage
From Bedrock Agents & RAG to SageMaker Inference, Guardrails, Glue Crawlers — 18 comprehensive guides and growing.

</td>
<td width="50%">

### ⚡ Zero Backend
Fully static site with no API calls. Fast loads, GitHub Pages hosting, and privacy-friendly analytics via GoatCounter.

</td>
</tr>
</table>

---

## 📚 Learning Modules

| # | Module | Description | Key Topics |
|:-:|--------|-------------|------------|
| 🧠 | **[AWS ML Services Overview](https://kujalk.github.io/GenAI_Concepts/#/aws-ml-services-overview)** | Bird's-eye view of AWS AI/ML services | Bedrock, SageMaker, AI Services |
| 🗄️ | **[AWS Vector Stores](https://kujalk.github.io/GenAI_Concepts/#/aws-vector-stores)** | Vector database options for Bedrock Knowledge Bases | OpenSearch, Aurora pgvector, Pinecone, Chroma |
| ✂️ | **[Chunking Strategies](https://kujalk.github.io/GenAI_Concepts/#/chunking-strategies)** | Chunking approaches for RAG pipelines | Fixed-size, Semantic, Hierarchical |
| 🤖 | **[Multi-Agent Architecture](https://kujalk.github.io/GenAI_Concepts/#/multi-agent-explorer)** | LLM agents, tools, memory & 6 collaboration patterns | Orchestrator, Pipeline, Swarm, Router |
| ☁️ | **[AWS Bedrock Agents](https://kujalk.github.io/GenAI_Concepts/#/bedrock-agents)** | Bedrock Agent internals & action groups | Agent SDK, Knowledge Bases, Memory |
| 📚 | **[AWS Bedrock RAG](https://kujalk.github.io/GenAI_Concepts/#/bedrock-rag)** | Three RAG approaches compared end-to-end | Lambda Pipeline, Knowledge Bases, OpenSearch Neural |
| 🪙 | **[Token Efficiency](https://kujalk.github.io/GenAI_Concepts/#/token-efficiency)** | Strategies to reduce token usage & cost | Prompt compression, Caching, Batching |
| 🔬 | **[SageMaker Inference](https://kujalk.github.io/GenAI_Concepts/#/sagemaker-inference)** | All SageMaker inference deployment options | Real-time, Serverless, Batch, Async |
| 🧠 | **[Bedrock Inference](https://kujalk.github.io/GenAI_Concepts/#/bedrock-inference)** | Bedrock inference capabilities & model options | On-Demand, Provisioned, Cross-Region |
| 🔍 | **[Bedrock Rerank & Hybrid Search](https://kujalk.github.io/GenAI_Concepts/#/bedrock-rerank-hybrid-search)** | Advanced RAG retrieval techniques | Reranking, Hybrid Search, Fusion |
| 🧩 | **[Strands Agent & Agent Squad](https://kujalk.github.io/GenAI_Concepts/#/strands-agent-squad)** | Agent coordination framework & squad patterns | Strands SDK, Agent Squads |
| 🔌 | **[MCP Server Architecture](https://kujalk.github.io/GenAI_Concepts/#/mcp-server-a-architecture)** | Model Context Protocol server design | MCP Servers, LLM Integration |
| 🛡️ | **[Bedrock Guardrails](https://kujalk.github.io/GenAI_Concepts/#/bedrock-guardrails)** | Content filtering, PII redaction & safety | Denied Topics, Word Filters, PII |
| ✍️ | **[Prompt Types](https://kujalk.github.io/GenAI_Concepts/#/prompt-types)** | Prompt engineering patterns & best practices | Zero-shot, Few-shot, Chain-of-Thought |
| 🎓 | **[LLM Training & Fine-Tuning](https://kujalk.github.io/GenAI_Concepts/#/llm-training-and-finetuning)** | Training and fine-tuning techniques | Continued Pre-training, RLHF, LoRA |
| 🔗 | **[SageMaker Lineage & Bedrock Eval](https://kujalk.github.io/GenAI_Concepts/#/sagemaker-lineage)** | ML provenance tracking & model evaluation | Lineage, Metrics, Quality Assessment |
| 🏗️ | **[Useful AWS Architectures](https://kujalk.github.io/GenAI_Concepts/#/useful-architectures)** | Production-ready reference architectures | Data Ingestion, Vector Search, MLOps |
| 📊 | **[Glue Crawlers & Data Catalog](https://kujalk.github.io/GenAI_Concepts/#/glue-crawlers-and-data-catalog)** | Making S3 data queryable with Glue & Athena | Crawlers, Data Catalog, Athena |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 | Component-based UI |
| **Routing** | React Router 6 (HashRouter) | Client-side navigation on static hosting |
| **Styling** | Tailwind CSS 3.4 | Utility-first responsive design |
| **Build** | Create React App | Zero-config bundling |
| **Deployment** | gh-pages | Automated GitHub Pages deploys |
| **Analytics** | GoatCounter | Privacy-friendly visitor tracking |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+

### Install & Run

```bash
# Clone the repository
git clone https://github.com/kujalk/GenAI_Concepts.git
cd GenAI_Concepts

# Install dependencies
npm install

# Start the development server (http://localhost:3000)
npm start
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Launch dev server with hot reload |
| `npm run build` | Create optimized production build |
| `npm test` | Run test suite |
| `npm run deploy` | Build & publish to GitHub Pages |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.js              # Responsive sidebar + main content wrapper
│   └── ProjectCard.js         # Reusable card for the home grid
├── data/
│   └── projects.js            # Single source of truth for all modules
├── pages/
│   ├── Home.js                # Landing page with project grid
│   ├── NotFound.js            # 404 page
│   └── projects/              # One file per learning module (18 pages)
│       ├── MultiAgentExplorer.js
│       ├── BedrockAgents.js
│       ├── BedrockRAG.js
│       └── ...
├── App.js                     # Route definitions
├── index.js                   # Entry point
└── index.css                  # Tailwind directives
```

> **Adding a new module?** Add an entry to `src/data/projects.js`, create a page in `src/pages/projects/`, and add the route in `App.js` — the sidebar and home grid update automatically.

---

## 🌐 Deployment

The site is deployed to **GitHub Pages** from the `gh-pages` branch.

```bash
# One command to build + deploy
npm run deploy
```

This runs `react-scripts build` then pushes the `/build` folder to the `gh-pages` branch via the `gh-pages` package.

---

## 🤝 Contributing

Contributions are welcome! Whether it's a new learning module, a bug fix, or improved visualizations:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/new-module`)
3. **Commit** your changes (`git commit -m "Add new module: Topic Name"`)
4. **Push** to the branch (`git push origin feature/new-module`)
5. **Open** a Pull Request

---

<div align="center">

**Built with React & Tailwind CSS for an engaging, interactive learning experience.**

[![Live Site](https://img.shields.io/badge/🔗_Explore_the_Site-8B5CF6?style=for-the-badge)](https://kujalk.github.io/GenAI_Concepts)

</div>
