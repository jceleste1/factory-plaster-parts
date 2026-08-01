import React from 'react';

const App: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Manufacturing Tracking System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Real-time production visibility and batch traceability
        </p>
        <div className="text-gray-500">
          <p>Phase 1 Setup: Infrastructure initialized</p>
          <p>Phase 2: Core services and authentication coming next...</p>
        </div>
      </div>
    </div>
  );
};

export default App;
