declare module 'file-saver' {
  export function saveAs(data: Blob | string, filename?: string, options?: object): void;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
  const gapi: any;
  const google: any;
}

export {};
