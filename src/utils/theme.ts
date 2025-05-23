// OSの設定を確認
const getOSTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 保存されたテーマを取得
const getSavedTheme = (): 'dark' | 'light' | null => {
  if (typeof window === 'undefined') return null;
  const savedTheme = localStorage.getItem('theme');
  return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : null;
};

// テーマの初期設定
const initTheme = (): 'dark' | 'light' => {
  // 1. 保存された設定を確認
  const savedTheme = getSavedTheme();
  if (savedTheme) return savedTheme;

  // 2. OSの設定を確認
  return getOSTheme();
};

// 現在のテーマを取得
export const getCurrentTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') as 'dark' | 'light' || initTheme();
};

// テーマを設定
export const setTheme = (theme: 'dark' | 'light'): void => {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}; 