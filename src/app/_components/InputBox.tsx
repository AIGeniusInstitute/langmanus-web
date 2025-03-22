import { ArrowUpOutlined, GlobalOutlined } from "@ant-design/icons";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Atom } from "~/core/icons";
import { cn } from "~/core/utils";

export function InputBox({
  className,
  size,
  responding,
  onSend,
  onCancel,
}: {
  className?: string;
  size?: "large" | "normal";
  responding?: boolean;
  onSend?: (
    message: string,
    options: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
  ) => void;
  onCancel?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [deepThinkingMode, setDeepThinkMode] = useState(false);
  const [searchBeforePlanning, setSearchBeforePlanning] = useState(false);
  const [imeStatus, setImeStatus] = useState<"active" | "inactive">("inactive");
  const saveConfig = useCallback(() => {
    localStorage.setItem(
      "langmanus.config.inputbox",
      JSON.stringify({ deepThinkingMode, searchBeforePlanning }),
    );
  }, [deepThinkingMode, searchBeforePlanning]);
  useEffect(() => {
    const config = localStorage.getItem("langmanus.config.inputbox");
    if (config) {
      const { deepThinkingMode, searchBeforePlanning } = JSON.parse(config);
      setDeepThinkMode(deepThinkingMode);
      setSearchBeforePlanning(searchBeforePlanning);
    }
  }, []);
  useEffect(() => {
    saveConfig();
  }, [deepThinkingMode, searchBeforePlanning, saveConfig]);
  const handleSendMessage = useCallback(() => {
    if (responding) {
      onCancel?.();
    } else {
      if (message.trim() === "") {
        return;
      }
      if (onSend) {
        onSend(message, { deepThinkingMode, searchBeforePlanning });
        setMessage("");
      }
    }
  }, [
    responding,
    onCancel,
    message,
    onSend,
    deepThinkingMode,
    searchBeforePlanning,
  ]);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (responding) {
        return;
      }
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        imeStatus === "inactive"
      ) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [responding, imeStatus, handleSendMessage],
  );
  return (
    <div className={cn(className)}>
      <div className="w-full">
        <textarea
          className={cn(
            "m-0 w-full resize-none border-none px-4 py-3 text-lg",
            size === "large" ? "min-h-32" : "min-h-4",
          )}
          placeholder="What can I do for you?"
          value={message}
          onCompositionStart={() => setImeStatus("active")}
          onCompositionEnd={() => setImeStatus("inactive")}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setMessage(event.target.value);
          }}
        />
      </div>
      <div className="flex items-center px-4 py-2">
        <div className="flex grow items-center gap-2">
          <Button
            variant="outline"
            className={cn("rounded-2xl px-4 text-sm", {
              "border-blue-300 bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600":
                deepThinkingMode,
            })}
            onClick={() => {
              setDeepThinkMode(!deepThinkingMode);
            }}
          >
            <Atom className="h-4 w-4" />
            <span>Deep Think</span>
          </Button>
          <Button
            variant="outline"
            className={cn("rounded-2xl px-4 text-sm", {
              "border-blue-300 bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600":
                searchBeforePlanning,
            })}
            onClick={() => {
              setSearchBeforePlanning(!searchBeforePlanning);
            }}
          >
            <GlobalOutlined className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full",
                  responding ? "bg-button-hover" : "bg-button",
                )}
                onClick={handleSendMessage}
              >
                {responding ? (
                  <div className="flex h-10 w-10 items-center justify-center">
                    <div className="h-4 w-4 rounded-sm bg-red-300" />
                  </div>
                ) : (
                  <ArrowUpOutlined />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{responding ? "Cancel" : "Send"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
