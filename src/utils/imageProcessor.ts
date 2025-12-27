/**
 * Image Processor Utility
 * UNIVERSAL Background Removal (Works on any object).
 */

const modelCache: Record<string, any> = {};

// Helper: Standard CSS Filters
function applyCSSFilters(ctx: CanvasRenderingContext2D, nodeData: any) {
  const data = nodeData || {};
  const brightness = (data.brightness ?? 100) / 100;
  const contrast = (data.contrast ?? 100) / 100;
  const saturation = (data.saturation ?? 100) / 100;
  const blur = data.blur ?? 0;
  const sepia = (data.sepia ?? 0) / 100;

  ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px) sepia(${sepia})`;
}

// Helper: Mask to Canvas
function maskToCanvas(mask: any, width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    const pixelCount = width * height;
    const rgbaData = new Uint8ClampedArray(pixelCount * 4);
    const isFloat = mask.data instanceof Float32Array;

    for (let i = 0; i < pixelCount; i++) {
        let value = mask.data[i];
        if (isFloat && value <= 1.0) value = value * 255;
        rgbaData[i * 4 + 0] = 0; 
        rgbaData[i * 4 + 1] = 0; 
        rgbaData[i * 4 + 2] = 0;
        rgbaData[i * 4 + 3] = value; 
    }
    const imageData = new ImageData(rgbaData, width, height);
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * AI TASK RUNNER
 */
async function applyAITask(canvas: HTMLCanvasElement, nodeData: any): Promise<HTMLCanvasElement> {
  const data = nodeData || {};
  const task = data.aiModel; 

  if (task === 'none') return canvas;

  try {
    const { pipeline, env } = await import('@xenova/transformers');
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    // Use SegFormer (Best Browser Model)
    if (!modelCache['segmentation']) {
            modelCache['segmentation'] = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512');
    }
    const segmenter = modelCache['segmentation'];
    const output = await segmenter(canvas.toDataURL());

    // --- UNIVERSAL LOGIC STARTS HERE ---
    
    // We define ONLY what is definitely "Background" (Structural elements).
    // Everything else (bottles, shoes, phones, people) is considered "Subject".
    const strictBackgrounds = [
        'wall', 'floor', 'ceiling', 'sky', 'grass', 'dirt', 'road', 
        'building', 'pavement', 'earth', 'mountain', 'sea', 'water', 
        'field', 'sand', 'rock', 'carpet', 'rug', 'sidewalk'
    ];

    // Filter: Keep anything that is NOT in the background list
    // This allows it to work on "Bottle", "Shoe", "Toy", "Apple", etc.
    let targetSegments = output.filter((seg: any) => !strictBackgrounds.includes(seg.label));

    // Fallback: If AI thinks EVERYTHING is background (e.g. a person standing on a huge rug),
    // we force it to keep the largest segment that isn't "Sky" or "Wall".
    if (targetSegments.length === 0) {
        console.warn("🤖 AI: Everything looks like background. Forcing largest object.");
        targetSegments = output.filter((seg: any) => seg.label !== 'sky' && seg.label !== 'wall');
    }

    if (targetSegments.length > 0) {
        console.log(`🤖 AI: Keeping [${targetSegments.map((s:any) => s.label).join(', ')}]`);
        
        // Combine all valid subject parts
        const combinedMaskCanvas = document.createElement('canvas');
        combinedMaskCanvas.width = canvas.width;
        combinedMaskCanvas.height = canvas.height;
        const maskCtx = combinedMaskCanvas.getContext('2d')!;

        for (const seg of targetSegments) {
            const segmentCanvas = maskToCanvas(seg.mask, seg.mask.width, seg.mask.height);
            maskCtx.drawImage(segmentCanvas, 0, 0, canvas.width, canvas.height);
        }

        const ctx = canvas.getContext('2d')!;
        
        if (task === 'remove-background') {
            ctx.globalCompositeOperation = 'destination-in'; // Keep Subject
        } else if (task === 'remove-foreground') {
            ctx.globalCompositeOperation = 'destination-out'; // Remove Subject
        }

        ctx.drawImage(combinedMaskCanvas, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    } else {
        console.warn("🤖 AI: Could not isolate subject.");
    }

  } catch (err) {
    console.error(`❌ AI Failed:`, err);
    return canvas;
  }

  return canvas;
}

// Helper: Blend Function
async function applyBlend(inputs: Record<string, string>): Promise<HTMLCanvasElement> {
    const bgSrc = inputs['bg'];
    const fgSrc = inputs['fg'];
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    if (bgSrc) {
        const bgImg = new Image(); bgImg.src = bgSrc;
        await new Promise(r => bgImg.onload = r);
        canvas.width = bgImg.width; canvas.height = bgImg.height;
        ctx.drawImage(bgImg, 0, 0);
    }
    if (fgSrc) {
        const fgImg = new Image(); fgImg.src = fgSrc;
        await new Promise(r => fgImg.onload = r);
        ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);
    }
    return canvas;
}

/**
 * MAIN EXPORT
 */
export async function processNodeOperation(
  imageInput: string | HTMLCanvasElement | Record<string, string> | null, 
  nodeType: string,
  nodeData: any
): Promise<string> {

  const safeData = nodeData || {};

  // 1. Blend Logic
  if (nodeType === 'blendNode' && imageInput && typeof imageInput === 'object' && !('getContext' in imageInput)) {
       const blendedCanvas = await applyBlend(imageInput as Record<string, string>);
       return blendedCanvas.toDataURL('image/png');
  }

  // 2. Single Image Logic
  let srcString = '';
  if (typeof imageInput === 'string') srcString = imageInput;
  else if (imageInput && typeof imageInput === 'object' && !('getContext' in imageInput)) srcString = Object.values(imageInput)[0] as string;

  let canvas: HTMLCanvasElement;

  if (srcString) {
      canvas = document.createElement('canvas');
      const img = new Image(); img.src = srcString; img.crossOrigin = "Anonymous";
      await new Promise(r => img.onload = r);
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d')?.drawImage(img, 0, 0);
  } else if (imageInput && 'getContext' in (imageInput as any)) {
      canvas = imageInput as HTMLCanvasElement;
  } else {
      return '';
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL();

  try {
      if (nodeType === 'filterNode') {
         const tempCanvas = document.createElement('canvas');
         tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
         const tempCtx = tempCanvas.getContext('2d');
         if (tempCtx) {
           applyCSSFilters(tempCtx, safeData);
           tempCtx.drawImage(canvas, 0, 0);
           ctx.clearRect(0,0, canvas.width, canvas.height);
           ctx.drawImage(tempCanvas, 0,0);
         }
      } 
      else if (nodeType === 'aiNode') {
          canvas = await applyAITask(canvas, safeData);
      }
  } catch (err) {
      console.error("Processing Error:", err);
  }

  return canvas.toDataURL('image/png');
}