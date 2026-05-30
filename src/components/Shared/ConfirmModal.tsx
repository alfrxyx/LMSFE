import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-100',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100',
    info: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
  };

  const iconStyles = {
    danger: 'bg-red-50 text-red-600',
    warning: 'bg-orange-50 text-orange-600',
    info: 'bg-blue-50 text-blue-600'
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-8 text-center space-y-6">
          <div className={`inline-flex items-center justify-center h-20 w-20 rounded-[2rem] ${iconStyles[type]} mb-2`}>
            <AlertCircle size={40} />
          </div>
          
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{title}</h3>
            <p className="text-gray-500 font-medium text-sm px-4 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${typeStyles[type]}`}
            >
              {confirmText}
            </button>
            <button 
              onClick={onCancel}
              className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
