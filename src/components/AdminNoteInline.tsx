import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
interface AdminNoteInlineProps {
  overrideValue: number;
  note: string;
}
export const AdminNoteInline: React.FC<AdminNoteInlineProps> = ({
  overrideValue,
  note
}) => {
  return <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
      <div className="flex items-start">
        <AlertCircleIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            Admin override: Score set to {overrideValue}
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Note: {note}
          </p>
        </div>
      </div>
    </div>;
};