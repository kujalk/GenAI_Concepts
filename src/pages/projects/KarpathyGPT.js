import { useState, useEffect, useRef } from "react";

// ─── Code sections from the 243-line GPT ────────────────────────────────────
const CODE_SECTIONS = [
  {
    id: "data",
    title: "1. Data Loading & Tokenization",
    icon: "📄",
    color: "#6366f1",
    lines: "Lines 1–35",
    code: `# Pure Python — zero external libraries needed!
import math, random

# Read text (e.g. Shakespeare)
text = open('input.txt').read()

# Build character-level vocabulary
chars     = sorted(set(text))          # ['\\n',' ','!', ...]
vocab_size = len(chars)                # 65 for Shakespeare

# Encode / decode look-up tables
stoi = {ch: i for i, ch in enumerate(chars)}
itos = {i: ch for i, ch in enumerate(chars)}

encode = lambda s: [stoi[c] for c in s]
decode = lambda l: ''.join(itos[i] for i in l)

# 90 / 10 train-val split (as integer indices)
data  = encode(text)                   # list of ints
n     = int(0.9 * len(data))
train = data[:n]
val   = data[n:]`,
    explanation: "Pure Python — no external libraries at all. Each character maps to a unique integer. The whole Shakespeare corpus (1 MB) becomes a flat list of integers like [47, 56, 57, 58, 1, ...]. stoi / itos are just Python dicts.",
    visual: "tokenizer",
  },
  {
    id: "batching",
    title: "2. Data Batching & Sliding Window",
    icon: "📦",
    color: "#8b5cf6",
    lines: "Lines 36–60",
    code: `block_size = 8    # context length (small for demo)

def get_batch(split):
    data = train if split == 'train' else val
    # Pick random start positions
    starts = [random.randint(0, len(data)-block_size-1)
               for _ in range(batch_size)]
    # x: input windows   y: targets (shifted +1)
    x = [data[i : i+block_size]   for i in starts]
    y = [data[i+1 : i+block_size+1] for i in starts]
    return x, y

# Example with block_size=5:
# x = [47, 56, 57, 58,  1]   ← "irst "
# y = [56, 57, 58,  1, 15]   ← "rst C"
#
# Every position is a training example:
#   [47]       → predict 56
#   [47, 56]   → predict 57
#   [47,56,57] → predict 58  ... etc.`,
    explanation: "The model learns from every prefix of every training window simultaneously. A single window of length 8 yields 8 separate training examples. No batching library needed — just Python list slicing.",
    visual: "batching",
  },
  {
    id: "attention",
    title: "3. Self-Attention (Pure Math)",
    icon: "🎯",
    color: "#06b6d4",
    lines: "Lines 61–110",
    code: `# Pure Python matrix operations
def matmul(A, B):
    rows, mid, cols = len(A), len(A[0]), len(B[0])
    return [[sum(A[i][k]*B[k][j] for k in range(mid))
             for j in range(cols)] for i in range(rows)]

def softmax(row):
    m = max(row)
    e = [math.exp(v - m) for v in row]
    s = sum(e)
    return [v/s for v in e]

def attention(Q, K, V):
    d_k   = len(Q[0])
    scale = math.sqrt(d_k)
    T     = len(Q)

    # Scaled dot-product scores  (T × T)
    scores = matmul(Q, [[K[j][i] for j in range(T)]
                         for i in range(d_k)])  # Q @ K.T
    scores = [[v/scale for v in row] for row in scores]

    # Causal mask: future positions → -infinity
    for i in range(T):
        for j in range(i+1, T):
            scores[i][j] = float('-inf')

    # Softmax + weighted sum of values
    attn = [softmax(row) for row in scores]
    return matmul(attn, V)`,
    explanation: "Self-attention implemented with pure Python list comprehensions — no numpy, no PyTorch. matmul is O(n³) list comprehension. The causal mask sets upper-triangle positions to −∞ so softmax zeroes them out, preventing future tokens from influencing the past.",
    visual: "attention",
  },
  {
    id: "multihead",
    title: "4. Multi-Head Attention",
    icon: "🔀",
    color: "#10b981",
    lines: "Lines 111–140",
    code: `# Linear projection: pure Python W@x + b
def linear(x, W, b=None):
    out = matmul(x, W)
    if b:
        out = [[out[i][j] + b[j]
                for j in range(len(b))]
               for i in range(len(out))]
    return out

def multi_head_attention(x, Wq, Wk, Wv, Wo,
                          n_head, head_size):
    T, C = len(x), len(x[0])
    heads = []
    for h in range(n_head):
        # Each head has its own Q/K/V projections
        sl = slice(h*head_size, (h+1)*head_size)
        Q  = [[row[sl] for row in linear(x, Wq[h])]]
        K  = [[row[sl] for row in linear(x, Wk[h])]]
        V  = linear(x, Wv[h])
        heads.append(attention(Q[0], K[0], V))

    # Concatenate heads then project
    concat = [sum((heads[h][i] for h in range(n_head)),[])
              for i in range(T)]
    return linear(concat, Wo)

# n_head=4, head_size=8, n_embd=32 (demo scale)`,
    explanation: "Each head independently projects tokens into Q/K/V sub-spaces and runs attention. The results are concatenated and projected back. Different heads learn different patterns: syntactic, semantic, positional. All in pure Python.",
    visual: "multihead",
  },
  {
    id: "ffn",
    title: "5. Feed-Forward Network",
    icon: "⚡",
    color: "#f59e0b",
    lines: "Lines 141–158",
    code: `def relu(x):
    return [[max(0.0, v) for v in row] for row in x]

def feed_forward(x, W1, b1, W2, b2):
    # Expand 4×, apply ReLU, project back
    # x: (T, n_embd) → hidden: (T, 4*n_embd) → out: (T, n_embd)
    hidden = relu(linear(x, W1, b1))   # 4× expansion
    return linear(hidden, W2, b2)      # project back

# Independently applied to each token position.
# "After tokens communicate via attention, each token
#  now processes what it learned — individually."
#
# Dimensions (demo):
#   x      : (T, 32)
#   W1     : (32, 128)   ← 4× expand
#   hidden : (T, 128)
#   W2     : (128, 32)   ← project back
#   out    : (T, 32)`,
    explanation: "The FFN is two linear layers with a ReLU in between. It runs position-by-position (no cross-token communication). It 'thinks' about what attention gathered. The 4× expansion follows the original 'Attention is All You Need' paper — just pure Python math here.",
    visual: "ffn",
  },
  {
    id: "block",
    title: "6. Transformer Block",
    icon: "🧱",
    color: "#ec4899",
    lines: "Lines 159–185",
    code: `def layer_norm(x, gamma, beta, eps=1e-5):
    out = []
    for row in x:
        mean = sum(row) / len(row)
        var  = sum((v-mean)**2 for v in row) / len(row)
        norm = [(v-mean)/math.sqrt(var+eps) for v in row]
        out.append([gamma[j]*norm[j]+beta[j]
                    for j in range(len(row))])
    return out

def transformer_block(x, params):
    Wq,Wk,Wv,Wo = params['attn']
    W1,b1,W2,b2  = params['ffn']
    g1,b1n,g2,b2n = params['norm']

    # Pre-norm + attention + residual
    normed = layer_norm(x, g1, b1n)
    attn   = multi_head_attention(normed, Wq,Wk,Wv,Wo,
                                   n_head, head_size)
    x = [[x[i][j]+attn[i][j] for j in range(C)]
          for i in range(T)]          # x = x + attn

    # Pre-norm + FFN + residual
    normed = layer_norm(x, g2, b2n)
    ff     = feed_forward(normed, W1,b1,W2,b2)
    x = [[x[i][j]+ff[i][j] for j in range(C)]
          for i in range(T)]          # x = x + ff
    return x`,
    explanation: "Pre-LayerNorm + residual connections. x = x + sublayer(x) is the single most important line. Without residuals, deep networks suffer vanishing gradients. Layer norm stabilises training by normalising each token's embedding vector. All pure Python.",
    visual: "block",
  },
  {
    id: "model",
    title: "7. Full GPT Forward Pass",
    icon: "🤖",
    color: "#ef4444",
    lines: "Lines 186–220",
    code: `def gpt_forward(token_ids, params):
    T = len(token_ids)

    # 1. Token embeddings — look up rows from table
    tok_emb = [params['tok_emb'][i] for i in token_ids]

    # 2. Positional embeddings — learn one vector per position
    pos_emb = params['pos_emb'][:T]

    # 3. Add token + position embeddings
    x = [[tok_emb[i][j] + pos_emb[i][j]
           for j in range(n_embd)]
          for i in range(T)]

    # 4. Run N transformer blocks
    for blk_params in params['blocks']:
        x = transformer_block(x, blk_params)

    # 5. Final layer norm
    x = layer_norm(x, params['ln_g'], params['ln_b'])

    # 6. Linear projection → logits over vocab
    logits = linear(x, params['lm_head'])
    # logits[t] = distribution over next token at position t
    return logits`,
    explanation: "The entire forward pass: look up embeddings, add position info, pass through N blocks, normalise, project to vocabulary. logits[t] gives the score for every possible next character after seeing positions 0..t. No libraries — pure nested Python lists.",
    visual: "model",
  },
  {
    id: "training",
    title: "8. Training Loop & Generation",
    icon: "🔁",
    color: "#84cc16",
    lines: "Lines 221–243",
    code: `def cross_entropy_loss(logits, targets):
    total = 0.0
    for t in range(len(targets)):
        probs  = softmax(logits[t])
        total -= math.log(probs[targets[t]] + 1e-9)
    return total / len(targets)

def generate(params, seed_ids, max_new=200):
    ids = list(seed_ids)
    for _ in range(max_new):
        ctx     = ids[-block_size:]      # trim to window
        logits  = gpt_forward(ctx, params)
        probs   = softmax(logits[-1])    # last position
        # Sample from probability distribution
        r, cum = random.random(), 0.0
        for tok, p in enumerate(probs):
            cum += p
            if r < cum:
                ids.append(tok); break
    return decode(ids)

# Training: gradient descent via finite differences
# (or analytical gradients) — pure Python, no autograd
# Typical config: n_embd=32, n_head=4, n_layer=4
# Trains in minutes on CPU for Shakespeare char-GPT`,
    explanation: "Cross-entropy loss and autoregressive generation in pure Python. The generate() loop samples one token at a time by converting logits to probabilities with softmax, then sampling. Training updates weights via gradient descent — either finite differences or a manual backprop, all in pure Python.",
    visual: "training",
  },
];

// ─── Attention visualization ─────────────────────────────────────────────────
const ATTN_TOKENS = ["The", "quick", "brown", "fox", "jumps"];

// ─── Architecture layers for animation ───────────────────────────────────────
const ARCH_LAYERS = [
  { label: "Input Tokens", color: "#6366f1", icon: "📝" },
  { label: "Token + Position Embedding", color: "#8b5cf6", icon: "🔢" },
  { label: "Block 1: Self-Attention", color: "#06b6d4", icon: "🎯" },
  { label: "Block 1: Feed-Forward", color: "#10b981", icon: "⚡" },
  { label: "Block 2: Self-Attention", color: "#06b6d4", icon: "🎯" },
  { label: "Block 2: Feed-Forward", color: "#10b981", icon: "⚡" },
  { label: "Block 3–6: (repeat)", color: "#94a3b8", icon: "⟳" },
  { label: "Layer Norm", color: "#f59e0b", icon: "📐" },
  { label: "Linear → Logits", color: "#ec4899", icon: "📊" },
  { label: "Softmax → Next Token", color: "#ef4444", icon: "✨" },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function KarpathyGPT() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Overview", "Architecture", "Code Walkthrough", "Attention Explorer", "Training Dynamics"];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-mono">
      <header className="text-center mb-8">
        <div className="text-5xl mb-3">🔬</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">GPT in 243 Lines</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm mb-3">
          Andrej Karpathy's <span className="text-cyan-400 font-bold">nanoGPT</span> — a complete GPT implementation from scratch, interactive and animated
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs">
          <a href="https://github.com/karpathy/nanoGPT" target="_blank" rel="noopener noreferrer"
            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-gray-300 hover:border-cyan-500 hover:text-cyan-300 transition-all">
            📂 Andrej Karpathy — nanoGPT (GitHub)
          </a>
          <a href="https://www.towardsdeeplearning.com/andrej-karpathy-just-built-an-entire-gpt-in-243-lines-of-python-7d66cfdfa301" target="_blank" rel="noopener noreferrer"
            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-gray-300 hover:border-purple-500 hover:text-purple-300 transition-all">
            📝 Sumit Pandey — Towards Deep Learning
          </a>
        </div>
      </header>

      {/* Tab nav */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === i ? "bg-cyan-700 text-white shadow-lg shadow-cyan-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto">
        {activeTab === 0 && <OverviewTab />}
        {activeTab === 1 && <ArchitectureTab />}
        {activeTab === 2 && <CodeWalkthroughTab />}
        {activeTab === 3 && <AttentionExplorerTab />}
        {activeTab === 4 && <TrainingDynamicsTab />}
      </div>
    </div>
  );
}

// ─── TAB 0: Overview ──────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-950 rounded-2xl p-6 border border-cyan-800">
        <h2 className="text-xl font-bold text-cyan-300 mb-4">What is this?</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Andrej Karpathy built a fully functional GPT language model in <span className="text-white font-bold">243 lines of pure Python</span> —
          no external libraries whatsoever, just Python's built-in <code className="bg-gray-800 px-1 rounded text-cyan-300">math</code> and <code className="bg-gray-800 px-1 rounded text-cyan-300">random</code> modules.
          It trains on Shakespeare and generates coherent text, capturing every core idea behind GPT-2 and GPT-3 in minimal, readable code.
          As Sumit Pandey explains in his article, the implementation proves that the GPT architecture is fundamentally just matrix math — no magic required.
        </p>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { label: "Lines of Code", value: "243", sub: "pure Python only", color: "cyan" },
            { label: "Dependencies", value: "0", sub: "no external libraries", color: "purple" },
            { label: "Train Data", value: "1 MB", sub: "Shakespeare corpus", color: "emerald" },
            { label: "Architecture", value: "GPT", sub: "decoder-only transformer", color: "amber" },
          ].map((s, i) => (
            <div key={i} className={`bg-gray-900 rounded-xl p-4 border border-${s.color}-800 text-center`}>
              <div className={`text-2xl font-bold text-${s.color}-300`}>{s.value}</div>
              <div className="text-white text-xs font-semibold mt-1">{s.label}</div>
              <div className="text-gray-500 text-xs">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key ideas */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-purple-800">
        <h2 className="text-xl font-bold text-purple-300 mb-4">The 5 Core Ideas</h2>
        <div className="space-y-4">
          {[
            { num: "01", title: "Language = Next Token Prediction", desc: "The entire task: given a sequence of tokens, predict the next one. That's it. From this simple objective, intelligence emerges.", icon: "🎯", color: "purple" },
            { num: "02", title: "Self-Attention = Tokens Talking to Each Other", desc: "Each token can look at all previous tokens and decide which ones are relevant. This 'attention' mechanism is what makes transformers so powerful.", icon: "🗣️", color: "cyan" },
            { num: "03", title: "Residual Connections = Deep Networks Made Trainable", desc: "x = x + sublayer(x). By adding the input back to the output, gradients can flow directly to early layers. This is why we can stack 96+ layers in GPT-3.", icon: "🔗", color: "emerald" },
            { num: "04", title: "Positional Embeddings = Order Awareness", desc: "Attention is permutation-invariant — it doesn't know order. Positional embeddings inject position information, so token 1 ≠ token 50.", icon: "📍", color: "amber" },
            { num: "05", title: "Scale = Intelligence", desc: "The same architecture trained on 1000× more data with 1000× more parameters becomes GPT-3. The recipe scales remarkably well.", icon: "📈", color: "rose" },
          ].map((idea) => (
            <div key={idea.num} className={`flex gap-4 bg-gray-800 rounded-xl p-4 border border-${idea.color}-900`}>
              <div className={`text-3xl font-black text-${idea.color}-800 w-10 shrink-0 select-none`}>{idea.num}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span>{idea.icon}</span>
                  <span className={`font-bold text-${idea.color}-300`}>{idea.title}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{idea.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GPT vs nanoGPT */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-gray-300 mb-4">nanoGPT vs Real GPTs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-700">
                <th className="text-left py-2 pr-4">Feature</th>
                <th className="text-center py-2 px-4 text-cyan-300">nanoGPT</th>
                <th className="text-center py-2 px-4 text-purple-300">GPT-2 (117M)</th>
                <th className="text-center py-2 px-4 text-emerald-300">GPT-3 (175B)</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ["Layers", "4–6", "12", "96"],
                ["Heads", "4", "12", "96"],
                ["Embedding dim", "32–384", "768", "12,288"],
                ["Parameters", "~1–10M", "~117M", "~175B"],
                ["Context window", "8–256", "1024", "2048"],
                ["Vocabulary", "65 (chars)", "50,257 (BPE)", "50,257 (BPE)"],
                ["Libraries", "None (pure Python)", "PyTorch", "PyTorch + Megatron"],
                ["Training data", "Shakespeare (1MB)", "WebText (40GB)", "Common Crawl (570GB)"],
                ["Architecture", "Decoder-only ✓", "Decoder-only ✓", "Decoder-only ✓"],
              ].map(([feat, nano, gpt2, gpt3], i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-2 pr-4 text-gray-400 font-semibold">{feat}</td>
                  <td className="py-2 px-4 text-center">{nano}</td>
                  <td className="py-2 px-4 text-center">{gpt2}</td>
                  <td className="py-2 px-4 text-center">{gpt3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-xs mt-3">Same architecture, very different scale. The nanoGPT code is the blueprint for all of them.</p>
      </div>
    </div>
  );
}

// ─── TAB 1: Architecture ─────────────────────────────────────────────────────
function ArchitectureTab() {
  const [activeLayer, setActiveLayer] = useState(-1);
  const [flowing, setFlowing] = useState(false);
  const flowRef = useRef(null);

  useEffect(() => {
    if (flowing) {
      let i = 0;
      flowRef.current = setInterval(() => {
        setActiveLayer(i);
        i++;
        if (i >= ARCH_LAYERS.length) { setFlowing(false); setActiveLayer(-1); clearInterval(flowRef.current); }
      }, 500);
    }
    return () => clearInterval(flowRef.current);
  }, [flowing]);

  const layerInfo = {
    "Input Tokens": "Raw text is split into characters (or BPE sub-words), mapped to integer IDs. e.g. \"Hello\" → [H=19, e=5, l=12, l=12, o=15]",
    "Token + Position Embedding": "Each token ID maps to a learned 384-dim vector. Position 0,1,2,... also map to 384-dim vectors. Both are ADDED together — this gives the model both meaning AND order.",
    "Block 1: Self-Attention": "Multi-head self-attention (6 heads × 64-dim each). Tokens communicate: each position aggregates info from all previous positions using learned Q/K/V projections.",
    "Block 1: Feed-Forward": "Each token position independently goes through: Linear(384→1536) → ReLU → Linear(1536→384). 'Think about what you just learned from attention.'",
    "Block 2: Self-Attention": "Second layer of attention — can now combine patterns learned in block 1. Deeper layers capture more abstract relationships.",
    "Block 2: Feed-Forward": "Second FFN layer — refines representations further.",
    "Block 3–6: (repeat)": "6 total blocks. Each block adds more representational depth. GPT-3 uses 96 blocks — same idea, much more capacity.",
    "Layer Norm": "Normalizes activations across the embedding dimension. Stabilizes training. Applied BEFORE each sub-layer in the modern 'pre-norm' style.",
    "Linear → Logits": "Final linear projection: 384-dim → 65-dim (vocab size). Each position outputs 65 scores, one per possible next character.",
    "Softmax → Next Token": "Softmax converts logits to probabilities. Sample from this distribution to get the next token. Repeat to generate text.",
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-cyan-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-cyan-300">GPT Architecture Flow</h2>
          <div className="flex gap-2">
            <button onClick={() => { setActiveLayer(-1); setFlowing(false); clearInterval(flowRef.current); }}
              className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600">Reset</button>
            <button onClick={() => { setActiveLayer(-1); setFlowing(true); }}
              className="text-xs px-4 py-1 rounded-full bg-cyan-700 text-white font-bold">▶ Animate</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Layer stack */}
          <div className="space-y-2">
            {ARCH_LAYERS.map((layer, i) => (
              <button key={i} onClick={() => setActiveLayer(activeLayer === i ? -1 : i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  activeLayer === i ? "border-white bg-gray-700 shadow-lg" : "border-gray-700 bg-gray-800 hover:bg-gray-750"
                }`}
                style={{ borderColor: activeLayer === i ? layer.color : undefined }}>
                <span className="text-xl">{layer.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{layer.label}</div>
                  {i > 0 && <div className="text-xs text-gray-500">{["", "embd=384", "n_head=6, head_size=64", "4×expand", "n_head=6, head_size=64", "4×expand", "×4 total", "eps=1e-5", "out→vocab_size=65", "temperature sampling"][i]}</div>}
                </div>
                <div className="w-3 h-3 rounded-full shrink-0 transition-all"
                  style={{ backgroundColor: layer.color, opacity: activeLayer === i ? 1 : 0.4 }} />
              </button>
            ))}
          </div>

          {/* Info panel */}
          <div className="sticky top-4">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 min-h-48">
              {activeLayer === -1 ? (
                <div className="text-gray-500 text-sm flex flex-col items-center justify-center h-full text-center pt-8">
                  <div className="text-3xl mb-3">👆</div>
                  Click any layer to see details,<br />or press Animate to watch data flow
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{ARCH_LAYERS[activeLayer].icon}</span>
                    <span className="font-bold text-white">{ARCH_LAYERS[activeLayer].label}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {layerInfo[ARCH_LAYERS[activeLayer].label]}
                  </p>
                  {/* Tensor shape flow */}
                  <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs">
                    <div className="text-gray-500 mb-1">tensor shape:</div>
                    {[
                      "(B, T) = (64, 256) — token IDs",
                      "(B, T, C) = (64, 256, 384) — embeddings",
                      "(B, T, C) = (64, 256, 384) — after attention",
                      "(B, T, C) = (64, 256, 384) — after FFN",
                      "(B, T, C) = (64, 256, 384)",
                      "(B, T, C) = (64, 256, 384)",
                      "(B, T, C) = (64, 256, 384)",
                      "(B, T, C) = (64, 256, 384) — normalized",
                      "(B, T, V) = (64, 256, 65) — logits",
                      "(B, T, V) = (64, 256, 65) — probabilities",
                    ][activeLayer]}
                  </div>
                </div>
              )}
            </div>

            {/* Mini transformer block diagram */}
            <div className="mt-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-3 font-semibold">One Transformer Block:</div>
              {[
                { label: "LayerNorm", color: "#f59e0b" },
                { label: "Multi-Head Self-Attention", color: "#06b6d4" },
                { label: "+ Residual", color: "#6366f1" },
                { label: "LayerNorm", color: "#f59e0b" },
                { label: "Feed-Forward Network", color: "#10b981" },
                { label: "+ Residual", color: "#6366f1" },
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-full rounded text-xs flex items-center justify-center font-mono"
                    style={{ backgroundColor: l.color + "22", border: `1px solid ${l.color}44`, color: l.color }}>
                    {l.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: Code Walkthrough ─────────────────────────────────────────────────
function CodeWalkthroughTab() {
  const [activeSection, setActiveSection] = useState(0);
  const sec = CODE_SECTIONS[activeSection];

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
        <h2 className="text-lg font-bold text-gray-300 mb-3">Code Walkthrough — All 243 Lines</h2>
        <div className="flex flex-wrap gap-2">
          {CODE_SECTIONS.map((s, i) => (
            <button key={i} onClick={() => setActiveSection(i)}
              className={`text-xs px-3 py-2 rounded-full border font-semibold transition-all flex items-center gap-1 ${
                activeSection === i ? "text-white" : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
              style={activeSection === i ? { borderColor: s.color, backgroundColor: s.color + "22", color: s.color } : {}}>
              <span>{s.icon}</span>
              <span className="hidden md:inline">{s.title.split(". ")[1]}</span>
              <span className="md:hidden">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Code pane */}
        <div className="bg-gray-900 rounded-2xl border overflow-hidden" style={{ borderColor: sec.color + "55" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: sec.color + "33", backgroundColor: sec.color + "11" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{sec.icon}</span>
              <span className="font-bold text-sm text-white">{sec.title}</span>
            </div>
            <span className="text-xs text-gray-500">{sec.lines}</span>
          </div>
          <div className="p-4 overflow-auto max-h-96">
            <pre className="text-xs text-gray-300 whitespace-pre leading-relaxed">{sec.code}</pre>
          </div>
        </div>

        {/* Explanation + visual */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-700">
            <div className="text-sm font-bold text-white mb-2">Explanation</div>
            <p className="text-gray-300 text-sm leading-relaxed">{sec.explanation}</p>
          </div>
          <SectionVisual id={sec.id} color={sec.color} />
        </div>
      </div>
    </div>
  );
}

function SectionVisual({ id, color }) {
  if (id === "data") return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
      <div className="text-xs text-gray-400 mb-3">Shakespeare → Characters → Integer IDs</div>
      <div className="font-mono text-sm mb-2">
        <span className="text-gray-300">"First Citizen:"</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {["F","i","r","s","t"," ","C","i","t","i","z","e","n",":"].map((c,i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-xs text-white font-mono">{c === " " ? "⎵" : c}</div>
            <div className="text-xs text-gray-500">{[21,47,56,57,58,1,15,47,58,47,64,43,52,11][i]}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">Vocab size = 65 unique characters</div>
    </div>
  );

  if (id === "batching") return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
      <div className="text-xs text-gray-400 mb-3">Input x and Target y (shifted by 1)</div>
      <div className="font-mono text-xs space-y-2">
        <div className="flex gap-2 items-center">
          <span className="text-purple-400 w-6">x:</span>
          {[18,47,56,57,58,1,15].map((t,i) => <span key={i} className="bg-purple-900 border border-purple-700 rounded px-1 py-0.5 text-white">{t}</span>)}
          <span className="text-gray-600">...</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-emerald-400 w-6">y:</span>
          {[47,56,57,58,1,15,47].map((t,i) => <span key={i} className="bg-emerald-900 border border-emerald-700 rounded px-1 py-0.5 text-white">{t}</span>)}
          <span className="text-gray-600">...</span>
        </div>
        <div className="text-gray-500 text-xs">y is x shifted right by 1 position</div>
      </div>
    </div>
  );

  if (id === "attention") return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
      <div className="text-xs text-gray-400 mb-3">Causal attention mask (lower triangular)</div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {ATTN_TOKENS.map((t, row) =>
          ATTN_TOKENS.map((_, col) => (
            <div key={`${row}-${col}`}
              className={`h-7 rounded text-xs flex items-center justify-center font-mono transition-all ${
                col <= row ? "bg-cyan-900 text-cyan-300 border border-cyan-700" : "bg-gray-800 text-gray-700 border border-gray-700"
              }`}>
              {col <= row ? (row === col ? "1.0" : `0.${Math.floor(Math.random() * 5 + 1)}`) : "−∞"}
            </div>
          ))
        )}
      </div>
      <div className="grid gap-0.5 mt-1" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {ATTN_TOKENS.map((t, i) => <div key={i} className="text-center text-xs text-gray-500 truncate">{t}</div>)}
      </div>
    </div>
  );

  if (id === "multihead") return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
      <div className="text-xs text-gray-400 mb-3">6 heads × 64-dim = 384-dim total</div>
      <div className="grid grid-cols-6 gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg p-2 text-center border" style={{ backgroundColor: color + "22", borderColor: color + "66" }}>
            <div className="text-xs text-white font-bold">H{i + 1}</div>
            <div className="text-xs text-gray-400">64d</div>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg p-2 text-center border text-xs font-bold" style={{ backgroundColor: color + "33", borderColor: color, color: color }}>
        Concat + Project → 384d
      </div>
    </div>
  );

  if (id === "ffn") return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
      <div className="text-xs text-gray-400 mb-3">FFN dimension expansion (4×)</div>
      <div className="flex items-center gap-2 text-xs font-mono">
        <div className="bg-gray-800 border border-gray-600 rounded px-2 py-4 text-center text-white">384</div>
        <div className="text-gray-500">→</div>
        <div className="bg-amber-900 border border-amber-600 rounded px-2 py-8 text-center text-amber-200">1536<br/><span className="text-xs opacity-70">4×</span></div>
        <div className="text-gray-500">→</div>
        <div className="bg-gray-800 border border-gray-600 rounded px-2 py-4 text-center text-white">384</div>
      </div>
    </div>
  );

  if (id === "training") return (
    <TrainingLossChart color={color} />
  );

  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700 text-center text-gray-500 text-sm py-8">
      See Architecture tab for visual
    </div>
  );
}

function TrainingLossChart({ color }) {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  // Simulated loss curve
  const lossPoints = Array.from({ length: 50 }, (_, i) => {
    const t = i / 49;
    return 4.2 * Math.exp(-2.5 * t) + 1.5 + (Math.random() * 0.3 - 0.15) * Math.exp(-t * 3);
  });

  useEffect(() => {
    if (running) {
      const id = setInterval(() => {
        setProgress(p => {
          if (p >= 49) { setRunning(false); return 49; }
          return p + 1;
        });
      }, 80);
      return () => clearInterval(id);
    }
  }, [running]);

  const w = 280, h = 100, pad = 20;
  const maxLoss = 4.5, minLoss = 1.0;
  const points = lossPoints.slice(0, progress + 1).map((l, i, arr) => {
    const x = pad + (i / 49) * (w - 2 * pad);
    const y = h - pad - ((l - minLoss) / (maxLoss - minLoss)) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-400">Training Loss</div>
        <button onClick={() => { setProgress(0); setRunning(true); }}
          className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">▶ Run</button>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        {/* Grid */}
        {[1.5, 2.5, 3.5, 4.2].map(l => {
          const y = h - pad - ((l - minLoss) / (maxLoss - minLoss)) * (h - 2 * pad);
          return <line key={l} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#374151" strokeWidth={0.5} strokeDasharray="2" />;
        })}
        {/* Loss curve */}
        {progress > 0 && <polyline points={points} fill="none" stroke={color} strokeWidth={2} />}
        {/* Current point */}
        {progress > 0 && (() => {
          const i = progress;
          const x = pad + (i / 49) * (w - 2 * pad);
          const l = lossPoints[i];
          const y = h - pad - ((l - minLoss) / (maxLoss - minLoss)) * (h - 2 * pad);
          return <circle cx={x} cy={y} r={3} fill={color} />;
        })()}
        {/* Axes labels */}
        <text x={pad} y={h - 2} fontSize={8} fill="#6b7280">0</text>
        <text x={w - pad} y={h - 2} fontSize={8} fill="#6b7280">5000 steps</text>
        <text x={2} y={pad} fontSize={8} fill="#6b7280">4.2</text>
        <text x={2} y={h - pad} fontSize={8} fill="#6b7280">1.5</text>
      </svg>
      <div className="text-xs text-gray-500 mt-1">
        Step {progress * 100} — Loss: {lossPoints[progress].toFixed(3)}
      </div>
    </div>
  );
}

// ─── TAB 3: Attention Explorer ────────────────────────────────────────────────
function AttentionExplorerTab() {
  const tokens = ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy"];
  const [selectedToken, setSelectedToken] = useState(4); // "jumps"
  const [head, setHead] = useState(0);

  // Simulated attention weights — each head focuses differently
  const headProfiles = [
    { name: "Syntactic", desc: "Previous token & subject", weights: (t, s) => t === s - 1 ? 0.6 : t === 0 ? 0.3 : t < s ? 0.1 / s : 0 },
    { name: "Semantic", desc: "Related meaning words", weights: (t, s) => [0, 3].includes(t) && t < s ? 0.4 : t === s - 2 && t >= 0 ? 0.5 : t < s ? 0.1 : 0 },
    { name: "Positional", desc: "Local context window", weights: (t, s) => t < s ? Math.max(0, 1 - (s - t) * 0.2) * 0.5 : 0 },
    { name: "Long-range", desc: "Beginning of sequence", weights: (t, s) => t === 0 ? 0.7 : t === 1 ? 0.2 : t < s ? 0.05 : 0 },
  ];

  const attnWeights = (t) => {
    const raw = tokens.map((_, i) => headProfiles[head].weights(i, t));
    const sum = raw.reduce((a, b) => a + b, 0) || 1;
    return raw.map(w => w / sum);
  };

  const weights = attnWeights(selectedToken);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-cyan-800">
        <h2 className="text-xl font-bold text-cyan-300 mb-2">Attention Head Explorer</h2>
        <p className="text-gray-400 text-sm mb-5">
          Select a query token (blue) and see how each attention head distributes attention across previous tokens.
          Different heads learn different relationship patterns.
        </p>

        {/* Head selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {headProfiles.map((h2, i) => (
            <button key={i} onClick={() => setHead(i)}
              className={`text-xs px-3 py-2 rounded-full border transition-all ${
                head === i ? "border-cyan-400 bg-cyan-950 text-cyan-200" : "border-gray-600 text-gray-400 hover:border-gray-400"
              }`}>
              <span className="font-bold">Head {i + 1}</span>: {h2.name}
            </button>
          ))}
        </div>

        {/* Token selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tokens.map((tok, i) => (
            <button key={i} onClick={() => setSelectedToken(i)}
              className={`px-3 py-2 rounded-lg text-sm font-mono border transition-all ${
                selectedToken === i ? "bg-blue-700 border-blue-400 text-white" : "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-400"
              }`}>
              {tok}
            </button>
          ))}
        </div>

        {/* Attention weight bars */}
        <div className="space-y-2 mb-5">
          {tokens.map((tok, i) => {
            const w = i <= selectedToken ? weights[i] : 0;
            const canAttend = i <= selectedToken;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-16 text-xs font-mono text-right ${
                  i === selectedToken ? "text-blue-300 font-bold" : canAttend ? "text-gray-300" : "text-gray-600"
                }`}>{tok}</div>
                <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden relative">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${w * 100}%`,
                      background: i === selectedToken ? "#3b82f6" : "linear-gradient(to right, #06b6d4, #6366f1)",
                      opacity: canAttend ? 1 : 0.2,
                    }} />
                  <span className="absolute inset-0 flex items-center px-2 text-xs text-white">
                    {canAttend ? `${(w * 100).toFixed(1)}%` : "masked (future)"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-800 rounded-xl p-4 text-sm border border-gray-700">
          <span className="text-cyan-300 font-bold">Head {head + 1} ({headProfiles[head].name})</span>
          <span className="text-gray-400 ml-2">— {headProfiles[head].desc}.</span>
          <span className="text-gray-400 ml-1">
            Token <span className="text-white">"{tokens[selectedToken]}"</span> at position {selectedToken} attends most to{" "}
            <span className="text-cyan-300">"{tokens[weights.indexOf(Math.max(...weights.slice(0, selectedToken + 1)))]}"</span>
            {" "}({(Math.max(...weights.slice(0, selectedToken + 1)) * 100).toFixed(0)}% weight).
          </span>
        </div>
      </div>

      {/* QKV explanation */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-purple-800">
        <h2 className="text-xl font-bold text-purple-300 mb-4">Q · K · V — The Attention Formula</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {[
            { letter: "Q", full: "Query", color: "#3b82f6", question: "What am I looking for?", example: "\"jumps\" → looking for: who is jumping?" },
            { letter: "K", full: "Key", color: "#8b5cf6", question: "What do I offer?", example: "\"fox\" → offers: I am the subject!" },
            { letter: "V", full: "Value", color: "#10b981", question: "What info do I carry?", example: "\"fox\" value: semantic fox-embedding" },
          ].map((qkv) => (
            <div key={qkv.letter} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-3xl font-black mb-1" style={{ color: qkv.color }}>{qkv.letter}</div>
              <div className="text-white font-bold text-sm">{qkv.full}</div>
              <div className="text-gray-400 text-xs italic mb-2">"{qkv.question}"</div>
              <div className="text-gray-500 text-xs bg-gray-900 rounded p-2">{qkv.example}</div>
            </div>
          ))}
        </div>
        <div className="bg-gray-800 rounded-xl p-4 font-mono text-xs border border-gray-700">
          <div className="text-gray-400 mb-2">// Attention computation:</div>
          <div className="text-amber-300">scores = Q @ K.T / sqrt(head_size)    <span className="text-gray-500"># (T, T) similarity matrix</span></div>
          <div className="text-amber-300">scores = masked_fill(scores, tril==0, -inf)  <span className="text-gray-500"># causal mask</span></div>
          <div className="text-amber-300">attn   = softmax(scores)               <span className="text-gray-500"># probabilities sum to 1</span></div>
          <div className="text-amber-300">out    = attn @ V                      <span className="text-gray-500"># weighted sum of values</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 4: Training Dynamics ─────────────────────────────────────────────────
function TrainingDynamicsTab() {
  const [step, setStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const timerRef = useRef(null);

  const trainingSteps = [
    { title: "Initialize", desc: "Random weights. Model outputs uniform distribution over 65 chars. Loss = ln(65) ≈ 4.17. Pure noise.", loss: 4.17, sample: "xKjQmZpLrTcVnYwHoIuAsSdFgJbNmXqWeRtYuIoPaS..." },
    { title: "Early Training (500 steps)", desc: "Model learns basic character frequencies. Common chars like 'e', 'a', spaces appear more.", loss: 3.1, sample: "    e the  ath  a  an  he    e  the a  e th..." },
    { title: "Mid Training (1500 steps)", desc: "Word boundaries emerge. Common short words like 'the', 'and', 'I' appear.", loss: 2.4, sample: "the and I the hat in the not I, and the king..." },
    { title: "Later Training (3000 steps)", desc: "Syntax emerges. Sentences start forming. Verb-noun agreement begins.", loss: 1.9, sample: "I will not go to the king, and the man shall..." },
    { title: "Converged (5000 steps)", desc: "Shakespeare-like text! Rhyme, meter, character names, consistent style emerge.", loss: 1.48, sample: "MIRANDA:\nO brave new world,\nThat has such people in't!\n\nPROSPERO:\nTis new to thee." },
  ];

  const cur = trainingSteps[step];

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setInterval(() => {
        setStep(s => { if (s >= trainingSteps.length - 1) { setAutoPlay(false); return s; } return s + 1; });
      }, 1800);
    }
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-6 border border-lime-800">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-lime-300">Training Progress Simulator</h2>
          <div className="flex gap-2">
            <button onClick={() => { setStep(0); setAutoPlay(false); }}
              className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">Reset</button>
            <button onClick={() => setAutoPlay(a => !a)}
              className={`text-xs px-4 py-1 rounded-full font-bold ${autoPlay ? "bg-rose-700 text-white" : "bg-lime-700 text-white"}`}>
              {autoPlay ? "⏸ Pause" : "▶ Animate"}
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-6">
          {trainingSteps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                i === step ? "bg-lime-800 border-lime-400 text-lime-200" : i < step ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-800 border-gray-700 text-gray-600"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current step display */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">{cur.title}</span>
              <span className="text-rose-400 font-mono text-sm">loss: {cur.loss}</span>
            </div>
            <p className="text-gray-400 text-sm">{cur.desc}</p>
            {/* Loss bar */}
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Cross-entropy loss (lower = better)</div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${((cur.loss - 1.48) / (4.17 - 1.48)) * 100}%`,
                    background: cur.loss > 3 ? "#ef4444" : cur.loss > 2 ? "#f59e0b" : "#84cc16"
                  }} />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1.48 (converged)</span><span>4.17 (random)</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-2 font-semibold">Generated Text Sample:</div>
            <div className="font-mono text-sm text-green-300 bg-gray-900 rounded-lg p-3 leading-relaxed min-h-24">
              {cur.sample}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm disabled:opacity-30">← Back</button>
          <button onClick={() => setStep(s => Math.min(trainingSteps.length - 1, s + 1))} disabled={step === trainingSteps.length - 1}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm disabled:opacity-30">Next →</button>
        </div>
      </div>

      {/* What makes GPT work */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-gray-300 mb-4">Why Does It Work? Key Insights</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: "🎲", title: "Next-token prediction as compression", desc: "To predict the next character well, the model must understand syntax, semantics, style, and world knowledge. The task is simple; the solution requires intelligence.", color: "purple" },
            { icon: "🌊", title: "Gradient flow via residuals", desc: "Without x = x + sublayer(x), gradients vanish in deep networks. Residual connections create 'highways' for gradients, enabling stacking many layers.", color: "cyan" },
            { icon: "⚖️", title: "Scaled dot-product attention", desc: "Dividing Q·Kᵀ by √head_size prevents softmax saturation. Without scaling, large dot products push softmax to near-zero gradients (vanishing gradient problem).", color: "amber" },
            { icon: "🐍", title: "Pure Python proves the concept", desc: "No ML framework is needed to understand the architecture. Pure Python matmul + softmax captures the complete forward pass — making the math fully transparent.", color: "emerald" },
          ].map((c, i) => (
            <div key={i} className={`bg-gray-800 rounded-xl p-4 border border-${c.color}-900`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{c.icon}</span>
                <span className={`font-bold text-${c.color}-300 text-sm`}>{c.title}</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Karpathy quotes */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-lg font-bold text-gray-300 mb-4">Key Quotes & References</h2>
        <div className="space-y-3">
          {[
            { quote: "The transformer is a surprisingly simple neural network architecture. The key idea is self-attention.", attr: "Andrej Karpathy" },
            { quote: "Every token in the sequence looks at every other token and decides how much to attend to it. That's it.", attr: "Andrej Karpathy, Let's build GPT" },
            { quote: "In 243 lines of code, Karpathy proves that GPT is fundamentally about patterns — patterns in text that a neural network learns to predict.", attr: "Sumit Pandey, Towards Deep Learning" },
          ].map((q, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 border-l-4 border-cyan-600">
              <p className="text-gray-300 text-sm italic mb-2">"{q.quote}"</p>
              <p className="text-gray-500 text-xs">— {q.attr}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <a href="https://www.youtube.com/watch?v=kCc8FmEb1nY" target="_blank" rel="noopener noreferrer"
            className="text-xs px-4 py-2 bg-red-900 border border-red-700 rounded-lg text-red-200 hover:bg-red-800 transition-all">
            ▶ Watch: Let's build GPT (YouTube)
          </a>
          <a href="https://github.com/karpathy/nanoGPT" target="_blank" rel="noopener noreferrer"
            className="text-xs px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:border-white transition-all">
            📂 nanoGPT on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
