import React, { useState } from 'react';
import { Book, MapPin, Clock, Users, Heart, ChevronDown, ChevronUp } from 'lucide-react';

interface CulturalInfo {
  history: string;
  traditions: string[];
  localTips: string[];
  culturalSignificance: string;
  bestTimeToVisit: string;
  localEtiquette: string[];
  languageHelp: {
    phrase: string;
    pronunciation: string;
    meaning: string;
  }[];
}

interface CulturalContextProps {
  barracaName: string;
  location: string;
  culturalInfo: CulturalInfo;
  className?: string;
}

const CulturalContext: React.FC<CulturalContextProps> = ({ 
  barracaName, 
  location, 
  culturalInfo,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'tips' | 'language'>('history');

  const tabs = [
    { id: 'history', label: 'History & Culture', icon: Book },
    { id: 'tips', label: 'Local Tips', icon: MapPin },
    { id: 'language', label: 'Language Help', icon: Users }
  ];

  return (
    <div className={`bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 ${className}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <Heart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Cultural Context: {location}
              </h3>
              <p className="text-sm text-gray-600">
                Learn about the local culture and traditions
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 border border-orange-100">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Best Time to Visit</span>
              </div>
              <p className="text-sm text-gray-600">{culturalInfo.bestTimeToVisit}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-100">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Cultural Significance</span>
              </div>
              <p className="text-sm text-gray-600">{culturalInfo.culturalSignificance}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-orange-200 mb-4">
            <nav className="flex space-x-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">History</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {culturalInfo.history}
                  </p>
                </div>
                
                {culturalInfo.traditions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Local Traditions</h4>
                    <ul className="space-y-2">
                      {culturalInfo.traditions.map((tradition, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{tradition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Local Tips</h4>
                  <div className="space-y-3">
                    {culturalInfo.localTips.map((tip, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-orange-100">
                        <p className="text-sm text-gray-600">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {culturalInfo.localEtiquette.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Local Etiquette</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {culturalInfo.localEtiquette.map((rule, index) => (
                        <div key={index} className="flex items-center bg-white rounded-lg p-2 border border-orange-100">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'language' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Helpful Portuguese Phrases</h4>
                  <div className="space-y-3">
                    {culturalInfo.languageHelp.map((phrase, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-orange-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{phrase.phrase}</p>
                            <p className="text-sm text-gray-500 italic">"{phrase.pronunciation}"</p>
                          </div>
                          <button className="text-orange-600 hover:text-orange-700 text-sm font-medium ml-4">
                            🔊
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">{phrase.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Most barraca staff speak some English, but they appreciate when tourists try to speak Portuguese!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CulturalContext;