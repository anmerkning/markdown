import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { use, useRef } from "react";
import { AppContext, RECOMMENDED_MODELS } from "../context/appContext";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "./ui/item";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import SearchHuggingFace from "./searchHuggingFace";
import type { Model } from "@wllama/wllama";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";
import { CircleOffIcon } from "lucide-react";

const ModelSelectDialog = () => {
  const { models, selectOpen, setSelectOpen, selectModel, currentModel } =
    use(AppContext);
  const recommended = useRef<Model[]>([JSON.parse(RECOMMENDED_MODELS)]);

  return (
    <Dialog
      open={selectOpen || currentModel == null}
      onOpenChange={() => setSelectOpen(false)}
    >
      <DialogContent
        className="max-h-9/10 overflow-y-scroll"
        showCloseButton={currentModel != null}
      >
        <DialogHeader>
          <DialogTitle>Select Model</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <SearchHuggingFace />
        <ModelsList
          title="Downloaded"
          currentModel={currentModel}
          models={models}
          itemAction={(m) => {
            selectModel(m.url);
            setSelectOpen(false);
          }}
        />

        <ModelsList
          title="Recommended"
          currentModel={currentModel}
          models={recommended.current}
          itemAction={(m) => {
            selectModel(m.url);
            setSelectOpen(false);
          }}
        />

        <DialogFooter className="items-center"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ModelsListProps {
  title: string;
  currentModel: Model | null;
  models: Model[];
  itemAction: (m: Model) => void;
}
const ModelsList: React.FC<ModelsListProps> = (props) => {
  const { title, currentModel, models, itemAction } = props;

  return (
    <div className="max-h-60 overflow-y-scroll">
      <Label className="pb-4 text-sm">{title}</Label>
      {models.length == 0 ? (
        <Empty className="border border-solid border-neutral-200">
          <EmptyHeader>
            <EmptyMedia>
              <CircleOffIcon />
            </EmptyMedia>
            <EmptyTitle>Empty</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {models.map((m) => (
            <Item
              variant={`${currentModel?.url == m.url ? "muted" : "outline"}`}
              key={m.url}
              className={`hover:bg-slate-200`}
            >
              <ItemContent>
                <ItemTitle>{m.files[0].name.substring(41)}</ItemTitle>
                <ItemDescription>{m.url}</ItemDescription>
              </ItemContent>
              <ItemActions>
                {currentModel?.url != m.url ? (
                  <Button size="sm" onClick={() => itemAction(m)}>
                    Select
                  </Button>
                ) : (
                  <Label className="text-blue-900">Selected</Label>
                )}
              </ItemActions>
            </Item>
          ))}
        </>
      )}
    </div>
  );
};

export default ModelSelectDialog;
