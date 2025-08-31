import getPixels from 'get-pixels';
import rgb2hex from 'rgb2hex';
import { PNG } from 'pngjs';

export interface PixelData {
  width: number;
  height: number;
  pixels: Uint8Array;
  channels: number;
}

/**
 * PNGバッファをピクセルデータに変換（get-pixels使用）
 */
export function getPixelsFromBuffer(buffer: Buffer): Promise<PixelData> {
  return new Promise((resolve, reject) => {
    getPixels(buffer, (err, pixels) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve({
        width: pixels.shape[0],
        height: pixels.shape[1],
        pixels: pixels.data,
        channels: pixels.shape[2]
      });
    });
  });
}

/**
 * PNGバッファをピクセルデータに変換（pngjs使用）
 */
export function getPixelsFromBufferPngjs(buffer: Buffer): Promise<PixelData> {
  return new Promise((resolve, reject) => {
    try {
      const png = PNG.sync.read(buffer);
      
      resolve({
        width: png.width,
        height: png.height,
        pixels: png.data,
        channels: 4 // PNGは常にRGBA
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * RGB値を16進数カラーコードに変換
 */
export function rgbToHex(r: number, g: number, b: number): string {
  try {
    const result = rgb2hex(`rgb(${r},${g},${b})`);
    return result.hex;
  } catch (error) {
    // フォールバック: 手動で16進数に変換
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

/**
 * RGB値をグレースケール値に変換
 */
export function rgbToGrayscale(r: number, g: number, b: number): number {
  // 標準的なグレースケール変換式
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * グレースケール値を16進数カラーコードに変換
 */
export function grayscaleToHex(gray: number): string {
  const hex = gray.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

/**
 * PNGをピクセルアート風のSVGに変換
 */
export function convertPixelsToPixelArtSvg(pixelData: PixelData): string {
  const { width, height, pixels, channels } = pixelData;
  
  let svg = `<svg width="480" height="480" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <defs>\n`;
  svg += `    <style>\n`;
  svg += `      .pixel { shape-rendering: pixelated; }\n`;
  svg += `    </style>\n`;
  svg += `  </defs>\n`;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = channels > 3 ? pixels[index + 3] : 255;
      
      // 透明ピクセルはスキップ
      if (a === 0) continue;
      
      const hex = rgbToHex(r, g, b);
      const pixelSize = 20; // 20x20のピクセルサイズ
      const pixelX = x * pixelSize;
      const pixelY = y * pixelSize;
      svg += `  <rect x="${pixelX}" y="${pixelY}" width="${pixelSize}" height="${pixelSize}" fill="${hex}" stroke="#b4b4b4" class="pixel" />\n`;
    }
  }
  
  svg += '</svg>';
  return svg;
}

/**
 * PNGをグレースケールのピクセルアート風SVGに変換
 */
export function convertPixelsToGrayscalePixelArtSvg(pixelData: PixelData): string {
  const { width, height, pixels, channels } = pixelData;
  
  let svg = `<svg width="480" height="480" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <defs>\n`;
  svg += `    <style>\n`;
  svg += `      .pixel { shape-rendering: pixelated; }\n`;
  svg += `    </style>\n`;
  svg += `  </defs>\n`;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = channels > 3 ? pixels[index + 3] : 255;
      
      // 透明ピクセルはスキップ
      if (a === 0) continue;
      
      const gray = rgbToGrayscale(r, g, b);
      const hex = grayscaleToHex(gray);
      const pixelSize = 20; // 20x20のピクセルサイズ
      const pixelX = x * pixelSize;
      const pixelY = y * pixelSize;
      svg += `  <rect x="${pixelX}" y="${pixelY}" width="${pixelSize}" height="${pixelSize}" fill="${hex}" class="pixel" />\n`;
    }
  }
  
  svg += '</svg>';
  return svg;
}

/**
 * PNGをクロスステッチ風のSVGに変換
 */
export function convertPixelsToCrossStitchSvg(pixelData: PixelData): string {
  const { width, height, pixels, channels } = pixelData;

  let svg = `<svg width="${width * 20}" height="${height * 20}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <defs>\n`;
  svg += `    <style>\n`;
  svg += `      .stitch { fill: currentColor; }\n`;
  svg += `    </style>\n`;
  svg += `  </defs>\n`;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = channels > 3 ? pixels[index + 3] : 255;

      if (a === 0) continue;

      const hex = rgbToHex(r, g, b);
      const centerX = x * 20 + 10;
      const centerY = y * 20 + 10;

      // クロスステッチ風の×マークを描画（角丸の長方形を45度傾けたものを二つ重ねる）
      // 左上から右下への斜線（45度）
      svg += `  <g fill="${hex}" stroke="${hex}" transform="matrix(0.70710678 0.70710678 -0.70710678 0.70710678 ${centerX} ${centerY})">\n`;
      svg += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" stroke="none"/>\n`;
      svg += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" fill="none" stroke="#fff"/>\n`;
      svg += `  </g>\n`;
      // 右上から左下への斜線（-45度）
      svg += `  <g fill="${hex}" stroke="#fff" transform="matrix(0.70710678 -0.70710678 0.70710678 0.70710678 ${centerX} ${centerY})">\n`;
      svg += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" stroke="none"/>\n`;
      svg += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" fill="none" stroke="#fff"/>\n`;
      svg += `  </g>\n`;
    }
  }

  svg += '</svg>';
  return svg;
}

/**
 * PNGをグレースケールのクロスステッチ風SVGに変換
 */
export function convertPixelsToGrayscaleCrossStitchSvg(pixelData: PixelData): string {
  const { width, height, pixels, channels } = pixelData;

  let svg = `<svg width="${width * 20}" height="${height * 20}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <defs>\n`;
  svg += `    <style>\n`;
  svg += `      .stitch { fill: currentColor; }\n`;
  svg += `    </style>\n`;
  svg += `  </defs>\n`;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = channels > 3 ? pixels[index + 3] : 255;

      if (a === 0) continue;

      const grayscale = rgbToGrayscale(r, g, b);
      const hex = grayscaleToHex(grayscale);
      const centerX = x * 20 + 10;
      const centerY = y * 20 + 10;

      // クロスステッチ風の×マークを描画（角丸の長方形を45度傾けたものを二つ重ねる）
      // 左上から右下への斜線（45度）
      svg += `  <g fill="${hex}" stroke="${hex}" transform="matrix(0.70710678 0.70710678 -0.70710678 0.70710678 ${centerX} ${centerY})">\n`;
      svg += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" stroke="none"/>\n`;
      svg += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" fill="none" stroke="#fff"/>\n`;
      svg += `  </g>\n`;
      // 右上から左下への斜線（-45度）
      svg += `  <g fill="${hex}" stroke="#fff" transform="matrix(0.70710678 -0.70710678 0.70710678 0.70710678 ${centerX} ${centerY})">\n`;
      svg += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" stroke="none"/>\n`;
      svg += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" fill="none" stroke="#fff"/>\n`;
      svg += `  </g>\n`;
    }
  }

  svg += '</svg>';
  return svg;
}

/**
 * PNGをパターン風のSVGに変換（記号ベース）
 * Processingのコードを参考に、色の使用頻度に基づいて記号を選択
 */
export function convertPixelsToPatternSvg(pixelData: PixelData): string {
  const { width, height, pixels, channels } = pixelData;
  
  // 色の使用頻度をカウント
  const colorCounts = new Map<string, number>();
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = channels > 3 ? pixels[index + 3] : 255;
      
      if (a === 0) continue;
      
      const hex = rgbToHex(r, g, b);
      colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
    }
  }
  
  // 使用頻度の中央値を計算
  const counts = Array.from(colorCounts.values());
  counts.sort((a, b) => a - b);
  const median = counts[Math.floor(counts.length / 2)];
  
  // 記号の定義（Processingのコードを参考）
  // 線記号：使用頻度が高い色に使用
  const lineSymbols = ['×', '+', '*', '○', '□', '◇', '△'];
  // 塗り記号：使用頻度が低い色に使用
  const fillSymbols = ['●', '■', '★', '◆', '▲'];
  
  // 記号の配列をシャッフル（Processingのコードを参考）
  const shuffledLineSymbols = [...lineSymbols].sort(() => Math.random() - 0.5);
  const shuffledFillSymbols = [...fillSymbols].sort(() => Math.random() - 0.5);
  
  // 色を記号にマッピング（使用頻度に基づいて線記号か塗り記号かを選択）
  const colorToSymbol = new Map<string, string>();
  let lineIndex = 0;
  let fillIndex = 0;
  
  // 色を使用頻度でソート（高い順）
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1]);
  
  for (const [color, count] of sortedColors) {
    if (count >= median) {
      // 使用頻度が高い色には線記号を使用
      colorToSymbol.set(color, shuffledLineSymbols[lineIndex % shuffledLineSymbols.length]);
      lineIndex++;
    } else {
      // 使用頻度が低い色には塗り記号を使用
      colorToSymbol.set(color, shuffledFillSymbols[fillIndex % shuffledFillSymbols.length]);
      fillIndex++;
    }
  }
  
  let svg = `<svg width="480" height="480" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <defs>\n`;
  svg += `    <style>\n`;
  svg += `      .symbol { font-family: monospace; font-size: 15px; text-anchor: middle; dominant-baseline: middle; }\n`;
  svg += `    </style>\n`;
  svg += `  </defs>\n`;
  
  // 記号を描画
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = channels > 3 ? pixels[index + 3] : 255;
      
      if (a === 0) continue;
      
      const hex = rgbToHex(r, g, b);
      const symbol = colorToSymbol.get(hex) || '●';
      const symbolSize = 20; // 20x20の記号サイズ
      // グリッドの中心に正確に配置（x=10, 30, 50... y=10, 30, 50...）
      // SVGのtext要素の特性を考慮して微調整
      const centerX = x * symbolSize + 10;
      const centerY = y * symbolSize + 12; // テキストのベースライン調整
      
      // 記号の色はすべて#000000（黒）に統一
      svg += `  <text x="${centerX}" y="${centerY}" fill="#000000" class="symbol">${symbol}</text>\n`;
    }
  }
  
  // グリッドを描画（present_pattern.svgを参考）
  const gridSize = 20; // 20x20のグリッドサイズ
  const gridColor = "#1c30d0"; // 青いグリッド線
  
  // 縦線を描画
  for (let x = 0; x <= width; x++) {
    const strokeWidth = (x === 0 || x === width) ? 2 : 1; // 外枠は太く
    svg += `  <line x1="${x * gridSize}" y1="0" x2="${x * gridSize}" y2="${height * gridSize}" stroke="${gridColor}" stroke-width="${strokeWidth}"/>\n`;
  }
  
  // 横線を描画
  for (let y = 0; y <= height; y++) {
    const strokeWidth = (y === 0 || y === height) ? 2 : 1; // 外枠は太く
    svg += `  <line x1="0" y1="${y * gridSize}" x2="${width * gridSize}" y2="${y * gridSize}" stroke="${gridColor}" stroke-width="${strokeWidth}"/>\n`;
  }
  
  svg += '</svg>';
  return svg;
}

/**
 * メイン変換関数：PNGバッファから3つのSVG形式を生成（カラー版）
 */
export async function convertPngToSvgs(pngBuffer: Buffer): Promise<{
  pixel: string;
  stitch: string;
  pattern: string;
}> {
  try {
    // まずpngjsで試行
    const pixelData = await getPixelsFromBufferPngjs(pngBuffer);
    
    return {
      pixel: convertPixelsToPixelArtSvg(pixelData),
      stitch: convertPixelsToCrossStitchSvg(pixelData),
      pattern: convertPixelsToPatternSvg(pixelData)
    };
  } catch (error) {
    // pngjsが失敗した場合はget-pixelsで試行
    try {
      const pixelData = await getPixelsFromBuffer(pngBuffer);
      
      return {
        pixel: convertPixelsToPixelArtSvg(pixelData),
        stitch: convertPixelsToCrossStitchSvg(pixelData),
        pattern: convertPixelsToPatternSvg(pixelData)
      };
    } catch (fallbackError) {
      throw new Error(`PNG変換エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * メイン変換関数：PNGバッファから3つのSVG形式を生成（グレースケール版）
 */
export async function convertPngToGrayscaleSvgs(pngBuffer: Buffer): Promise<{
  pixel: string;
  stitch: string;
}> {
  try {
    // まずpngjsで試行
    const pixelData = await getPixelsFromBufferPngjs(pngBuffer);
    
    return {
      pixel: convertPixelsToGrayscalePixelArtSvg(pixelData),
      stitch: convertPixelsToGrayscaleCrossStitchSvg(pixelData)
    };
  } catch (error) {
    // pngjsが失敗した場合はget-pixelsで試行
    try {
      const pixelData = await getPixelsFromBuffer(pngBuffer);
      
      return {
        pixel: convertPixelsToGrayscalePixelArtSvg(pixelData),
        stitch: convertPixelsToGrayscaleCrossStitchSvg(pixelData)
      };
    } catch (fallbackError) {
      throw new Error(`PNG変換エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
