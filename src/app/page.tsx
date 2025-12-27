'use client';

import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css'; // Essential styles

// Import Store & Logic
import { useStore } from '@/store/useStore';
import { useGraphProcessor } from '@/hooks/useGraphProcessor';

// Import Custom Nodes
import SourceNode from '@/components/nodes/SourceNode';
import FilterNode from '@/components/nodes/FilterNode';
import AINode from '@/components/nodes/AINode';
import OutputNode from '@/components/nodes/OutputNode';

export default function Home() {
  // 1. Initialize the Graph Processor (The Brain)
  // This hook listens for changes and updates the images automatically.
  useGraphProcessor();

  // 2. Memoize Node Types
  // This prevents React Flow from re-rendering nodes unnecessarily.
  const nodeTypes = useMemo(() => ({
    sourceNode: SourceNode,
    filterNode: FilterNode,
    aiNode: AINode,
    outputNode: OutputNode,
  }), []);

  // 3. Get State from Store
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect 
  } = useStore();

  return (
    // We wrap in ReactFlowProvider to ensure internal context works correctly
    <ReactFlowProvider>
      <div className="w-screen h-screen bg-stone-50">
        
        {/* The Main Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          // Default behaviors (Explicitly set to be safe)
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
        >
          {/* Grid Background */}
          <Background color="#999" gap={20} size={1} />
          
          {/* Navigation Controls (Zoom/Pan) */}
          <Controls className="bg-white border-stone-200 shadow-xl" />

          {/* Floating Header Panel */}
          <Panel position="top-left" className="m-4">
            <div className="bg-white/90 backdrop-blur border border-stone-200 p-4 rounded-xl shadow-lg w-80">
              <h1 className="text-xl font-extrabold text-stone-800 tracking-tight">
                FlowPixel <span className="text-purple-600">AI</span>
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Non-destructive, node-based image editor.
              </p>
              <div className="mt-4 flex flex-col gap-1 text-xs text-stone-400 bg-stone-50 p-2 rounded border border-stone-100">
                <p>1. Upload an image in <span className="font-bold text-stone-600">Source</span>.</p>
                <p>2. Connect wires to <span className="font-bold text-blue-600">Filters</span>.</p>
                <p>3. Use <span className="font-bold text-purple-600">AI</span> to remove backgrounds.</p>
                <p>4. Download from <span className="font-bold text-green-600">Output</span>.</p>
              </div>
            </div>
          </Panel>

        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}