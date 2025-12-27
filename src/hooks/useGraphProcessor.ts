import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { processNodeOperation } from '@/utils/imageProcessor';

export function useGraphProcessor() {
  const { nodes, edges, updateNodeData } = useStore();
  
  // Ref to track if we are currently calculating (prevents overlapping runs)
  const isProcessingRef = useRef(false);

  const getProcessedImageForNode = useCallback(async (nodeId: string, visited: Set<string>): Promise<string | null> => {
    try {
        if (visited.has(nodeId)) return null;
        visited.add(nodeId);

        const currentNode = nodes.find((n) => n.id === nodeId);
        if (!currentNode) return null;

        // 1. Check Input Connection
        const inputEdge = edges.find((e) => e.target === nodeId);

        // CASE: Source Node (Start of chain)
        if (!inputEdge) {
            if (currentNode.type === 'sourceNode') {
                return currentNode.data?.image || null;
            }
            return null;
        }

        // CASE: Connected Node (Middle of chain)
        const previousNodeId = inputEdge.source;
        const inputImage = await getProcessedImageForNode(previousNodeId, visited);

        if (!inputImage) return null;

        // 2. PROCESS THE NODE
        // Important: We don't update 'isProcessing' state here anymore to avoid triggering re-renders loop.
        // We just do the calculation silently.
        
        // Execute Logic
        const result = await processNodeOperation(
            inputImage,
            currentNode.type || 'default',
            currentNode.data || {}
        );

        return result;

    } catch (error) {
        console.error("Graph traversal error:", error);
        return null;
    }
  }, [nodes, edges]); // Dependencies

  // --- Main Loop ---
  useEffect(() => {
    const runPipeline = async () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
          const outputNodes = nodes.filter((n) => n.type === 'outputNode');

          for (const outputNode of outputNodes) {
            const visited = new Set<string>();
            const finalImage = await getProcessedImageForNode(outputNode.id, visited);
            
            if (typeof finalImage === 'string') {
                // --- THE FIX IS HERE ---
                // Only update the store if the image is DIFFERENT than what we already have.
                // This stops the infinite loop of Update -> Detect Change -> Update.
                if (outputNode.data?.processedImage !== finalImage) {
                    console.log("Updating Output Node...");
                    updateNodeData(outputNode.id, { processedImage: finalImage });
                }
            }
          }
      } catch (e) {
          console.error("Pipeline crashed:", e);
      } finally {
          isProcessingRef.current = false;
      }
    };

    // Increase debounce to 1 second to be safe
    const timeoutId = setTimeout(runPipeline, 1000);
    return () => clearTimeout(timeoutId);

  }, [nodes, edges, getProcessedImageForNode, updateNodeData]);
}