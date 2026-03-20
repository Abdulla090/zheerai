import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState, useCallback, Component, type ReactNode } from "react";

class MarkdownErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="text-foreground whitespace-pre-wrap">{(this.props as any).fallback}</div>;
    return this.props.children;
  }
}

const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);
  return (
    <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground transition-colors" aria-label="Copy code">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

const MarkdownRenderer = ({ content }: { content: string }) => (
  <MarkdownErrorBoundary fallback={content}>
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        const code = String(children).replace(/\n$/, "");
        if (match) {
          return (
            <div className="relative group not-prose my-4">
              <CopyButton code={code} />
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{ borderRadius: "0.5rem", fontSize: "0.85rem", padding: "1.25rem" }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          );
        }
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground" {...props}>
            {children}
          </code>
        );
      },
      table({ children }) {
        return (
          <div className="my-4 w-full overflow-auto not-prose">
            <table className="w-full border-collapse border border-border text-sm">{children}</table>
          </div>
        );
      },
      thead({ children }) {
        return <thead className="bg-muted/60">{children}</thead>;
      },
      th({ children }) {
        return <th className="border border-border px-3 py-2 text-right font-semibold text-foreground">{children}</th>;
      },
      td({ children }) {
        return <td className="border border-border px-3 py-2 text-right text-foreground">{children}</td>;
      },
      blockquote({ children }) {
        return (
          <blockquote className="my-4 border-r-4 border-primary/60 bg-muted/40 py-2 pr-4 pl-2 rounded-sm italic text-muted-foreground not-prose">
            {children}
          </blockquote>
        );
      },
      hr() {
        return <hr className="my-6 border-border" />;
      },
      img({ src, alt }) {
        return <img src={src} alt={alt || ""} className="my-4 rounded-lg max-w-full" loading="lazy" />;
      },
      a({ href, children }) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
            {children}
          </a>
        );
      },
      ul({ children }) {
        return <ul className="my-3 mr-6 list-disc space-y-1 text-foreground">{children}</ul>;
      },
      ol({ children }) {
        return <ol className="my-3 mr-6 list-decimal space-y-1 text-foreground">{children}</ol>;
      },
      h1({ children }) {
        return <h2 className="mt-8 mb-3 text-2xl font-bold text-foreground">{children}</h2>;
      },
      h2({ children }) {
        return <h3 className="mt-6 mb-2 text-xl font-bold text-foreground">{children}</h3>;
      },
      h3({ children }) {
        return <h4 className="mt-5 mb-2 text-lg font-semibold text-foreground">{children}</h4>;
      },
      p({ children }) {
        return <p className="my-2 leading-7 text-foreground">{children}</p>;
      },
      input({ checked, ...props }) {
        return <input type="checkbox" checked={checked} readOnly className="mr-2 accent-primary" {...props} />;
      },
    }}
  >
    {content}
  </ReactMarkdown>
  </MarkdownErrorBoundary>
);

export default MarkdownRenderer;
