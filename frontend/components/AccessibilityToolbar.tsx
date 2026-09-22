'use client';

import React from 'react';
import { Eye, Type, RotateCcw } from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';

export function AccessibilityToolbar() {
  const { highContrast, toggleHighContrast, largeText, toggleLargeText, resetAccessibility } =
    useAccessibility();

  return (
    <div
      className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/90 rounded-md p-1 border border-slate-200"
      role="region"
      aria-label="Accessibility options"
    >
      <button
        onClick={toggleHighContrast}
        className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
          highContrast
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-700 hover:bg-slate-200'
        }`}
        aria-pressed={highContrast}
        title="Toggle High Contrast Mode"
      >
        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Contrast</span>
      </button>

      <button
        onClick={toggleLargeText}
        className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
          largeText
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-700 hover:bg-slate-200'
        }`}
        aria-pressed={largeText}
        title="Toggle Larger Text Size"
      >
        <Type className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Text Size</span>
      </button>

      {(highContrast || largeText) && (
        <button
          onClick={resetAccessibility}
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          title="Reset accessibility settings"
          aria-label="Reset accessibility settings"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
