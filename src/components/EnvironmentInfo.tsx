import React, { useState } from 'react';
import { Info, Database, Settings, Shield } from 'lucide-react';
import { environmentInfo } from '../lib/supabase';
import { getEnvironmentConfig, isFeatureEnabled } from '../utils/environmentUtils';

const EnvironmentInfo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const config = getEnvironmentConfig();

  // Only show in non-production environments
  if (config.isProduction) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Environment Info"
      >
        <Info className="h-5 w-5" />
      </button>

      {/* Environment Info Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              Environment Info
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Environment Details */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">Current Environment</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{config.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Schema:</span>
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">{config.schema}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">URL:</span>
                  <span className="font-mono text-xs truncate max-w-32" title={environmentInfo.url}>
                    {environmentInfo.url.split('//')[1]?.split('.')[0]}...
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                Feature Flags
              </h4>
              <div className="space-y-1 text-sm">
                {Object.entries(config.allowedFeatures).map(([feature, enabled]) => (
                  <div key={feature} className="flex justify-between items-center">
                    <span className="text-gray-600 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {enabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Retention */}
            <div className="bg-yellow-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Data Retention
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stories:</span>
                  <span className="font-medium">{config.dataRetention.stories} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weather Cache:</span>
                  <span className="font-medium">{config.dataRetention.weatherCache} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visitor Data:</span>
                  <span className="font-medium">{config.dataRetention.visitorData} days</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {isFeatureEnabled('debugMode') && (
              <div className="bg-purple-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">Debug Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      console.log('Environment Config:', config);
                      console.log('Supabase Info:', environmentInfo);
                    }}
                    className="w-full text-left text-sm text-purple-600 hover:text-purple-800 py-1"
                  >
                    Log Environment to Console
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full text-left text-sm text-red-600 hover:text-red-800 py-1"
                  >
                    Clear Storage & Reload
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Environment info only visible in non-production
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default EnvironmentInfo;