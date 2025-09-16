import React from 'react';
interface RegionCellProps {
  regionName: string;
  countryCode: string;
}
export const RegionCell: React.FC<RegionCellProps> = ({
  regionName,
  countryCode
}) => {
  const countryFlag = getCountryFlag(countryCode);
  const countryName = getCountryName(countryCode);
  return <div className="flex items-center">
      <span className="mr-2 text-lg" aria-hidden="true">
        {countryFlag}
      </span>
      <div>
        <div className="font-medium text-te-ink-900 dark:text-white">
          {regionName}
        </div>
        <div className="text-xs text-te-ink-700 dark:text-gray-400">
          {countryName}
        </div>
      </div>
    </div>;
};
function getCountryFlag(countryCode: string): string {
  const flagMap: Record<string, string> = {
    GB: '🇬🇧',
    FR: '🇫🇷',
    DE: '🇩🇪',
    ES: '🇪🇸',
    IT: '🇮🇹',
    NL: '🇳🇱',
    BE: '🇧🇪',
    PT: '🇵🇹',
    SE: '🇸🇪',
    DK: '🇩🇰'
  };
  return flagMap[countryCode] || '🏳️';
}
function getCountryName(countryCode: string): string {
  const nameMap: Record<string, string> = {
    GB: 'United Kingdom',
    FR: 'France',
    DE: 'Germany',
    ES: 'Spain',
    IT: 'Italy',
    NL: 'Netherlands',
    BE: 'Belgium',
    PT: 'Portugal',
    SE: 'Sweden',
    DK: 'Denmark'
  };
  return nameMap[countryCode] || 'Unknown';
}