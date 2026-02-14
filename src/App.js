import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import MultiAgentExplorer from './pages/projects/MultiAgentExplorer';
import BedrockAgents from './pages/projects/BedrockAgents';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/multi-agent-explorer" element={<MultiAgentExplorer />} />
        <Route path="/bedrock-agents" element={<BedrockAgents />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
