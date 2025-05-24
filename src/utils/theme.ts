// テーマの初期設定
const initTheme = (): 'dark' | 'light' => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const theme = initTheme();

if (theme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
} else {
  document.documentElement.setAttribute('data-theme', 'light');
}

window.localStorage.setItem('theme', theme);

// テーマ切り替えボタンのイベントリスナー
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    window.localStorage.setItem('theme', newTheme);
  });
} 