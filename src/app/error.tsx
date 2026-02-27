'use client';

import { useEffect } from 'react';
import { notoSansJp } from '@/lib/font';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className={`${notoSansJp.className} relative flex h-dvh w-full flex-col items-center justify-center gap-2 overflow-x-hidden text-center font-bold tracking-widest md:gap-4`}
    >
      <h1 className='text-2xl font-black text-[#555] md:text-6xl'>An Error Occurred</h1>
      <div className='text-base font-black text-[#555] md:text-xl'>問題が発生しました&nbsp;&gt;&lt;</div>
      <div className='text-base font-black text-[#555] md:text-lg'>{error.message}</div>
      <div>
        <button
          onClick={() => reset()}
          className='border-b text-xl font-bold leading-none text-[#361ea5] underline underline-offset-2 hover:text-[#361ea5]/70'
        >
          再試行
        </button>
      </div>
    </main>
  );
}
