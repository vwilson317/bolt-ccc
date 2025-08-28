import React, { useState } from 'react';
import { CTAButtonConfig } from '../types';
import { handleCTAButtonClick } from '../utils/ctaButtonUtils';

const InstagramCTATest: React.FC = () => {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  // Sample barraca for testing
  const sampleBarraca = {
    id: 'test-barraca',
    name: 'Test Barraca',
    location: 'Copacabana',
    description: 'Test description',
    isOpen: true,
    partnered: true,
    weatherDependent: false,
    coordinates: { lat: -22.9711, lng: -43.1822 },
    typicalHours: '9:00 - 18:00',
    photos: { horizontal: [''], vertical: [''] },
    menuPreview: [],
    contact: { phone: '', email: '', website: '' },
    amenities: [],
    ctaButtons: []
  };

  const testInstagramButton = () => {
    if (!instagramUrl.trim()) {
      setTestResults(['Please enter an Instagram URL']);
      return;
    }

    const results: string[] = [];
    
    // Create test button
    const testButton: CTAButtonConfig = {
      id: 'test-instagram',
      text: 'Follow on Instagram',
      action: {
        type: 'ig',
        value: instagramUrl,
        target: '_blank',
        trackingEvent: 'test_instagram_clicked'
      },
      style: 'outline',
      position: 1,
      visibilityConditions: {},
      icon: 'Instagram',
      enabled: true
    };

    results.push(`Testing Instagram button with URL: ${instagramUrl}`);
    
    try {
      // Test the click handler
      handleCTAButtonClick(testButton.action, sampleBarraca);
      results.push('✅ Instagram button click handled successfully');
    } catch (error) {
      results.push(`❌ Error handling Instagram button click: ${error}`);
    }

    setTestResults(results);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Instagram CTA Button Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram URL or Username
          </label>
          <input
            type="text"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="e.g., @username, username, or https://instagram.com/username"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={testInstagramButton}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
        >
          Test Instagram Button
        </button>

        {testResults.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Test Results:</h4>
            <ul className="space-y-1">
              {testResults.map((result, index) => (
                <li key={index} className="text-sm text-gray-700">{result}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Supported Formats:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• @username</li>
            <li>• username</li>
            <li>• instagram.com/username</li>
            <li>• https://instagram.com/username</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InstagramCTATest;
