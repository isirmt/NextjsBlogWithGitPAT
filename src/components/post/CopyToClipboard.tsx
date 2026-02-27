'use client';
import { useState } from 'react';

export default function CopyToClipboard({ text }: { text: string }) {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } catch (error) {
        console.error('クリップボードへのコピーに失敗しました: ', error);
      }
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setCopied(true);
      } catch (error) {
        console.error('クリップボードへのコピーに失敗しました: ', error);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <button
      aria-label={copied ? 'コピー完了' : 'クリップボードへコピー'}
      className='flex items-center justify-center rounded-full bg-gray-200 p-2.5 text-lg transition-colors hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600'
      onClick={copy}
    >
      <span className={`${copied ? 'i-tabler-clipboard-check' : 'i-tabler-clipboard'}`} />
    </button>
  );
}
