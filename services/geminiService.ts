
import { GoogleGenAI, Modality } from "@google/genai";
import type { GeneratePortraitsParams, GeneratedImage, GenerateVideoParams, GeneratedVideo } from "../types";

export const generatePortraits = async (params: GeneratePortraitsParams): Promise<GeneratedImage[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const identityInstruction = `
    [CRITICAL DIRECTIVE - PRESERVE FACE IDENTITY 100%]
    - THE SUBJECT: The person in the output photograph MUST be unmistakably the exact same individual shown in the source portrait (Image 1).
    - FACE LOCK: Keep the identical facial architecture: bone structure, forehead, eyebrows, eye shape and color, eyelids, nose shape and bridge, philtrum, lip contours, jawline, chin, and skin undertone.
    - DO NOT create an arbitrary or generic model. She must be recognized immediately by her family and friends as her true self.
    - EXPRESSION & POSE: Natural, graceful, radiant smile or captivating confident glance, standing or seated comfortably as a natural tourist or local protagonist at the location.
  `;

  const locationInstruction = `
    [DESTINATION & SCENE TO PLACE HER IN]
    - TARGET LOCATION / AMBIANCE: "${params.prompt}".
    ${params.houseRefBase64 ? '- ARCHITECTURAL REFERENCE: Incorporate the design, villa materials, garden aesthetic, and luxury atmosphere from Image 2.' : ''}
    - NATURAL INTEGRATION: The subject must be authentically situated within this environment with matching ambient lighting, soft shadows, and realistic environmental reflections.
    - The background landmark, scenery, architecture, or flora must be clearly recognizable and cinematic.
  `;

  const flowerInstruction = params.withFlowers ? `
    - FLORAL ACCENT: Include elegant, fresh, realistic natural blossoms harmonizing with the dress and surroundings (e.g., holding a small bouquet or naturally surrounded by blooming branches).
  ` : '';

  const photographyInstruction = `
    [PHOTOGRAPHIC QUALITY]
    - STYLE: Masterpiece high-end editorial travel portrait, RAW photography, shot on Sony A7R V with 85mm f/1.4 GM lens.
    - LIGHTING: Natural golden hour or luminous daylight, natural catchlight in the eyes, soft background bokeh with landmark visibly defined.
    - SKIN & TEXTURE: Authentic real human skin texture, pores, fine hair strands. NO artificial plastic smoothing, NO porcelain blur.
    - NEGATIVE CONSTRAINTS: different face, altered facial features, stranger, anime, cartoon, 3D rendering, plastic skin, bad anatomy, deformed fingers, extra hands, blurry eyes, low resolution.
  `;

  const fullDirective = `
    ${identityInstruction}
    ${locationInstruction}
    ${flowerInstruction}
    ${photographyInstruction}
  `.trim();

  const contentsParts: any[] = [];
  
  // Tag the source face photo explicitly
  contentsParts.push({
    text: "IMAGE 1 (SOURCE PORTRAIT FACE TO PRESERVE): Preserve the exact facial identity, eyes, nose, lips, smile, and likeness of the person in this photo:"
  });
  contentsParts.push({
    inlineData: { data: params.imageBase64, mimeType: params.mimeType }
  });

  // Tag the scenery reference if present
  if (params.houseRefBase64) {
    contentsParts.push({
      text: "IMAGE 2 (SCENE & ARCHITECTURE REFERENCE): Incorporate the luxurious atmosphere, architecture, and garden style from this photo:"
    });
    contentsParts.push({
      inlineData: { data: params.houseRefBase64, mimeType: 'image/jpeg' }
    });
  }

  // Final execution instructions
  contentsParts.push({ text: fullDirective });

  const generationPromises = Array.from({ length: params.numberOfImages }, () =>
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: contentsParts },
      config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    })
  );

  const results = await Promise.allSettled(generationPromises);
  const generatedImages: GeneratedImage[] = [];
  let firstError: Error | null = null;

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const response = result.value;
      const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
      if (imagePart?.inlineData) {
        generatedImages.push({
          id: `gen-${i}-${Date.now()}`,
          url: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
          seed: Math.floor(Math.random() * 1000000).toString(),
        });
      }
    } else {
      firstError = firstError || (result.reason as Error);
    }
  });
  
  if (generatedImages.length === 0) throw firstError || new Error("AI không phản hồi.");
  return generatedImages;
};

export const generateVideo = async (params: GenerateVideoParams): Promise<GeneratedVideo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: params.prompt,
    image: {
      imageBytes: params.imageBase64,
      mimeType: params.mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Không thể tạo video.");

  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': process.env.API_KEY || '',
    },
  });

  if (!response.ok) throw new Error("Không thể tải video.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  return {
    id: `video-${Date.now()}`,
    url: url
  };
};

export const rewritePrompt = async (originalPrompt: string): Promise<string> => {
  if (!originalPrompt.trim()) return originalPrompt;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bạn là một chuyên gia viết prompt cho AI tạo hình ảnh. Hãy đọc các từ khóa sau và viết lại thành một đoạn mô tả (prompt) chi tiết, nghệ thuật và chuyên nghiệp bằng tiếng Việt để tạo ra một bức ảnh chân dung đẹp nhất. Hãy giữ cho đoạn văn mượt mà và giàu hình ảnh. Từ khóa: "${originalPrompt}"`,
    });
    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Error rewriting prompt:", error);
    return originalPrompt;
  }
};
