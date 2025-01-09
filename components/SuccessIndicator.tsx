import React from "react";
import { CheckCircle } from "lucide-react";

interface SuccessIndicatorProps {
  show: boolean;
}

const SuccessIndicator: React.FC<SuccessIndicatorProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-8 right-8 flex items-center justify-center p-4 bg-green-500 text-white rounded-full shadow-lg animate-bounce">
      <CheckCircle size={32} />
      <span className="ml-2 font-semibold">Success!</span>
    </div>
  );
};

export default SuccessIndicator;
