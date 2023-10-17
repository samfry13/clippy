"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "~/lib/utils";

const MultiSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    startTooltip?: string;
    endTooltip?: string;
  }
>(({ className, startTooltip, endTooltip, ...props }, ref) => {
  const [showStartTooltip, setShowStartTooltip] = React.useState(false);
  const [showEndTooltip, setShowEndTooltip] = React.useState(false);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center [&>span:not(:first-child)]:z-10",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full">
        <SliderPrimitive.Range className="absolute h-full" />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb
        onPointerDown={() => setShowStartTooltip(true)}
        onPointerUp={() => setShowStartTooltip(false)}
        className="relative block w-1 bg-primary h-5 rounded-b-full"
      >
        <span className="absolute block -left-4 -top-5 h-5 w-5 rounded-t-full rounded-bl-full bg-primary" />

        {startTooltip && (
          <span
            className={cn(
              "pointer-events-none absolute -top-12 -left-10 bg-secondary text-secondary-foreground px-2 py-0.5 text-sm rounded-sm opacity-0 transition-opacity",
              showStartTooltip && "opacity-100"
            )}
          >
            {startTooltip}
          </span>
        )}
      </SliderPrimitive.Thumb>

      <SliderPrimitive.Thumb
        onPointerDown={() => setShowEndTooltip(true)}
        onPointerUp={() => setShowEndTooltip(false)}
        className="relative block w-1 bg-primary h-5 rounded-b-full"
      >
        <span className="absolute block -right-4 -top-5 h-5 w-5 rounded-t-full rounded-br-full bg-primary" />

        {endTooltip && (
          <span
            className={cn(
              "pointer-events-none absolute -top-12 -right-10 bg-secondary text-secondary-foreground px-2 py-0.5 text-sm rounded-sm opacity-0 transition-opacity",
              showEndTooltip && "opacity-100"
            )}
          >
            {endTooltip}
          </span>
        )}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
MultiSlider.displayName = SliderPrimitive.Root.displayName;

export { MultiSlider };
