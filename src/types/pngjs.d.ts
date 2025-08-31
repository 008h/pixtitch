declare module 'pngjs' {
  interface PNG {
    width: number;
    height: number;
    data: Uint8Array;
  }
  
  interface PNGStatic {
    sync: {
      read(buffer: Buffer): PNG;
    };
  }
  
  const PNG: PNGStatic;
  export { PNG };
}
