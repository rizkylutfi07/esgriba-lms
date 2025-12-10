declare global {
  interface Window {
    htmlDocx?: {
      asBlob: (html: string, options?: Record<string, unknown>) => Blob;
    };
  }
}

type HtmlDocx = NonNullable<typeof window.htmlDocx>;

let htmlDocxPromise: Promise<HtmlDocx> | null = null;

// Lazy-load html-docx-js from a CDN to bypass build-time ESM restrictions.
const HTML_DOCX_CDN =
  "https://cdn.jsdelivr.net/npm/html-docx-js/dist/html-docx.min.js";

export const loadHtmlDocx = async (): Promise<
  NonNullable<typeof window.htmlDocx>
> => {
  if (window.htmlDocx) {
    return window.htmlDocx;
  }

  if (!htmlDocxPromise) {
    htmlDocxPromise = new Promise<HtmlDocx>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = HTML_DOCX_CDN;
      script.async = true;
      script.onload = () => {
        if (window.htmlDocx) {
          resolve(window.htmlDocx);
        } else {
          reject(new Error("html-docx-js did not expose a global export"));
        }
      };
      script.onerror = () => {
        script.remove();
        reject(new Error("Gagal memuat library html-docx-js"));
      };
      document.head.appendChild(script);
    }).catch((error) => {
      htmlDocxPromise = null;
      throw error;
    });
  }

  return htmlDocxPromise!;
};
