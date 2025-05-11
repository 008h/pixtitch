export default {
  multipass: true, // 複数回の最適化を実行
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          removeTitle: false,
          removeDesc: false,
          removeUselessStrokeAndFill: false,
          removeHiddenElems: false,
          removeEmptyContainers: false,
          removeEmptyText: false,
          removeEmptyAttrs: false,
          removeEditorsNSData: false,
          removeRasterImages: false,
          removeUselessDefs: false,
          removeUnknownsAndDefaults: false,
          removeNonInheritableGroupAttrs: false,
          removeOffCanvasPaths: false,
          removeStyleElement: false,
          removeScriptElement: false,
          removeUnusedNS: false,
          removeXMLNS: false,
          sortAttrs: false,
          removeDimensions: false,
        },
      },
    },
  ],
}; 