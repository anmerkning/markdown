import "./markdown.css";
import { WllamaProvider } from "./context/wllamaContext";
import MarkdownEditor from "./components/markdownEditor";
import MarkdownViewer from "./components/markdownViewer";
import ProgressDialog from "./components/progressDialog";
import ModelSelectDialog from "./components/modelSelectDialog";

function App() {
  return (
    <WllamaProvider>
      <div className="w-dvw h-dvh flex flex-col justify-center items-center">
        <div className="flex flex-col p-0 lg:flex-row h-full w-full">
          <>
            <div className="relative basis-1/2 h-full flex">
              <MarkdownEditor />
            </div>
            <div className="basis-1/2 h-full markdown-body p-6 break-all rounded-lg overflow-y-scroll border ">
              <MarkdownViewer />
            </div>
          </>
          <ModelSelectDialog />
          <ProgressDialog />
        </div>
      </div>
    </WllamaProvider>
  );
}

export default App;
