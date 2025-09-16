import React from 'react';
interface UpdatedCellProps {
  timestamp: string;
}
export const UpdatedCell: React.FC<UpdatedCellProps> = ({
  timestamp
}) => {
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }) + ' BST';
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}`;
      } else {
        return date.toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  };
  return <div className="text-sm text-te-ink-700 dark:text-gray-400">
      {formatTimestamp(timestamp)}
    </div>;
};