import React, { ChangeEvent } from 'react';
import { Handle, Position } from 'reactflow'; // Handle is the "dot" we connect wires to
import { useStore } from '@/store/useStore';
import { Upload } from 'lucide-react';

export default function SourceNode({ id, data }: { id: string; data: any }) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  // Handle file upload
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Save the image URL to the store
        updateNodeData(id, { image: event.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white border-2 border-stone-800 rounded-lg p-4 shadow-xl w-64">
      <div className="flex items-center gap-2 mb-2 border-b border-stone-200 pb-2">
        <Upload size={16} />
        <span className="font-bold text-sm">Image Source</span>
      </div>

      <div className="flex flex-col gap-2">
        {data.image ? (
          // Preview the uploaded image
          <img src={data.image} alt="Upload" className="w-full h-32 object-cover rounded bg-stone-100" />
        ) : (
          <div className="w-full h-32 bg-stone-100 rounded flex items-center justify-center text-stone-400 text-xs">
            No Image
          </div>
        )}
        
        <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload} 
            className="text-xs text-stone-500" 
        />
      </div>

      {/* The output handle (Right side) */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
  );
}