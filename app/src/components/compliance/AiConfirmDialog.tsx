import React, { useState } from 'react';

export interface AiConfirmDialogProps {
  title: string;
  proposedAction: string;
  confidenceString: string;
  provenance: string;
  onConfirm: () => void;
  onReject: () => void;
}

export const AiConfirmDialog: React.FC<AiConfirmDialogProps> = ({
  title,
  proposedAction,
  confidenceString,
  provenance,
  onConfirm,
  onReject,
}) => {
  const [isOverride, setIsOverride] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border-2 border-purple-500"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="dialog-title" className="text-xl font-bold text-gray-900">
            {title}
          </h2>
          <span className="px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full border border-purple-200">
            AI Suggestion
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Proposed Action:</h3>
            <p className="text-base text-gray-900 mt-1">{proposedAction}</p>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="font-medium text-gray-700">Confidence: </span>
              <span className={`font-semibold ${
                confidenceString.toLowerCase() === 'high' ? 'text-green-600' : 
                confidenceString.toLowerCase() === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {confidenceString}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200 text-sm">
            <h3 className="font-medium mb-1">Why was this proposed?</h3>
            <p>{provenance}</p>
          </div>

          <div className="flex items-center mt-4">
            <input 
              type="checkbox" 
              id="human-override" 
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              checked={isOverride}
              onChange={(e) => setIsOverride(e.target.checked)}
            />
            <label htmlFor="human-override" className="ml-2 block text-sm text-gray-900 font-medium">
              Human Override - I am modifying this action
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onReject}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Reject
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {isOverride ? 'Confirm with Override' : 'Approve AI Action'}
          </button>
        </div>
      </div>
    </div>
  );
};
