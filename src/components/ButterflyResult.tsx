import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButterflyResultProps {
  loading: boolean;
  result?: {
    label: string;
    score: number;
  };
}

export const ButterflyResult: React.FC<ButterflyResultProps> = ({ loading, result }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-textDark">Identifying butterfly...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-textDark mb-2">
        {result.label}
      </h3>
      <p className="text-sm text-gray-600">
        Confidence: {Math.round(result.score * 100)}%
      </p>
    </div>
  );
};