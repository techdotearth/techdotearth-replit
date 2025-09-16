import React from 'react';
type Source = 'EEA' | 'Meteoalarm' | 'EA' | 'GloFAS' | 'FIRMS' | 'GHSL';
interface SourceBadgesProps {
  sources: Source[];
}
export const SourceBadges: React.FC<SourceBadgesProps> = ({
  sources
}) => {
  const getSourceTooltip = (source: Source): string => {
    const tooltips: Record<Source, string> = {
      EEA: 'European Environment Agency',
      Meteoalarm: 'European Weather Alerts',
      EA: 'Environment Agency (UK)',
      GloFAS: 'Global Flood Awareness System',
      FIRMS: 'Fire Information for Resource Management System',
      GHSL: 'Global Human Settlement Layer'
    };
    return tooltips[source];
  };
  return <div className="flex space-x-1.5">
      {sources.map(source => <div key={source} className="h-6 w-6 bg-te-muted dark:bg-gray-800 rounded-md flex items-center justify-center" title={getSourceTooltip(source)}>
          <span className="text-xs font-mono text-te-ink-700 dark:text-gray-400">
            {source.substring(0, 2)}
          </span>
        </div>)}
    </div>;
};