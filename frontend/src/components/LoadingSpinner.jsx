import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ size = "default", text = "Loading..." }) {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

// Full page loading
export function PageLoader({ text = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="large" text={text} />
    </div>
  );
}

// Button loading state
export function ButtonLoader() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}
