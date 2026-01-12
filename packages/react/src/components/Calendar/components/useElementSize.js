import { useState, useEffect } from "react";

export const useContainerDimensions = (containerRef) => {
  const [elementWidth, setElementWidth] = useState(
    containerRef?.current?.innerWidth,
  );
  const [elementHeight, setElementHeight] = useState(
    containerRef?.current?.innerHeight,
  );

  useEffect(() => {
    const handleResize = () => {
      setElementWidth(containerRef?.current?.innerWidth);
      setElementHeight(containerRef?.current?.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef]);

  // const isMobile = dimensions?.width <= 768;
  // const isTablet = dimensions?.width <= 1024;
  // const isDesktop = dimensions?.width > 1024;

  return { elementWidth, elementHeight };
};
