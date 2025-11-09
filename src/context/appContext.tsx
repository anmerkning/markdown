import { LoggerWithoutDebug, Model, Wllama } from "@wllama/wllama";
import React, { createContext, useEffect, useRef, useState } from "react";

// JSON Dump of the recommended model.
// Get parsed and added to the models list to ensure
// that at least one model is viewed to the user on
// the first run.
export const RECOMMENDED_MODELS =
  '{"modelManager":{"cacheManager":{},"params":{"cacheManager":{},"logger":{}},"logger":{}},"url":"https://huggingface.co/LiquidAI/LFM2-350M-GGUF/resolve/main/LFM2-350M-Q4_K_M.gguf","size":229309376,"files":[{"name":"4d44b45ab5ccd10c16ccaa96722a1fdd9c9a932d_LFM2-350M-Q4_K_M.gguf","size":229309376,"metadata":{"originalURL":"https://huggingface.co/LiquidAI/LFM2-350M-GGUF/resolve/main/LFM2-350M-Q4_K_M.gguf","originalSize":229309376,"etag":"8011c02a2fed5b5898f8d8ff915045434b3d39f165e7729ca7dbd82e700f7fb1"}}]}';

// Wasm files
const CONFIG_PATHS = {
  "single-thread/wllama.wasm":
    "https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.6/src/single-thread/wllama.wasm",
  "multi-thread/wllama.wasm":
    "https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.6/src/multi-thread/wllama.wasm",
};

interface AppContextProps {
  markdown: string;
  progress: number;
  loadingModel: boolean;
  generatingResponse: boolean;
  models: Model[];
  currentModel: Model | null;
  selectOpen: boolean;
  setSelectOpen: (open: boolean) => void;
  setSelectionStart: (selectionStart: number) => void;
  setSelectionEnd: (selectionEnd: number) => void;
  setMarkdown: (markdown: string) => void;
  selectModel: (url: string) => Promise<void>;
  abort: () => void;
  prompt: (promptCommand: string) => Promise<void>;
}

const DEFAULT_CONTEXT_VALUES = {
  markdown: "",
  progress: 100,
  loadingModel: false,
  generatingResponse: false,
  models: [],
  currentModel: null,
  selectOpen: false,
  setSelectOpen: () => {},
  setSelectionStart: () => {},
  setSelectionEnd: () => {},
  setMarkdown: () => {},
  selectModel: async () => {},
  abort: () => {},
  prompt: async () => {},
};

const AppContext = createContext<AppContextProps>(DEFAULT_CONTEXT_VALUES);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const wllama = useRef<Wllama | null>(null);
  const abortController = useRef(new AbortController());

  const [markdown, setMarkdown] = useState(``);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [progress, setProgress] = useState(100);
  const [loadingModel, setLoadingModel] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [selectOpen, setSelectOpen] = useState(false);

  const progressCallback = ({
    loaded,
    total,
  }: {
    loaded: number;
    total: number;
  }) => {
    setProgress(Math.round((loaded / total) * 100));
  };

  const selectModel = async (url: string) => {
    setProgress(0);
    setCurrentModel(null);
    setLoadingModel(true);
    await wllama.current!.exit();
    const model = await wllama.current!.modelManager.getModelOrDownload(url, {
      progressCallback,
      signal: abortController.current.signal,
    });
    await wllama.current!.loadModel(model);
    if (model.url == "") {
      model.url = url;
    }
    if (models.findIndex((m) => m.url == url) < 0) {
      setModels([model, ...models]);
    }
    setCurrentModel(model);
    setLoadingModel(false);
  };

  const abort = () => {
    abortController.current.abort("Cancelled by user!");
    abortController.current = new AbortController();
    setProgress(100);
  };

  const prompt = async (promptCommand: string) => {
    setGeneratingResponse(true);
    const iterable = await wllama.current!.createChatCompletion(
      [
        {
          role: "system",
          content: `
You are a Markdown assistant. 

- Follow exact formatting instructions (lists, tables, headings, code blocks).  
- Preserve existing Markdown; modify only when instructed.  
- Output **only Markdown** — no explanations or commentary.  
- Be concise; complete the task exactly as requested and stop when done.`,
        },
        { role: "user", content: promptCommand },
      ],
      {
        abortSignal: abortController.current.signal,
        stream: true,
        nPredict: 512,
        sampling: {
          temp: 0.5,
          top_k: 40,
          top_p: 0.9,
        },
      },
    );
    const markdown_left = markdown.substring(0, selectionStart);
    const markdown_right = markdown.substring(selectionEnd);

    for await (const chunk of iterable) {
      setMarkdown(markdown_left + chunk.currentText + markdown_right);
    }
    setGeneratingResponse(false);
  };

  const initModels = async () => {
    await wllama
      .current!.modelManager.getModels({ includeInvalid: false })
      .then((models) => {
        const map = new Map<string, boolean>();
        const models_set = [];

        for (const model of models) {
          if (model.url == "") {
            model.remove();
            continue;
          }
          if (!map.has(model.url)) {
            map.set(model.url, true);
            models_set.push(model);
          }
        }
        setModels(models_set);
      });
  };

  useEffect(() => {
    const ls_markdown = localStorage.getItem("markdown");
    if (ls_markdown != null) {
      setMarkdown(ls_markdown);
    }

    if (wllama.current == null) {
      wllama.current = new Wllama(CONFIG_PATHS, { logger: LoggerWithoutDebug });

      const ls_currentModel = localStorage.getItem("currentModel");
      if (ls_currentModel != null) {
        const m: Model = JSON.parse(ls_currentModel);
        selectModel(m.url).then(() => initModels());
      }
    } else {
      initModels();
    }
  }, []);

  useEffect(() => {
    if (markdown.length > 0) {
      localStorage.setItem("markdown", markdown);
    }
  }, [markdown]);

  useEffect(() => {
    if (currentModel != null) {
      localStorage.setItem("currentModel", JSON.stringify(currentModel));
    }
  }, [currentModel]);

  return (
    <AppContext
      value={{
        markdown,
        setMarkdown,
        progress,
        loadingModel,
        models,
        currentModel,
        generatingResponse,
        selectOpen,
        setSelectOpen,
        setSelectionStart,
        setSelectionEnd,
        selectModel,
        abort,
        prompt,
      }}
    >
      {children}
    </AppContext>
  );
};

export { AppContext, AppProvider };
