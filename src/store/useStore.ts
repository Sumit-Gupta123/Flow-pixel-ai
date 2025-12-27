import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

interface AppState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (id: string, data: any) => void;
}

// 1. Define Initial Nodes Safely
const initialNodes: Node[] = [
  { 
    id: '1', 
    type: 'sourceNode', 
    position: { x: 50, y: 200 }, 
    data: { image: null } // Ensure data is an object
  },
  { 
    id: '2', 
    type: 'filterNode', 
    position: { x: 350, y: 100 }, 
    data: { brightness: 100, contrast: 100, saturation: 100 } 
  },
  { 
    id: '3', 
    type: 'aiNode', 
    position: { x: 650, y: 200 }, 
    data: { aiModel: 'none', isProcessing: false } 
  },
  { 
    id: '4', 
    type: 'outputNode', 
    position: { x: 950, y: 200 }, 
    data: { processedImage: null } 
  },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
];

export const useStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection: Connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },

  updateNodeData: (id, newData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          // SAFEGUARD: Ensure node.data is an object before spreading
          const currentData = node.data || {};
          return { ...node, data: { ...currentData, ...newData } };
        }
        return node;
      }),
    });
  },
}));