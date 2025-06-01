import { atom } from 'nanostores';

export type ImageType = 'stitch' | 'pixel' | 'pattern';

// 初期値をlocalStorageから取得（存在しない場合は'stitch'）
const initialType = (typeof window !== 'undefined' && localStorage.getItem('imageType')) as ImageType || 'stitch';

export const imageTypeStore = atom<ImageType>(initialType);

// ストアの変更を監視してlocalStorageに保存
if (typeof window !== 'undefined') {
  imageTypeStore.subscribe((type) => {
    localStorage.setItem('imageType', type);
  });
} 