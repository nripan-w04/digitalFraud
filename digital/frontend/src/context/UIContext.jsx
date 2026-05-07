import { createContext } from 'react';

const UIContext = createContext({
  showToast: () => {},
  showConfirm: () => {},
  showAlert: () => {},
  showPrompt: () => {},
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
  toggleMobileMenu: () => {},
});

export default UIContext;
