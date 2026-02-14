import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import MultiAgentExplorer from './pages/projects/MultiAgentExplorer';
import BedrockAgents from './pages/projects/BedrockAgents';
import BedrockRAG from './pages/projects/BedrockRAG';
import SageMakerInference from './pages/projects/SageMakerInference';
import BedrockInference from './pages/projects/BedrockInference';
import BedrockRerankHybridSearch from './pages/projects/BedrockRerankHybridSearch';
import BedrockGuardrail from './pages/projects/BedrockGuardrail';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/multi-agent-explorer" element={<MultiAgentExplorer />} />
        <Route path="/bedrock-agents" element={<BedrockAgents />} />
        <Route path="/bedrock-rag" element={<BedrockRAG />} />
        <Route path="/sagemaker-inference" element={<SageMakerInference />} />
        <Route path="/bedrock-inference" element={<BedrockInference />} />
        <Route path="/bedrock-rerank-hybrid-search" element={<BedrockRerankHybridSearch />} />
        <Route path="/bedrock-guardrails" element={<BedrockGuardrail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
