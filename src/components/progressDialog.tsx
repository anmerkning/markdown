import { use } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { WllamaContext } from "../context/wllamaContext";
import { Button } from "./ui/button";

const ProgressDialog = () => {
  const { progress, abort } = use(WllamaContext);
  return (
    <Dialog open={progress < 100}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Downloading Model</DialogTitle>
          <DialogDescription>This might take several minutes</DialogDescription>
        </DialogHeader>
        <DialogFooter className="items-center">
          <Progress value={progress} className="w-full" />
          {progress}%
          <Button variant="secondary" onClick={() => abort()}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog;
