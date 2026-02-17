import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import AWSMLServicesOverview from './pages/projects/AWSMLServicesOverview';
import MultiAgentExplorer from './pages/projects/MultiAgentExplorer';
import BedrockAgents from './pages/projects/BedrockAgents';
import BedrockRAG from './pages/projects/BedrockRAG';
import SageMakerInference from './pages/projects/SageMakerInference';
import BedrockInference from './pages/projects/BedrockInference';
import BedrockRerankHybridSearch from './pages/projects/BedrockRerankHybridSearch';
import BedrockGuardrail from './pages/projects/BedrockGuardrail';
import StrandsAgentSquad from './pages/projects/StrandsAgentSquad';
import VectorStore from './pages/projects/VectorStore';
import ChunkingStrategies from './pages/projects/ChunkingStrategies';
import TokenEfficiency from './pages/projects/TokenEfficiency';
import PromptTypes from './pages/projects/PromptTypes';
import MCPServerArchitecture from './pages/projects/MCPServerArchitecture';
import LLMTrainingAndFineTuning from './pages/projects/LLMTrainingAndFineTuning';
import SageMakerLineage from './pages/projects/SageMakerLineage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/aws-ml-services-overview" element={<AWSMLServicesOverview />} />
          <Route path="/aws-vector-stores" element={<VectorStore />} />
          <Route path="/chunking-strategies" element={<ChunkingStrategies />} />
          <Route path="/multi-agent-explorer" element={<MultiAgentExplorer />} />
          <Route path="/bedrock-agents" element={<BedrockAgents />} />
          <Route path="/bedrock-rag" element={<BedrockRAG />} />
          <Route path="/token-efficiency" element={<TokenEfficiency />} />
          <Route path="/sagemaker-inference" element={<SageMakerInference />} />
          <Route path="/bedrock-inference" element={<BedrockInference />} />
          <Route path="/bedrock-rerank-hybrid-search" element={<BedrockRerankHybridSearch />} />
          <Route path="/strands-agent-squad" element={<StrandsAgentSquad />} />
          <Route path="/mcp-server-a-architecture" element={<MCPServerArchitecture />} />
          <Route path="/bedrock-guardrails" element={<BedrockGuardrail />} />
          <Route path="/prompt-types" element={<PromptTypes />} />
          <Route path="/llm-training-and-finetuning" element={<LLMTrainingAndFineTuning />} />
          <Route path="/sagemaker-lineage" element={<SageMakerLineage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
