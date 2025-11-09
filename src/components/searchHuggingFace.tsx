import { use } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./ui/input-group";
import { AppContext } from "../context/appContext";
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
import useDebounce from "@/hooks/useDebounce";
import useHuggingFace from "@/hooks/useHuggingFace";
import { SearchIcon, SearchXIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

const SearchHuggingFace = () => {
  const { selectModel, setSelectOpen } = use(AppContext);
  const { repos, isLoading, update } = useHuggingFace();
  const { value, setValue } = useDebounce({
    callback: async (value) => await update(value),
    delay: 500,
  });

  return (
    <div>
      <InputGroup>
        <InputGroupInput
          id="searchHuggingface"
          placeholder="Search HuggingFace"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)
          }
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        {isLoading && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>Searching...</InputGroupText>
            <Spinner />
          </InputGroupAddon>
        )}
      </InputGroup>
      <div className="border border-neutral-200 rounded-lg max-h-60 overflow-y-scroll mt-4 inset-shadow-2xs">
        {repos.length == 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon />
              </EmptyMedia>
              <EmptyTitle>No Repositories Found</EmptyTitle>
              <EmptyDescription>
                We couldn’t find any Hugging Face repositories matching your
                search. Try adjusting your keywords or check your spelling.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {!isLoading && repos.length > 0 && (
          <Accordion type="multiple">
            {repos.map((repo) => (
              <AccordionItem
                key={repo._id}
                className="border border-nautral-200"
                value={repo.id}
              >
                <AccordionTrigger className="p-4 py-6">
                  <Label>{repo.modelId}</Label>
                </AccordionTrigger>
                <AccordionContent>
                  <>
                    {repo.siblings
                      .filter((f) => f.rfilename.includes(".gguf"))
                      .map((file, index) => (
                        <Item
                          key={`${repo.id}/${file.rfilename}`}
                          variant={`${index % 2 == 0 ? "muted" : "default"}`}
                        >
                          <ItemContent>{file.rfilename}</ItemContent>
                          <ItemActions>
                            <Button
                              onClick={() => {
                                selectModel(
                                  `https://huggingface.co/${repo.id}/resolve/main/${file.rfilename}`,
                                );
                                setSelectOpen(false);
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
