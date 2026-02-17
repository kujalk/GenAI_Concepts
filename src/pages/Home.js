import projects from '../data/projects';
import ProjectCard from '../components/ProjectCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            AWS GenAI Concepts
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Exploring AWS GenAI concepts through interactive visualizations and deep dives
          </p>
          <div className="mt-4 flex justify-center">
            <img src="https://visitor-badge.laobi.icu/badge?page_id=aws-genai-concepts" alt="visitors" className="h-7" />
          </div>
        </header>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center text-gray-400 border-t border-white/10 pt-8">
          <p className="mb-2">Built with React + Tailwind CSS</p>
          <p className="text-sm">Interactive AI Learning Platform</p>
        </footer>
      </div>
    </div>
  );
}
