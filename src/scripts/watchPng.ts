import { watch } from 'fs';
import { join, basename, extname } from 'path';
import { convertPngToSvgs } from '../utils/pngToSvg';
import { readFile } from 'fs/promises';

const PNG_DIR = '_png';
const OUTPUT_DIR = 'public/assets/svg';

// 出力ディレクトリが存在しない場合は作成
async function ensureOutputDir() {
  const fs = await import('fs/promises');
  try {
    await fs.access(OUTPUT_DIR);
  } catch {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
}

// PNGファイルをSVGに変換
async function convertPngFile(filename: string) {
  try {
    const pngPath = join(PNG_DIR, filename);
    const pngBuffer = await readFile(pngPath);
    
    console.log(`Converting ${filename} to SVG...`);
    
    const svgs = await convertPngToSvgs(pngBuffer);
    
    // ファイル名から拡張子を除去
    const baseName = basename(filename, extname(filename));
    
    // 各SVGタイプを保存
    if (svgs.pixel) {
      const pixelPath = join(OUTPUT_DIR, `${baseName}_pixel.svg`);
      await writeFile(pixelPath, svgs.pixel);
      console.log(`  Saved: ${baseName}_pixel.svg`);
    }
    
    if (svgs.stitch) {
      const stitchPath = join(OUTPUT_DIR, `${baseName}_stitch.svg`);
      await writeFile(stitchPath, svgs.stitch);
      console.log(`  Saved: ${baseName}_stitch.svg`);
    }
    
    if (svgs.pattern) {
      const patternPath = join(OUTPUT_DIR, `${baseName}_pattern.svg`);
      await writeFile(patternPath, svgs.pattern);
      console.log(`  Saved: ${baseName}_pattern.svg`);
    }
    
    if (svgs.grayscalePixel) {
      const grayscalePixelPath = join(OUTPUT_DIR, `${baseName}_grayscale_pixel.svg`);
      await writeFile(grayscalePixelPath, svgs.grayscalePixel);
      console.log(`  Saved: ${baseName}_grayscale_pixel.svg`);
    }
    
    if (svgs.grayscaleStitch) {
      const grayscaleStitchPath = join(OUTPUT_DIR, `${baseName}_grayscale_stitch.svg`);
      await writeFile(grayscaleStitchPath, svgs.grayscaleStitch);
      console.log(`  Saved: ${baseName}_grayscale_stitch.svg`);
    }
    
    console.log(`✓ Completed conversion of ${filename}`);
    
  } catch (error) {
    console.error(`Error converting ${filename}:`, error);
  }
}

// ファイル書き込みのヘルパー関数
async function writeFile(path: string, content: string) {
  const fs = await import('fs/promises');
  await fs.writeFile(path, content, 'utf-8');
}

// 既存のPNGファイルを変換
async function convertExistingPngFiles() {
  try {
    const fs = await import('fs/promises');
    const files = await fs.readdir(PNG_DIR);
    const pngFiles = files.filter(file => extname(file).toLowerCase() === '.png');
    
    if (pngFiles.length > 0) {
      console.log(`Found ${pngFiles.length} existing PNG files. Converting...`);
      for (const file of pngFiles) {
        await convertPngFile(file);
      }
    }
  } catch (error) {
    console.error('Error reading PNG directory:', error);
  }
}

// メイン処理
async function main() {
  console.log('Starting PNG to SVG watcher...');
  
  // 出力ディレクトリを確保
  await ensureOutputDir();
  
  // 既存のPNGファイルを変換
  await convertExistingPngFiles();
  
  // ファイル監視を開始
  console.log(`Watching ${PNG_DIR} directory for new PNG files...`);
  
  watch(PNG_DIR, (eventType, filename) => {
    if (filename && extname(filename).toLowerCase() === '.png') {
      if (eventType === 'rename') {
        // ファイルが追加された場合
        setTimeout(() => {
          convertPngFile(filename);
        }, 100); // 少し遅延を入れてファイルの書き込み完了を待つ
      }
    }
  });
  
  console.log('Watcher is running. Press Ctrl+C to stop.');
}

// エラーハンドリング
process.on('SIGINT', () => {
  console.log('\nStopping watcher...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// スクリプトを実行
main().catch(console.error);
