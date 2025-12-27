import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useStore } from '@/store/useStore';
import { SlidersHorizontal } from 'lucide-react';

const SliderControl = ({ label, value, onChange, min, max, step }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-xs text-stone-500">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={onChange}
      className="nodrag accent-blue-500 h-2 cursor-pointer"
      onMouseDownCapture={(e) => e.stopPropagation()}
    />
  </div>
);

export default function FilterNode({ id, data }: NodeProps) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  
  // Get values with defaults
  const brightness = data.brightness ?? 100;
  const contrast = data.contrast ?? 100;
  const blur = data.blur ?? 0;
  const sepia = data.sepia ?? 0;

  const handleChange = (key: string, value: number) => {
    updateNodeData(id, { [key]: value });
  };

  return (
    <div className="bg-white border-2 border-blue-800 rounded-lg p-4 shadow-xl w-64">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />

      <div className="flex items-center gap-2 mb-3 border-b border-stone-200 pb-2 text-blue-800">
        <SlidersHorizontal size={16} />
        <span className="font-bold text-sm">Pro Filters</span>
      </div>

      <div className="flex flex-col gap-3">
        <SliderControl label="Brightness" value={brightness} min={0} max={200} step={5}
            onChange={(e: any) => handleChange('brightness', Number(e.target.value))} />
        <SliderControl label="Contrast" value={contrast} min={0} max={200} step={5}
            onChange={(e: any) => handleChange('contrast', Number(e.target.value))} />
        <SliderControl label="Blur (px)" value={blur} min={0} max={20} step={1}
            onChange={(e: any) => handleChange('blur', Number(e.target.value))} />
        <SliderControl label="Sepia (%)" value={sepia} min={0} max={100} step={5}
            onChange={(e: any) => handleChange('sepia', Number(e.target.value))} />
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
  );
}