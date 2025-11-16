import React, { lazy } from "react";

export function DynamicIcon(name) {
  return lazy(() =>
    import("lucide-react").then((m) => ({ default: m[name] }))
  );
}
