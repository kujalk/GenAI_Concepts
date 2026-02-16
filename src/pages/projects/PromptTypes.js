import { useState } from "react";

const techniques = [
  {
    id: "zero-shot",
    name: "Zero-Shot",
    emoji: "🎯",
    difficulty: "Beginner",
    color: "#3B82F6",
    tagline: "No examples, just instructions",
    description: "Ask the model to perform a task without providing any examples. Relies entirely on the model's pre-trained knowledge.",
    when: "Simple, well-defined tasks the model already understands — classification, translation, summarization.",
    strengths: ["Minimal effort", "Fast iteration", "Works for common tasks"],
    weaknesses: ["Less control over output format", "Can be inconsistent", "Struggles with niche tasks"],
    example: {
      prompt: `Classify the sentiment of this review as positive, negative, or neutral:\n\n"The battery life is decent but the camera is terrible."`,
      output: `Sentiment: Negative`
    }
  },
  {
    id: "few-shot",
    name: "Few-Shot",
    emoji: "📚",
    difficulty: "Beginner",
    color: "#8B5CF6",
    tagline: "Teach by example",
    description: "Provide a few input-output examples before your actual query. The model learns the pattern and applies it to new inputs.",
    when: "When you need consistent formatting, specific output structure, or the task is ambiguous without examples.",
    strengths: ["Much more consistent output", "Controls format and style", "Handles niche tasks better"],
    weaknesses: ["Uses more tokens", "Bad examples = bad results", "Choosing examples matters a lot"],
    example: {
      prompt: `Classify the sentiment:\n\nReview: "Absolutely love this product!"\nSentiment: Positive\n\nReview: "Worst purchase I ever made."\nSentiment: Negative\n\nReview: "It's okay, nothing special."\nSentiment: Neutral\n\nReview: "The battery life is decent but the camera is terrible."\nSentiment:`,
      output: `Negative`
    }
  },
  {
    id: "cot",
    name: "Chain of Thought",
    emoji: "🔗",
    difficulty: "Intermediate",
    color: "#F59E0B",
    tagline: "Think step by step",
    description: "Instruct the model to break down its reasoning into intermediate steps before arriving at a final answer. Dramatically improves performance on complex reasoning tasks.",
    when: "Math problems, logic puzzles, multi-step reasoning, any task where showing work improves accuracy.",
    strengths: ["Much better accuracy on reasoning", "Transparent decision-making", "Catches logical errors"],
    weaknesses: ["Longer responses (more tokens)", "Can overthink simple tasks", "Steps can still contain errors"],
    example: {
      prompt: `A farmer has 17 sheep. All but 9 die. How many sheep are left?\n\nThink step by step.`,
      output: `Step 1: The farmer starts with 17 sheep.\nStep 2: "All but 9 die" means 9 sheep survive.\nStep 3: So 9 sheep are left.\n\nAnswer: 9 sheep.`
    }
  },
  {
    id: "react",
    name: "ReAct",
    emoji: "⚡",
    difficulty: "Advanced",
    color: "#EF4444",
    tagline: "Reason + Act in a loop",
    description: "Combines reasoning (chain of thought) with action-taking (tool use). The model thinks about what to do, takes an action, observes the result, then reasons again. Powers most AI agents today.",
    when: "Agentic tasks — web search, API calls, multi-step workflows, anything requiring external tools or dynamic information.",
    strengths: ["Handles dynamic, real-world tasks", "Self-correcting loop", "Foundation of AI agents"],
    weaknesses: ["Complex to implement", "Depends on tool quality", "Can get stuck in loops"],
    example: {
      prompt: `Question: What is the population of the capital of Australia?\n\n[ReAct Loop]`,
      output: `Thought: I need to find Australia's capital first.\nAction: search("capital of Australia")\nObservation: Canberra is the capital of Australia.\n\nThought: Now I need Canberra's population.\nAction: search("population of Canberra")\nObservation: ~460,000 (2023)\n\nThought: I have my answer.\nAnswer: ~460,000`
    }
  },
  {
    id: "tot",
    name: "Tree of Thought",
    emoji: "🌳",
    difficulty: "Advanced",
    color: "#10B981",
    tagline: "Explore multiple reasoning paths",
    description: "Instead of a single chain of reasoning, the model explores multiple possible paths (like a tree), evaluates each branch, and selects the most promising one. Think of it as 'brainstorm, then choose.'",
    when: "Creative problem-solving, strategic planning, puzzles with multiple valid approaches, tasks where the first idea isn't always best.",
    strengths: ["Explores diverse solutions", "Better for creative tasks", "Reduces tunnel vision"],
    weaknesses: ["Very token-heavy", "Complex prompt engineering", "Slower execution"],
    example: {
      prompt: `How can we reduce cloud costs by 30%?\n\nGenerate 3 different approaches, evaluate each, then select the best.`,
      output: `Branch A: Right-size instances → saves ~20%, low risk\nBranch B: Spot instances + auto-scaling → saves ~40%, medium risk\nBranch C: Multi-cloud arbitrage → saves ~35%, high complexity\n\nEvaluation: Branch B offers best savings-to-risk ratio.\n\nRecommendation: Implement spot instances with auto-scaling fallback.`
    }
  },
  {
    id: "self-consistency",
    name: "Self-Consistency",
    emoji: "🔄",
    difficulty: "Intermediate",
    color: "#EC4899",
    tagline: "Sample multiple answers, take the majority",
    description: "Run the same prompt multiple times (with temperature > 0), collect different reasoning paths, then take the most common final answer. A 'wisdom of crowds' approach using the same model.",
    when: "High-stakes decisions, math/logic where you want confidence, any task where consistency matters more than speed.",
    strengths: ["More reliable answers", "Quantifies confidence", "Simple to implement"],
    weaknesses: ["Multiplies API costs", "Slower (multiple calls)", "Doesn't help if model is systematically wrong"],
    example: {
      prompt: `[Same CoT prompt run 5 times]`,
      output: `Run 1: Answer = 42\nRun 2: Answer = 42\nRun 3: Answer = 38\nRun 4: Answer = 42\nRun 5: Answer = 42\n\nMajority vote → 42 (4/5 agreement, 80% confidence)`
    }
  },
  {
    id: "role",
    name: "Role / Persona",
    emoji: "🎭",
    difficulty: "Beginner",
    color: "#6366F1",
    tagline: "You are an expert in...",
    description: "Assign the model a specific role or persona to shape its responses. This primes the model to use domain-specific knowledge, tone, and reasoning patterns.",
    when: "Domain-specific tasks, when you need expert-level depth, or when tone/style matters (e.g., teaching, code review).",
    strengths: ["Activates domain knowledge", "Controls tone and style", "Easy to combine with other techniques"],
    weaknesses: ["Can introduce bias", "Role may be too narrow", "Persona can override accuracy"],
    example: {
      prompt: `You are a senior AWS Solutions Architect with 15 years of experience.\n\nReview this architecture and identify potential issues:\n[architecture description]`,
      output: `As an SA, I see three concerns:\n1. Single AZ deployment — no fault tolerance\n2. No caching layer — DB will bottleneck at scale\n3. Missing WAF — exposed to common web attacks\n\nRecommendation: Add multi-AZ, ElastiCache, and AWS WAF.`
    }
  },
  {
    id: "meta",
    name: "Meta Prompting",
    emoji: "🧠",
    difficulty: "Advanced",
    color: "#F97316",
    tagline: "Ask the AI to write the prompt",
    description: "Use the model to generate or refine its own prompts. You describe what you want to achieve, and the model crafts an optimized prompt for it. Great for prompt engineering itself.",
    when: "When you're unsure how to prompt for a complex task, or when you want to systematically improve prompt quality.",
    strengths: ["Leverages model's self-knowledge", "Great for complex tasks", "Iterative improvement"],
    weaknesses: ["Adds an extra step", "Generated prompts need testing", "Can be overly verbose"],
    example: {
      prompt: `I want to classify support tickets into categories. Write me an optimized prompt that will do this accurately and consistently.`,
      output: `Here's an optimized prompt:\n\n"You are a support ticket classifier. Given a ticket, output ONLY one of: [billing, technical, account, feature_request, other].\n\nExamples:\n- 'Can't login' → technical\n- 'Charge me twice' → billing\n...\n\nTicket: {input}\nCategory:"`
    }
  }
];

const difficultyColor = { Beginner: "#22C55E", Intermediate: "#F59E0B", Advanced: "#EF4444" };

export default function PromptingGuide() {
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("cards"); // cards | compare | flowchart
  const [compareA, setCompareA] = useState("zero-shot");
  const [compareB, setCompareB] = useState("cot");
  const [showExample, setShowExample] = useState({});

  const t = selected ? techniques.find(t => t.id === selected) : null;

  const toggleExample = (id) => setShowExample(p => ({ ...p, [id]: !p[id] }));

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0F172A", color: "#E2E8F0", minHeight: "100vh", padding: "24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
          Prompting Strategies Guide
        </h1>
        <p style={{ color: "#94A3B8", marginTop: 8, fontSize: 14 }}>Interactive comparison of LLM prompting techniques</p>
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {[["cards", "📋 Explore"], ["compare", "⚖️ Compare"], ["flowchart", "🗺️ Which to Use?"]].map(([v, label]) => (
          <button key={v} onClick={() => { setView(v); setSelected(null); }}
            style={{ padding: "8px 20px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: view === v ? "linear-gradient(135deg, #3B82F6, #8B5CF6)" : "#1E293B",
              color: view === v ? "#fff" : "#94A3B8", transition: "all .2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* === CARDS VIEW === */}
      {view === "cards" && !selected && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, maxWidth: 1100, margin: "0 auto" }}>
          {techniques.map(t => (
            <div key={t.id} onClick={() => setSelected(t.id)}
              style={{ background: "#1E293B", borderRadius: 16, padding: 20, cursor: "pointer", border: `1px solid ${t.color}22`,
                transition: "all .2s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = t.color + "66"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = t.color + "22"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${t.color}, transparent)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{t.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12, background: difficultyColor[t.difficulty] + "22", color: difficultyColor[t.difficulty] }}>
                  {t.difficulty}
                </span>
              </div>
              <h3 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>{t.name}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>{t.tagline}</p>
            </div>
          ))}
        </div>
      )}

      {/* === DETAIL VIEW === */}
      {view === "cards" && selected && t && (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <button onClick={() => setSelected(null)}
            style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 14, marginBottom: 16, padding: 0 }}>
            ← Back to all techniques
          </button>
          <div style={{ background: "#1E293B", borderRadius: 20, padding: 28, border: `1px solid ${t.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 36 }}>{t.emoji}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#F1F5F9" }}>{t.name}</h2>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 12, background: difficultyColor[t.difficulty] + "22", color: difficultyColor[t.difficulty] }}>
                  {t.difficulty}
                </span>
              </div>
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#CBD5E1", marginTop: 16 }}>{t.description}</p>

            <div style={{ background: "#0F172A", borderRadius: 12, padding: 16, marginTop: 16 }}>
              <h4 style={{ margin: "0 0 6px", fontSize: 13, color: t.color, textTransform: "uppercase", letterSpacing: 1 }}>When to use</h4>
              <p style={{ margin: 0, fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>{t.when}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              <div style={{ background: "#0F172A", borderRadius: 12, padding: 16 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#22C55E" }}>✅ Strengths</h4>
                {t.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: "#94A3B8", padding: "3px 0" }}>• {s}</div>)}
              </div>
              <div style={{ background: "#0F172A", borderRadius: 12, padding: 16 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#EF4444" }}>⚠️ Weaknesses</h4>
                {t.weaknesses.map((w, i) => <div key={i} style={{ fontSize: 13, color: "#94A3B8", padding: "3px 0" }}>• {w}</div>)}
              </div>
            </div>

            {/* Example */}
            <div style={{ marginTop: 20 }}>
              <button onClick={() => toggleExample(t.id)}
                style={{ background: `${t.color}15`, border: `1px solid ${t.color}33`, color: t.color, borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%" }}>
                {showExample[t.id] ? "Hide" : "Show"} Example {showExample[t.id] ? "▲" : "▼"}
              </button>
              {showExample[t.id] && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ background: "#0F172A", borderRadius: 10, padding: 14, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Prompt</div>
                    <pre style={{ margin: 0, fontSize: 13, color: "#CBD5E1", whiteSpace: "pre-wrap", lineHeight: 1.6, fontFamily: "'Fira Code', 'Consolas', monospace" }}>{t.example.prompt}</pre>
                  </div>
                  <div style={{ background: "#0F172A", borderRadius: 10, padding: 14, borderLeft: `3px solid ${t.color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Output</div>
                    <pre style={{ margin: 0, fontSize: 13, color: "#CBD5E1", whiteSpace: "pre-wrap", lineHeight: 1.6, fontFamily: "'Fira Code', 'Consolas', monospace" }}>{t.example.output}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === COMPARE VIEW === */}
      {view === "compare" && (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Technique A</label>
              <select value={compareA} onChange={e => setCompareA(e.target.value)}
                style={{ background: "#1E293B", color: "#E2E8F0", border: "1px solid #334155", borderRadius: 10, padding: "8px 14px", fontSize: 14 }}>
                {techniques.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
              </select>
            </div>
            <span style={{ alignSelf: "flex-end", fontSize: 20, color: "#475569", padding: "0 4px" }}>vs</span>
            <div>
              <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Technique B</label>
              <select value={compareB} onChange={e => setCompareB(e.target.value)}
                style={{ background: "#1E293B", color: "#E2E8F0", border: "1px solid #334155", borderRadius: 10, padding: "8px 14px", fontSize: 14 }}>
                {techniques.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
              </select>
            </div>
          </div>

          {(() => {
            const a = techniques.find(x => x.id === compareA);
            const b = techniques.find(x => x.id === compareB);
            const dims = [
              { label: "Complexity", key: "difficulty", vals: { Beginner: 1, Intermediate: 2, Advanced: 3 } },
              { label: "Token Cost", compute: t => ({ "zero-shot": 1, "few-shot": 2, "cot": 3, "react": 3, "tot": 4, "self-consistency": 5, "role": 1, "meta": 2 })[t.id] || 2 },
              { label: "Accuracy Boost", compute: t => ({ "zero-shot": 1, "few-shot": 2, "cot": 4, "react": 4, "tot": 5, "self-consistency": 5, "role": 2, "meta": 3 })[t.id] || 2 },
              { label: "Ease of Use", compute: t => ({ "zero-shot": 5, "few-shot": 4, "cot": 3, "react": 1, "tot": 1, "self-consistency": 3, "role": 5, "meta": 2 })[t.id] || 3 },
            ];
            return (
              <div style={{ background: "#1E293B", borderRadius: 16, padding: 24, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 0 }}>
                  <div style={{ padding: "12px", fontWeight: 700, fontSize: 13, color: "#64748B" }}>Dimension</div>
                  <div style={{ padding: "12px", fontWeight: 700, fontSize: 15, color: a.color, textAlign: "center" }}>{a.emoji} {a.name}</div>
                  <div style={{ padding: "12px", fontWeight: 700, fontSize: 15, color: b.color, textAlign: "center" }}>{b.emoji} {b.name}</div>

                  {dims.map((d, i) => {
                    const valA = d.compute ? d.compute(a) : d.vals[a[d.key]];
                    const valB = d.compute ? d.compute(b) : d.vals[b[d.key]];
                    return [
                      <div key={`l${i}`} style={{ padding: "14px 12px", fontSize: 13, fontWeight: 600, color: "#94A3B8", borderTop: "1px solid #334155" }}>{d.label}</div>,
                      <div key={`a${i}`} style={{ padding: "14px 12px", borderTop: "1px solid #334155", display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                        <div style={{ display: "flex", gap: 3 }}>
                          {[1,2,3,4,5].map(n => (
                            <div key={n} style={{ width: 24, height: 8, borderRadius: 4, background: n <= valA ? a.color : "#334155", transition: "all .3s" }} />
                          ))}
                        </div>
                      </div>,
                      <div key={`b${i}`} style={{ padding: "14px 12px", borderTop: "1px solid #334155", display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                        <div style={{ display: "flex", gap: 3 }}>
                          {[1,2,3,4,5].map(n => (
                            <div key={n} style={{ width: 24, height: 8, borderRadius: 4, background: n <= valB ? b.color : "#334155", transition: "all .3s" }} />
                          ))}
                        </div>
                      </div>
                    ];
                  })}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                  {[a, b].map(tech => (
                    <div key={tech.id} style={{ background: "#0F172A", borderRadius: 12, padding: 16 }}>
                      <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>{tech.description}</p>
                      <div style={{ marginTop: 12, fontSize: 12, color: "#64748B" }}>
                        <strong style={{ color: tech.color }}>Best for:</strong> {tech.when}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* === FLOWCHART VIEW === */}
      {view === "flowchart" && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <FlowChart />
        </div>
      )}
    </div>
  );
}

function FlowChart() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  const questions = [
    { q: "Does your task require external tools or APIs?", yes: "react-result", no: 1 },
    { q: "Does the task involve multi-step reasoning?", yes: 2, no: 3 },
    { q: "Are there multiple valid solution paths?", yes: "tot-result", no: "cot-result" },
    { q: "Do you need a specific output format?", yes: "few-shot-result", no: 4 },
    { q: "Is domain expertise important?", yes: "role-result", no: "zero-shot-result" },
  ];

  const results = {
    "react-result": { tech: "ReAct", emoji: "⚡", color: "#EF4444", tip: "Combine reasoning with tool calls in a Thought → Action → Observation loop. Perfect for agents." },
    "tot-result": { tech: "Tree of Thought", emoji: "🌳", color: "#10B981", tip: "Explore multiple branches, evaluate each, then select the best path. Great for creative or strategic problems." },
    "cot-result": { tech: "Chain of Thought", emoji: "🔗", color: "#F59E0B", tip: "Add 'Think step by step' or break reasoning into numbered steps. Huge accuracy boost for logic and math." },
    "few-shot-result": { tech: "Few-Shot", emoji: "📚", color: "#8B5CF6", tip: "Provide 2-5 high-quality input/output examples. The model will match your format precisely." },
    "role-result": { tech: "Role / Persona", emoji: "🎭", color: "#6366F1", tip: "Assign an expert persona to activate deep domain knowledge. Combine with CoT for even better results." },
    "zero-shot-result": { tech: "Zero-Shot", emoji: "🎯", color: "#3B82F6", tip: "Just ask directly! For simple tasks, a clear instruction is all you need." },
  };

  const reset = () => { setStep(0); setResult(null); };

  if (result) {
    const r = results[result];
    return (
      <div style={{ background: "#1E293B", borderRadius: 20, padding: 32, textAlign: "center", border: `1px solid ${r.color}44` }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{r.emoji}</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: r.color }}>{r.tech}</h2>
        <p style={{ color: "#94A3B8", lineHeight: 1.7, fontSize: 15, maxWidth: 440, margin: "12px auto 0" }}>{r.tip}</p>
        <div style={{ marginTop: 20, padding: "12px 16px", background: "#0F172A", borderRadius: 10, display: "inline-block" }}>
          <span style={{ fontSize: 12, color: "#64748B" }}>💡 Pro tip: Techniques can be combined! Try <strong style={{ color: "#E2E8F0" }}>{r.tech} + Few-Shot</strong> for maximum control.</span>
        </div>
        <div style={{ marginTop: 24 }}>
          <button onClick={reset} style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}88)`, border: "none", color: "#fff", borderRadius: 12, padding: "10px 28px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const current = questions[step];

  return (
    <div style={{ background: "#1E293B", borderRadius: 20, padding: 32, textAlign: "center" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ width: 32, height: 4, borderRadius: 2, background: i <= step ? "#3B82F6" : "#334155", transition: "all .3s" }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#64748B" }}>Question {step + 1} of {questions.length}</span>
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", margin: "16px 0 28px", lineHeight: 1.4 }}>{current.q}</h3>
      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        {[["Yes", current.yes, "#22C55E"], ["No", current.no, "#64748B"]].map(([label, target, color]) => (
          <button key={label}
            onClick={() => typeof target === "string" ? setResult(target) : setStep(target)}
            style={{ padding: "12px 36px", borderRadius: 12, border: `2px solid ${color}44`, background: "transparent",
              color, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all .2s", minWidth: 120 }}
            onMouseEnter={e => { e.currentTarget.style.background = color + "15"; e.currentTarget.style.borderColor = color; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = color + "44"; }}>
            {label}
          </button>
        ))}
      </div>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} style={{ marginTop: 20, background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 13 }}>
          ← Go back
        </button>
      )}
    </div>
  );
}