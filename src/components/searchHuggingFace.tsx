import { use, useEffect, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { WllamaContext } from "../context/wllamaContext";
import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Item, ItemActions, ItemContent } from "./ui/item";
import { Button } from "./ui/button";

export type RepoList = Repo[];

export interface Repo {
  _id: string;
  id: string;
  author: string;
  gated: any;
  lastModified: string;
  likes: number;
  trendingScore: number;
  private: boolean;
  sha: string;
  downloads: number;
  tags: string[];
  pipeline_tag?: string;
  library_name?: string;
  createdAt: string;
  modelId: string;
  siblings: Sibling[];
}

export interface Sibling {
  rfilename: string;
}
const SearchHuggingFace = () => {
  const { selectModel, setSelectOpen } = use(WllamaContext);
  const [repo, setRepo] = useState("");
  const [repos, setRepos] = useState<RepoList>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    if (repo.length == 0) {
      setRepos([]);
      setLoading(false);
      return;
    }
    const getData = setTimeout(async () => {
      // Example parameters
      const searchQuery = repo; // The term you're searching for
      const filterParams = {
        filter: "gguf",
        full: "true",
      };

      // Construct query string with search and filter parameters
      const queryString = new URLSearchParams({
        ...filterParams, // Spread any additional filter parameters you want to include
        search: searchQuery, // Adding the search query
      }).toString();

      // Construct the full URL with the query string
      const url = `https://huggingface.co/api/models?${queryString}`;
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }
      const repos: RepoList = JSON.parse(await response.text());
      setRepos(repos);
      setLoading(false);
    }, 500);

    return () => clearTimeout(getData);
  }, [repo]);

  return (
    <div>
      <InputGroup>
        <InputGroupInput
          id="searchHuggingface"
          placeholder="LiquidAI/LFM2-700M-GGUF"
          value={repo}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRepo(e.target.value)
          }
        />
        <InputGroupAddon align="block-start">
          <Label htmlFor="searchHuggingface">Search huggingface</Label>
        </InputGroupAddon>
      </InputGroup>
      <div className="border border-neutral-200 rounded-lg max-h-60 overflow-y-scroll my-2 inset-shadow-2xs">
        {loading ? (
          <Spinner />
        ) : (
          <Accordion type="multiple" className="w-full">
            {repos.map((repo) => (
              <AccordionItem
                key={repo._id}
                className="border border-nautral-200"
                value={repo.id}
              >
                <AccordionTrigger>
                  <Label className="px-4">{repo.modelId}</Label>
                </AccordionTrigger>
                <AccordionContent>
                  <>
                    {repo.siblings
                      .filter((f) => f.rfilename.includes(".gguf"))
                      .map((file, index) => (
                        <Item
                          variant={`${index % 2 == 0 ? "muted" : "default"}`}
                        >
                          <ItemContent>
                            {file.rfilename} {error}
                          </ItemContent>
                          <ItemActions>
                            <Button
                              onClick={async () => {
                                try {
                                  await selectModel(
                                    `https://huggingface.co/${repo.id}/resolve/main/${file.rfilename}`,
                                  );
                                  setSelectOpen(false);
                                } catch (e: any) {
                                  console.log(e);
                                  setError(e);
                                }
                              }}
                            >
                              Download
                            </Button>
                          </ItemActions>
                        </Item>
                      ))}
                  </>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default SearchHuggingFace;
