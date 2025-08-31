import fs from 'node:fs/promises';
import path from 'path';
import { convertPngToGrayscaleSvgs } from '../utils/pngToSvg';

async function convertToGrayscale() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('使用方法: npm run grayscale <PNGファイル名>');
      console.log('例: npm run grayscale fuecoco.png');
      return;
    }
    
    const pngFileName = args[0];
    const pngDir = path.join(process.cwd(), '_png');
    const pngPath = path.join(pngDir, pngFileName);
    
    // ファイルの存在確認
    try {
      await fs.access(pngPath);
    } catch (error) {
      console.log(`ファイルが見つかりません: ${pngFileName}`);
      console.log(`利用可能なPNGファイル:`);
      const files = await fs.readdir(pngDir);
      const pngFiles = files.filter(file => file.endsWith('.png'));
      pngFiles.forEach(file => console.log(`  - ${file}`));
      return;
    }
    
    const baseName = path.basename(pngFileName, '.png');
    console.log(`=== グレースケール変換: ${pngFileName} ===`);
    
    // PNGファイルを読み込み
    const pngBuffer = await fs.readFile(pngPath);
    console.log(`PNGファイルサイズ: ${pngBuffer.length} bytes`);
    
    // グレースケール版の変換
    console.log('\n--- グレースケール版変換 ---');
    const grayscaleSvgs = await convertPngToGrayscaleSvgs(pngBuffer);
    console.log('変換完了:');
    console.log(`- Pixel: ${grayscaleSvgs.pixel.length} characters`);
    console.log(`- Stitch: ${grayscaleSvgs.stitch.length} characters`);
    
    // グレースケール版SVGを保存
    const outputDir = path.join(process.cwd(), 'grayscale_output');
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }
    
    await fs.writeFile(path.join(outputDir, `${baseName}_grayscale_pixel.svg`), grayscaleSvgs.pixel);
    await fs.writeFile(path.join(outputDir, `${baseName}_grayscale_stitch.svg`), grayscaleSvgs.stitch);
    
    console.log(`\nグレースケール版SVGが ${outputDir} フォルダに保存されました:`);
    console.log(`  - ${baseName}_grayscale_pixel.svg`);
    console.log(`  - ${baseName}_grayscale_stitch.svg`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  convertToGrayscale();
}
