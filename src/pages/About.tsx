import React from 'react';
import { ArrowLeftIcon, HelpCircleIcon, BarChartIcon, ClockIcon, DatabaseIcon } from 'lucide-react';
interface AboutProps {
  onBack: () => void;
}
export const About: React.FC<AboutProps> = ({
  onBack
}) => {
  return <div>
      <button onClick={onBack} className="inline-flex items-center text-te-primary dark:text-teal-400 hover:underline mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to challenges
      </button>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-te-ink-900 dark:text-white mb-4">
            About Tech.Earth
          </h1>
          <p className="text-lg text-te-ink-700 dark:text-gray-400">
            Understanding the challenges affecting people and nature across the
            UK and EU
          </p>
        </div>
        <div className="space-y-12">
          <section className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 p-6">
            <div className="flex items-start mb-4">
              <div className="bg-te-muted dark:bg-gray-800 p-2 rounded-lg mr-4">
                <HelpCircleIcon className="h-6 w-6 text-te-primary dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-te-ink-900 dark:text-white mb-2">
                  How It Works
                </h2>
                <p className="text-te-ink-700 dark:text-gray-400">
                  Tech.Earth continuously monitors environmental challenges
                  across the UK and EU, providing real-time insights into air
                  quality, heat, floods, and wildfires. Our platform aggregates
                  data from multiple authoritative sources to give you a
                  comprehensive view of the challenges affecting people and
                  nature.
                </p>
              </div>
            </div>
          </section>
          <section className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 p-6">
            <div className="flex items-start mb-4">
              <div className="bg-te-muted dark:bg-gray-800 p-2 rounded-lg mr-4">
                <BarChartIcon className="h-6 w-6 text-te-primary dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-te-ink-900 dark:text-white mb-2">
                  Score Computation
                </h2>
                <p className="text-te-ink-700 dark:text-gray-400 mb-4">
                  Our challenge scores (0-100) are calculated using three key
                  factors:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="bg-te-muted dark:bg-gray-800 text-te-ink-900 dark:text-white h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-medium text-te-ink-900 dark:text-white">
                        Intensity
                      </span>
                      <p className="text-sm text-te-ink-700 dark:text-gray-400">
                        How severe the challenge is relative to historical norms
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-te-muted dark:bg-gray-800 text-te-ink-900 dark:text-white h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                      2
                    </span>
                    <div>
                      <span className="font-medium text-te-ink-900 dark:text-white">
                        Exposure
                      </span>
                      <p className="text-sm text-te-ink-700 dark:text-gray-400">
                        The number of people or natural assets potentially
                        affected
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-te-muted dark:bg-gray-800 text-te-ink-900 dark:text-white h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                      3
                    </span>
                    <div>
                      <span className="font-medium text-te-ink-900 dark:text-white">
                        Persistence
                      </span>
                      <p className="text-sm text-te-ink-700 dark:text-gray-400">
                        How long the challenge has been active and is expected
                        to continue
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 p-6">
            <div className="flex items-start mb-4">
              <div className="bg-te-muted dark:bg-gray-800 p-2 rounded-lg mr-4">
                <ClockIcon className="h-6 w-6 text-te-primary dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-te-ink-900 dark:text-white mb-2">
                  Data Freshness
                </h2>
                <p className="text-te-ink-700 dark:text-gray-400 mb-4">
                  We categorize data freshness to help you understand how
                  current the information is:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="font-medium text-te-ink-900 dark:text-white mr-2">
                      Live:
                    </span>
                    <span className="text-sm text-te-ink-700 dark:text-gray-400">
                      Updated within the last hour
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                    <span className="font-medium text-te-ink-900 dark:text-white mr-2">
                      Today:
                    </span>
                    <span className="text-sm text-te-ink-700 dark:text-gray-400">
                      Updated within the last 24 hours
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                    <span className="font-medium text-te-ink-900 dark:text-white mr-2">
                      Week:
                    </span>
                    <span className="text-sm text-te-ink-700 dark:text-gray-400">
                      Updated within the last 7 days
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                    <span className="font-medium text-te-ink-900 dark:text-white mr-2">
                      Stale:
                    </span>
                    <span className="text-sm text-te-ink-700 dark:text-gray-400">
                      Older than 7 days
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 p-6">
            <div className="flex items-start mb-4">
              <div className="bg-te-muted dark:bg-gray-800 p-2 rounded-lg mr-4">
                <DatabaseIcon className="h-6 w-6 text-te-primary dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-te-ink-900 dark:text-white mb-2">
                  Data Sources
                </h2>
                <p className="text-te-ink-700 dark:text-gray-400 mb-4">
                  Our data comes from multiple authoritative sources:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium text-te-ink-900 dark:text-white mr-2">
                      EEA:
                    </span>
                    <span className="text-sm text-te-ink-700 dark:text-gray-400">
                      European Environment Agency air quality data
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-te-ink-900 dark:text-white mr-2">
                      Meteoalarm:
                    </span>
                    <span className="text-sm text-te-ink-700 dark:text-gray-400">
                      European weather alerts
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-te-ink-900 dark:text-white mr-2">
                      EA:
                    </span>
                    <span className="text-sm text-te-ink-700 dark:text-gray-400">
                      UK Environment Agency flood data
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-te-ink-900 dark:text-white mr-2">
                      GloFAS:
                    </span>
                    <span className="text-sm text-te-ink-700 dark:text-gray-400">
                      Global Flood Awareness System
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-te-ink-900 dark:text-white mr-2">
                      FIRMS:
                    </span>
                    <span className="text-sm text-te-ink-700 dark:text-gray-400">
                      Fire Information for Resource Management System
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section className="bg-white dark:bg-gray-900 rounded-2xl border border-te-border dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-te-ink-900 dark:text-white mb-4 text-center">
              Contact Us
            </h2>
            <p className="text-center text-te-ink-700 dark:text-gray-400 mb-4">
              Have questions or feedback about Tech.Earth?
            </p>
            <div className="flex justify-center">
              <button className="px-4 py-2 bg-te-primary dark:bg-teal-600 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors">
                Get in Touch
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>;
};