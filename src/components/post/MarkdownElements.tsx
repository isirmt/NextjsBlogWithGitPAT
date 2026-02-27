/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { ClassAttributes, HTMLAttributes } from 'react';
import * as React from 'react';
import ReactMarkdown, { Components, ExtraProps } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { getImage } from '@/lib/getPosts';
import { getImageMimeType } from '@/lib/mime-getter';
import { highlightCodeBlock } from '@/lib/shiki';
import { makeExcerpt } from '@/lib/textFormatter';
import { HeadMeta } from '@/static/metaType';
import { ExplainingBanner } from '../UserBanner';
import CopyToClipboard from './CopyToClipboard';
import 'katex/dist/katex.min.css';

async function ExImg({ path, alt }: { path: string; alt?: string }) {
  const image64 = await getImage(path);
  const mimeType = getImageMimeType(path);
  if (image64 !== '') return <img alt={alt} src={`data:${mimeType};base64,${image64}`} />;
  else return <ExplainingBanner>画像取得に失敗しました</ExplainingBanner>;
}

async function ExA({ path, isInner }: { path: string; isInner: boolean }) {
  const failFallback = () =>
    isInner ? (
      <a className='post_hyper_url' href={path}>
        {path}
      </a>
    ) : (
      <a className='post_hyper_url' href={path} target='_blank' rel='noopener noreferrer'>
        {path}
      </a>
    );

  if (!process.env.NEXT_PUBLIC_URL) {
    console.error('NEXT_PUBLIC_URL is not set; skipping link preview');
    return failFallback();
  }

  const CardComponent = ({ meta }: { meta: HeadMeta }) => {
    const titleBase = meta['og:title'] ? meta['og:title'] : meta.title ? meta.title : meta.url;
    const title = makeExcerpt(titleBase, 20);
    const descriptionBase = meta['og:description'] ? meta['og:description'] : meta.description ? meta.description : '';
    const description = makeExcerpt(descriptionBase, 15);
    return (
      <span className='group my-4 flex h-24 w-full justify-between gap-1 overflow-hidden rounded border border-slate-100 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700'>
        <span className='flex flex-shrink flex-row items-stretch justify-start'>
          <span className='flex w-6 flex-shrink-0 items-center justify-center overflow-hidden bg-slate-200 text-center text-xl font-bold tracking-widest text-slate-500 transition-colors [writing-mode:sideways-lr] group-hover:text-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300'>
            LINK
          </span>
          <span className='flex flex-shrink flex-col justify-between overflow-hidden px-3 py-4'>
            <span className='flex flex-col gap-0.5'>
              <span className='block whitespace-nowrap font-bold'>{title}</span>
              <span className='block whitespace-nowrap text-xs'>{description}</span>
            </span>
            <span className='block'>
              <span className='block whitespace-nowrap text-xs'>
                <span className='i-tabler-world relative top-0.5 mr-0.5 bg-gray-700 dark:bg-slate-500' />
                {makeExcerpt(meta.url, 36)}
              </span>
            </span>
          </span>
        </span>
        {meta['og:image'] ? (
          <span className='flex h-full flex-shrink-0 flex-col items-center justify-center overflow-hidden'>
            <img className='m-0 h-full w-auto' loading='lazy' alt='thumb' src={meta['og:image']} />
          </span>
        ) : (
          <></>
        )}
      </span>
    );
  };

  let meta: HeadMeta | null = null;
  try {
    const metaResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get-head?url=${encodeURIComponent(path)}`, {
      next: { revalidate: 3600 * 24 },
    });
    const bodyText = await metaResponse.text();
    if (!metaResponse.ok) {
      console.error(
        `get-head failed: ${metaResponse.status} ${metaResponse.statusText} - ${bodyText.slice(0, 200)} for ${path}`,
      );
    } else {
      const parsed = JSON.parse(bodyText);
      meta = parsed.meta as HeadMeta;
    }
  } catch (err) {
    console.error('Error fetching link preview for', path, err);
  }

  if (!meta) return failFallback();

  return isInner ? (
    <a href={path}>
      <CardComponent meta={meta} />
    </a>
  ) : (
    <a href={path} target='_blank' rel='noopener noreferrer'>
      <CardComponent meta={meta} />
    </a>
  );
}

function getNodeText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map((child) => getNodeText(child)).join('');
  if (React.isValidElement(children)) {
    const childProps = children.props as { children?: React.ReactNode };
    return getNodeText(childProps.children);
  }
  return '';
}

function toHeadingId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[!"$%&'()*+,./:;<=>?@[\\\]^_{|}]/g, '')
    .replace(/\s+/g, '-');
}

function getHeadingId(children: React.ReactNode) {
  return toHeadingId(getNodeText(children));
}

const H2 = ({ ...props }: ClassAttributes<HTMLHeadingElement> & HTMLAttributes<HTMLHeadingElement> & ExtraProps) => {
  return (
    <div
      className='mb-4 mt-3 border-b-2 border-blue-200 text-blue-700 transition-colors dark:border-slate-700 dark:text-white'
      id={getHeadingId(props.children)}
    >
      <h2 {...props}>{props.children}</h2>
    </div>
  );
};

const H3 = ({ ...props }: ClassAttributes<HTMLHeadingElement> & HTMLAttributes<HTMLHeadingElement> & ExtraProps) => {
  return (
    <h3 {...props} className='transition-colors dark:text-white' id={getHeadingId(props.children)}>
      {props.children}
    </h3>
  );
};

const Img = ({
  ...props
}: ClassAttributes<HTMLImageElement> &
  HTMLAttributes<HTMLImageElement> &
  ExtraProps & { src?: string; alt?: string }) => {
  const src = (props.src as string) || '';
  const alt = (props.alt as string) || '';
  if (src.startsWith(`/${process.env.GIT_IMAGES_DIR!}/`)) {
    return <ExImg path={src} alt={alt} />;
  } else return <img {...props}>{props.children}</img>;
};

async function AwaitingPre({
  normalizedCode,
  language,
  fileName,
}: {
  normalizedCode: string;
  language: string;
  fileName?: string;
}) {
  const highlightedCode = await highlightCodeBlock(normalizedCode, language);

  return (
    <div className='post_codeblock w-full'>
      {(fileName || language !== '') && (
        <div className='post_fname'>
          <span className='flex items-center'>
            <span className='i-tabler-file mr-1' />
            {fileName ?? '<無題>'}
          </span>
          {language !== '' && (
            <React.Fragment>
              <span className='h-4 border-l border-slate-200' />
              <span className='post_lang'>{language}</span>
            </React.Fragment>
          )}
        </div>
      )}
      <div className='post_shiki' dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      <div className='sticky bottom-2 mt-4 flex w-full justify-center'>
        <CopyToClipboard text={normalizedCode} />
      </div>
    </div>
  );
}

const Pre = ({ children, ...props }: ClassAttributes<HTMLPreElement> & HTMLAttributes<HTMLPreElement> & ExtraProps) => {
  if (!React.isValidElement(children)) {
    return <code {...props}>{children}</code>;
  }
  if (children.type !== 'code') {
    return <code {...props}>{children}</code>;
  }

  const childProps = children.props as { className?: string; children?: React.ReactNode };
  const className = typeof childProps.className === 'string' ? childProps.className : '';
  const code = childProps.children ?? '';
  const classList = className ? className.split(':') : [];
  const language = classList[0]?.replace('language-', '');
  const fileName = classList[1];
  const normalizedCode = String(code).replace(/\n$/, '');
  return <AwaitingPre normalizedCode={normalizedCode} language={language} fileName={fileName} />;
};

const A = ({
  href,
  children,
  ...props
}: ClassAttributes<HTMLAnchorElement> &
  HTMLAttributes<HTMLAnchorElement> & { href?: string; children?: React.ReactNode }) => {
  const isHashLink = href?.startsWith('#') ?? false;
  const isInternalLink = href?.startsWith('/') || isHashLink;
  const displayText = typeof children === 'string' ? children : '';

  if (href && !isHashLink && displayText === href) {
    return <ExA path={href} isInner={isInternalLink ?? false} />;
  }

  return isHashLink || isInternalLink ? (
    <a className='post_hyper_url' href={href} {...props}>
      {children}
    </a>
  ) : (
    <a className='post_hyper_url' href={href} target='_blank' rel='noopener noreferrer' {...props}>
      {children}
    </a>
  );
};

export const components: Partial<Components> = {
  pre: Pre,
  h2: H2,
  h3: H3,
  img: Img,
  a: A,
};

export function PostMarkdown({ content }: { content: string }) {
  return (
    <div className='markdown'>
      <ReactMarkdown
        disallowedElements={['h1']}
        components={components}
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function CommentMarkdown({ content }: { content: string }) {
  return (
    <div className='markdown'>
      <ReactMarkdown
        disallowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'iframe', 'script']}
        components={components}
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
