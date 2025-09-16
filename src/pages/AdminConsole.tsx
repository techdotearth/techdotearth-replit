import React, { useState } from 'react';
import { ArrowLeftIcon, AlertCircleIcon, CheckCircleIcon, XIcon } from 'lucide-react';
import { getMockChallenges } from '../data/mockData';
interface AdminConsoleProps {
  onBack: () => void;
}
export const AdminConsole: React.FC<AdminConsoleProps> = ({
  onBack
}) => {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const airQualityChallenges = getMockChallenges('air-quality');
  const heatChallenges = getMockChallenges('heat');
  const floodsChallenges = getMockChallenges('floods');
  const wildfireChallenges = getMockChallenges('wildfire');
  const allChallenges = [...airQualityChallenges, ...heatChallenges, ...floodsChallenges, ...wildfireChallenges];
  const handleSaveOverride = () => {
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };
  return <div>
      <button onClick={onBack} className="inline-flex items-center text-te-primary dark:text-teal-400 hover:underline mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to challenges
      </button>
      <h1 className="text-2xl font-bold text-te-ink-900 dark:text-white mb-6">
        Admin Console
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <HealthCard title="Data Sources" status="healthy" details="All sources reporting normally" />
        <HealthCard title="API Health" status="warning" details="Meteoalarm API: Increased latency" />
        <HealthCard title="Coverage" status="healthy" details="27/27 EU countries covered" />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-te-border dark:border-gray-700">
          <h2 className="font-semibold text-te-ink-900 dark:text-white">
            Challenge Overrides
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-te-muted dark:bg-gray-800 border-b border-te-border dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                  Current Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                  Override
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-te-ink-700 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-te-border dark:divide-gray-700">
              {allChallenges.slice(0, 5).map(challenge => <tr key={challenge.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg" aria-hidden="true">
                        {challenge.countryCode === 'GB' ? '🇬🇧' : challenge.countryCode === 'ES' ? '🇪🇸' : challenge.countryCode === 'FR' ? '🇫🇷' : '🏳️'}
                      </span>
                      <span className="font-medium text-te-ink-900 dark:text-white">
                        {challenge.regionName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${challenge.type === 'air-quality' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : challenge.type === 'heat' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : challenge.type === 'floods' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {challenge.type === 'air-quality' ? 'Air Quality' : challenge.type === 'heat' ? 'Heat' : challenge.type === 'floods' ? 'Floods' : 'Wildfire'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-medium text-te-ink-900 dark:text-white">
                      {challenge.score}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input type="number" min="0" max="100" className="w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-te-border dark:border-gray-700 rounded-md text-te-ink-900 dark:text-white" placeholder="Score" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input type="text" className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-te-border dark:border-gray-700 rounded-md text-te-ink-900 dark:text-white" placeholder="Reason for override" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button onClick={handleSaveOverride} className="px-3 py-1 bg-te-primary dark:bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors">
                      Save
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {showSuccessToast && <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg flex items-start max-w-sm">
          <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
          <div className="flex-grow">
            <p className="font-medium text-green-800 dark:text-green-200">
              Override saved successfully
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              The challenge score has been updated with your override.
            </p>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="flex-shrink-0 ml-2 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300">
            <XIcon className="h-5 w-5" />
          </button>
        </div>}
    </div>;
};
interface HealthCardProps {
  title: string;
  status: 'healthy' | 'warning' | 'error';
  details: string;
}
const HealthCard: React.FC<HealthCardProps> = ({
  title,
  status,
  details
}) => {
  return <div className="bg-white dark:bg-gray-900 rounded-xl border border-te-border dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-te-ink-900 dark:text-white">{title}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm text-te-ink-700 dark:text-gray-400">{details}</p>
    </div>;
};
interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'error';
}
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status
}) => {
  let badgeClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  switch (status) {
    case 'healthy':
      badgeClass += ' bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      break;
    case 'warning':
      badgeClass += ' bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      break;
    case 'error':
      badgeClass += ' bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      break;
  }
  return <span className={badgeClass}>
      {status === 'healthy' && 'Healthy'}
      {status === 'warning' && 'Warning'}
      {status === 'error' && 'Error'}
    </span>;
};