import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { use } from "react";
import { AppContext } from "../context/appContext";
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
import { Separator } from "./ui/separator";

const ModelSelectDialog = () => {
  const { models, selectOpen, setSelectOpen, selectModel, currentModel } =
    use(AppContext);

  return (
    <Dialog
      open={selectOpen || currentModel == null}
      onOpenChange={() => setSelectOpen(false)}
    >
      <DialogContent showCloseButton={currentModel != null}>
        <DialogHeader>
          <DialogTitle>Select Model</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <SearchHuggingFace />
        <Separator orientation="horizontal" />

        <div className="max-h-112 overflow-y-scroll">
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
                  <Button
                    size="sm"
                    onClick={() => {
                      selectModel(m.url);
                      setSelectOpen(false);
                    }}
                  >
                    Select
                  </Button>
                ) : (
                  <Label className="text-blue-900">Selected</Label>
                )}
              </ItemActions>
            </Item>
          ))}
        </div>

        <DialogFooter className="items-center"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default ModelSelectDialog;
