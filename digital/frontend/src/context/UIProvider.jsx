import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import UIContext from './UIContext';

export const UIProvider = ({ children }) => {
  const [modal, setModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const options = { duration };
    if (type === 'success') {
      toast.success(message, options);
    } else if (type === 'error') {
      toast.error(message, options);
    } else if (type === 'warning') {
      toast(message, { ...options, icon: '⚠️' });
    } else {
      toast(message, options);
    }
  }, []);

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModal({ type: 'confirm', ...options, resolve });
    });
  }, []);

  const showAlert = useCallback((options) => {
    return new Promise((resolve) => {
      setModal({ type: 'alert', ...options, resolve });
    });
  }, []);

  const showPrompt = useCallback((options) => {
    return new Promise((resolve) => {
      setModal({ type: 'prompt', value: options.defaultValue || '', ...options, resolve });
    });
  }, []);

  const closeModal = (result) => {
    if (modal?.resolve) {
      if (modal.type === 'prompt' && result !== false) {
        modal.resolve(modal.value);
      } else {
        modal.resolve(result);
      }
    }
    setModal(null);
  };

  return (
    <UIContext.Provider value={{ showToast, showConfirm, showAlert, showPrompt, mobileMenuOpen, setMobileMenuOpen, toggleMobileMenu }}>
      {children}
      
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            background: '#09090b', 
            color: '#fff', 
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderRadius: '12px',
            zIndex: 99999
          },
          success: { iconTheme: { primary: '#22d3ee', secondary: '#09090b' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#09090b' } }
        }} 
      />

      {/* Custom Dialog Modal */}
      <AnimatePresence>
        {modal && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 99999 }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => closeModal(false)}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '480px', 
                backgroundColor: '#111113', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '32px', 
                padding: '40px', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
                overflow: 'hidden', 
                fontFamily: "'Plus Jakarta Sans', sans-serif" 
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '20px', 
                  backgroundColor: modal.type === 'confirm' ? 'rgba(249,115,22,0.1)' : modal.type === 'alert' ? 'rgba(239,68,68,0.1)' : 'rgba(34,211,238,0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {modal.type === 'confirm' ? <AlertTriangle color="#f97316" size={32} /> : 
                   modal.type === 'alert' ? <AlertCircle color="#ef4444" size={32} /> : 
                   <Info color="#22d3ee" size={32} />}
                </div>

                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#fff', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
                    {modal.title || (modal.type === 'confirm' ? 'Confirm Action' : modal.type === 'alert' ? 'System Notification' : 'Input Required')}
                  </h3>
                  <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                    {modal.message}
                  </p>
                </div>

                {modal.type === 'prompt' && (
                  <div style={{ width: '100%', marginTop: '8px' }}>
                    <input
                      autoFocus
                      type={modal.inputType || 'text'}
                      value={modal.value}
                      onChange={(e) => setModal({ ...modal, value: e.target.value })}
                      placeholder={modal.placeholder || 'Enter value...'}
                      onKeyDown={(e) => e.key === 'Enter' && closeModal(true)}
                      style={{ 
                        width: '100%', 
                        backgroundColor: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '16px', 
                        padding: '16px 20px', 
                        color: '#fff', 
                        fontSize: '14px', 
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#22d3ee'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
                  {(modal.type === 'confirm' || modal.type === 'prompt') && (
                    <button
                      onClick={() => closeModal(false)}
                      style={{ 
                        flex: 1,
                        padding: '16px', 
                        borderRadius: '16px', 
                        backgroundColor: 'rgba(255,255,255,0.05)', 
                        color: '#fff', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer', 
                        transition: 'all 0.2s' 
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    >
                      {modal.cancelText || 'Cancel'}
                    </button>
                  )}
                  <button
                    onClick={() => closeModal(true)}
                    style={{ 
                      flex: 1,
                      padding: '16px', 
                      borderRadius: '16px', 
                      backgroundColor: modal.type === 'alert' && modal.severity === 'critical' ? '#ef4444' : '#22d3ee', 
                      color: modal.type === 'alert' && modal.severity === 'critical' ? '#fff' : '#000', 
                      fontSize: '13px', 
                      fontWeight: '700', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em', 
                      border: 'none', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      boxShadow: modal.type === 'alert' && modal.severity === 'critical' ? '0 10px 20px rgba(239,68,68,0.2)' : '0 10px 20px rgba(34,211,238,0.2)'
                    }}
                    onMouseOver={(e) => e.target.style.opacity = '0.9'}
                    onMouseOut={(e) => e.target.style.opacity = '1'}
                  >
                    {modal.confirmText || (modal.type === 'alert' ? 'Dismiss' : 'Confirm')}
                  </button>
                </div>
              </div>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Shield size={12} color="rgba(34,211,238,0.5)" />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>Secure Command Dialog</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </UIContext.Provider>
  );
};
