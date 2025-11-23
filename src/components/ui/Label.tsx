import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label: React.FC<LabelProps> = ({ className, ...props }) => {
  return (
    <label
      className={`block text-sm font-medium text-gray-300 mb-2 ${className}`}
      {...props}
    />
  );
};

export default Label;
