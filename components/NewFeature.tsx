'use client';

import React from 'react';

interface NewFeatureProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const NewFeature: React.FC<NewFeatureProps> = ({ 
  title = "新機能", 
  description = "最新の機能をご紹介します",
  children 
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
          <span className="text-sm font-bold">新</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      {children && (
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default NewFeature;
