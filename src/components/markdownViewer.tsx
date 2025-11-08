import { use } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { WllamaContext } from "../context/wllamaContext";

const MarkdownViewer = () => {
  const { markdown } = use(WllamaContext);
  return <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>;
};

export default MarkdownViewer;
