import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Save, X } from 'lucide-react';
import { BarracaService } from '../services/barracaService';

interface WeekendHoursFormProps {
  barracaId: string;
  barracaName: string;
  isEnabled: boolean;
  onSave: () => void;
  onCancel: () => void;
}

interface WeekendHours {
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

const WeekendHoursForm: React.FC<WeekendHoursFormProps> = ({
  barracaId,
  barracaName,
  isEnabled,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState<WeekendHours>({
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '10:00', close: '19:00' },
    sunday: { open: '11:00', close: '17:00' }
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await BarracaService.setWeekendHours(
        barracaId,
        hours.friday.open,
        hours.friday.close,
        hours.saturday.open,
        hours.saturday.close,
        hours.sunday.open,
        hours.sunday.close
      );

      setMessage({ type: 'success', text: 'Weekend hours saved successfully!' });
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save weekend hours' });
      console.error('Error saving weekend hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await BarracaService.disableWeekendHours(barracaId);
      setMessage({ type: 'success', text: 'Weekend hours disabled successfully!' });
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disable weekend hours' });
      console.error('Error disabling weekend hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHours = (day: keyof WeekendHours, field: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00', '23:00', '00:00'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Weekend Hours</h2>
            <p className="text-sm text-gray-600">{barracaName}</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Weekend Hours Form */}
      <div className="space-y-6">
        {/* Friday */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2">FRI</span>
            Friday
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
              <select
                value={hours.friday.open}
                onChange={(e) => updateHours('friday', 'open', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
              <select
                value={hours.friday.close}
                onChange={(e) => updateHours('friday', 'close', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Saturday */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-2">SAT</span>
            Saturday
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
              <select
                value={hours.saturday.open}
                onChange={(e) => updateHours('saturday', 'open', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
              <select
                value={hours.saturday.close}
                onChange={(e) => updateHours('saturday', 'close', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sunday */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm mr-2">SUN</span>
            Sunday
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
              <select
                value={hours.sunday.open}
                onChange={(e) => updateHours('sunday', 'open', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
              <select
                value={hours.sunday.close}
                onChange={(e) => updateHours('sunday', 'close', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Save Weekend Hours</span>
          </button>
          
          {isEnabled && (
            <button
              onClick={handleDisable}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Disable Weekend Hours
            </button>
          )}
        </div>
        
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          About Weekend Hours
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Weekend hours override regular business hours for Friday, Saturday, and Sunday</li>
          <li>• Times are in local timezone (America/Sao_Paulo)</li>
          <li>• When enabled, these hours take precedence over daily schedules</li>
          <li>• You can disable weekend hours to return to regular daily schedules</li>
        </ul>
      </div>
    </div>
  );
};

export default WeekendHoursForm; 