"use client";

import { Bird as BirdIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Bird = () => {
  const birdRef = useRef<SVGSVGElement>(null);
  const [flip, setFlipped] = useState(false);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const birdBoundingBox = birdRef.current?.getBoundingClientRect();
      if (!birdBoundingBox) return;

      const middleX = birdBoundingBox.left + birdBoundingBox.width / 2;
      if (event.clientX < middleX) {
        setFlipped(true);
      } else if (event.clientX > middleX) {
        setFlipped(false);
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <BirdIcon
      ref={birdRef}
      style={flip ? { transform: "scaleX(-1)" } : { transform: "scaleX(1)" }}
      size={240}
      strokeWidth={1}
    />
  );
};
