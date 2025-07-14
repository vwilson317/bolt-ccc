import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const EmailSubscription: React.FC = () => {
  const { t } = useTranslation();
  const { subscribeEmail } = useApp();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage(t('email.error'));
      return;
    }

    setStatus('loading');
    
    try {
      const success = await subscribeEmail(email);
      if (success) {
        setStatus('success');
        setMessage(t('email.success'));
        setEmail('');
      } else {
        setStatus('error');
        setMessage(t('email.failed') || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Email subscription error:', error);
      setStatus('error');
      setMessage(t('email.error') || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email.placeholder')}
            disabled={status === 'loading' || status === 'success'}
            className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-0 shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none transition-all duration-200 disabled:opacity-50"
          />
        </div>
        
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="w-full bg-gradient-to-r from-white to-gray-100 text-beach-600 py-4 rounded-xl font-semibold text-lg hover:from-gray-100 hover:to-gray-200 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:transform-none flex items-center justify-center"
        >
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-beach-600 mr-2"></div>
          )}
          {status === 'success' && <Check className="h-5 w-5 mr-2" />}
          {status === 'loading' ? t('email.joining') : status === 'success' ? t('email.welcome') : t('email.submit')}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-4 rounded-xl flex items-center ${
          status === 'success' 
            ? 'bg-green-100/20 border border-green-300/30 text-green-100' 
            : 'bg-red-100/20 border border-red-300/30 text-red-100'
        }`}>
          {status === 'success' ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <span className="text-sm">{message}</span>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-700 font-medium" data-lingo-skip>
          {t('email.benefits')}
        </p>
      </div>
    </div>
  );
};

export default EmailSubscription;