/// <reference types="vite/client" />

declare module 'blobshape' {
  interface BlobShapeOptions {
    growth?: number;
    edges?: number;
  }
  
  interface BlobShapeResult {
    path: string;
  }
  
  function blobshape(options?: BlobShapeOptions): BlobShapeResult;
  export default blobshape;
}