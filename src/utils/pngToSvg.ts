import getPixels from 'get-pixels';
import rgb2hex from 'rgb2hex';
import { PNG } from 'pngjs';

// 定数定義
const PIXEL_SIZE = 20;
const GRID_COLOR = "#1c30d0";
const STROKE_COLOR = "#b4b4b4";
const WHITE_COLOR = "#fff";
const BLACK_COLOR = "#000000";

// 記号定義
const LINE_SYMBOLS = ['×', '+', '*', '○', '□', '◇', '△'];
const FILL_SYMBOLS = ['●', '■', '★', '◆', '▲'];

export interface PixelData {
  width: number;
  height: number;
  pixels: Uint8Array;
  channels: number;
}

export interface SvgConversionResult {
  pixel: string;
  stitch: string;
  pattern: string;
  grayscalePixel: string;
  grayscaleStitch: string;
}

export interface GrayscaleSvgConversionResult {
  pixel: string;
  stitch: string;
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
 * PNGの実際のサイズに基づいてSVGのサイズを計算
 */
function calculateSvgSize(pngWidth: number, pngHeight: number): { width: number; height: number } {
  const width = pngWidth * PIXEL_SIZE;
  const height = pngHeight * PIXEL_SIZE;
  
  return { width, height };
}

/**
 * ピクセルの色情報を取得
 */
function getPixelColor(pixels: Uint8Array, index: number, channels: number): {
  r: number;
  g: number;
  b: number;
  a: number;
} | null {
  const r = pixels[index];
  const g = pixels[index + 1];
  const b = pixels[index + 2];
  const a = channels > 3 ? pixels[index + 3] : 255;
  
  // 透明ピクセルはスキップ
  if (a === 0) return null;
  
  return { r, g, b, a };
}

/**
 * SVGヘッダーを生成
 */
function generateSvgHeader(width: number, height: number, additionalStyles?: string): string {
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <defs>\n`;
  svg += `    <style>\n`;
  svg += `      .pixel { shape-rendering: pixelated; }\n`;
  svg += `      .stitch { fill: currentColor; }\n`;
  svg += `      .symbol { font-family: monospace; font-size: 15px; text-anchor: middle; dominant-baseline: middle; }\n`;
  if (additionalStyles) {
    svg += `      ${additionalStyles}\n`;
  }
  svg += `    </style>\n`;
  svg += `  </defs>\n`;
  return svg;
}

/**
 * ピクセルアート風のSVGを生成
 */
function generatePixelArtSvg(pixelData: PixelData, useGrayscale: boolean = false): string {
  const { width, height, pixels, channels } = pixelData;
  const svgSize = calculateSvgSize(width, height);
  
  let svg = generateSvgHeader(svgSize.width, svgSize.height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const colorInfo = getPixelColor(pixels, index, channels);
      
      if (!colorInfo) continue;
      
      const { r, g, b } = colorInfo;
      const hex = useGrayscale ? grayscaleToHex(rgbToGrayscale(r, g, b)) : rgbToHex(r, g, b);
      const pixelX = x * PIXEL_SIZE;
      const pixelY = y * PIXEL_SIZE;
      
      svg += `  <rect x="${pixelX}" y="${pixelY}" width="${PIXEL_SIZE}" height="${PIXEL_SIZE}" fill="${hex}" stroke="${STROKE_COLOR}" class="pixel" />\n`;
    }
  }
  
  svg += '</svg>';
  return svg;
}

/**
 * クロスステッチ風のSVGを生成
 */
function generateCrossStitchSvg(pixelData: PixelData, useGrayscale: boolean = false): string {
  const { width, height, pixels, channels } = pixelData;
  const svgSize = calculateSvgSize(width, height);

  let svg = generateSvgHeader(svgSize.width, svgSize.height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const colorInfo = getPixelColor(pixels, index, channels);
      
      if (!colorInfo) continue;

      const { r, g, b } = colorInfo;
      const hex = useGrayscale ? grayscaleToHex(rgbToGrayscale(r, g, b)) : rgbToHex(r, g, b);
      const centerX = x * PIXEL_SIZE + PIXEL_SIZE / 2;
      const centerY = y * PIXEL_SIZE + PIXEL_SIZE / 2;

      // クロスステッチ風の×マークを描画
      svg += generateCrossStitchPaths(hex, centerX, centerY);
    }
  }

  svg += '</svg>';
  return svg;
}

/**
 * クロスステッチのパスを生成
 */
function generateCrossStitchPaths(color: string, centerX: number, centerY: number): string {
  let paths = '';
  
  // 左上から右下への斜線（45度）
  paths += `  <g fill="${color}" stroke="${color}" transform="matrix(0.70710678 0.70710678 -0.70710678 0.70710678 ${centerX} ${centerY})">\n`;
  paths += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" stroke="none"/>\n`;
  paths += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" fill="none" stroke="${WHITE_COLOR}"/>\n`;
  paths += `  </g>\n`;
  
  // 右上から左下への斜線（-45度）
  paths += `  <g fill="${color}" stroke="${WHITE_COLOR}" transform="matrix(0.70710678 -0.70710678 0.70710678 0.70710678 ${centerX} ${centerY})">\n`;
  paths += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" stroke="none"/>\n`;
  paths += `    <path d="m7.4-3.6c2.4 0 3.6 1.2 3.6 3.6s-1.2 3.6-3.6 3.6h-14.8c-2.4 0-3.6-1.2-3.6-3.6s1.2-3.6 3.6-3.6z" fill="none" stroke="${WHITE_COLOR}"/>\n`;
  paths += `  </g>\n`;
  
  return paths;
}

/**
 * パターン風のSVGを生成
 */
function generatePatternSvg(pixelData: PixelData): string {
  const { width, height, pixels, channels } = pixelData;
  const svgSize = calculateSvgSize(width, height);
  
  // 色の使用頻度をカウント
  const colorCounts = countColorUsage(pixels, width, height, channels);
  
  // 記号のマッピングを生成
  const colorToSymbol = generateSymbolMapping(colorCounts);
  
  let svg = generateSvgHeader(svgSize.width, svgSize.height);
  
  // 記号を描画
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const colorInfo = getPixelColor(pixels, index, channels);
      
      if (!colorInfo) continue;
      
      const hex = rgbToHex(colorInfo.r, colorInfo.g, colorInfo.b);
      const symbol = colorToSymbol.get(hex) || '●';
      const centerX = x * PIXEL_SIZE + PIXEL_SIZE / 2;
      const centerY = y * PIXEL_SIZE + PIXEL_SIZE / 2 + 2; // テキストのベースライン調整
      
      svg += `  <text x="${centerX}" y="${centerY}" fill="${BLACK_COLOR}" class="symbol">${symbol}</text>\n`;
    }
  }
  
  // グリッドを描画
  svg += generateGrid(width, height);
  
  svg += '</svg>';
  return svg;
}

/**
 * 色の使用頻度をカウント
 */
function countColorUsage(pixels: Uint8Array, width: number, height: number, channels: number): Map<string, number> {
  const colorCounts = new Map<string, number>();
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels;
      const colorInfo = getPixelColor(pixels, index, channels);
      
      if (!colorInfo) continue;
      
      const hex = rgbToHex(colorInfo.r, colorInfo.g, colorInfo.b);
      colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
    }
  }
  
  return colorCounts;
}

/**
 * 記号のマッピングを生成
 */
function generateSymbolMapping(colorCounts: Map<string, number>): Map<string, string> {
  const counts = Array.from(colorCounts.values());
  counts.sort((a, b) => a - b);
  const median = counts[Math.floor(counts.length / 2)];
  
  // 記号の配列をシャッフル
  const shuffledLineSymbols = [...LINE_SYMBOLS].sort(() => Math.random() - 0.5);
  const shuffledFillSymbols = [...FILL_SYMBOLS].sort(() => Math.random() - 0.5);
  
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
  
  return colorToSymbol;
}

/**
 * グリッドを生成
 */
function generateGrid(width: number, height: number): string {
  let grid = '';
  
  // 縦線を描画
  for (let x = 0; x <= width; x++) {
    const strokeWidth = (x === 0 || x === width) ? 2 : 1; // 外枠は太く
    grid += `  <line x1="${x * PIXEL_SIZE}" y1="0" x2="${x * PIXEL_SIZE}" y2="${height * PIXEL_SIZE}" stroke="${GRID_COLOR}" stroke-width="${strokeWidth}"/>\n`;
  }
  
  // 横線を描画
  for (let y = 0; y <= height; y++) {
    const strokeWidth = (y === 0 || y === height) ? 2 : 1; // 外枠は太く
    grid += `  <line x1="0" y1="${y * PIXEL_SIZE}" x2="${width * PIXEL_SIZE}" y2="${y * PIXEL_SIZE}" stroke="${GRID_COLOR}" stroke-width="${strokeWidth}"/>\n`;
  }
  
  return grid;
}

/**
 * PNGをピクセルアート風のSVGに変換
 */
export function convertPixelsToPixelArtSvg(pixelData: PixelData): string {
  return generatePixelArtSvg(pixelData, false);
}

/**
 * PNGをグレースケールのピクセルアート風SVGに変換
 */
export function convertPixelsToGrayscalePixelArtSvg(pixelData: PixelData): string {
  return generatePixelArtSvg(pixelData, true);
}

/**
 * PNGをクロスステッチ風のSVGに変換
 */
export function convertPixelsToCrossStitchSvg(pixelData: PixelData): string {
  return generateCrossStitchSvg(pixelData, false);
}

/**
 * PNGをグレースケールのクロスステッチ風SVGに変換
 */
export function convertPixelsToGrayscaleCrossStitchSvg(pixelData: PixelData): string {
  return generateCrossStitchSvg(pixelData, true);
}

/**
 * PNGをパターン風のSVGに変換
 */
export function convertPixelsToPatternSvg(pixelData: PixelData): string {
  return generatePatternSvg(pixelData);
}

/**
 * PNG変換を実行（フォールバック付き）
 */
async function executePngConversion<T>(
  conversionFn: (pixelData: PixelData) => T,
  pngBuffer: Buffer
): Promise<T> {
  try {
    // まずpngjsで試行
    const pixelData = await getPixelsFromBufferPngjs(pngBuffer);
    return conversionFn(pixelData);
  } catch (error) {
    // pngjsが失敗した場合はget-pixelsで試行
    try {
      const pixelData = await getPixelsFromBuffer(pngBuffer);
      return conversionFn(pixelData);
    } catch (fallbackError) {
      throw new Error(`PNG変換エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * メイン変換関数：PNGバッファから3つのSVG形式を生成（カラー版のみ）
 */
export async function convertPngToSvgs(pngBuffer: Buffer): Promise<{
  pixel: string;
  stitch: string;
  pattern: string;
}> {
  const pixelData = await executePngConversion(
    (data) => data,
    pngBuffer
  );
  
  return {
    pixel: convertPixelsToPixelArtSvg(pixelData),
    stitch: convertPixelsToCrossStitchSvg(pixelData),
    pattern: convertPixelsToPatternSvg(pixelData)
  };
}

/**
 * グレースケール専用変換関数：PNGバッファから2つのグレースケールSVG形式を生成
 */
export async function convertPngToGrayscaleSvgs(pngBuffer: Buffer): Promise<GrayscaleSvgConversionResult> {
  const pixelData = await executePngConversion(
    (data) => data,
    pngBuffer
  );
  
  return {
    pixel: convertPixelsToGrayscalePixelArtSvg(pixelData),
    stitch: convertPixelsToGrayscaleCrossStitchSvg(pixelData)
  };
}

/**
 * 全形式変換関数：PNGバッファから5つのSVG形式を生成（カラー版 + グレースケール版）
 * 必要に応じて使用する場合のための関数
 */
export async function convertPngToAllSvgs(pngBuffer: Buffer): Promise<SvgConversionResult> {
  const pixelData = await executePngConversion(
    (data) => data,
    pngBuffer
  );
  
  return {
    pixel: convertPixelsToPixelArtSvg(pixelData),
    stitch: convertPixelsToCrossStitchSvg(pixelData),
    pattern: convertPixelsToPatternSvg(pixelData),
    grayscalePixel: convertPixelsToGrayscalePixelArtSvg(pixelData),
    grayscaleStitch: convertPixelsToGrayscaleCrossStitchSvg(pixelData)
  };
}
