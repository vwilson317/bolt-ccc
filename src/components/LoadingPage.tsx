import React from 'react';

const LoadingPage: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-beach-400 to-beach-600 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8">
          <img 
            src="/logo-text.png" 
            alt="Carioca Coastal Club" 
            className="w-32 h-32 md:w-40 md:h-40 mx-auto animate-pulse"
          />
        </div>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
