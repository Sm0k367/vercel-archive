import wizardData from './vercel-wizard-data.json';

export interface Project {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  githubUrl: string;
  repo: string;
  category: string;
  tags: string[];
  status: 'active' | 'archive' | 'preview';
  title?: string;
  httpCode?: number;
}

export const projects: Project[] = wizardData.projects.map((p: any) => ({
  id: p.id || p.name?.toLowerCase().replace(/\s+/g, '-') || 'project-' + Math.random().toString(36).slice(2),
  name: p.title || p.name || 'Untitled Project',
  description: p.description || 'Experimental Next.js project by Sm0k367.',
  previewUrl: p.previewUrl || p.preview_url || '',
  githubUrl: p.githubUrl || p.github_url || `https://github.com/Sm0k367/${p.repo || 'unknown'}`,
  repo: p.repo || 'unknown',
  category: p.category?.replace(' Pages', '') || 'Experimental',
  tags: Array.isArray(p.tags) ? p.tags : [],
  status: (p.status === 'live' || p.httpCode === 200 ? 'active' : 'active') as any,
  title: p.title,
  httpCode: p.http_code || p.httpCode
})) as Project[];

// Fallback/additional projects from initial analysis if wizard JSON is limited
if (projects.length < 10) {
  projects.push(
    {
      id: 'sm0k367-com',
      name: 'sm0k367.com',
      description: 'Main Next.js portfolio and hub for all experiments. The flagship site.',
      previewUrl: 'https://sm0k367.com',
      githubUrl: 'https://github.com/Sm0k367/nextjs',
      repo: 'nextjs',
      category: 'Landing',
      tags: ['portfolio', 'hub', 'flagship'],
      status: 'active'
    }
  );
}

export const categories = ['All', 'AI', 'Music', 'Visuals', 'Streaming', 'Landing', 'Experimental', 'Avatar', 'Portal'] as const;

export const meta = wizardData.meta || { total_projects_cataloged: projects.length };
