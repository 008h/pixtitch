import fs from 'node:fs/promises';
import path from 'path';
import { convertPngToSvgs, convertPngToGrayscaleSvgs } from '../utils/pngToSvg';

async function testSpecificPng() {
  try {
    const pngDir = path.join(process.cwd(), '_png');
    const testFiles = ['fuecoco.png', 'cocktail.png'];
    
    for (const testFile of testFiles) {
      const pngPath = path.join(pngDir, testFile);
      
      try {
        // ファイルの存在確認
        await fs.access(pngPath);
      } catch (error) {
        console.log(`ファイルが見つかりません: ${testFile}`);
        continue;
      }
      
      const baseName = path.basename(testFile, '.png');
      console.log(`\n=== テストファイル: ${testFile} ===`);
      
      // PNGファイルを読み込み
      const pngBuffer = await fs.readFile(pngPath);
      console.log(`PNGファイルサイズ: ${pngBuffer.length} bytes`);
      
      // カラー版の変換
      console.log('\n--- カラー版変換 ---');
      const colorSvgs = await convertPngToSvgs(pngBuffer);
      console.log('変換完了:');
      console.log(`- Pixel: ${colorSvgs.pixel.length} characters`);
      console.log(`- Stitch: ${colorSvgs.stitch.length} characters`);
      console.log(`- Pattern: ${colorSvgs.pattern.length} characters`);
      
      // グレースケール版の変換
      console.log('\n--- グレースケール版変換 ---');
      const grayscaleSvgs = await convertPngToGrayscaleSvgs(pngBuffer);
      console.log('変換完了:');
      console.log(`- Pixel: ${grayscaleSvgs.pixel.length} characters`);
      console.log(`- Stitch: ${grayscaleSvgs.stitch.length} characters`);
      
      // テスト用のSVGファイルを出力
      const outputDir = path.join(process.cwd(), 'test_output');
      try {
        await fs.mkdir(outputDir, { recursive: true });
      } catch (error) {
        // ディレクトリが既に存在する場合は無視
      }
      
      // カラー版SVGを保存
      await fs.writeFile(path.join(outputDir, `${baseName}_pixel.svg`), colorSvgs.pixel);
      await fs.writeFile(path.join(outputDir, `${baseName}_stitch.svg`), colorSvgs.stitch);
      await fs.writeFile(path.join(outputDir, `${baseName}_pattern.svg`), colorSvgs.pattern);
      
      // グレースケール版SVGを保存
      await fs.writeFile(path.join(outputDir, `${baseName}_grayscale_pixel.svg`), grayscaleSvgs.pixel);
      await fs.writeFile(path.join(outputDir, `${baseName}_grayscale_stitch.svg`), grayscaleSvgs.stitch);
      
      console.log(`出力ファイルは ${outputDir} フォルダに保存されました。`);
    }
    
    console.log('\n=== 全テスト完了 ===');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  testSpecificPng();
}
