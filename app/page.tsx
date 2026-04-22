'use client';

import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { projects, categories, Project, meta } from '../lib/projects';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Environment, Float, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ExternalLink, Search, X, Volume2, VolumeX } from 'lucide-react';

interface Node {
  id: string;
  position: [number, number, number];
  project: Project;
  connections: string[];
}

const NeuralNode = ({ node, onClick, isSelected }: { node: Node; onClick: () => void; isSelected: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1);
    }
  });

  const color = node.project.category === 'AI' ? '#a855f7' : 
                node.project.category === 'Music' ? '#22d3ee' : 
                node.project.category === 'Avatar' ? '#ec4899' : '#f472b6';

  return (
    <group ref={meshRef} onClick={onClick}>
      {/* Core glowing orb */}
      <Sphere args={[0.8, 32, 32]} position={node.position}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={isSelected ? 2.5 : 1.2}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      {/* Outer glow ring */}
      <Sphere ref={glowRef} args={[1.4, 32, 32]} position={node.position}>
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={isSelected ? 0.4 : 0.15} 
          side={THREE.DoubleSide}
        />
      </Sphere>

      {/* Project name label */}
      <Text
        position={[node.position[0], node.position[1] + 2.2, node.position[2]]}
        fontSize={0.45}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {node.project.name.length > 12 ? node.project.name.slice(0, 12) + '...' : node.project.name}
      </Text>
    </group>
  );
};

const ConnectionLines = ({ nodes }: { nodes: Node[] }) => {
  const lines = useMemo(() => {
    const lineElements: React.ReactNode[] = [];
    const connectionSet = new Set<string>();

    nodes.forEach((node, i) => {
      node.connections.forEach((targetId) => {
        const target = nodes.find(n => n.id === targetId);
        if (target && i < nodes.indexOf(target)) {
          const key = [node.id, target.id].sort().join('-');
          if (!connectionSet.has(key)) {
            connectionSet.add(key);
            lineElements.push(
              <Line
                key={key}
                points={[node.position, target.position]}
                color="#22d3ee"
                lineWidth={2}
                transparent
                opacity={0.6}
              />
            );
          }
        }
      });
    });
    return lineElements;
  }, [nodes]);

  return <>{lines}</>;
};

const NeuralScene = ({ nodes, onNodeClick, selectedId }: { 
  nodes: Node[]; 
  onNodeClick: (id: string) => void; 
  selectedId: string | null;
}) => {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.Fog(0x0a0a0a, 30, 120);
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 30, 0]} intensity={2} color="#ff00ff" />
      <pointLight position={[-40, -20, -40]} intensity={1.5} color="#00ffff" />
      
      <Stars radius={200} depth={60} count={8000} factor={2} saturation={0} fade speed={0.5} />
      
      <Environment preset="night" />

      <ConnectionLines nodes={nodes} />

      {nodes.map((node) => (
        <NeuralNode 
          key={node.id} 
          node={node} 
          onClick={() => onNodeClick(node.id)}
          isSelected={selectedId === node.id}
        />
      ))}

      {/* Central core */}
      <Float speed={0.8} rotationIntensity={0.4}>
        <Sphere args={[3.5, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#4f46e5" 
            emissive="#6366f1" 
            emissiveIntensity={0.8}
            metalness={0.3}
            roughness={0.2}
            transparent
            opacity={0.15}
          />
        </Sphere>
      </Float>
    </>
  );
};

export default function NeuralArchive() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create nodes with 3D positioning and connections based on shared repos/categories
  const nodes = useMemo(() => {
    const nodeMap = new Map();
    const repoGroups = new Map<string, string[]>();

    projects.forEach((project, index) => {
      const angle = (index / projects.length) * Math.PI * 2;
      const radius = 25 + Math.random() * 15;
      const height = (Math.random() - 0.5) * 35;
      
      const position: [number, number, number] = [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius * 0.8
      ];

      const node: Node = {
        id: project.id,
        position,
        project,
        connections: []
      };

      nodeMap.set(project.id, node);

      // Group by repo for connections (iteration awareness)
      if (project.repo && project.repo !== 'unknown') {
        if (!repoGroups.has(project.repo)) repoGroups.set(project.repo, []);
        repoGroups.get(project.repo)!.push(project.id);
      }
    });

    // Add connections for projects that share repos (the "iteration" links)
    repoGroups.forEach((ids) => {
      if (ids.length > 1) {
        for (let i = 0; i < ids.length; i++) {
          for (let j = i + 1; j < ids.length; j++) {
            const node1 = nodeMap.get(ids[i]);
            const node2 = nodeMap.get(ids[j]);
            if (node1 && node2) {
              node1.connections.push(ids[j]);
              node2.connections.push(ids[i]);
            }
          }
        }
      }
    });

    return Array.from(nodeMap.values());
  }, []);

  const filteredNodes = useMemo(() => {
    if (!searchTerm && activeCategory === 'All') return nodes;
    
    return nodes.filter(node => {
      const p = node.project;
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.repo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'All' || 
        (p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase()));
      
      return matchesSearch && matchesCategory;
    });
  }, [nodes, searchTerm, activeCategory]);

  const handleNodeClick = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      setSelectedProject(node.project);
    }
  };

  // Audio reactive system
  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Ambient cyberpunk-style track (replace with better one if desired)
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  // Initialize audio context for potential reactivity (pulse on beat)
  useEffect(() => {
    if (isPlaying && !audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [isPlaying]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Neural Network Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 15, 60], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: '#050505' }}
        >
          <Suspense fallback={null}>
            <NeuralScene 
              nodes={filteredNodes} 
              onNodeClick={handleNodeClick} 
              selectedId={selectedProject?.id || null} 
            />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={8}
              maxDistance={120}
              autoRotate={!selectedProject}
              autoRotateSpeed={0.2}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD */}
        <div className="pointer-events-auto p-8 flex justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                <span className="text-black text-2xl font-bold">⚡</span>
              </div>
              <div>
                <div className="text-4xl font-bold tracking-tighter text-white neon-text">NEURAL ARCHIVE</div>
                <div className="text-xs text-cyan-400 tracking-[4px] -mt-1">SM0K367 UNIVERSE v0.1</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm font-mono text-white/70">
            <div className="px-5 py-2 glass rounded-3xl border border-white/10">
              {meta?.totalProjects || projects.length} NODES ACTIVE
            </div>
            <div onClick={toggleAudio} className="cursor-pointer flex items-center gap-2 hover:text-white transition-colors">
              {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="text-xs">AMBIENT PULSE</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-4 w-full max-w-2xl px-6">
          <div className="relative w-full">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH THE ARCHIVE... (try 'dj', 'avatar', 'stream', 'grok', 'portal')"
              className="w-full bg-black/80 border border-white/20 pl-14 pr-6 py-4 rounded-3xl text-lg placeholder:text-white/40 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 text-xs font-medium rounded-3xl border transition-all ${
                  activeCategory === cat 
                    ? 'bg-white text-black border-white' 
                    : 'border-white/30 hover:border-white/60 text-white/70'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Selected Project Holographic Panel */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-auto"
            >
              <div className="glass border border-cyan-400/50 rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="uppercase text-[10px] tracking-[3px] text-cyan-400 mb-1">{selectedProject.category || 'EXPERIMENT'}</div>
                    <h2 className="text-4xl font-bold text-white tracking-tighter">{selectedProject.name}</h2>
                    <div className="font-mono text-sm text-white/60 mt-1">{selectedProject.repo}</div>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="text-white/60 hover:text-white">
                    <X size={28} />
                  </button>
                </div>

                <p className="text-white/80 leading-relaxed mb-8 text-lg">
                  {selectedProject.description}
                </p>

                <div className="flex gap-4">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedProject.previewUrl}
                    target="_blank"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-5 rounded-2xl font-semibold flex items-center justify-center gap-3 text-lg"
                  >
                    OPEN PORTAL <ExternalLink size={22} />
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedProject.githubUrl}
                    target="_blank"
                    className="flex-1 border border-white/40 py-5 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-white/5"
                  >
                    VIEW SOURCE <ExternalLink size={22} />
                  </motion.a>
                </div>

                <div className="text-center text-[10px] text-white/40 mt-6 font-mono">
                  NODE {selectedProject.id} • PART OF THE SM0K367 NEURAL CONTINUUM
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom HUD */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-xs font-mono text-white/30 flex gap-8">
          <div>DRAG TO NAVIGATE • SCROLL TO ZOOM • CLICK NODES TO ENTER</div>
          <div className="text-emerald-400">127 NODES ONLINE • ALL DEPLOYS LIVE</div>
        </div>

        {/* Archivist Lore Panel */}
        <div className="absolute top-8 right-8 w-80 glass rounded-3xl p-6 text-sm border border-purple-500/30 pointer-events-auto">
          <div className="uppercase text-purple-400 text-xs tracking-widest mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            THE ARCHIVIST
          </div>
          <div className="text-white/80 leading-relaxed text-[13px]">
            {selectedProject 
              ? `This node belongs to the ${selectedProject.category || 'Experimental'} cluster. It is one of many iterations exploring the same concept. The creative lineage is strong here.`
              : "You are floating inside the complete creative output of Sm0k367. 127 experiments. One continuous mind. The connections you see are the iteration history — shared codebases, evolving aesthetics, recurring obsessions."}
          </div>
          <div className="mt-6 text-[10px] text-purple-400/70">
            The archive is alive. It remembers everything.
          </div>
        </div>
      </div>

      {/* Background ambient audio (silent until toggled) */}
      <audio ref={audioRef} loop />
    </div>
  );
}
