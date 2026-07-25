/**
 * Google Sheets Image Service
 * 
 * Fetches dashboard background image URLs from a Google Sheet
 * Expected sheet format:
 * 
 * Column A: Image URL (required)
 * Column B: WebP URL (optional, for modern browsers)
 * 
 * Sheet ID: 1bj3mrZEl-_k0gCZOO9jzPMGqXR8qFZ9Ri3yx6LRyNZs
 */

export interface BackgroundImageData {
  url: string;
  webp?: string;
}

/**
 * Fetch and parse images from Google Sheet
 * Uses CSV export format for reliability
 * Has a 5-second timeout to prevent hanging
 */
export async function fetchDashboardImages(): Promise<BackgroundImageData[]> {
  try {
    const sheetId = '1bj3mrZEl-_k0gCZOO9jzPMGqXR8qFZ9Ri3yx6LRyNZs';
    const gid = '0'; // First sheet

    // Google Sheets CSV export endpoint
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    console.log('[SheetImages] Fetching from:', csvUrl);

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[SheetImages] Failed to fetch sheet:', response.statusText, response.status);
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }

    const csv = await response.text();
    console.log('[SheetImages] Raw CSV length:', csv.length);
    console.log('[SheetImages] First 200 chars:', csv.substring(0, 200));
    
    const images = parseCSV(csv);

    console.log(`[SheetImages] Fetched ${images.length} images from Google Sheet`);
    if (images.length > 0) {
      console.log('[SheetImages] First image:', images[0]);
    }
    
    return images;
  } catch (error) {
    console.error('[SheetImages] Error fetching images:', error);
    
    // Provide helpful debug info
    if (error instanceof Error) {
      console.error('[SheetImages] Error message:', error.message);
      console.error('[SheetImages] Error stack:', error.stack);
    }
    
    return [];
  }
}

/**
 * Parse CSV data into image objects
 * Handles quoted values and empty cells
 * Special handling for Google Drive URLs - converts to CORS-friendly format
 */
function parseCSV(csv: string): BackgroundImageData[] {
  const lines = csv.split('\n').filter(line => line.trim());
  console.log('[SheetImages] Total lines in CSV:', lines.length);
  
  const images: BackgroundImageData[] = [];

  // Skip first row (header) if it contains descriptive text
  const startIdx = lines.length > 0 && (lines[0].toLowerCase().includes('url') || lines[0].toLowerCase().includes('image')) ? 1 : 0;
  console.log('[SheetImages] Starting parse from line:', startIdx);

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      console.log(`[SheetImages] Line ${i} is empty, skipping`);
      continue;
    }

    console.log(`[SheetImages] Parsing line ${i}: ${line.substring(0, 100)}...`);

    // Parse CSV values (handle quotes and commas)
    const values = parseCSVLine(line);

    if (values.length === 0) {
      console.warn(`[SheetImages] Line ${i} produced no values`);
      continue;
    }

    let url = values[0];
    if (!url) {
      console.warn(`[SheetImages] Line ${i} has empty URL`);
      continue;
    }

    // Special handling for Google Drive URLs
    if (url.includes('drive.google.com')) {
      console.log(`[SheetImages] Detected Google Drive URL, converting to CORS-friendly lh3.googleusercontent.com format`);
      
      // Extract file ID from various Google Drive URL formats
      let fileId = null;
      
      // Format 1: /file/d/FILE-ID/view or /file/d/FILE-ID/preview
      const fileMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileMatch) {
        fileId = fileMatch[1];
      }
      // Format 2: id=FILE-ID
      else {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        if (idMatch) {
          fileId = idMatch[1];
        }
      }

      if (fileId) {
        // Use lh3.googleusercontent.com which has proper CORS headers
        // This is Google's own CDN for Drive files
        url = `https://lh3.googleusercontent.com/d/${fileId}=w1200-h800-c`;
        console.log(`[SheetImages] Converted to CORS-friendly: ${url.substring(0, 80)}...`);
      } else {
        console.warn(`[SheetImages] Could not extract file ID from Google Drive URL: ${url}`);
        continue;
      }
    }

    if (!isValidUrl(url)) {
      console.warn(`[SheetImages] Line ${i} URL is invalid: ${url}`);
      continue;
    }

    const webp = values[1];
    const image: BackgroundImageData = {
      url,
      ...(webp && isValidUrl(webp) && { webp })
    };

    console.log(`[SheetImages] ✓ Added image: ${url.substring(0, 80)}...`);
    images.push(image);
  }

  console.log('[SheetImages] Parse complete. Total valid images:', images.length);
  return images;
}

/**
 * Parse a single CSV line handling quotes
 */
function parseCSVLine(line: string): string[] {
  const regex = /(?:[^,"]|"(?:(?:"")*[^"])*")*(?=,|$)/g;
  const matches = line.match(regex) || [];
  
  return matches
    .map(val => val.trim())
    .map(val => {
      // Remove leading/trailing quotes
      if (val.startsWith('"') && val.endsWith('"')) {
        return val.slice(1, -1).replace(/""/g, '"');
      }
      return val;
    })
    .filter(val => val.length > 0);
}

/**
 * Validate if string is a valid URL
 */
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    const validProtocol = url.protocol === 'http:' || url.protocol === 'https:';
    if (!validProtocol) {
      console.warn('[SheetImages] Invalid protocol for URL:', str, 'protocol:', url.protocol);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[SheetImages] URL validation failed for:', str);
    return false;
  }
}

/**
 * Preload a single image
 * Returns a promise that resolves when image is loaded
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}
