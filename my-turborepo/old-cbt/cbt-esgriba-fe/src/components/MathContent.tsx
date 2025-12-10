import React, { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathContentProps {
  content: string;
  className?: string;
}

/**
 * Component to render HTML content with math equations support
 * Supports:
 * - Inline math: $...$
 * - Display math: $$...$$
 * - LaTeX in OMML from Word documents
 * - Images (base64 or URLs)
 */
export const MathContent: React.FC<MathContentProps> = ({
  content,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    try {
      // Set the HTML content first
      containerRef.current.innerHTML = content;

      // Find and render all math expressions
      const container = containerRef.current;

      // Process display math ($$...$$)
      const displayMathRegex = /\$\$(.*?)\$\$/g;
      let html = container.innerHTML;
      html = html.replace(displayMathRegex, (match, latex) => {
        try {
          return katex.renderToString(latex.trim(), {
            displayMode: true,
            throwOnError: false,
            output: "html",
          });
        } catch {
          return match; // Return original if rendering fails
        }
      });

      // Process inline math ($...$)
      const inlineMathRegex = /\$([^\$]+?)\$/g;
      html = html.replace(inlineMathRegex, (match, latex) => {
        try {
          return katex.renderToString(latex.trim(), {
            displayMode: false,
            throwOnError: false,
            output: "html",
          });
        } catch {
          return match; // Return original if rendering fails
        }
      });

      // Update the container with rendered math
      container.innerHTML = html;

      // Process text nodes for common math patterns from Word
      const processTextNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          let text = node.textContent;
          let modified = false;

          // Convert common patterns: x^2, x_1, sqrt(...), etc.
          const patterns = [
            // Superscript: x^2 -> x²
            {
              regex: /(\w+)\^(\d+)/g,
              replace: (_: string, base: string, exp: string) => {
                modified = true;
                return `$${base}^{${exp}}$`;
              },
            },
            // Subscript: x_1 -> x₁
            {
              regex: /(\w+)_(\d+)/g,
              replace: (_: string, base: string, sub: string) => {
                modified = true;
                return `$${base}_{${sub}}$`;
              },
            },
            // Square root: sqrt(x)
            {
              regex: /sqrt\(([^)]+)\)/g,
              replace: (_: string, content: string) => {
                modified = true;
                return `$\\sqrt{${content}}$`;
              },
            },
            // Fractions: a/b where both are single chars or numbers
            {
              regex: /(\d+)\/(\d+)/g,
              replace: (_: string, num: string, den: string) => {
                modified = true;
                return `$\\frac{${num}}{${den}}$`;
              },
            },
          ];

          patterns.forEach(({ regex, replace }) => {
            text = text.replace(regex, replace as any);
          });

          if (modified && node.parentNode) {
            const span = document.createElement("span");
            span.innerHTML = text;
            node.parentNode.replaceChild(span, node);
          }
        }

        // Recursively process child nodes
        Array.from(node.childNodes).forEach(processTextNode);
      };

      // Process all text nodes
      processTextNode(container);

      // Re-render any new math expressions that were created
      const newHtml = container.innerHTML;
      html = newHtml.replace(displayMathRegex, (match, latex) => {
        try {
          return katex.renderToString(latex.trim(), {
            displayMode: true,
            throwOnError: false,
            output: "html",
          });
        } catch {
          return match;
        }
      });

      html = html.replace(inlineMathRegex, (match, latex) => {
        try {
          return katex.renderToString(latex.trim(), {
            displayMode: false,
            throwOnError: false,
            output: "html",
          });
        } catch {
          return match;
        }
      });

      container.innerHTML = html;
    } catch (error) {
      console.error("Error rendering math content:", error);
      // Fallback to plain HTML if something goes wrong
      if (containerRef.current) {
        containerRef.current.innerHTML = content;
      }
    }
  }, [content]);

  return <div ref={containerRef} className={className} />;
};

export default MathContent;
