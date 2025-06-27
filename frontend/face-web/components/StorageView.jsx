import React from 'react';
import { Database, FileText, Image as ImageIcon, Folder } from 'lucide-react';

const StorageView = ({ 
  storageUsage, 
  loadingStorage, 
  handleUpgradeStorage, 
  handleCleanFiles 
}) => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-gray-800/60 rounded-2xl p-6 space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Storage Management</h3>
        <div className="bg-gray-900/30 rounded-xl p-5">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Your Storage</span>
              {loadingStorage ? (
                <span>...</span>
              ) : (
                <span>{storageUsage.used.toFixed(1)} MB of {storageUsage.total} MB used</span>
              )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              {!loadingStorage && (
                <div 
                  className="progress-bar h-3 rounded-full" 
                  style={{ width: `${Math.min(100, (storageUsage.used / storageUsage.total) * 100)}%` }}
                ></div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Upgrade Storage</h4>
                <p className="text-sm text-gray-400">Get more space for your files</p>
              </div>
              <button 
                onClick={handleUpgradeStorage}
                className="btn-primary px-4 py-2"
              >
                Upgrade Plan
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">File Cleanup</h4>
                <p className="text-sm text-gray-400">Remove unnecessary files</p>
              </div>
              <button 
                onClick={handleCleanFiles}
                className="btn-secondary px-4 py-2"
              >
                Clean Files
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Storage Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-900/30">
                <FileText size={20} className="text-blue-400" />
              </div>
              <h4 className="font-medium">Documents</h4>
            </div>
            <p className="text-2xl font-bold mb-1">
              {loadingStorage ? '...' : (storageUsage.used * 0.6).toFixed(1)} MB
            </p>
            <p className="text-sm text-gray-400">60% of storage</p>
          </div>
          <div className="bg-gray-900/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-purple-900/30">
                <ImageIcon size={20} className="text-purple-400" />
              </div>
              <h4 className="font-medium">Images</h4>
            </div>
            <p className="text-2xl font-bold mb-1">
              {loadingStorage ? '...' : (storageUsage.used * 0.3).toFixed(1)} MB
            </p>
            <p className="text-sm text-gray-400">30% of storage</p>
          </div>
          <div className="bg-gray-900/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-900/30">
                <Folder size={20} className="text-green-400" />
              </div>
              <h4 className="font-medium">Other</h4>
            </div>
            <p className="text-2xl font-bold mb-1">
              {loadingStorage ? '...' : (storageUsage.used * 0.1).toFixed(1)} MB
            </p>
            <p className="text-sm text-gray-400">10% of storage</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StorageView;