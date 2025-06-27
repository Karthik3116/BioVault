import React from 'react';
import ActivityItem from './ActivityItem';
import { 
  Activity, Upload, Folder, ShieldCheck, Database, History 
} from 'lucide-react';

const DashboardView = ({ 
  setActiveNav, 
  activityLog, 
  loadingActivity, 
  storageUsage, 
  loadingStorage 
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity size={20} /> Quick Actions
      </h3>
      <div className="space-y-3">
        <button 
          onClick={() => setActiveNav('upload')}
          className="w-full flex items-center justify-between gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Upload size={20} />
            <span>Upload Files</span>
          </div>
          <div className="text-gray-400">&gt;</div>
        </button>
        <button 
          onClick={() => setActiveNav('access')}
          className="w-full flex items-center justify-between gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Folder size={20} />
            <span>Access Vault</span>
          </div>
          <div className="text-gray-400">&gt;</div>
        </button>
        <button 
          onClick={() => setActiveNav('security')}
          className="w-full flex items-center justify-between gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} />
            <span>Security Settings</span>
          </div>
          <div className="text-gray-400">&gt;</div>
        </button>
      </div>
    </div>

    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 lg:col-span-2">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <History size={20} /> Recent Activity
      </h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {activityLog.length > 0 ? (
          activityLog.slice(0, 5).map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">
            {loadingActivity ? 'Loading activities...' : 'No recent activity'}
          </p>
        )}
      </div>
    </div>

    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Database size={20} /> Storage Overview
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Used: {loadingStorage ? '...' : storageUsage.used.toFixed(1)} MB</span>
            <span>Total: {loadingStorage ? '...' : storageUsage.total} MB</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            {!loadingStorage && (
              <div 
                className="progress-bar h-2 rounded-full" 
                style={{ width: `${Math.min(100, (storageUsage.used / storageUsage.total) * 100)}%` }}
              ></div>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-400">
          <p className="flex justify-between py-1">
            <span>Documents</span>
            <span>{loadingStorage ? '...' : (storageUsage.used * 0.6).toFixed(1)} MB</span>
          </p>
          <p className="flex justify-between py-1">
            <span>Images</span>
            <span>{loadingStorage ? '...' : (storageUsage.used * 0.3).toFixed(1)} MB</span>
          </p>
          <p className="flex justify-between py-1">
            <span>Other</span>
            <span>{loadingStorage ? '...' : (storageUsage.used * 0.1).toFixed(1)} MB</span>
          </p>
        </div>
      </div>
    </div>

    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ShieldCheck size={20} /> Security Status
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-green-900/30">
              <ShieldCheck size={16} className="text-green-400" />
            </div>
            <span>Biometric Auth</span>
          </div>
          <span className="text-green-400">Active</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-yellow-900/30">
              <ShieldCheck size={16} className="text-yellow-400" />
            </div>
            <span>2FA</span>
          </div>
          <span className="text-yellow-400">Inactive</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-900/30">
              <ShieldCheck size={16} className="text-blue-400" />
            </div>
            <span>Encryption</span>
          </div>
          <span className="text-blue-400">AES-256</span>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardView;