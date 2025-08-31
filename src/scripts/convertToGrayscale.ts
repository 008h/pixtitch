import fs from 'node:fs/promises';
import path from 'path';
import { convertPngToGrayscaleSvgs } from '../utils/pngToSvg';

async function convertToGrayscale() {
  try {
    const pngDir = path.join(process.cwd(), '_png');
    const outputDir = path.join(process.cwd(), '_grayscale_svgs');
    
    // 出力ディレクトリを作成
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }
    
    // _pngフォルダからすべてのPNGファイルを読み込み
    const files = await fs.readdir(pngDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    if (pngFiles.length === 0) {
      console.log('_pngフォルダにPNGファイルが見つかりません');
      return;
    }
    
    console.log(`=== グレースケール変換開始 ===`);
    console.log(`処理対象ファイル数: ${pngFiles.length}`);
    console.log(`出力先フォルダ: ${outputDir}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const pngFile of pngFiles) {
      try {
        const pngPath = path.join(pngDir, pngFile);
        const baseName = path.basename(pngFile, '.png');
        
        console.log(`処理中: ${pngFile}`);
        
        // PNGファイルを読み込み
        const pngBuffer = await fs.readFile(pngPath);
        
        // グレースケール版の変換
        const grayscaleSvgs = await convertPngToGrayscaleSvgs(pngBuffer);
        
        // グレースケール版SVGを保存
        await fs.writeFile(path.join(outputDir, `${baseName}_grayscale_pixel.svg`), grayscaleSvgs.pixel);
        await fs.writeFile(path.join(outputDir, `${baseName}_grayscale_stitch.svg`), grayscaleSvgs.stitch);
        
        console.log(`  ✓ 完了: ${baseName}_grayscale_pixel.svg, ${baseName}_grayscale_stitch.svg`);
        successCount++;
        
      } catch (error) {
        console.error(`  ✗ エラー: ${pngFile} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }
    
    console.log(`\n=== 変換完了 ===`);
    console.log(`成功: ${successCount} ファイル`);
    if (errorCount > 0) {
      console.log(`エラー: ${errorCount} ファイル`);
    }
    console.log(`出力先: ${outputDir}`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  convertToGrayscale();
}
