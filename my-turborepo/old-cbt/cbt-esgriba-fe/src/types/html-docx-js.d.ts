declare module "html-docx-js/dist/html-docx" {
  interface HtmlDocxModule {
    asBlob: (html: string, options?: Record<string, unknown>) => Blob;
  }

  const htmlDocx: HtmlDocxModule;
  export default htmlDocx;
}
