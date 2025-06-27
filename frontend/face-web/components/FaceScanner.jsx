import React from 'react';
import { Scan } from 'lucide-react';

const FaceScanner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-10">
    <div className="relative">
      <div className="w-40 h-40 border-2 border-gray-400/30 rounded-full animate-pulse"></div>
      <div className="absolute inset-2 w-36 h-36 border-2 border-white/50 rounded-full animate-spin-slow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
          <Scan className="text-white animate-pulse" size={24} />
        </div>
      </div>
      <div className="absolute inset-0 w-40 h-40">
        <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-white/60 to-transparent animate-scan-line-v origin-top"></div>
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent animate-scan-line-h"></div>
      </div>
    </div>
  </div>
);

export default FaceScanner;