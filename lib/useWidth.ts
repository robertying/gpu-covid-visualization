import { useEffect, useState } from "react";

const useWidth = (ref: React.RefObject<HTMLElement | null>) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      setWidth(element.clientWidth);
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.unobserve(element);
    };
  }, [ref]);

  return width;
};

export default useWidth;
