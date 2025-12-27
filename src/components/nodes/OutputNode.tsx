import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Download } from 'lucide-react';

export default function OutputNode({ data }: NodeProps) {
  const downloadImage = () => {
    if (!data.processedImage) return;
    const link = document.createElement('a');
    link.href = data.processedImage;
    link.download = 'flowpixel-export.png';
    link.click();
  };

  return (
    <div className="bg-stone-900 border-2 border-stone-700 rounded-lg p-4 shadow-2xl w-64 text-white">
      {/* Input Handle (Left side) - Receives processed data */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500" />

      <div className="flex items-center gap-2 mb-3 border-b border-stone-700 pb-2">
        <span className="font-bold text-sm text-green-400">Final Output</span>
      </div>

      <div className="flex flex-col gap-2">
        {data.processedImage ? (
          <div className="relative group">
            <img 
              src={data.processedImage} 
              alt="Output" 
              className="w-full h-32 object-contain bg-stone-800 rounded border border-stone-600" 
            />
            <button 
              onClick={downloadImage}
              className="absolute bottom-2 right-2 bg-green-600 hover:bg-green-500 text-white p-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Download"
            >
              <Download size={16} />
            </button>
          </div>
        ) : (
          <div className="w-full h-32 bg-stone-800 rounded flex items-center justify-center text-stone-500 text-xs border border-stone-700 border-dashed">
            Waiting for input...
          </div>
        )}
      </div>
    </div>
  );
}