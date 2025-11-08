import { Model, Wllama } from "@wllama/wllama";
import React, { createContext, useEffect, useRef, useState } from "react";

const CONFIG_PATHS = {
  "single-thread/wllama.wasm":
    "https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.6/src/single-thread/wllama.wasm",
  "multi-thread/wllama.wasm":
    "https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.6/src/multi-thread/wllama.wasm",
};

interface WllamaContextProps {
  markdown: string;
  progress: number;
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

const WllamaContext = createContext<WllamaContextProps>(DEFAULT_CONTEXT_VALUES);

const WllamaProvider = ({ children }: { children: React.ReactNode }) => {
  const wllama = useRef(new Wllama(CONFIG_PATHS));
  const abortController = useRef(new AbortController());

  const [markdown, setMarkdown] = useState("");
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [progress, setProgress] = useState(100);
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
    await wllama.current.exit();
    try {
      const model = await wllama.current.modelManager.getModelOrDownload(url, {
        progressCallback,
        signal: abortController.current.signal,
      });
      await wllama.current.loadModel(model);
      if (model.url == "") {
        model.url = url;
      }
      setCurrentModel(model);
      if (models.includes(model)) {
        setModels([model, ...models]);
      }
    } catch (e) {
      if (e == "TypeError: Error in input stream") {
        throw new Error("Failed to setup model! Refresh and try again.");
      }
    }
  };

  const abort = () => {
    abortController.current.abort("Cancelled by user!");
    abortController.current = new AbortController();
    setProgress(100);
  };

  const prompt = async (promptCommand: string) => {
    setGeneratingResponse(true);
    const iterable = await wllama.current.createChatCompletion(
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

  useEffect(() => {
    wllama.current.modelManager
      .getModels({ includeInvalid: false })
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
  }, []);

  return (
    <WllamaContext
      value={{
        markdown,
        setMarkdown,
        progress,
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
    </WllamaContext>
  );
};

export { WllamaContext, WllamaProvider };
