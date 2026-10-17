import { PostMarkdown } from './MarkdownElements';

export default async function CachedPostMarkdown({ content }: { content: string }) {
  return <PostMarkdown content={content} />;
}
