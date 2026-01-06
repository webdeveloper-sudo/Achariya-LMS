import React from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 flex items-center"
                    >
                        {isLoading ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
