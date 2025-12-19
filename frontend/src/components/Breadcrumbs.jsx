import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
  const location = useLocation();
  
  // Generate breadcrumb items from path
  const pathnames = location.pathname.split("/").filter((x) => x);
  
  // Don't show breadcrumbs on homepage
  if (pathnames.length === 0 || location.pathname === "/") {
    return null;
  }

  // Format breadcrumb labels
  const formatLabel = (str) => {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 py-3 px-6 bg-gray-50 border-b border-gray-200">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
      >
        <Home size={16} />
        <span>Home</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight size={16} className="text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium">
                {formatLabel(name)}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-blue-600 transition-colors"
              >
                {formatLabel(name)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
