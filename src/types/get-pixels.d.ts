declare module 'get-pixels' {
  interface Pixels {
    shape: [number, number, number];
    data: Uint8Array;
  }
  
  function getPixels(
    buffer: Buffer | string,
    callback: (err: Error | null, pixels: Pixels) => void
  ): void;
  
  export = getPixels;
}
