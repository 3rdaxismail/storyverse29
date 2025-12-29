// Load token from environment variables
const FIGMA_API_TOKEN = import.meta.env.VITE_FIGMA_API_TOKEN;

if (!FIGMA_API_TOKEN) {
  console.warn('VITE_FIGMA_API_TOKEN is not set in environment');
}

export interface FigmaFile {
  name: string;
  [key: string]: any;
}

/**
 * Fetch a Figma file by its key
 */
export async function getFigmaFile(fileKey: string): Promise<FigmaFile> {
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: {
      'X-FIGMA-TOKEN': FIGMA_API_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a specific frame or component from a Figma file
 */
export async function getFigmaNode(
  fileKey: string,
  nodeIds: string[]
): Promise<any> {
  const params = new URLSearchParams({
    ids: nodeIds.join(','),
  });

  const response = await fetch(
    `https://api.figma.com/v1/files/${fileKey}/nodes?${params}`,
    {
      headers: {
        'X-FIGMA-TOKEN': FIGMA_API_TOKEN,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  return response.json();
}

export default {
  getFigmaFile,
  getFigmaNode,
};
