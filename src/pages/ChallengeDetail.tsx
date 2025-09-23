import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, AlertTriangleIcon, UserIcon, LeafIcon } from 'lucide-react';
import { MiniMapPanel } from '../components/MiniMapPanel';
import { TrendSparkCard } from '../components/TrendSparkCard';
import { AdminNoteInline } from '../components/AdminNoteInline';
import { ChallengeType } from '../App';
import { getChallengeDetail, Challenge } from '../services/api';
interface ChallengeDetailProps {
  challengeId: string;
  challengeType: ChallengeType;
  onBack: () => void;
}
export const ChallengeDetail: React.FC<ChallengeDetailProps> = ({
  challengeId,
  challengeType,
  onBack
}) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract region code from challengeId (format: "type-regionCode")
  const regionCode = challengeId.split('-')[1] || challengeId;

  useEffect(() => {
    const fetchChallengeDetail = async () => {
      setLoading(true);
      try {
        console.log(`🔄 Fetching challenge detail for ${challengeType}/${regionCode}`);
        const data = await getChallengeDetail(challengeType, regionCode);
        setChallenge(data);
        console.log(`✅ Loaded challenge detail:`, data);
      } catch (error) {
        console.error('❌ Failed to fetch challenge detail:', error);
        setChallenge(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeDetail();
  }, [challengeType, regionCode]);

  if (loading) {
    return <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-te-ink-900 dark:text-white mb-2">
          Loading challenge details...
        </h2>
      </div>;
  }
  if (!challenge) {
    return <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-te-ink-900 dark:text-white mb-2">
          Challenge not found
        </h2>
        <button onClick={onBack} className="inline-flex items-center text-te-primary dark:text-teal-400 hover:underline">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to challenges
        </button>
      </div>;
  }
  const getTagColor = () => {
    switch (challengeType) {
      case 'air-quality':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'heat':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'floods':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'wildfire':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };
  const getTagIcon = () => {
    switch (challengeType) {
      case 'air-quality':
        return <AlertTriangleIcon className="h-4 w-4 mr-1.5" />;
      case 'heat':
        return <AlertTriangleIcon className="h-4 w-4 mr-1.5" />;
      case 'floods':
        return <AlertTriangleIcon className="h-4 w-4 mr-1.5" />;
      case 'wildfire':
        return <AlertTriangleIcon className="h-4 w-4 mr-1.5" />;
    }
  };
  const getChallengeTypeLabel = () => {
    switch (challengeType) {
      case 'air-quality':
        return 'Air Quality';
      case 'heat':
        return 'Heat';
      case 'floods':
        return 'Floods';
      case 'wildfire':
        return 'Wildfire';
    }
  };
  const getExplainerText = () => {
    switch (challengeType) {
      case 'air-quality':
        return '27% of stations poor/very poor for PM2.5; ≈ 6.2M residents affected (7d).';
      case 'heat':
        return 'Orange heat warning across 42% of Andalucía; ≈ 1.3M people exposed (24h).';
      case 'floods':
        return '5 active flood warnings in East Midlands; ≈ 120k people in affected areas (48h).';
      case 'wildfire':
        return 'High-confidence VIIRS detections clustered near Evros; ≈ 85k residents within 10km (72h).';
    }
  };
  const getTimeWindow = () => {
    switch (challengeType) {
      case 'air-quality':
        return '7d';
      case 'heat':
        return '24h';
      case 'floods':
        return '48h';
      case 'wildfire':
        return '72h';
    }
  };
  return <div>
      <button onClick={onBack} className="inline-flex items-center text-te-primary dark:text-teal-400 hover:underline mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to challenges
      </button>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTagColor()}`}>
              {getTagIcon()}
              {getChallengeTypeLabel()}
            </span>
            <h1 className="text-xl font-bold text-te-ink-900 dark:text-white">
              {challenge.regionName}
            </h1>
            <span className="text-lg" aria-hidden="true">
              {challenge.countryCode === 'GB' ? '🇬🇧' : challenge.countryCode === 'ES' ? '🇪🇸' : challenge.countryCode === 'FR' ? '🇫🇷' : '🏳️'}
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium ml-auto">
              <UserIcon className="h-4 w-4 mr-1.5" />
              People
            </span>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="bg-te-muted dark:bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-te-ink-900 dark:text-white">
                    {challenge.score}
                  </div>
                  <div className="text-sm text-te-ink-700 dark:text-gray-400">
                    As of 13:00 BST · Window: {getTimeWindow()}
                  </div>
                </div>
                <MiniMapPanel challengeType={challengeType} regionName={challenge.regionName} />
              </div>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-te-ink-900 dark:text-white">
                  What's Happening
                </h2>
                <p className="text-te-ink-900 dark:text-white">
                  {getExplainerText()}
                </p>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-te-ink-700 dark:text-gray-400">
                    Sources
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {challenge.sources.map(source => <div key={source} className="inline-flex items-center px-3 py-1 bg-te-muted dark:bg-gray-800 rounded-lg text-sm text-te-ink-700 dark:text-gray-400">
                        {source}
                      </div>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-80">
              <div className="bg-white dark:bg-gray-900 border border-te-border dark:border-gray-700 rounded-xl overflow-hidden mb-6">
                <div className="bg-te-muted dark:bg-gray-800 px-4 py-3 border-b border-te-border dark:border-gray-700">
                  <h2 className="font-medium text-te-ink-900 dark:text-white">
                    Inputs Breakdown
                  </h2>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-te-ink-700 dark:text-gray-400">
                        Intensity
                      </span>
                      <span className="text-sm font-medium text-te-ink-900 dark:text-white">
                        {challenge.intensity?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="h-2 bg-te-muted dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-te-primary dark:bg-teal-500" style={{
                      width: `${Math.round((challenge.intensity || 0) * 100)}%`
                    }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-te-ink-700 dark:text-gray-400">
                        Exposure
                      </span>
                      <span className="text-sm font-medium text-te-ink-900 dark:text-white">
                        {challenge.exposure?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="h-2 bg-te-muted dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-te-primary dark:bg-teal-500" style={{
                      width: `${Math.round((challenge.exposure || 0) * 100)}%`
                    }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-te-ink-700 dark:text-gray-400">
                        Persistence
                      </span>
                      <span className="text-sm font-medium text-te-ink-900 dark:text-white">
                        {challenge.persistence?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="h-2 bg-te-muted dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-te-primary dark:bg-teal-500" style={{
                      width: `${Math.round((challenge.persistence || 0) * 100)}%`
                    }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <TrendSparkCard challengeType={challengeType} />
              {challenge.hasOverride && challenge.overrideNote && <AdminNoteInline overrideValue={challenge.score} note={challenge.overrideNote} />}
            </div>
          </div>
        </div>
      </div>
    </div>;
};