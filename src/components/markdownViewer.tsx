import { use } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppContext } from "../context/appContext";

const MarkdownViewer = () => {
  const { markdown } = use(AppContext);
  return <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>;
};

export default MarkdownViewer;
