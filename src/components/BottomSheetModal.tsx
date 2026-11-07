import React from 'react';
import { X } from 'lucide-react';

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-stone-900/35 backdrop-blur-md transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl liquid-glass rounded-t-[32px] lg:rounded-[32px] max-h-[86vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle Affordance */}
        <div className="w-11 h-1.5 bg-stone-300/80 dark:bg-stone-700 rounded-full mx-auto mt-3.5 mb-1 lg:hidden shrink-0" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/70 dark:border-stone-800 shrink-0">
          <div className="min-w-0 pr-3">
            <h2
              id="sheet-title"
              className="text-base font-semibold text-stone-900 dark:text-stone-100 truncate"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl liquid-glass-subtle liquid-glass-hover text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">{children}</div>
      </div>
    </div>
  );
};
