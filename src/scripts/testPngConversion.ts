import fs from 'node:fs/promises';
import path from 'path';
import { convertPngToSvgs } from '../utils/pngToSvg';

async function testPngConversion() {
  try {
    // _pngフォルダからテスト用のPNGファイルを読み込み
    const pngDir = path.join(process.cwd(), '_png');
    const files = await fs.readdir(pngDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    if (pngFiles.length === 0) {
      console.log('_pngフォルダにPNGファイルが見つかりません');
      return;
    }
    
    // 最初のPNGファイルでテスト
    const testFile = pngFiles[0];
    const pngPath = path.join(pngDir, testFile);
    const baseName = path.basename(testFile, '.png');
    
    console.log(`テストファイル: ${testFile}`);
    
    // PNGファイルを読み込み
    const pngBuffer = await fs.readFile(pngPath);
    console.log(`PNGファイルサイズ: ${pngBuffer.length} bytes`);
    
    // カラー版の変換
    console.log('\n=== カラー版変換 ===');
    const colorSvgs = await convertPngToSvgs(pngBuffer);
    console.log('変換完了:');
    console.log(`- Pixel: ${colorSvgs.pixel.length} characters`);
    console.log(`- Stitch: ${colorSvgs.stitch.length} characters`);
    console.log(`- Pattern: ${colorSvgs.pattern.length} characters`);
    
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
    
    console.log(`\nテスト完了！出力ファイルは ${outputDir} フォルダに保存されました。`);
    console.log('グレースケール版が必要な場合は `npm run grayscale <PNGファイル名>` を使用してください。');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  testPngConversion();
}
