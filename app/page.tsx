'use client';

import React, { useState, useMemo } from 'react';
import { projects, categories, Project } from '../lib/projects';

export default function VercelProjectsDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.repo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const stats = {
    total: projects.length,
    uniqueRepos: new Set(projects.map(p => p.repo)).size,
    categories: new Set(projects.map(p => p.category)).size,
    active: projects.filter(p => p.status === 'active').length,
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'AI': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      'Music': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
      'Visuals': 'bg-pink-500/20 text-pink-400 border-pink-500/50',
      'Streaming': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'Landing': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      'Experimental': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
      'Avatar': 'bg-violet-500/20 text-violet-400 border-violet-500/50',
      'Portal': 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/50',
    };
    return colors[category] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50';
  };

  const openLink = (url: string, type: 'preview' | 'github') => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Custom SVG Logo */}
            <div className="w-9 h-9 flex items-center justify-center">
              <svg 
                viewBox="0 0 100 100" 
                className="w-9 h-9 neon-border rounded-full p-1"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="38" stroke="#ff00ff" strokeWidth="8" />
                <path d="M35 40 L50 65 L65 40" stroke="#00ffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="35" cy="35" r="5" fill="#ff00ff" />
                <circle cx="65" cy="35" r="5" fill="#00ffff" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tighter neon-text">SM0K367</div>
              <div className="text-[10px] text-zinc-500 -mt-1 tracking-[3px]">VERCEL ARCHIVE</div>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-sm">
            <a href="https://github.com/Sm0k367" target="_blank" className="hover:text-[#ff00ff] transition-colors flex items-center gap-1.5">
              <span>GITHUB</span>
              <span className="text-xs text-zinc-500">↗</span>
            </a>
            <a href="https://vercel.com" target="_blank" className="hover:text-[#00ffff] transition-colors flex items-center gap-1.5">
              VERCEL
              <span className="text-xs text-zinc-500">↗</span>
            </a>
            <div className="h-3 w-px bg-white/20"></div>
            <div className="text-xs px-3 py-1 rounded-full border border-white/20 text-emerald-400 flex items-center gap-2">
              <div className="status-dot"></div>
              47+ DEPLOYS LIVE
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-3xl border border-[#ff00ff]/30 text-xs tracking-widest mb-6 bg-black/60">
            EXPERIMENTAL ARCHIVE • ITERATIVE CREATION
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold tracking-tighter mb-6 neon-text leading-none">
            VERCEL<br />PROJECTS
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-zinc-400">
            A living museum of 50+ Next.js experiments, AI prototypes, 
            music interfaces, visual playgrounds, and digital rituals by Sm0k367.
            <span className="block mt-3 text-sm text-zinc-500">From one repo to many realities.</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'TOTAL PROJECTS', value: stats.total.toString().padStart(2, '0') },
            { label: 'UNIQUE REPOS', value: stats.uniqueRepos.toString().padStart(2, '0') },
            { label: 'CATEGORIES', value: stats.categories.toString().padStart(2, '0') },
            { label: 'LIVE PREVIEWS', value: stats.active.toString().padStart(2, '0') },
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-3xl neon-border">
              <div className="text-5xl font-mono font-bold text-[#ff00ff] mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search projects, repos, tags... (try 'dj', 'avatar', 'stream', 'grok')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass px-6 py-4 rounded-2xl text-lg placeholder:text-zinc-500 focus:outline-none border border-white/10 focus:border-[#ff00ff]"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full"
              >
                CLEAR
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-chip px-5 py-2.5 text-sm font-medium rounded-2xl border transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'active border-[#ff00ff] text-black bg-[#ff00ff]' 
                    : 'border-white/10 hover:border-white/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="project-card glass rounded-3xl overflow-hidden neon-border group cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="h-2 bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff]"></div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="font-mono text-xs text-zinc-500 mb-1">{project.repo}</div>
                      <h3 className="text-2xl font-semibold tracking-tight mb-2 group-hover:text-[#ff00ff] transition-colors">
                        {project.name}
                      </h3>
                    </div>
                    <div className={`text-[10px] px-3 py-1 rounded-full border ${getCategoryColor(project.category)}`}>
                      {project.category}
                    </div>
                  </div>
                  
                  <p className="text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openLink(project.previewUrl, 'preview'); }}
                      className="flex-1 bg-white text-black hover:bg-white/90 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <span>PREVIEW</span>
                      <span className="text-xs opacity-70">↗</span>
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); openLink(project.githubUrl, 'github'); }}
                      className="flex-1 border border-white/30 hover:bg-white/5 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      GITHUB
                      <span className="text-xs opacity-70">↗</span>
                    </button>
                  </div>
                </div>
                
                <div className="px-8 py-4 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <div>STATUS: <span className="text-emerald-400">LIVE</span></div>
                  <div className="flex items-center gap-1">
                    ITERATION 
                    <div className="w-1.5 h-px bg-white/30 flex-1"></div> 
                    {Math.floor(Math.random() * 8) + 1}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-zinc-400">
              No projects found matching your search.
            </div>
          )}
        </div>

        <div className="mt-20 text-center">
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            This archive represents hundreds of hours of rapid experimentation. 
            Many projects share base repositories with different branches, 
            environments, and feature explorations. The creative process is the product.
          </p>
          <div className="mt-8 flex justify-center gap-8 text-[10px] text-zinc-600">
            <a href="https://github.com/Sm0k367" className="hover:text-white transition-colors">VIEW ALL REPOS ON GITHUB →</a>
            <a href="https://vercel.com/dashboard" className="hover:text-white transition-colors">MANAGE ON VERCEL →</a>
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6" onClick={() => setSelectedProject(null)}>
          <div 
            className="glass max-w-2xl w-full rounded-3xl p-10 relative neon-border"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-8 right-8 text-zinc-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
            
            <div className="mb-8">
              <div className={`inline px-4 py-1 text-xs rounded-full border mb-6 ${getCategoryColor(selectedProject.category)}`}>
                {selectedProject.category}
              </div>
              <h2 className="text-5xl font-bold tracking-tighter mb-3">{selectedProject.name}</h2>
              <div className="font-mono text-sm text-[#00ffff]">{selectedProject.repo}</div>
            </div>
            
            <p className="text-lg text-zinc-300 mb-10 leading-relaxed">
              {selectedProject.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-12">
              <button 
                onClick={() => openLink(selectedProject.previewUrl, 'preview')}
                className="py-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-xl font-semibold hover:brightness-110 active:scale-[0.985] transition-all flex items-center justify-center gap-3"
              >
                LAUNCH PREVIEW
                <span className="text-2xl">↗</span>
              </button>
              <button 
                onClick={() => openLink(selectedProject.githubUrl, 'github')}
                className="py-6 border border-white/30 hover:bg-white/5 rounded-2xl text-xl font-semibold transition-all flex items-center justify-center gap-3"
              >
                VIEW SOURCE ON GITHUB
                <span className="text-2xl">↗</span>
              </button>
            </div>
            
            <div className="text-xs uppercase tracking-widest border-t border-white/10 pt-8 text-zinc-500">
              Part of an evolving series of {selectedProject.category.toLowerCase()} experiments by Sm0k367. 
              This deployment is one of many variations exploring the same core concept.
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-8">
          BUILT AS A META-PROJECT • CURATED FROM {projects.length} ENTRIES IN THE SM0K367 VERCEL DASHBOARD • 
          MANY MORE VARIANTS EXIST IN THE WILD
          <div className="mt-4 text-[10px]">A demonstration of portfolio-as-archive by the Kortix agent system</div>
        </div>
      </footer>
    </div>
  );
}
