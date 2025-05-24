export type ImageType = 'cross-stitch' | 'pixel' | 'pattern';

// 画像タイプの初期設定
const initImageType = (): ImageType => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('imageType')) {
    const savedType = localStorage.getItem('imageType');
    return (savedType === 'cross-stitch' || savedType === 'pixel' || savedType === 'pattern') 
      ? savedType as ImageType 
      : 'cross-stitch';
  }
  return 'cross-stitch';
};

// 現在の画像タイプを取得
export const getCurrentImageType = (): ImageType => {
  return initImageType();
};

// 画像タイプを設定
export const setImageType = (type: ImageType): void => {
  localStorage.setItem('imageType', type);
  // すべての画像コンテナを更新
  document.querySelectorAll('.pattern-container').forEach((container) => {
    const images = container.querySelectorAll('img[data-pattern-type]');
    images.forEach((img) => {
      if (img.getAttribute('data-pattern-type') === type) {
        img.classList.remove('hidden');
      } else {
        img.classList.add('hidden');
      }
    });
  });
}; 