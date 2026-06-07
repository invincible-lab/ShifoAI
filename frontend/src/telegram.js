const tg = window.Telegram?.WebApp;

export const initTelegram = () => {
  tg?.ready();
  tg?.expand();
};

export const getInitData = () => tg?.initData || "";
export const getUser = () => tg?.initDataUnsafe?.user || null;
export const haptic = (type = "medium") => tg?.HapticFeedback?.impactOccurred(type);
export const showAlert = (msg) => tg?.showAlert(msg);
export const closeApp = () => tg?.close();
export const getTgTheme = () => tg?.colorScheme || 'light';