/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 100, // 1行の最大文字数
  tabWidth: 2, // インデントのスペース数
  useTabs: false, // インデントにスペースを使用
  semi: true, // ステートメントの末尾にセミコロンを追加
  singleQuote: true, // 文字列をシングルクォートで囲む
  trailingComma: "es5", // 配列やオブジェクトの末尾にカンマを追加
  bracketSpacing: true, // オブジェクトリテラルの括弧内にスペースを追加
  arrowParens: "always", // アロー関数の引数を常に括弧で囲む
  endOfLine: "lf", // 行末文字を LF に統一
  plugins: ["prettier-plugin-astro"], // Astro 用のプラグインを指定
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
