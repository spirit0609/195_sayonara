import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="bg-royal-600 p-2 rounded-lg text-white mr-3 shadow-sm">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Order Parser</h1>
              <p className="text-xs text-slate-500 font-medium">AI Invoice Assistant for University Accounting</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             <span className="px-3 py-1 bg-royal-50 text-royal-700 text-xs font-semibold rounded-full border border-royal-200">
               Gemini 1.5 Powered
             </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;