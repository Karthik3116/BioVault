import React from 'react';
import FaceScanner from './FaceScanner';
import { Camera, ArrowRight, Loader2 } from 'lucide-react';

const AccessView = ({ 
  cameraOn, 
  videoRef, 
  canvasRef, 
  isScanning, 
  isProcessing, 
  verificationSuccess, 
  countdown, 
  handleSubmit, 
  handleManualNavigate 
}) => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-gray-800/60 rounded-2xl p-6 space-y-6">
      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex items-center justify-center">
        {cameraOn ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            {isScanning && <FaceScanner />}
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <Camera size={48} />
            <span>Camera {isProcessing ? 'Initializing...' : 'Off'}</span>
          </div>
        )}
      </div>

      <div className="space-y-4 text-center">
        <p className="text-gray-400 mb-4">
          Verify your identity to access the secure vault
        </p>
        
        {verificationSuccess && !isProcessing ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/30 rounded-lg border border-green-600">
              <p className="text-green-300">Verification successful!</p>
              {countdown > 0 ? (
                <p className="text-sm text-green-400 mt-1">
                  Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
              ) : (
                <p className="text-sm text-green-400 mt-1">
                  Automatic redirect failed. Please click below:
                </p>
              )}
            </div>
            <button
              onClick={handleManualNavigate}
              className="btn-success w-full"
            >
              <ArrowRight size={20} /> {countdown > 0 ? `(${countdown})` : ''} Go to Vault
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="btn-action w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="ml-2">Verifying Identity...</span>
              </>
            ) : (
              <span>Verify & Access Vault</span>
            )}
          </button>
        )}
      </div>
    </div>
  </div>
);

export default AccessView;