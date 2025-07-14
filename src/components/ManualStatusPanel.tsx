import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, CheckCircle, XCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { BarracaService } from '../services/barracaService';

interface ManualStatusPanelProps {
  onRefresh: () => void;
}

interface BarracaWithManualStatus {
  barracaId: string;
  barracaName: string;
  location: string;
  partnered: boolean;
  manualStatus: string;
  lastUpdated: Date;
}

const ManualStatusPanel: React.FC<ManualStatusPanelProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const [barracas, setBarracas] = useState<BarracaWithManualStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load barracas with manual status on mount
  useEffect(() => {
    loadBarracas();
  }, []);

  const loadBarracas = async () => {
    setLoading(true);
    try {
      const data = await BarracaService.getBarracasWithManualStatus();
      setBarracas(data);
    } catch (error) {
      console.error('Error loading barracas with manual status:', error);
      setMessage({ type: 'error', text: 'Failed to load barracas' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (barracaId: string, newStatus: 'open' | 'closed' | 'undefined') => {
    setLoading(true);
    setMessage(null);
    
    try {
      await BarracaService.setManualStatus(barracaId, newStatus);
      setMessage({ type: 'success', text: 'Status updated successfully!' });
      await loadBarracas(); // Refresh the list
      onRefresh(); // Refresh the main barracas list
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
      console.error('Error updating manual status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'undefined':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      case 'undefined':
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manual Status Management</h2>
            <p className="text-sm text-gray-600">Set open/closed status for non-partnered barracas</p>
          </div>
        </div>
        
        <button
          onClick={loadBarracas}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Undefined:</strong> Status not determined yet (default)</li>
          <li>• <strong>Open:</strong> Manually set as open (overrides business hours)</li>
          <li>• <strong>Closed:</strong> Manually set as closed (overrides business hours)</li>
          <li>• Only applies to non-partnered barracas</li>
          <li>• Partnered barracas use business hours only</li>
        </ul>
      </div>

      {/* Barraca List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading && barracas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Loading barracas...</p>
          </div>
        ) : barracas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No non-partnered barracas found.</p>
          </div>
        ) : (
          barracas.map((barraca) => (
            <div key={barraca.barracaId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {barraca.barracaName}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(barraca.manualStatus)}`}>
                      {getStatusIcon(barraca.manualStatus)}
                      <span className="ml-1 capitalize">{barraca.manualStatus}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{barraca.location}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {barraca.lastUpdated.toLocaleDateString()} {barraca.lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={barraca.manualStatus}
                    onChange={(e) => handleStatusChange(barraca.barracaId, e.target.value as 'open' | 'closed' | 'undefined')}
                    disabled={loading}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="undefined">Undefined</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManualStatusPanel; 