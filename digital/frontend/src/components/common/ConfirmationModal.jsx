import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                ></motion.div>
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass-effect w-full max-w-md p-8 relative z-10 border border-white/10"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`p-4 rounded-full mb-6 ${
                            type === 'danger' ? 'bg-danger/15 text-danger' : 'bg-accent-blue/15 text-accent-blue'
                        }`}>
                            <AlertCircle size={32} />
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3">{title}</h3>
                        <div className="text-text-secondary mb-8 leading-relaxed">
                            {message}
                        </div>

                        <div className="flex gap-4 w-full">
                            <button 
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                {cancelText}
                            </button>
                            <button 
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-6 py-3 rounded-xl text-white font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                                    type === 'danger' ? 'bg-danger shadow-[0_4px_15px_rgba(255,77,77,0.3)]' : 'bg-accent-blue shadow-[0_4px_15px_rgba(0,123,255,0.3)]'
                                }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
