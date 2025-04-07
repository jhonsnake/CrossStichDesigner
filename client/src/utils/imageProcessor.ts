import { fabricTypes, threadTypes } from '@shared/schema';
import { DMCThreads, AnchorThreads, JPCoatsThreads } from '@/data/threadColors';

// Types
interface ProcessImageOptions {
  width: number;
  height: number;
  limitColors: boolean;
  colorCount?: number;
  threadType: string;
}

interface ProcessedPatternResult {
  matrix: Array<Array<string>>;
  colors: Array<{
    code: string;
    name: string;
    color: string;
    count: number;
    skeins: number;
  }>;
  patternDifficulty: 'Sencilla' | 'Media' | 'Difícil';
}

// Function to find closest thread color to an RGB value
const findClosestThreadColor = (
  r: number,
  g: number,
  b: number, 
  threadType: string,
  excludedCodes: string[] = []
) => {
  // Select the appropriate thread palette
  let threadPalette;
  switch (threadType) {
    case 'anchor':
      threadPalette = AnchorThreads;
      break;
    case 'jpcoats':
      threadPalette = JPCoatsThreads;
      break;
    case 'dmc':
    default:
      threadPalette = DMCThreads;
      break;
  }

  let closestColor = null;
  let closestDistance = Infinity;

  // Find the closest color using Euclidean distance in RGB space
  for (const thread of threadPalette) {
    if (excludedCodes.includes(thread.code)) continue;
    
    const tR = parseInt(thread.color.slice(1, 3), 16);
    const tG = parseInt(thread.color.slice(3, 5), 16);
    const tB = parseInt(thread.color.slice(5, 7), 16);
    
    // Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(r - tR, 2) + 
      Math.pow(g - tG, 2) + 
      Math.pow(b - tB, 2)
    );
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestColor = thread;
    }
  }
  
  return closestColor;
};

// Function to quantize image into fewer colors
const quantizeImageColors = (
  imageData: Uint8ClampedArray, 
  width: number, 
  height: number, 
  maxColors: number,
  threadType: string
) => {
  const pixels = [];
  
  // Extract pixel data
  for (let i = 0; i < imageData.length; i += 4) {
    pixels.push({
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
      a: imageData[i + 3]
    });
  }
  
  // Array to store selected threads
  const selectedThreads: any[] = [];
  
  // For each pixel, find the closest thread color
  for (let i = 0; i < pixels.length; i++) {
    const pixel = pixels[i];
    
    // Skip transparent pixels
    if (pixel.a < 128) continue;
    
    // Check if we've reached the max colors
    if (selectedThreads.length >= maxColors) {
      // Find closest existing thread
      let closestThread = null;
      let closestDistance = Infinity;
      
      for (const thread of selectedThreads) {
        const tR = parseInt(thread.color.slice(1, 3), 16);
        const tG = parseInt(thread.color.slice(3, 5), 16);
        const tB = parseInt(thread.color.slice(5, 7), 16);
        
        const distance = Math.sqrt(
          Math.pow(pixel.r - tR, 2) + 
          Math.pow(pixel.g - tG, 2) + 
          Math.pow(pixel.b - tB, 2)
        );
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestThread = thread;
        }
      }
      
      if (closestThread) {
        imageData[i * 4] = parseInt(closestThread.color.slice(1, 3), 16);
        imageData[i * 4 + 1] = parseInt(closestThread.color.slice(3, 5), 16);
        imageData[i * 4 + 2] = parseInt(closestThread.color.slice(5, 7), 16);
      }
    } else {
      // Find closest thread color not already in selectedThreads
      const excludedCodes = selectedThreads.map(t => t.code);
      const closestThread = findClosestThreadColor(
        pixel.r, 
        pixel.g, 
        pixel.b, 
        threadType,
        excludedCodes
      );
      
      if (closestThread && !selectedThreads.some(t => t.code === closestThread.code)) {
        selectedThreads.push(closestThread);
      }
      
      // Replace pixel with thread color
      if (closestThread) {
        imageData[i * 4] = parseInt(closestThread.color.slice(1, 3), 16);
        imageData[i * 4 + 1] = parseInt(closestThread.color.slice(3, 5), 16);
        imageData[i * 4 + 2] = parseInt(closestThread.color.slice(5, 7), 16);
      }
    }
  }
  
  return { imageData, selectedThreads };
};

// Process image to generate cross-stitch pattern
export const processImage = async (
  imagePath: string,
  options: ProcessImageOptions
): Promise<ProcessedPatternResult> => {
  return new Promise((resolve, reject) => {
    // Load the image
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      try {
        // Create canvas to resize and process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Set canvas dimensions to desired pattern size
        canvas.width = options.width;
        canvas.height = options.height;
        
        // Draw image on canvas with desired dimensions
        ctx.drawImage(img, 0, 0, options.width, options.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, options.width, options.height);
        
        // Process image data based on color count option
        const colorCount = options.limitColors ? options.colorCount || 15 : 50;
        
        // Quantize image to reduce colors
        const { imageData: quantizedData, selectedThreads } = quantizeImageColors(
          imageData.data,
          options.width,
          options.height,
          colorCount,
          options.threadType
        );
        
        // Put quantized data back on canvas
        ctx.putImageData(new ImageData(quantizedData, options.width, options.height), 0, 0);
        
        // Create pattern matrix
        const matrix: Array<Array<string>> = [];
        const colorCounts: Record<string, number> = {};
        
        // Initialize the matrix with empty values
        for (let y = 0; y < options.height; y++) {
          matrix[y] = [];
          for (let x = 0; x < options.width; x++) {
            matrix[y][x] = '';
          }
        }
        
        // Fill the matrix with colors
        for (let y = 0; y < options.height; y++) {
          for (let x = 0; x < options.width; x++) {
            const pixelIndex = (y * options.width + x) * 4;
            const r = quantizedData[pixelIndex];
            const g = quantizedData[pixelIndex + 1];
            const b = quantizedData[pixelIndex + 2];
            const a = quantizedData[pixelIndex + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            // Convert RGB to hex
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            
            // Find closest thread
            const closestThread = selectedThreads.find(thread => {
              const threadR = parseInt(thread.color.slice(1, 3), 16);
              const threadG = parseInt(thread.color.slice(3, 5), 16);
              const threadB = parseInt(thread.color.slice(5, 7), 16);
              
              return Math.abs(threadR - r) <= 5 && 
                     Math.abs(threadG - g) <= 5 && 
                     Math.abs(threadB - b) <= 5;
            });
            
            if (closestThread) {
              matrix[y][x] = closestThread.code;
              colorCounts[closestThread.code] = (colorCounts[closestThread.code] || 0) + 1;
            }
          }
        }
        
        // Calculate color counts and skein amounts
        const colors = selectedThreads.map(thread => {
          const count = colorCounts[thread.code] || 0;
          // Rough estimate: 1 skein can cover about 1500 stitches (adjust as needed)
          const skeins = Math.ceil(count / 1500);
          
          return {
            code: thread.code,
            name: thread.name,
            color: thread.color,
            count,
            skeins,
          };
        }).filter(color => color.count > 0)
         .sort((a, b) => b.count - a.count);
        
        // Determine pattern difficulty
        let patternDifficulty: 'Sencilla' | 'Media' | 'Difícil';
        
        if (colors.length <= 10) {
          patternDifficulty = 'Sencilla';
        } else if (colors.length <= 20) {
          patternDifficulty = 'Media';
        } else {
          patternDifficulty = 'Difícil';
        }
        
        // Resolve with pattern data
        resolve({
          matrix,
          colors,
          patternDifficulty,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imagePath;
  });
};
