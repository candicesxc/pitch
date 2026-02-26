import React, { useState } from 'react';

interface RefineModalProps {
  isOpen: boolean;
  companyName: string;
  roleName: string;
  isLoading?: boolean;
  error?: string;
  onSubmit: (company: string, role: string, instructions: string) => void;
  onClose: () => void;
}

export const RefineModal: React.FC<RefineModalProps> = ({
  isOpen,
  companyName,
  roleName,
  isLoading = false,
  error,
  onSubmit,
  onClose,
}) => {
  const [company, setCompany] = useState(companyName);
  const [role, setRole] = useState(roleName);
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(company.trim(), role.trim(), instructions.trim());
  };

  const charCount = instructions.length;
  const charLimit = 500;
  const exceedsLimit = charCount > charLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Refine Your Pitch</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-100 disabled:opacity-50"
              placeholder="e.g., Kong"
            />
          </div>

          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Role Name
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-100 disabled:opacity-50"
              placeholder="e.g., Senior Product Manager"
            />
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Custom Instructions <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, charLimit))}
              disabled={isLoading}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-100 disabled:opacity-50 resize-none"
              placeholder="e.g., Emphasize my AI infrastructure experience and agentic framework expertise"
            />
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${exceedsLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount} / {charLimit}
              </span>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => onSubmit(company.trim(), role.trim(), instructions.trim())}
                className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !company.trim() || !role.trim()}
              className="px-4 py-2 text-black font-semibold rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              style={{
                backgroundColor: 'var(--yellow)',
              }}
            >
              {isLoading && <span>⏳</span>}
              {isLoading ? 'Updating...' : 'Update Pitch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
