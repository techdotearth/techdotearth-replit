import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
const countries = [{
  code: 'GB',
  name: 'United Kingdom',
  flag: '🇬🇧'
}, {
  code: 'FR',
  name: 'France',
  flag: '🇫🇷'
}, {
  code: 'DE',
  name: 'Germany',
  flag: '🇩🇪'
}, {
  code: 'ES',
  name: 'Spain',
  flag: '🇪🇸'
}, {
  code: 'IT',
  name: 'Italy',
  flag: '🇮🇹'
}, {
  code: 'NL',
  name: 'Netherlands',
  flag: '🇳🇱'
}, {
  code: 'BE',
  name: 'Belgium',
  flag: '🇧🇪'
}, {
  code: 'PT',
  name: 'Portugal',
  flag: '🇵🇹'
}, {
  code: 'SE',
  name: 'Sweden',
  flag: '🇸🇪'
}, {
  code: 'DK',
  name: 'Denmark',
  flag: '🇩🇰'
}];
export const CountrySelect: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      setSelectedCountries(selectedCountries.filter(c => c !== code));
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };
  return <div className="space-y-2">
      <label className="block text-sm font-medium text-te-ink-700 dark:text-gray-300">
        Country
      </label>
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-te-border dark:border-gray-700 rounded-lg p-2 text-sm text-te-ink-900 dark:text-white">
          <span>
            {selectedCountries.length === 0 ? 'All countries' : `${selectedCountries.length} selected`}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-te-ink-700 dark:text-gray-400" />
        </button>
        {isOpen && <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-te-border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {countries.map(country => <div key={country.code} className="flex items-center p-2 hover:bg-te-muted dark:hover:bg-gray-700 cursor-pointer" onClick={() => toggleCountry(country.code)}>
                <input type="checkbox" checked={selectedCountries.includes(country.code)} onChange={() => {}} className="mr-2" />
                <span className="mr-2">{country.flag}</span>
                <span className="text-sm text-te-ink-900 dark:text-white">
                  {country.name}
                </span>
              </div>)}
          </div>}
      </div>
    </div>;
};