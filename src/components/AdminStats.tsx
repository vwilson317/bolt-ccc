import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Users, MapPin, TrendingUp, Activity, Eye } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const AdminStats: React.FC = () => {
  const { t } = useTranslation();
  const { barracas, emailSubscriptions } = useApp();

  const openBarracas = barracas.filter(b => b.isOpen).length;
  const weatherDependentBarracas = barracas.filter(b => b.weatherDependent).length;
  const locations = [...new Set(barracas.map(b => b.location))].length;

  const stats = [
    {
      title: t('admin.stats.totalBarracas'),
      value: barracas.length,
      icon: MapPin,
      color: 'bg-blue-500',
      change: t('admin.stats.thisMonth')
    },
    {
      title: t('admin.stats.currentlyOpen'),
      value: openBarracas,
      icon: Activity,
      color: 'bg-green-500',
      change: `${Math.round((openBarracas / barracas.length) * 100)}% ${t('admin.stats.openRate')}`
    },
    {
      title: t('admin.stats.emailSubscribers'),
      value: emailSubscriptions.length,
      icon: Users,
      color: 'bg-purple-500',
      change: t('admin.stats.thisWeek')
    },
    {
      title: t('admin.stats.uniqueLocations'),
      value: locations,
      icon: MapPin,
      color: 'bg-orange-500',
      change: t('admin.stats.acrossRio')
    }
  ];

  const recentActivity = [
    { action: 'New subscriber', detail: 'user@example.com subscribed', time: '2 min ago', type: 'subscriber' },
    { action: 'Barraca updated', detail: 'Sol e Mar status changed to open', time: '15 min ago', type: 'update' },
    { action: 'New subscriber', detail: 'beachfan@gmail.com subscribed', time: '1 hour ago', type: 'subscriber' },
    { action: 'Weather update', detail: 'Beach conditions updated to excellent', time: '2 hours ago', type: 'weather' }
  ];

  const barracasByLocation = barracas.reduce((acc, barraca) => {
    acc[barraca.location] = (acc[barraca.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xs text-green-600">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barracas by Location */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{t('admin.stats.barracasByLocation')}</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(barracasByLocation).map(([location, count]) => (
              <div key={location} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{location}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(barracasByLocation))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-6">
            <Activity className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{t('admin.stats.recentActivity')}</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'subscriber' ? 'bg-purple-500' :
                  activity.type === 'update' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500 truncate">{activity.detail}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center mb-6">
          <Eye className="h-5 w-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.stats.systemHealth')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">98.5%</div>
            <div className="text-sm text-gray-600">{t('admin.stats.uptime')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{Math.round((openBarracas / barracas.length) * 100)}%</div>
            <div className="text-sm text-gray-600">{t('admin.stats.openRate')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">{emailSubscriptions.length}</div>
            <div className="text-sm text-gray-600">{t('admin.stats.activeSubscribers')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;