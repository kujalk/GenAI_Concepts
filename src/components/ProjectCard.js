import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <Link to={project.path} className="block h-full">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer h-full flex flex-col">
        {/* Icon */}
        <div className="text-6xl mb-4">{project.icon}</div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-2">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-gray-300 mb-4 flex-grow line-clamp-3">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>

        {/* View Button */}
        <div className="text-purple-400 font-semibold flex items-center">
          View Project →
        </div>
      </div>
    </Link>
  );
}
