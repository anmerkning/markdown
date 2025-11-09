import type { RepoList } from "@/api/models/huggingFaceModel";
import { useState } from "react";

const useHuggingFace = () => {
  const [repos, setRepos] = useState<RepoList>([]);
  const [isLoading, setIsLoading] = useState(false);

  const update = async (value: string) => {
    setIsLoading(true);
    if (value.length == 0) {
      setRepos([]);
      setIsLoading(false);
      return;
    }

    const searchQuery = value;
    const filterParams = {
      filter: "gguf",
      full: "true",
    };

    const queryString = new URLSearchParams({
      ...filterParams,
      search: searchQuery,
    }).toString();

    const url = `https://huggingface.co/api/models?${queryString}`;
    const response = await fetch(url);
    if (!response.ok) {
      return;
    }
    const repos: RepoList = JSON.parse(await response.text());
    setRepos(repos);
    setIsLoading(false);
  };

  return { repos, setRepos, update, isLoading };
};

export default useHuggingFace;
