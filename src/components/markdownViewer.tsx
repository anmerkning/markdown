import { use } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppContext } from "../context/appContext";
import { EyeIcon } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownViewer = () => {
  const { markdown } = use(AppContext);
  return (
    <div>
      <div className="text-muted-foreground flex h-auto items-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50 order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5 border-b">
        <span className="text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4">
          <EyeIcon />
          Preview
        </span>
      </div>
      <div className="markdown-body break-all p-6">
        <Markdown
          components={{
            code(props) {
              const { children, className, node, ...rest } = props;
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <SyntaxHighlighter
                  PreTag="div"
                  children={String(children).replace(/\n$/, "")}
                  language={match[1]}
                  style={oneLight}
                />
              ) : (
                <code {...rest} className={className}>
                  {children}
                </code>
              );
            },
          }}
          remarkPlugins={[remarkGfm]}
        >
          {markdown}
        </Markdown>
      </div>
    </div>
  );
};

export default MarkdownViewer;
