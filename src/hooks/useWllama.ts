import { Wllama, type CacheEntry, type CompletionChunk } from "@wllama/wllama";
import { useEffect, useRef, useState } from "react";

const CONFIG_PATHS = {
  "single-thread/wllama.wasm":
    "https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.6/src/single-thread/wllama.wasm",
  "multi-thread/wllama.wasm":
    "https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.6/src/multi-thread/wllama.wasm",
};

// const MODEL_ID = "LiquidAI/LFM2-350M-GGUF";
// const MODEL_PATH = "LFM2-350M-Q4_K_M.gguf";

const useWllama = () => {
  const [progress, setProgress] = useState(0);
  const [isReady, SetIsReady] = useState(false);
  const [models, setModels] = useState<CacheEntry[]>([]);
  const [currentModelUrl, setCurrentModelUrl] = useState<string | null>(null);
  const abortController = useRef(new AbortController());
  const wllama = useRef(new Wllama(CONFIG_PATHS));

  const progressCallback = ({
    loaded,
    total,
  }: {
    loaded: number;
    total: number;
  }) => {
    setProgress(Math.round((loaded / total) * 100));
  };

  const abort = () => {
    abortController.current.abort();
  };

  const downloadModel = (url: string) => {
    let blob = wllama.current.modelManager.cacheManager.open(url);
    if (blob == null) {
      wllama.current.modelManager.cacheManager.download(url, {
        progressCallback,
        signal: abortController.current.signal,
      });
      blob = wllama.current.modelManager.cacheManager.open(url);
    }
    return blob;
  };

  const loadModel = async (modelId: string, modelPath: string) => {
    const url = `https://huggingface.co/${modelId}/resolve/main/${modelPath}`;
    setProgress(0);
    SetIsReady(false);
    const blob = await downloadModel(url);
    await wllama.current.loadModel([blob!]);
    setCurrentModelUrl(url);
    SetIsReady(true);
  };

  const loadModelFromCache = async (url: string) => {
    setProgress(0);
    SetIsReady(false);
    const blob = await wllama.current.modelManager.cacheManager.open(url);
    await wllama.current.exit();
    await wllama.current.loadModel([blob!]);
    setCurrentModelUrl(url);
    SetIsReady(true);
  };

  const prompt = async (
    promptCommand: string,
  ): Promise<AsyncIterable<CompletionChunk>> => {
    return await wllama.current.createChatCompletion(
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
        stream: true,
        nPredict: 512,
        sampling: {
          temp: 0.5,
          top_k: 40,
          top_p: 0.9,
        },
      },
    );
  };

  useEffect(() => {
    wllama.current.modelManager.cacheManager.list().then((models) => {
      setModels(models);
      SetIsReady(true);
    });
  }, []);

  return {
    progress,
    isReady,
    prompt,
    loadModel,
    models,
    currentModelUrl,
    loadModelFromCache,
    abort,
  };
};

export default useWllama;
