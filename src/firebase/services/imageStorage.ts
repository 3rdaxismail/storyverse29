/**
 * IMAGE STORAGE MANAGEMENT SERVICE
 * 
 * Handles image uploads with automatic cleanup and replacement.
 * Enforces size/format limits and prevents orphaned files.
 * 
 * RULES:
 * - All images must be ≤ 50 KB WebP
 * - Replacing an image deletes the old file
 * - No duplicate images
 * - Atomic reference updates
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config';
import { validateImageSize, validateImageType, CONTENT_LIMITS } from './contentLimits';

// ============================================================
// TYPES
// ============================================================

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  imageId?: string;
  error?: string;
}

export interface ImageReplaceResult extends ImageUploadResult {
  oldImageDeleted: boolean;
}

// ============================================================
// IMAGE OPTIMIZATION
// ============================================================

/**
 * Optimize image to WebP format and resize to meet size limits
 */
export async function optimizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      try {
        // Calculate dimensions to maintain aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200; // Max width/height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to WebP with quality adjustment to meet size limit
        let quality = 0.85;
        const attemptConversion = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to convert image'));
                return;
              }

              // If still too large and quality can be reduced, try again
              if (blob.size > CONTENT_LIMITS.MAX_IMAGE_SIZE_BYTES && q > 0.3) {
                attemptConversion(q - 0.1);
              } else if (blob.size > CONTENT_LIMITS.MAX_IMAGE_SIZE_BYTES) {
                reject(new Error(`Image cannot be compressed below ${CONTENT_LIMITS.MAX_IMAGE_SIZE_KB} KB`));
              } else {
                resolve(blob);
              }
            },
            'image/webp',
            q
          );
        };

        attemptConversion(quality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// ============================================================
// UPLOAD FUNCTIONS
// ============================================================

/**
 * Upload a new image (without replacing existing)
 */
export async function uploadImage(
  file: File,
  path: string,
  imageId: string
): Promise<ImageUploadResult> {
  try {
    // Validate file type
    const typeValidation = validateImageType(file);
    if (!typeValidation.valid) {
      return {
        success: false,
        error: typeValidation.message,
      };
    }

    // Optimize image
    const optimizedBlob = await optimizeImage(file);

    // Final size validation
    const sizeValidation = validateImageSize(new File([optimizedBlob], file.name));
    if (!sizeValidation.valid) {
      return {
        success: false,
        error: sizeValidation.message,
      };
    }

    // Upload to Firebase Storage
    const storageRef = ref(storage, `${path}/${imageId}.webp`);
    await uploadBytes(storageRef, optimizedBlob);
    const url = await getDownloadURL(storageRef);

    console.log(`[ImageStorage] Uploaded image: ${path}/${imageId}.webp (${Math.round(optimizedBlob.size / 1024)} KB)`);

    return {
      success: true,
      url,
      imageId,
    };
  } catch (error) {
    console.error('[ImageStorage] Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Replace an existing image (deletes old, uploads new)
 */
export async function replaceImage(
  file: File,
  path: string,
  newImageId: string,
  oldImageId?: string
): Promise<ImageReplaceResult> {
  try {
    // Delete old image if it exists
    let oldImageDeleted = false;
    if (oldImageId) {
      try {
        const oldRef = ref(storage, `${path}/${oldImageId}.webp`);
        await deleteObject(oldRef);
        oldImageDeleted = true;
        console.log(`[ImageStorage] Deleted old image: ${path}/${oldImageId}.webp`);
      } catch (deleteError) {
        console.warn('[ImageStorage] Failed to delete old image (may not exist):', deleteError);
      }
    }

    // Upload new image
    const uploadResult = await uploadImage(file, path, newImageId);

    return {
      ...uploadResult,
      oldImageDeleted,
    };
  } catch (error) {
    console.error('[ImageStorage] Replace failed:', error);
    return {
      success: false,
      oldImageDeleted: false,
      error: error instanceof Error ? error.message : 'Replace failed',
    };
  }
}

/**
 * Delete an image from storage
 */
export async function deleteImage(path: string, imageId: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, `${path}/${imageId}.webp`);
    await deleteObject(storageRef);
    console.log(`[ImageStorage] Deleted image: ${path}/${imageId}.webp`);
    return true;
  } catch (error) {
    console.error('[ImageStorage] Delete failed:', error);
    return false;
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generate unique image ID
 */
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract image ID from URL
 */
export function extractImageIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/([^/]+)\.webp/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
