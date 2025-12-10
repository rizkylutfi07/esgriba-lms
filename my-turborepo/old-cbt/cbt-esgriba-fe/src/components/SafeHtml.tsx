import DOMPurify from "dompurify";

interface SafeHtmlProps {
  html: string | undefined | null;
  className?: string;
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const sanitized = DOMPurify.sanitize(html || "", {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe"],
    FORBID_ATTR: ["onerror", "onload", "style"],
  });
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

export default SafeHtml;
