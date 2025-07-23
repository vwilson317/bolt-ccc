import React from 'react';
import { useApp } from '../contexts/AppContext';
import { FirestoreService, type BarracaStatus } from '../services/firestoreService';

export const FirestoreStatusIndicator: React.FC = () => {
  const { firestoreConnected, barracaStatuses } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`p-3 rounded-lg shadow-lg text-sm font-medium ${
        firestoreConnected 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            firestoreConnected ? 'bg-green-300' : 'bg-red-300'
          }`} />
          <span>
            Firestore: {firestoreConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {firestoreConnected && (
          <div className="mt-1 text-xs opacity-90">
            {barracaStatuses.size} barracas monitored
          </div>
        )}
      </div>
    </div>
  );
};

export default FirestoreStatusIndicator; 