"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "~/lib/utils";

const MultiSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
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
    <SliderPrimitive.Thumb className="relative block w-1 bg-primary h-5 rounded-b-full">
      <span className="absolute block -left-4 -top-5 h-5 w-5 rounded-t-full rounded-bl-full bg-primary" />
    </SliderPrimitive.Thumb>
    <SliderPrimitive.Thumb className="relative block w-1 bg-primary h-5 rounded-b-full">
      <span className="absolute block -right-4 -top-5 h-5 w-5 rounded-t-full rounded-br-full bg-primary" />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
));
MultiSlider.displayName = SliderPrimitive.Root.displayName;

export { MultiSlider };
