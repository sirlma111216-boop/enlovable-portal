import { useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";

const KEY = "vibecoding:fontSize";

export type FontSize = "default" | "large" | "xlarge";

const sizes: Record<FontSize, string> = {
  default: "16px",
  large: "18px",
  xlarge: "20px",
};

export function useFontSize() {
  const [size, setSize] = useLocalStorage<FontSize>(KEY, "default");

  useEffect(() => {
    document.documentElement.style.setProperty("--root-font-size", sizes[size]);
  }, [size]);

  const cycle = () => {
    setSize((s) => (s === "default" ? "large" : s === "large" ? "xlarge" : "default"));
  };

  return { size, setSize, cycle };
}
