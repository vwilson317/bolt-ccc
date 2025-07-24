import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Users, Eye, MousePointer, TrendingUp, Globe, Cloud, Bell, Calendar, Star, Database, Zap } from 'lucide-react';
import { getAnalyticsStatus } from '../services/analyticsService';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  deviceTypes: Array<{ device: string; percentage: number }>;
  // New metrics
  weatherOverrideUsage: number;
  notificationInteractions: number;
  partneredBarracaViews: number;
  nonPartneredBarracaViews: number;
  weekendHoursViews: number;
  adminActions: number;
  firestoreConnections: number;
  supabaseQueries: number;
  realtimeSubscriptions: number;
  externalApiCalls: number;
  featureUsage: Array<{ feature: string; usage: number }>;
  businessMetrics: Array<{ metric: string; value: number; unit: string }>;
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
    deviceTypes: [],
    weatherOverrideUsage: 0,
    notificationInteractions: 0,
    partneredBarracaViews: 0,
    nonPartneredBarracaViews: 0,
    weekendHoursViews: 0,
    adminActions: 0,
    firestoreConnections: 0,
    supabaseQueries: 0,
    realtimeSubscriptions: 0,
    externalApiCalls: 0,
    featureUsage: [],
    businessMetrics: []
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
          ],
          weatherOverrideUsage: 23,
          notificationInteractions: 156,
          partneredBarracaViews: 789,
          nonPartneredBarracaViews: 458,
          weekendHoursViews: 234,
          adminActions: 45,
          firestoreConnections: 12,
          supabaseQueries: 89,
          realtimeSubscriptions: 34,
          externalApiCalls: 67,
          featureUsage: [
            { feature: 'Weather Widget', usage: 445 },
            { feature: 'Story Viewer', usage: 234 },
            { feature: 'Language Switcher', usage: 123 },
            { feature: 'Email Subscription', usage: 89 },
            { feature: 'PWA Install', usage: 56 }
          ],
          businessMetrics: [
            { metric: 'Total Barracas', value: 45, unit: 'locations' },
            { metric: 'Partnered Barracas', value: 23, unit: 'locations' },
            { metric: 'Active Sessions', value: 156, unit: 'sessions' },
            { metric: 'Avg Response Time', value: 245, unit: 'ms' }
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beach-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Status */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-beach-500" />
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

      {/* New Feature Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Cloud className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Weather Override</p>
              <p className="text-2xl font-bold text-gray-900">{data.weatherOverrideUsage}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{data.notificationInteractions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Star className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Partnered Views</p>
              <p className="text-2xl font-bold text-gray-900">{data.partneredBarracaViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Weekend Hours</p>
              <p className="text-2xl font-bold text-gray-900">{data.weekendHoursViews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Database className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Supabase Queries</p>
              <p className="text-2xl font-bold text-gray-900">{data.supabaseQueries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Realtime Subs</p>
              <p className="text-2xl font-bold text-gray-900">{data.realtimeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">API Calls</p>
              <p className="text-2xl font-bold text-gray-900">{data.externalApiCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Actions</p>
              <p className="text-2xl font-bold text-gray-900">{data.adminActions}</p>
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

      {/* Feature Usage */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h3>
        <div className="space-y-3">
          {data.featureUsage.map((feature, index) => (
            <div key={feature.feature} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                <span className="text-sm text-gray-900 ml-2">{feature.feature}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{feature.usage.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Business Metrics */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.businessMetrics.map((metric) => (
            <div key={metric.metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
              <span className="text-sm font-semibold text-gray-900">
                {metric.value.toLocaleString()} {metric.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Device Types */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2 text-beach-500" />
          Device Types
        </h3>
        <div className="space-y-3">
          {data.deviceTypes.map((device) => (
            <div key={device.device} className="flex items-center justify-between">
              <span className="text-sm text-gray-900">{device.device}</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-beach-500 h-2 rounded-full" 
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