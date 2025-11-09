import { use, useEffect, useRef, useState } from "react";
import type { Caret } from "./markdownEditor";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "./ui/input-group";
import { AppContext } from "../context/appContext";

interface PromptProps {
  isPromptOpen: boolean;
  close: () => void;
  caretPos: Caret;
}

const Prompt: React.FC<PromptProps> = (props) => {
  const { isPromptOpen, close, caretPos } = props;
  const { prompt } = use(AppContext);
  const [promptCommand, setPromptCommand] = useState("");
  const aiTextArea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isPromptOpen) {
      aiTextArea.current?.focus();
    }
  }, [isPromptOpen]);

  return (
    <div
      className={`absolute ${isPromptOpen ? "" : "invisible "} pt-6 min-w-2xs`}
      style={{
        left: `${caretPos.left}px`,
        top: `${caretPos.top}px`,
      }}
    >
      <InputGroup className="bg-background">
        <InputGroupTextarea
          ref={aiTextArea}
          value={promptCommand}
          placeholder="Write a command"
          onChange={(e) => setPromptCommand(e.target.value)}
          onKeyDown={async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key == "Enter") {
              e.preventDefault();
              close();

              prompt(promptCommand);
              setPromptCommand("");
            }
            if (e.ctrlKey && e.code === "Space") {
              e.preventDefault();
              close();
              setPromptCommand("");
            }
          }}
        />
        <InputGroupAddon align="block-end">
          <InputGroupText className="ml-auto">
            <b>Enter</b> to confirm · <b>Ctrl + Space</b> to cancel
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default Prompt;
