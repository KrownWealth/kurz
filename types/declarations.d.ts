declare module "pdfjs-dist" {
  export const getDocument: any;
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
}

declare module "*.mjs?url" {
  const src: string;
  export default src;
}
