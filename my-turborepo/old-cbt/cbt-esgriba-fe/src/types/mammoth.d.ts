declare module "mammoth/mammoth.browser" {
  interface MammothHtmlResult {
    value: string;
    messages?: Array<{ message: string }>;
  }

  export function convertToHtml(options: {
    arrayBuffer: ArrayBuffer;
  }): Promise<MammothHtmlResult>;
}
