'use client';

import { useEffect, useState } from 'react';
import { getFavList } from '@/lib/favTagsManager';
import TagBanner from '../tag/TagBanner';

export default function Menu() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavList());
  }, []);

  return (
    <div className='relative hidden min-w-72 flex-grow-0 bg-gray-100 px-4 transition-colors dark:bg-slate-900 xl:block'>
      <div className='sticky top-14 w-full'>
        <div className='p-3'>
          お気に入りのタグ
          <div className='mt-2 flex flex-col gap-y-2'>
            {favorites.map((tag, i) => (
              <TagBanner isSmall tag={tag} key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
