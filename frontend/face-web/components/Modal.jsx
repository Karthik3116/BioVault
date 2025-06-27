import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

const Modal = ({ showModal, setShowModal, modalContent }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className={`bg-gray-800 p-6 rounded-xl text-center space-y-4 max-w-sm w-full transform scale-95 animate-scale-in border ${
          modalContent.type === 'error'
            ? 'border-red-600'
            : modalContent.type === 'success'
            ? 'border-green-600'
            : 'border-blue-600'
        }`}
      >
        {modalContent.type === 'success' && <CheckCircle2 className="mx-auto text-green-500" size={48} />}
        {modalContent.type === 'error' && <XCircle className="mx-auto text-red-500" size={48} />}
        {modalContent.type === 'warning' && <AlertTriangle className="mx-auto text-yellow-500" size={48} />}
        {modalContent.type === 'info' && <Info className="mx-auto text-blue-500" size={48} />}
        <h3 className="text-2xl font-bold text-white">{modalContent.title}</h3>
        <p className="text-gray-300">{modalContent.message}</p>
        <button 
          onClick={() => setShowModal(false)}
          className="btn-primary w-full"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Modal;