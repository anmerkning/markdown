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
import { AppContext } from "../context/appContext";
import { Button } from "./ui/button";

const ProgressDialog = () => {
  const { loadingModel, progress, abort } = use(AppContext);
  return (
    <Dialog open={loadingModel}>
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
