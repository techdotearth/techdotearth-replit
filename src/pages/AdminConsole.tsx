import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, AlertCircleIcon, CheckCircleIcon, XIcon } from 'lucide-react';
import { getAllChallenges, submitAdminOverride, Challenge } from '../services/api';
interface AdminConsoleProps {
  onBack: () => void;
}
export const AdminConsole: React.FC<AdminConsoleProps> = ({
  onBack
}) => {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [overrideValues, setOverrideValues] = useState<Record<string, { score: string; note: string }>>({});

  // Fetch all challenges when component mounts
  useEffect(() => {
    const fetchAllChallenges = async () => {
      setLoading(true);
      try {
        console.log('🔄 Fetching all challenges for admin console');
        const data = await getAllChallenges();
        setAllChallenges(data);
        console.log(`✅ Loaded ${data.length} challenges for admin console`);
      } catch (error) {
        console.error('❌ Failed to fetch challenges for admin console:', error);
        setAllChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllChallenges();
  }, []);
  const handleSaveOverride = async (challenge: Challenge) => {
    const overrideData = overrideValues[challenge.id];
    if (!overrideData?.score || !overrideData?.note) {
      alert('Please enter both a score and a note for the override.');
      return;
    }

    const score = parseInt(overrideData.score);
    if (isNaN(score) || score < 0 || score > 100) {
      alert('Please enter a valid score between 0 and 100.');
      return;
    }

    try {
      console.log(`🔄 Submitting override for ${challenge.type}/${challenge.regionCode}: ${score}`);
      const success = await submitAdminOverride(challenge.type, challenge.regionCode, score, overrideData.note);
      
      if (success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
        }, 3000);
        
        // Clear the input values for this challenge
        setOverrideValues(prev => ({
          ...prev,
          [challenge.id]: { score: '', note: '' }
        }));
        
        // Refresh the challenges list
        const data = await getAllChallenges();
        setAllChallenges(data);
        
        console.log(`✅ Successfully submitted override for ${challenge.type}/${challenge.regionCode}`);
      } else {
        alert('Failed to save override. Please try again.');
      }
    } catch (error) {
      console.error('❌ Failed to save override:', error);
      alert('Failed to save override. Please try again.');
    }
  };

  const updateOverrideValue = (challengeId: string, field: 'score' | 'note', value: string) => {
    setOverrideValues(prev => ({
      ...prev,
      [challengeId]: {
        ...prev[challengeId],
        [field]: value
      }
    }));
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-te-ink-700 dark:text-gray-400">
                    Loading challenges...
                  </td>
                </tr>
              ) : allChallenges.slice(0, 10).map(challenge => <tr key={challenge.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg" aria-hidden="true">
                        {challenge.countryCode === 'GB' ? '🇬🇧' : 
                         challenge.countryCode === 'ES' ? '🇪🇸' : 
                         challenge.countryCode === 'FR' ? '🇫🇷' : 
                         challenge.countryCode === 'DE' ? '🇩🇪' : 
                         challenge.countryCode === 'IT' ? '🇮🇹' : 
                         challenge.countryCode === 'NL' ? '🇳🇱' : 
                         challenge.countryCode === 'BE' ? '🇧🇪' : 
                         challenge.countryCode === 'PT' ? '🇵🇹' : 
                         challenge.countryCode === 'SE' ? '🇸🇪' : 
                         challenge.countryCode === 'DK' ? '🇩🇰' : '🏳️'}
                      </span>
                      <span className="font-medium text-te-ink-900 dark:text-white">
                        {challenge.regionName}
                      </span>
                      {challenge.hasOverride && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Override Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      challenge.type === 'air-quality' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 
                      challenge.type === 'heat' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 
                      challenge.type === 'floods' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {challenge.type === 'air-quality' ? 'Air Quality' : 
                       challenge.type === 'heat' ? 'Heat' : 
                       challenge.type === 'floods' ? 'Floods' : 'Wildfire'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-medium text-te-ink-900 dark:text-white">
                      {challenge.score}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={overrideValues[challenge.id]?.score || ''}
                      onChange={(e) => updateOverrideValue(challenge.id, 'score', e.target.value)}
                      className="w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-te-border dark:border-gray-700 rounded-md text-te-ink-900 dark:text-white" 
                      placeholder="Score" 
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input 
                      type="text" 
                      value={overrideValues[challenge.id]?.note || ''}
                      onChange={(e) => updateOverrideValue(challenge.id, 'note', e.target.value)}
                      className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-te-border dark:border-gray-700 rounded-md text-te-ink-900 dark:text-white" 
                      placeholder="Reason for override" 
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleSaveOverride(challenge)} 
                      className="px-3 py-1 bg-te-primary dark:bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors">
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