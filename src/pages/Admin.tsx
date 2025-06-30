import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Plus, Edit2, Trash2, Eye, EyeOff, Users, Mail, BarChart3 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import AdminBarracaForm from '../components/AdminBarracaForm';
import AdminStats from '../components/AdminStats';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const { 
    isAdmin, 
    adminLogin, 
    adminLogout, 
    barracas, 
    deleteBarraca,
    emailSubscriptions 
  } = useApp();
  const { trackAdminLogin, trackAdminAction } = useAnalytics();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'barracas' | 'stats' | 'emails' | 'analytics'>('barracas');
  const [editingBarraca, setEditingBarraca] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);
    setLoginError('');

    try {
      const success = await adminLogin(email, password);
      trackAdminLogin(success);
      if (!success) {
        setLoginError('Invalid credentials. Try admin@cariocacoastal.com / admin123');
      }
    } catch (error) {
      trackAdminLogin(false);
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteBarraca = (id: string) => {
    if (window.confirm('Are you sure you want to delete this barraca?')) {
      trackAdminAction('Delete Barraca', `Barraca ID: ${id}`);
      deleteBarraca(id);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('admin.login')}
            </h1>
            <p className="text-gray-600">
              Access the admin dashboard to manage barracas
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="admin@cariocacoastal.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="admin123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLogging}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              {isLogging ? t('common.loading') : t('admin.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {t('admin.credentials')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('admin.dashboard')}
            </h1>
            <button
              onClick={adminLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('barracas')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'barracas'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Edit2 className="h-4 w-4 inline mr-2" />
                {t('admin.manageBarracas')}
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'stats'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                {t('admin.stats')}
              </button>
              <button
                onClick={() => setActiveTab('emails')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'emails'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                {t('admin.emails')} ({emailSubscriptions.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'barracas' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('admin.manageBarracas')}
              </h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.addBarraca')}
              </button>
            </div>

            {(showForm || editingBarraca) && (
              <div className="mb-8">
                <AdminBarracaForm 
                  barracaId={editingBarraca}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingBarraca(null);
                  }}
                  onSave={() => {
                    setShowForm(false);
                    setEditingBarraca(null);
                  }}
                />
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.table.barraca')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.table.location')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.table.availability')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.table.updated')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {barracas.map((barraca) => (
                      <tr key={barraca.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={barraca.images[0]}
                              alt={barraca.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {barraca.name}
                              </div>
                              {barraca.barracaNumber && (
                                <div className="text-xs text-gray-500">
                                  #{barraca.barracaNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {barraca.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            barraca.isOpen
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {barraca.isOpen ? t('barraca.open') : t('barraca.closed')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {barraca.updatedAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingBarraca(barraca.id)}
                              className="text-orange-600 hover:text-orange-900 p-1"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBarraca(barraca.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && <AdminStats />}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'emails' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('admin.emails')}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.table.email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.table.subscribed')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.table.preferences')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emailSubscriptions.map((subscription, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subscription.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscription.subscribedAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {subscription.preferences.newBarracas && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              New Spots
                            </span>
                          )}
                          {subscription.preferences.specialOffers && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                              Offers
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;