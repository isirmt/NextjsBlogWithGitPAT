'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import type { ClassAttributes, HTMLAttributes } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { ExtraProps } from 'react-markdown';

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

export default function PostIndex({ content, title }: { content: string; title: string }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const ids = Array.from(document.querySelectorAll<HTMLElement>('[data-post-index-id]'))
      .map((element) => element.dataset.postIndexId)
      .filter((id): id is string => Boolean(id));

    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (headings.length === 0) {
      setActiveId('');
      return;
    }

    const getActiveHeadingId = () => {
      const offset = 80;
      let currentId = '';

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - offset <= 0) {
          currentId = heading.id;
        } else {
          break;
        }
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        currentId = headings[headings.length - 1].id;
      }

      setActiveId((prev) => (prev === currentId ? prev : currentId));
    };

    const onScrollOrResize = () => getActiveHeadingId();

    getActiveHeadingId();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('hashchange', getActiveHeadingId);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('hashchange', getActiveHeadingId);
    };
  }, [content]);

  const IndexLink = ({ id, level, children }: { id: string; level: 1 | 2 | 3; children?: React.ReactNode }) => {
    const isH3 = level === 3;
    const isActive = activeId === id;

    return (
      <li className='relative w-full list-none'>
        <span
          aria-hidden
          className={`${isH3 ? 'left-2.5 size-2' : 'left-2 size-3'} absolute top-1/2 z-20 -translate-y-1/2 rounded-full border transition-all duration-200 ${
            isActive
              ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
              : 'border-slate-300 bg-slate-300 dark:border-slate-500 dark:bg-slate-700'
          }`}
        />
        <a
          className={`${isH3 ? 'pl-10' : 'pl-8'} inline-block w-full rounded-md p-0.5 transition-colors hover:bg-slate-200 dark:hover:bg-slate-600 md:hover:bg-gray-200 dark:md:hover:bg-slate-800 ${
            isActive ? 'font-semibold text-blue-700 dark:text-blue-300' : ''
          }`}
          onClick={() => setIsOpen(false)}
          href={id === '' ? '#' : `#${id}`}
          aria-current={isActive ? 'location' : undefined}
          data-post-index-id={id}
        >
          {children}
        </a>
      </li>
    );
  };

  const anchorLinkH2 = ({
    ...props
  }: ClassAttributes<HTMLHeadingElement> & HTMLAttributes<HTMLHeadingElement> & ExtraProps) => {
    const headingId = toHeadingId(getNodeText(props.children));
    return (
      <IndexLink id={headingId} level={2}>
        {props.children}
      </IndexLink>
    );
  };

  const anchorLinkH3 = ({
    ...props
  }: ClassAttributes<HTMLHeadingElement> & HTMLAttributes<HTMLHeadingElement> & ExtraProps) => {
    const headingId = toHeadingId(getNodeText(props.children));
    return (
      <IndexLink id={headingId} level={3}>
        {props.children}
      </IndexLink>
    );
  };

  return (
    <div className='flex flex-col px-3 pb-3 pt-3 md:pt-6'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='rounded-md bg-slate-200 px-6 py-1 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 md:hover:bg-slate-200 dark:md:hover:bg-slate-700'
      >
        目次
      </button>
      <ol
        className={`${isOpen ? '' : 'hidden'} absolute right-0 top-16 max-h-[calc(100vh_-_14rem)] w-[80vw] overflow-y-auto rounded-md border border-slate-400 bg-slate-100 p-4 drop-shadow-xl transition-colors before:pointer-events-none before:absolute before:bottom-6 before:left-[29px] before:top-0 before:z-10 before:w-px before:bg-slate-300 dark:bg-slate-700 dark:before:bg-slate-600 md:relative md:top-0 md:block md:h-auto md:max-h-[calc(100vh_-_14rem)] md:w-full md:rounded-none md:border-none md:bg-gray-100 md:pl-2 md:pt-2 md:drop-shadow-none before:md:left-[21px] dark:md:bg-slate-900`}
      >
        <IndexLink id='' level={1}>
          {title}
        </IndexLink>
        <ReactMarkdown
          allowedElements={['h2', 'h3']}
          components={{
            h2: anchorLinkH2,
            h3: anchorLinkH3,
          }}
          rehypePlugins={[rehypeSanitize]}
        >
          {content}
        </ReactMarkdown>
      </ol>
    </div>
  );
}
