import React from 'react';
import SecurityToggle from './SecurityToggle';
import { ShieldCheck, Lock, Database } from 'lucide-react';

const SecuritySettingsView = ({ securityStatus, setSecurityStatus }) => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-gray-800/60 rounded-2xl p-6 space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Security Settings</h3>
        <div className="bg-gray-900/30 rounded-xl p-5">
          <SecurityToggle 
            label="Biometric Authentication" 
            status={securityStatus.biometric} 
            onChange={() => setSecurityStatus(prev => ({...prev, biometric: !prev.biometric}))} 
          />
          <SecurityToggle 
            label="Two-Factor Authentication" 
            status={securityStatus.twoFactor} 
            onChange={() => setSecurityStatus(prev => ({...prev, twoFactor: !prev.twoFactor}))} 
          />
          <SecurityToggle 
            label="End-to-End Encryption" 
            status={securityStatus.encryption} 
            onChange={() => setSecurityStatus(prev => ({...prev, encryption: !prev.encryption}))} 
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Security Audit</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/30 rounded-xl p-5 border border-green-600/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-green-900/30">
                <ShieldCheck size={20} className="text-green-400" />
              </div>
              <h4 className="font-medium">Authentication</h4>
            </div>
            <p className="text-sm text-gray-400">Biometric verification enabled</p>
          </div>
          <div className="bg-gray-900/30 rounded-xl p-5 border border-yellow-600/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-yellow-900/30">
                <Lock size={20} className="text-yellow-400" />
              </div>
              <h4 className="font-medium">2FA Status</h4>
            </div>
            <p className="text-sm text-gray-400">Two-factor authentication not active</p>
          </div>
          <div className="bg-gray-900/30 rounded-xl p-5 border border-blue-600/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-blue-900/30">
                <Database size={20} className="text-blue-400" />
              </div>
              <h4 className="font-medium">Data Encryption</h4>
            </div>
            <p className="text-sm text-gray-400">AES-256 encryption enabled</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SecuritySettingsView;