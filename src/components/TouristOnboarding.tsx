import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Heart, Leaf, Users, DollarSign, Camera, ArrowRight, Globe } from 'lucide-react';

interface TouristPreferences {
  experienceType: 'authentic' | 'luxury' | 'family' | 'adventure';
  budgetRange: 'budget' | 'mid' | 'premium';
  culturalInterest: boolean;
  sustainabilityFocus: boolean;
  languagePreference: 'en' | 'pt' | 'es';
  interests: string[];
}

interface TouristOnboardingProps {
  onComplete: (preferences: TouristPreferences) => void;
  onSkip: () => void;
}

const TouristOnboarding: React.FC<TouristOnboardingProps> = ({ onComplete, onSkip }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<TouristPreferences>({
    experienceType: 'authentic',
    budgetRange: 'mid',
    culturalInterest: true,
    sustainabilityFocus: false,
    languagePreference: i18n.language as 'en' | 'pt' | 'es',
    interests: []
  });

  const experienceTypes = [
    {
      id: 'authentic',
      title: 'Authentic Local',
      description: 'Experience Rio like a local with traditional barracas',
      icon: Heart,
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 'luxury',
      title: 'Premium Comfort',
      description: 'High-end beach experiences with premium amenities',
      icon: Camera,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'family',
      title: 'Family Friendly',
      description: 'Safe, fun experiences perfect for families',
      icon: Users,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'adventure',
      title: 'Adventure Seeker',
      description: 'Active beach experiences and water sports',
      icon: MapPin,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const budgetRanges = [
    {
      id: 'budget',
      title: 'Budget Conscious',
      description: 'R$ 50-100 per day',
      icon: DollarSign,
      range: 'R$ 50-100'
    },
    {
      id: 'mid',
      title: 'Moderate Spending',
      description: 'R$ 100-250 per day',
      icon: DollarSign,
      range: 'R$ 100-250'
    },
    {
      id: 'premium',
      title: 'Premium Experience',
      description: 'R$ 250+ per day',
      icon: DollarSign,
      range: 'R$ 250+'
    }
  ];

  const interests = [
    'Traditional Food', 'Live Music', 'Water Sports', 'Photography',
    'Local Crafts', 'Nightlife', 'Wellness', 'History & Culture',
    'Beach Volleyball', 'Surfing', 'Yoga', 'Shopping'
  ];

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleComplete = () => {
    onComplete(preferences);
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900" data-lingo-skip>
              Welcome to Rio! 🏖️
            </h2>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 text-sm"
              data-lingo-skip
            >
              Skip
            </button>
          </div>
          <p className="text-gray-600" data-lingo-skip>
            Let's personalize your beach experience in Rio de Janeiro
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 flex space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex-1 h-2 rounded-full ${
                  stepNum <= step ? 'bg-sky-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Experience Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2" data-lingo-skip>
                  What kind of beach experience are you looking for?
                </h3>
                <p className="text-gray-600" data-lingo-skip>
                  Choose the style that best matches your travel preferences
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experienceTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setPreferences(prev => ({ ...prev, experienceType: type.id as any }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        preferences.experienceType === type.id
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{type.title}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Budget Range */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2" data-lingo-skip>
                  What's your daily budget for beach activities?
                </h3>
                <p className="text-gray-600" data-lingo-skip>
                  This helps us recommend barracas in your price range
                </p>
              </div>

              <div className="space-y-3">
                {budgetRanges.map((budget) => {
                  const Icon = budget.icon;
                  return (
                    <button
                      key={budget.id}
                      onClick={() => setPreferences(prev => ({ ...prev, budgetRange: budget.id as any }))}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center ${
                        preferences.budgetRange === budget.id
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{budget.title}</h4>
                        <p className="text-sm text-gray-600">{budget.description}</p>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {budget.range}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Interests & Values */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What matters most to you?
                </h3>
                <p className="text-gray-600">
                  Help us understand your values and interests
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Cultural Immersion</h4>
                      <p className="text-sm text-gray-600">Learn about local traditions and history</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.culturalInterest}
                      onChange={(e) => setPreferences(prev => ({ ...prev, culturalInterest: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center">
                    <Leaf className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Sustainability Focus</h4>
                      <p className="text-sm text-gray-600">Prefer eco-friendly and sustainable options</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.sustainabilityFocus}
                      onChange={(e) => setPreferences(prev => ({ ...prev, sustainabilityFocus: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Specific Interests */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What activities interest you?
                </h3>
                <p className="text-gray-600">
                  Select all that apply - we'll find barracas that match your interests
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      preferences.interests.includes(interest)
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Language Preference</h4>
                    <p className="text-sm text-gray-600">We'll prioritize barracas with staff who speak your language</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  {[
                    { code: 'en', name: 'English', flag: '🇺🇸' },
                    { code: 'pt', name: 'Português', flag: '🇧🇷' },
                    { code: 'es', name: 'Español', flag: '🇪🇸' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setPreferences(prev => ({ ...prev, languagePreference: lang.code as any }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        preferences.languagePreference === lang.code
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Skip Setup
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 flex items-center"
            >
              {step === 4 ? 'Complete Setup' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristOnboarding;