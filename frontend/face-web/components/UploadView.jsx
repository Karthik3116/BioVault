import React from 'react';
import FaceScanner from './FaceScanner';
import { Camera, Upload, FileText, XCircle } from 'lucide-react';

const UploadView = ({ 
  cameraOn, 
  videoRef, 
  canvasRef, 
  isScanning, 
  isProcessing, 
  dataFiles, 
  setDataFiles, 
  fileInputRef, 
  handleSubmit 
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

      <div className="space-y-4">
        <div className="border border-dashed border-gray-600 rounded-xl p-6 text-center">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => setDataFiles(Array.from(e.target.files))}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <label 
            htmlFor="file-upload" 
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload size={48} className="mb-4 text-gray-500" />
            <h3 className="text-lg font-medium">Select files to upload</h3>
            <p className="text-gray-400 mt-1">Drag & drop or click to browse</p>
            <p className="text-xs text-gray-500 mt-2">Max file size: 100MB</p>
          </label>
        </div>

        {dataFiles.length > 0 && (
          <div className="bg-gray-900/30 rounded-xl p-4">
            <h4 className="font-medium mb-3">Selected Files:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {dataFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDataFiles(files => files.filter((_, i) => i !== index))}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="btn-action w-full"
          disabled={isProcessing || !dataFiles.length}
        >
          <Upload size={20} /> {isProcessing ? 'Processing...' : 'Upload Securely'}
        </button>
      </div>
    </div>
  </div>
);

export default UploadView;