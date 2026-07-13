import React from "react";

/**
 * Tailwind-styled select component
 * @param {children} option elements
 * @param {className} custom Tailwind classes
 */
export const Select = React.forwardRef(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";
