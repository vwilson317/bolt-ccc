import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Users, Eye, MousePointer, TrendingUp, Globe } from 'lucide-react';
import { getAnalyticsStatus } from '../services/analyticsService';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  deviceTypes: Array<{ device: string; percentage: number }>;
}

const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [analyticsStatus, setAnalyticsStatus] = useState(getAnalyticsStatus());
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    pageViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    deviceTypes: []
  });

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      
      // In a real implementation, you would fetch data from Google Analytics API
      // For now, we'll simulate some data
      setTimeout(() => {
        setData({
          pageViews: 1247,
          uniqueVisitors: 892,
          bounceRate: 34.2,
          avgSessionDuration: 145,
          topPages: [
            { page: '/', views: 456 },
            { page: '/discover', views: 234 },
            { page: '/about', views: 123 },
            { page: '/admin', views: 89 }
          ],
          deviceTypes: [
            { device: 'Mobile', percentage: 68 },
            { device: 'Desktop', percentage: 28 },
            { device: 'Tablet', percentage: 4 }
          ]
        });
        setIsLoading(false);
      }, 1000);
    };

    loadAnalyticsData();
  }, []);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Status */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-orange-500" />
          Analytics Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${analyticsStatus.isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              Status: {analyticsStatus.isInitialized ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            GA ID: {analyticsStatus.measurementId}
          </div>
          <div className="text-sm text-gray-600">
            Environment: {analyticsStatus.environment}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-gray-900">{data.pageViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{data.uniqueVisitors.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MousePointer className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.bounceRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Session</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(data.avgSessionDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
        <div className="space-y-3">
          {data.topPages.map((page, index) => (
            <div key={page.page} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                <span className="text-sm text-gray-900 ml-2">{page.page}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Device Types */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2 text-orange-500" />
          Device Types
        </h3>
        <div className="space-y-3">
          {data.deviceTypes.map((device) => (
            <div key={device.device} className="flex items-center justify-between">
              <span className="text-sm text-gray-900">{device.device}</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${device.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{device.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a demo dashboard. In production, you would integrate with the Google Analytics API to fetch real-time data.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 