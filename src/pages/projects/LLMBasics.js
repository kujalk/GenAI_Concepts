import { useState, useEffect, useRef } from "react";

// ─── Tokenizer demo data ────────────────────────────────────────────────────
const SAMPLE_TEXTS = [
  { label: "Simple sentence", text: "Hello, world! How are you today?" },
  { label: "Code snippet", text: "def add(a, b):\n    return a + b" },
  { label: "LLM prompt", text: "Explain transformers to me like I'm five." },
];

const tokenColors = [
  "bg-purple-600", "bg-blue-600", "bg-emerald-600", "bg-amber-600",
  "bg-rose-600", "bg-cyan-600", "bg-fuchsia-600", "bg-orange-600",
  "bg-teal-600", "bg-indigo-600", "bg-lime-600", "bg-pink-600",
];

function naiveTokenize(text) {
  // Rough BPE-like tokenization for demo
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === ' ') {
      tokens.push({ text: '▁' + text.slice(i + 1, i + 1 + Math.min(6, text.slice(i+1).search(/[ \n,!?.:()]/)+1 || 6)), raw: text[i] });
      i++;
      const end = text.slice(i).search(/[ \n,!?.:()]/);
      const word = end === -1 ? text.slice(i) : text.slice(i, i + end);
      if (word.length > 0) { tokens[tokens.length - 1].text = '▁' + word; i += word.length; }
    } else if (/[,!?.:()]/.test(text[i])) {
      tokens.push({ text: text[i], raw: text[i] });
      i++;
    } else if (text[i] === '\n') {
      tokens.push({ text: '<0x0A>', raw: text[i] });
      i++;
    } else {
      const end = text.slice(i).search(/[ \n,!?.:()]/);
      const word = end === -1 ? text.slice(i) : text.slice(i, i + end);
      tokens.push({ text: word, raw: word });
      i += Math.max(1, word.length);
    }
  }
  return tokens.filter(t => t.text.length > 0 && t.text !== '▁');
}

// ─── Context Window visualiser data ─────────────────────────────────────────
const CTX_SIZES = [
  { model: "GPT-2", tokens: 1024, color: "#6366f1" },
  { model: "GPT-3.5", tokens: 4096, color: "#8b5cf6" },
  { model: "Claude 3", tokens: 200000, color: "#06b6d4" },
  { model: "Gemini 1.5", tokens: 1000000, color: "#10b981" },
];

// ─── Sequence diagram messages ────────────────────────────────────────────────
const CONVERSATION = [
  { role: "system", content: "You are a helpful coding assistant.", tokens: 8 },
  { role: "user", content: "What is a transformer?", tokens: 5 },
  { role: "assistant", content: "A transformer is a neural network architecture based on self-attention...", tokens: 42 },
  { role: "user", content: "Can you show me Python code?", tokens: 7 },
  { role: "assistant", content: "Sure! Here's a minimal transformer block in PyTorch...", tokens: 55 },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function LLMBasics() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["What is a Token?", "Context Window", "Message Bundle", "Full Flow"];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-mono">
      <header className="text-center mb-8">
        <div className="text-5xl mb-3">🧠</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">LLM Fundamentals</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-base">
          Tokens · Context Windows · System & User Messages · Continuous Iteration
        </p>
      </header>

      {/* Tab nav */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === i ? "bg-purple-600 text-white shadow-lg shadow-purple-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto">
        {activeTab === 0 && <TokenTab />}
        {activeTab === 1 && <ContextWindowTab />}
        {activeTab === 2 && <MessageBundleTab />}
        {activeTab === 3 && <FullFlowTab />}
      </div>
    </div>
  );
}

// ─── TAB 1: Tokenization ─────────────────────────────────────────────────────
function TokenTab() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [customText, setCustomText] = useState("");
  const [showIds, setShowIds] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  const inputText = customText || SAMPLE_TEXTS[sampleIdx].text;
  const tokens = naiveTokenize(inputText);

  useEffect(() => {
    setAnimating(true);
    setVisibleCount(0);
    let count = 0;
    const id = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= tokens.length) { clearInterval(id); setAnimating(false); }
    }, 60);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText]);

  return (
    <div className="space-y-6">
      {/* Concept card */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-purple-800">
        <h2 className="text-xl font-bold text-purple-300 mb-3">What is a Token?</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: "🔤", title: "Sub-word units", desc: "LLMs don't read characters or whole words — they split text into sub-word pieces. \"unbelievable\" → [\"un\", \"believ\", \"able\"]" },
            { icon: "🔢", title: "Integer IDs", desc: "Each token maps to a unique integer ID in the model's vocabulary (typically 32K–200K tokens). The model processes IDs, not text." },
            { icon: "📐", title: "Rule of thumb", desc: "~4 characters per token in English. 1 page ≈ 500 words ≈ 700 tokens. Code and non-English text use more tokens." },
          ].map((c, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-semibold text-white mb-1">{c.title}</div>
              <div className="text-gray-400 text-xs leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive tokenizer */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-blue-800">
        <h2 className="text-xl font-bold text-blue-300 mb-4">Interactive Tokenizer</h2>

        {/* Sample selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SAMPLE_TEXTS.map((s, i) => (
            <button key={i} onClick={() => { setSampleIdx(i); setCustomText(""); }}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                sampleIdx === i && !customText ? "border-blue-500 text-blue-300 bg-blue-950" : "border-gray-600 text-gray-400 hover:border-gray-400"
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <textarea
          placeholder="Or type your own text here..."
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          className="w-full bg-gray-800 text-gray-100 rounded-xl p-3 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none resize-none mb-4"
          rows={2}
        />

        {/* Token display */}
        <div className="bg-gray-950 rounded-xl p-4 min-h-16 flex flex-wrap gap-1 mb-3">
          {tokens.slice(0, visibleCount).map((tok, i) => (
            <span key={i} className={`inline-flex flex-col items-center rounded px-2 py-1 text-xs ${tokenColors[i % tokenColors.length]}`}
              style={{ animation: `fadeIn 0.2s ease-out` }}>
              <span className="text-white font-mono font-bold">{tok.text}</span>
              {showIds && <span className="text-gray-200 text-xs opacity-70">{1000 + i * 37}</span>}
            </span>
          ))}
          {animating && <span className="text-gray-500 text-xs animate-pulse ml-1">tokenizing…</span>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-400">
            <span className="text-white font-bold">{tokens.length}</span> tokens
            <span className="ml-3 text-gray-500">≈ {(tokens.length * 0.75).toFixed(0)} words</span>
            <span className="ml-3 text-gray-500">~${(tokens.length * 0.000002).toFixed(6)} cost</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showIds} onChange={e => setShowIds(e.target.checked)}
              className="accent-blue-500" />
            Show token IDs
          </label>
        </div>
      </div>

      {/* BPE explanation */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-emerald-800">
        <h2 className="text-xl font-bold text-emerald-300 mb-4">How Tokenization Works — BPE</h2>
        <div className="grid md:grid-cols-4 gap-3 text-xs">
          {[
            { step: "1", title: "Start with characters", example: "h e l l o", color: "emerald" },
            { step: "2", title: "Count pair frequencies", example: "he ll lo ... → 'he' is most common!", color: "blue" },
            { step: "3", title: "Merge top pair", example: "'he' + 'l' → 'hel' → merge again", color: "purple" },
            { step: "4", title: "Repeat until vocab full", example: "hello → [hello] (single token!)", color: "amber" },
          ].map((s) => (
            <div key={s.step} className={`bg-gray-800 rounded-xl p-3 border border-${s.color}-800`}>
              <div className={`text-${s.color}-400 font-bold text-lg`}>{s.step}</div>
              <div className="text-white font-semibold mt-1 mb-1">{s.title}</div>
              <div className="text-gray-300 font-mono bg-gray-900 rounded p-1">{s.example}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: Context Window ────────────────────────────────────────────────────
function ContextWindowTab() {
  const [used, setUsed] = useState(3200);
  const [selectedModel, setSelectedModel] = useState(1);
  const maxCtx = CTX_SIZES[selectedModel].tokens;
  const pct = Math.min(100, (used / maxCtx) * 100);
  const [pulse, setPulse] = useState(false);

  function handleSlider(v) {
    setUsed(parseInt(v));
    setPulse(parseInt(v) > maxCtx * 0.85);
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-cyan-800">
        <h2 className="text-xl font-bold text-cyan-300 mb-3">What is the Context Window?</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          The context window is the <span className="text-cyan-300 font-bold">maximum number of tokens</span> an LLM can
          "see" at once — its working memory. Everything fits in one giant array: system prompt, conversation history,
          documents, and the model's own previous responses. Once the window is full, <span className="text-rose-400 font-bold">older tokens are dropped</span>.
        </p>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: "📋", title: "What goes in?", items: ["System prompt", "Past user messages", "Past assistant replies", "Retrieved documents (RAG)", "Tool outputs"] },
            { icon: "⚠️", title: "When it fills up", items: ["Older messages get truncated", "Model loses earlier context", "RAG becomes critical", "Summaries help preserve state"] },
            { icon: "💡", title: "Strategies", items: ["Summarize old turns", "Use RAG for long docs", "Sliding window pruning", "Token-efficient prompting"] },
          ].map((c, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-semibold text-white mb-2">{c.title}</div>
              <ul className="text-gray-400 text-xs space-y-1">
                {c.items.map((it, j) => <li key={j} className="flex items-start gap-1"><span className="text-cyan-500 mt-0.5">›</span>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Visual context bar */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-indigo-800">
        <h2 className="text-xl font-bold text-indigo-300 mb-4">Context Window Explorer</h2>

        {/* Model picker */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CTX_SIZES.map((m, i) => (
            <button key={i} onClick={() => setSelectedModel(i)}
              className={`text-xs px-3 py-2 rounded-full border font-semibold transition-all ${
                selectedModel === i ? "border-indigo-400 bg-indigo-950 text-indigo-200" : "border-gray-600 text-gray-400 hover:border-gray-400"
              }`}
              style={selectedModel === i ? { borderColor: m.color } : {}}>
              {m.model} ({m.tokens.toLocaleString()} ctx)
            </button>
          ))}
        </div>

        {/* Big context bar */}
        <div className="relative mb-4">
          <div className="w-full h-14 bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            {/* System prompt */}
            <div className="absolute top-0 left-0 h-full bg-purple-800 opacity-90 flex items-center justify-center text-xs text-white font-bold"
              style={{ width: `${Math.min(15, (500/maxCtx)*100*4)}%` }}>
              <span className="truncate px-1">SYS</span>
            </div>
            {/* Used context */}
            <div className={`absolute top-0 left-0 h-full transition-all duration-500 ${pct > 85 ? "bg-rose-700" : pct > 60 ? "bg-amber-700" : "bg-emerald-700"}`}
              style={{ width: `${pct}%`, opacity: 0.85 }}>
            </div>
            {/* Label */}
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow">
              {used.toLocaleString()} / {maxCtx.toLocaleString()} tokens used ({pct.toFixed(1)}%)
            </div>
          </div>
          {pct > 85 && (
            <div className={`text-rose-400 text-xs mt-2 font-semibold ${pulse ? "animate-pulse" : ""}`}>
              ⚠️ Context nearly full — older messages will be truncated!
            </div>
          )}
        </div>

        {/* Slider */}
        <input type="range" min={100} max={maxCtx} value={Math.min(used, maxCtx)} step={100}
          onChange={e => handleSlider(e.target.value)}
          className="w-full accent-indigo-500 mb-4" />

        {/* Breakdown legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { color: "bg-purple-700", label: "System Prompt", tokens: Math.min(500, used) },
            { color: "bg-blue-700", label: "User Messages", tokens: Math.min(Math.floor(used * 0.3), used - 500) },
            { color: "bg-emerald-700", label: "Assistant Replies", tokens: Math.min(Math.floor(used * 0.4), Math.max(0, used - 800)) },
            { color: "bg-amber-700", label: "RAG / Tool Output", tokens: Math.max(0, used - Math.min(500, used) - Math.floor(used * 0.3) - Math.floor(used * 0.4)) },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-lg p-2 bg-opacity-50 border border-gray-700`}>
              <div className="font-semibold text-white">{s.label}</div>
              <div className="text-gray-200">{Math.max(0, s.tokens).toLocaleString()} tokens</div>
            </div>
          ))}
        </div>
      </div>

      {/* Model comparison */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-teal-800">
        <h2 className="text-xl font-bold text-teal-300 mb-4">Model Context Window Comparison</h2>
        <div className="space-y-3">
          {CTX_SIZES.map((m, i) => {
            const maxBar = 1000000;
            const w = Math.log10(m.tokens) / Math.log10(maxBar) * 100;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-300 font-semibold text-right">{m.model}</div>
                <div className="flex-1 bg-gray-800 rounded-full h-6 relative overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 flex items-center px-3"
                    style={{ width: `${w}%`, backgroundColor: m.color }}>
                    <span className="text-white text-xs font-bold whitespace-nowrap">{m.tokens.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 w-20">≈ {m.tokens >= 1000000 ? (m.tokens/1000000).toFixed(1)+"M" : m.tokens >= 1000 ? (m.tokens/1000).toFixed(0)+"K" : m.tokens} tokens</div>
              </div>
            );
          })}
        </div>
        <p className="text-gray-500 text-xs mt-3">Bar width uses log scale. 1M tokens ≈ a full novel (750 pages).</p>
      </div>
    </div>
  );
}

// ─── TAB 3: Message Bundle ────────────────────────────────────────────────────
function MessageBundleTab() {
  const [step, setStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setInterval(() => {
        setStep(s => {
          if (s >= CONVERSATION.length - 1) { setAutoPlay(false); return s; }
          return s + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timerRef.current);
  }, [autoPlay]);

  const totalTokens = CONVERSATION.slice(0, step + 1).reduce((a, m) => a + m.tokens, 0);
  const maxTokens = 4096;

  const roleStyle = {
    system:    { bg: "bg-purple-900", border: "border-purple-500", label: "SYSTEM",    icon: "⚙️", textColor: "text-purple-200" },
    user:      { bg: "bg-blue-900",   border: "border-blue-500",   label: "USER",      icon: "👤", textColor: "text-blue-200" },
    assistant: { bg: "bg-emerald-900",border: "border-emerald-500",label: "ASSISTANT", icon: "🤖", textColor: "text-emerald-200" },
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-blue-800">
        <h2 className="text-xl font-bold text-blue-300 mb-3">How Messages Are Bundled</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Every API call sends <span className="text-white font-bold">the entire conversation history</span> to the model —
          not just the latest message. The model is stateless; it has no memory between calls. Your application
          must <span className="text-amber-300 font-bold">collect and re-send all previous messages</span> on every turn.
          This bundle of messages is called the <span className="text-cyan-300 font-bold">context</span>.
        </p>
      </div>

      {/* Sequence animator */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-purple-800">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-purple-300">Message Bundle Builder</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => { setStep(0); setAutoPlay(false); }}
              className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600">Reset</button>
            <button onClick={() => setAutoPlay(a => !a)}
              className={`text-xs px-4 py-1 rounded-full font-bold transition-all ${autoPlay ? "bg-rose-700 text-white" : "bg-emerald-700 text-white"}`}>
              {autoPlay ? "⏸ Pause" : "▶ Auto Play"}
            </button>
          </div>
        </div>

        {/* Token progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Tokens in bundle</span>
            <span className={totalTokens > maxTokens * 0.8 ? "text-rose-400 font-bold" : "text-gray-400"}>
              {totalTokens} / {maxTokens}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (totalTokens / maxTokens) * 100)}%`,
                background: totalTokens > maxTokens * 0.8 ? "#ef4444" : "linear-gradient(to right, #6366f1, #06b6d4)"
              }} />
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 mb-5">
          {CONVERSATION.slice(0, step + 1).map((msg, i) => {
            const s = roleStyle[msg.role];
            return (
              <div key={i} className={`rounded-xl p-4 border ${s.bg} ${s.border} transition-all duration-300`}
                style={{ animation: "slideIn 0.3s ease-out" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{s.icon}</span>
                  <span className={`text-xs font-bold ${s.textColor} tracking-widest`}>{s.label}</span>
                  <span className="ml-auto text-xs text-gray-500">{msg.tokens} tokens</span>
                </div>
                <p className="text-gray-200 text-sm">{msg.content}</p>
              </div>
            );
          })}
        </div>

        {/* Step controls */}
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm disabled:opacity-30 hover:bg-gray-600">
            ← Previous
          </button>
          <div className="flex gap-1">
            {CONVERSATION.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i <= step ? "bg-purple-500" : "bg-gray-600"}`} />
            ))}
          </div>
          <button onClick={() => setStep(s => Math.min(CONVERSATION.length - 1, s + 1))} disabled={step === CONVERSATION.length - 1}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm disabled:opacity-30 hover:bg-gray-600">
            Next →
          </button>
        </div>
      </div>

      {/* API payload preview */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-amber-800">
        <h2 className="text-xl font-bold text-amber-300 mb-4">Actual API Payload</h2>
        <div className="bg-gray-950 rounded-xl p-4 text-xs font-mono overflow-auto max-h-72">
          <pre className="text-gray-300 whitespace-pre-wrap">{JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: CONVERSATION[0].content,
            messages: CONVERSATION.slice(1, step + 1).map(m => ({ role: m.role, content: m.content })),
          }, null, 2)}</pre>
        </div>
        <p className="text-gray-500 text-xs mt-3">
          ↑ This entire payload is sent on every turn. The model has no memory — your app maintains the history.
        </p>
      </div>
    </div>
  );
}

// ─── TAB 4: Full Flow Sequence Diagram ────────────────────────────────────────
function FullFlowTab() {
  const [activeStep, setActiveStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const runRef = useRef(null);

  const steps = [
    { from: 0, to: 1, label: "Types message", color: "#3b82f6", detail: "Raw text input from the user interface — e.g. \"What is a transformer?\"" },
    { from: 1, to: 2, label: "Encode text → token IDs", color: "#8b5cf6", detail: "Tokenizer converts text to integer IDs. \"What is a transformer?\" → [2061, 374, 264, 43616, 30]" },
    { from: 2, to: 1, label: "Return IDs [2061, 374, ...]", color: "#8b5cf6", detail: "Token IDs returned to the application layer for context assembly." },
    { from: 1, to: 3, label: "Prepend system prompt + history", color: "#f59e0b", detail: "App assembles: [SYSTEM] + [Turn 1] + [Turn 2] + ... + [New message]. Full history every call." },
    { from: 3, to: 4, label: "POST /messages (full bundle)", color: "#06b6d4", detail: "The complete context array is sent in a single API request. The LLM is stateless — it sees everything at once." },
    { from: 4, to: 4, label: "Self-attention over all tokens", color: "#10b981", detail: "Every token attends to every other token O(n²). The model predicts the next-token probability distribution." },
    { from: 4, to: 3, label: "Stream response tokens", color: "#06b6d4", detail: "Model outputs one token at a time. Streaming lets the UI display text as it is generated." },
    { from: 3, to: 1, label: "Append assistant reply to history", color: "#f59e0b", detail: "The full assistant reply is appended to conversation history for the next turn." },
    { from: 1, to: 0, label: "Display decoded response", color: "#3b82f6", detail: "Token IDs are decoded back to text and shown in the UI. The cycle repeats on the next message." },
  ];

  const actors = [
    { label: "User",            color: "#3b82f6" },
    { label: "App",             color: "#f59e0b" },
    { label: "Tokenizer",       color: "#8b5cf6" },
    { label: "Context Builder", color: "#06b6d4" },
    { label: "LLM API",         color: "#10b981" },
  ];

  // SVG geometry
  const N = actors.length;
  const COL = 130;          // px per actor column
  const ROW = 72;           // px per step row
  const HDR = 52;           // actor header height
  const PAD = 16;           // horizontal padding
  const SW  = N * COL + PAD * 2;
  const SH  = HDR + steps.length * ROW + 20;
  const cx  = (i) => PAD + i * COL + COL / 2;

  useEffect(() => {
    if (running) {
      let s = 0;
      runRef.current = setInterval(() => {
        setActiveStep(s);
        s++;
        if (s >= steps.length) { setRunning(false); clearInterval(runRef.current); }
      }, 850);
    }
    return () => clearInterval(runRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function startAnim() { setActiveStep(-1); setRunning(false); clearInterval(runRef.current); setTimeout(() => setRunning(true), 50); }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-cyan-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-300">End-to-End LLM Call Flow</h2>
          <div className="flex gap-2">
            <button onClick={() => { setActiveStep(-1); setRunning(false); clearInterval(runRef.current); }}
              className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600">Reset</button>
            <button onClick={startAnim}
              className="text-xs px-4 py-1 rounded-full bg-cyan-700 text-white font-bold hover:bg-cyan-600">▶ Animate</button>
          </div>
        </div>

        {/* SVG Sequence Diagram */}
        <div className="overflow-x-auto rounded-xl bg-gray-950 border border-gray-700">
          <svg width="100%" viewBox={`0 0 ${SW} ${SH}`} style={{ minWidth: 600, display: "block" }}>
            <defs>
              {actors.map((a, i) => (
                <marker key={i} id={`arr-${i}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill={a.color} />
                </marker>
              ))}
              <marker id="arr-self" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
              </marker>
            </defs>

            {/* Actor boxes + lifelines */}
            {actors.map((a, i) => (
              <g key={i}>
                <rect x={cx(i) - 52} y={6} width={104} height={36} rx={8}
                  fill={a.color + "22"} stroke={a.color} strokeWidth={2} />
                <text x={cx(i)} y={29} textAnchor="middle" fill={a.color}
                  fontSize={10} fontWeight="bold" fontFamily="monospace">{a.label}</text>
                {/* Lifeline */}
                <line x1={cx(i)} y1={42} x2={cx(i)} y2={SH - 8}
                  stroke="#374151" strokeWidth={1} strokeDasharray="5,4" />
              </g>
            ))}

            {/* Steps */}
            {steps.map((s, i) => {
              const y    = HDR + i * ROW + ROW / 2;
              const x1   = cx(s.from);
              const x2   = cx(s.to);
              const isSelf   = s.from === s.to;
              const isActive = activeStep === -1 || i <= activeStep;
              const isCurrent = i === activeStep;
              const fade = !isActive ? 0.18 : 1;
              const toColor = actors[s.to].color;

              return (
                <g key={i} onClick={() => setActiveStep(i)} style={{ cursor: "pointer", opacity: fade, transition: "opacity 0.3s" }}>
                  {/* Step number badge */}
                  <circle cx={x1} cy={y} r={10} fill={isCurrent ? s.color : "#1f2937"} stroke={s.color} strokeWidth={1.5} />
                  <text x={x1} y={y + 4} textAnchor="middle" fill={isCurrent ? "#fff" : s.color} fontSize={9} fontWeight="bold">{i + 1}</text>

                  {isSelf ? (
                    // Self-loop arrow
                    <g>
                      <path d={`M ${x1 + 10} ${y - 14} Q ${x1 + 46} ${y - 28} ${x1 + 46} ${y} Q ${x1 + 46} ${y + 28} ${x1 + 10} ${y + 14}`}
                        fill="none" stroke={toColor} strokeWidth={isCurrent ? 2.5 : 1.5}
                        markerEnd="url(#arr-self)" />
                      <rect x={x1 + 48} y={y - 11} width={72} height={22} rx={4}
                        fill="#111827" stroke={isCurrent ? toColor : "#374151"} strokeWidth={isCurrent ? 1.5 : 1} />
                      <text x={x1 + 84} y={y + 4} textAnchor="middle" fill={isCurrent ? "#e2e8f0" : "#9ca3af"} fontSize={8} fontFamily="monospace">
                        {s.label}
                      </text>
                    </g>
                  ) : (
                    // Arrow between two actors
                    <g>
                      <line
                        x1={s.from < s.to ? x1 + 11 : x1 - 11}
                        y1={y}
                        x2={s.from < s.to ? x2 - 4  : x2 + 4}
                        y2={y}
                        stroke={toColor}
                        strokeWidth={isCurrent ? 2.5 : 1.5}
                        markerEnd={`url(#arr-${s.to})`}
                      />
                      {/* Label above arrow */}
                      <text
                        x={(x1 + x2) / 2}
                        y={y - 8}
                        textAnchor="middle"
                        fill={isCurrent ? "#f1f5f9" : "#6b7280"}
                        fontSize={8.5}
                        fontFamily="monospace"
                      >
                        {s.label}
                      </text>
                      {/* Activation box on target */}
                      {isCurrent && (
                        <rect x={x2 - 5} y={y - 14} width={10} height={28} rx={2}
                          fill={toColor} fillOpacity={0.5} />
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail card for active step */}
        <div className="mt-4 min-h-14">
          {activeStep >= 0 ? (
            <div className="rounded-xl px-4 py-3 border text-sm transition-all"
              style={{ borderColor: actors[steps[activeStep].to].color + "66", backgroundColor: actors[steps[activeStep].to].color + "11" }}>
              <span className="font-bold text-xs tracking-widest mr-2" style={{ color: actors[steps[activeStep].to].color }}>
                STEP {activeStep + 1} — {actors[steps[activeStep].from].label} → {actors[steps[activeStep].to].label}
              </span>
              <span className="text-gray-300">{steps[activeStep].detail}</span>
            </div>
          ) : (
            <p className="text-gray-500 text-xs mt-1">Click any step number or press ▶ Animate to walk through the flow.</p>
          )}
        </div>
      </div>

      {/* Key insight cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { icon: "🔄", title: "Stateless by Design", desc: "The LLM has NO memory between API calls. Each call is independent. Your application is responsible for maintaining and sending conversation history.", color: "purple" },
          { icon: "📦", title: "Full Bundle Every Time", desc: "Whether it's turn 1 or turn 50, you always send the full accumulated context. This is why context window size matters — longer conversations cost more.", color: "blue" },
          { icon: "📈", title: "Growing Cost Per Turn", desc: "Turn 1: 20 tokens. Turn 10: 500 tokens. Turn 30: 2000 tokens. Each turn costs MORE than the last because the bundle grows. Budget accordingly.", color: "amber" },
          { icon: "✂️", title: "Truncation Strategies", desc: "When context fills: drop oldest messages, summarize past turns, or use a sliding window. RAG replaces large documents with retrieved snippets.", color: "rose" },
        ].map((c, i) => (
          <div key={i} className={`bg-gray-900 rounded-xl p-5 border border-${c.color}-800`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{c.icon}</span>
              <span className={`font-bold text-${c.color}-300`}>{c.title}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
