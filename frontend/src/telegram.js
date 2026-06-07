const tg = window.Telegram?.WebApp;

export const initTelegram = () => {
  tg?.ready();
  tg?.expand();
  
  const applyTheme = () => {
    const theme = tg?.colorScheme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  };
  
  applyTheme();
  tg?.onEvent('themeChanged', applyTheme);
};

export const getInitData = () => tg?.initData || "";
export const getUser = () => tg?.initDataUnsafe?.user || null;
export const haptic = (type = "medium") => {
  const notificationTypes = ['success', 'error', 'warning'];
  if (notificationTypes.includes(type)) {
    tg?.HapticFeedback?.notificationOccurred(type);
  } else {
    tg?.HapticFeedback?.impactOccurred(type);
  }
};
export const showAlert = (msg) => tg?.showAlert(msg);
export const closeApp = () => tg?.close();
export const getTgTheme = () => tg?.colorScheme || 'light';