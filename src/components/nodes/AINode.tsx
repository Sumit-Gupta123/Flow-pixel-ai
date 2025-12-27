import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useStore } from '@/store/useStore';
import { Wand2, Loader2 } from 'lucide-react';

export default function AINode({ id, data }: NodeProps) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const aiModel = data.aiModel || 'none';
  const isProcessing = data.isProcessing || false;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { aiModel: e.target.value });
  };

  return (
    <div className="bg-white border-2 border-purple-600 rounded-lg p-4 shadow-xl w-60">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />

      <div className="flex items-center gap-2 mb-3 border-b border-stone-200 pb-2 text-purple-800">
        {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Wand2 size={16} />}
        <span className="font-bold text-sm">AI Processor</span>
      </div>

      <div className="flex flex-col gap-2 relative">
        <label className="text-xs font-semibold text-stone-500">Task</label>
        
        {/* --- CRITICAL FIX --- */}
        <select 
          // 1. 'nodrag' stops node dragging
          // 2. 'nopan' stops canvas panning
          className="nodrag nopan border border-stone-300 rounded p-1 text-sm bg-stone-50 cursor-pointer w-full focus:ring-2 focus:ring-purple-500 outline-none"
          
          value={aiModel}
          onChange={handleChange}
          disabled={isProcessing}

          // 3. FORCE the browser to acknowledge the click here, not on the canvas
          onPointerDownCapture={(e) => e.stopPropagation()}
          onMouseDownCapture={(e) => e.stopPropagation()}
        >
          <option value="none">Select AI Task...</option>
          <option value="remove-background">Remove Background</option>
        </select>
        {/* -------------------- */}
        
         {isProcessing && <div className="text-xs text-purple-600 font-medium mt-1">Running AI model...</div>}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
    </div>
  );
}