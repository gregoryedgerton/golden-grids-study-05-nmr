import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

/** Each page's entry calls this with its own App. */
export function mount(app: ReactNode) {
  createRoot(document.getElementById("root")!).render(<StrictMode>{app}</StrictMode>);
}
