import type React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "./ui/input-group";
import { use, useRef, useState } from "react";
import getCaretCoordinates from "textarea-caret";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";
import { Check, CircleX } from "lucide-react";
import { WllamaContext } from "../context/wllamaContext";
import Prompt from "./prompt";

export interface Caret {
  top: number;
  left: number;
  height: number;
}

const MarkdownEditor: React.FC<{}> = ({}) => {
  const {
    generatingResponse,
    currentModel,
    markdown,
    abort,
    setMarkdown,
    setSelectionStart,
    setSelectionEnd,
    setSelectOpen,
  } = use(WllamaContext);
  const [isPromptOpen, setPromptOpen] = useState(false);
  const [caretPos, setCaretPos] = useState<Caret>({
    top: 0,
    left: 0,
    height: 0,
  });
  const textarea = useRef<HTMLTextAreaElement>(null);

  const updateCaretPos = () => {
    if (textarea.current != null) {
      const caretCoords = getCaretCoordinates(
        textarea.current,
        textarea.current.selectionEnd,
      );
      setCaretPos({
        height: caretCoords.height,
        left: caretCoords.left,
        top: caretCoords.top - (textarea.current.scrollTop ?? 0),
      });
      setSelectionStart(textarea.current.selectionStart);
      setSelectionEnd(textarea.current.selectionEnd);
    }
  };

  return (
    <>
      <InputGroup>
        <InputGroupTextarea
          ref={textarea}
          value={markdown}
          className="resize-none size-full p-6"
          onClick={() => updateCaretPos()}
          onKeyUp={() => updateCaretPos()}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.ctrlKey && e.code === "Space") {
              e.preventDefault();
              setPromptOpen(true);
            }
            updateCaretPos();
          }}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setMarkdown(e.target.value);
            updateCaretPos();
          }}
        />
        <InputGroupAddon align="block-end">
          <InputGroupText className="">
            {generatingResponse ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Spinner /> Working
                </div>
                <Button variant="secondary" onClick={() => abort()}>
                  <CircleX className="text-destructive" />
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Check className="text-green-400" />
                Ready
              </>
            )}
          </InputGroupText>
          <Separator orientation="vertical" />
          Model:
          <Button variant="ghost" onClick={() => setSelectOpen(true)}>
            {currentModel?.files[0].name.substring(41)}
          </Button>
          <Separator orientation="vertical" />
          <InputGroupText className="ml-auto">
            <b>Ctrl + Space</b> to open promt
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <Prompt
        isPromptOpen={isPromptOpen}
        close={() => {
          setPromptOpen(false);
          textarea.current?.focus();
        }}
        caretPos={caretPos}
      />
    </>
  );
};

export default MarkdownEditor;
