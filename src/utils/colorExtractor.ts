import { JSDOM } from 'jsdom';

export function extractColorsFromSVG(svgContent: string): string[] {
  // SVGの構造を解析
  const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
  const doc = dom.window.document;
  const svgElement = doc.documentElement;

  // 正規表現で色を抽出（fill, stroke, style属性の色を抽出）
  const colorRegex = /(?:fill|stroke|style)="[^"]*?(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|white|black)/g;
  const styleColorRegex = /(?:fill|stroke):\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|white|black)/g;
  const colors = new Set<string>();

  // 色名を16進数に変換する関数
  const convertColorNameToHex = (color: string): string => {
    const colorLower = color.toLowerCase();
    if (colorLower === 'white') return '#FFFFFF';
    if (colorLower === 'black') return '#000000';
    return color;
  };

  // SVG要素内のすべての要素を走査
  const elements = svgElement.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    // ルートのsvg要素のstyle属性は無視
    if (element === svgElement) continue;

    const attributes = element.attributes;
    for (let j = 0; j < attributes.length; j++) {
      const attr = attributes[j];
      
      if (attr.name === 'style') {
        // style属性から色を抽出
        const styleMatches = attr.value.match(styleColorRegex);
        if (styleMatches) {
          styleMatches.forEach((color: string) => {
            const extractedColor = color.split(':')[1].trim();
            if (!['none', 'transparent', 'currentcolor'].includes(extractedColor.toLowerCase())) {
              if (extractedColor.startsWith('rgb(')) {
                const rgb = extractedColor.match(/\d+/g);
                if (rgb && rgb.length === 3) {
                  const hex = '#' + rgb.map((x: string) => {
                    const hex = parseInt(x).toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                  }).join('');
                  colors.add(hex);
                }
              } else {
                colors.add(convertColorNameToHex(extractedColor).toLowerCase());
              }
            }
          });
        }
      } else if (['fill', 'stroke'].includes(attr.name)) {
        // fill, stroke属性から色を抽出
        const color = attr.value;
        if (!['none', 'transparent', 'currentcolor'].includes(color.toLowerCase())) {
          if (color.startsWith('rgb(')) {
            const rgb = color.match(/\d+/g);
            if (rgb && rgb.length === 3) {
              const hex = '#' + rgb.map((x: string) => {
                const hex = parseInt(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
              }).join('');
              colors.add(hex);
            }
          } else {
            colors.add(convertColorNameToHex(color).toLowerCase());
          }
        }
      }
    }
  }

  return Array.from(colors).sort();
}

export function formatColorName(color: string): string {
  // 16進数カラーコードを整形
  if (color.startsWith('#')) {
    // 3桁の16進数を6桁に変換
    if (color.length === 4) {
      const r = color[1];
      const g = color[2];
      const b = color[3];
      color = `#${r}${r}${g}${g}${b}${b}`;
    }
    return color.toUpperCase();
  }
  return color;
} 