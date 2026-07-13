import React from "react";

/**
 * Tailwind-styled input component
 * @param {className} custom classes to extend styling
 * @param {props} standard input props
 */
export const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
});
Input.displayName = "Input";
