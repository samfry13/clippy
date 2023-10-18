"use client";

import { Share } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const ShareButton = ({ id }: { id: string }) => {
  const { toast } = useToast();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            const url = `${window.location.origin}/${id}`;
            if (navigator.canShare?.({ url })) {
              navigator.share({ url });
            } else {
              navigator.clipboard.writeText(url);
              toast({
                title: "Copied Link!",
              });
            }
          }}
        >
          <Share />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Share</TooltipContent>
    </Tooltip>
  );
};
