import { Session } from 'next-auth';
import SessionButton from '@/components/SessionButton';
import ImagesBarChart from '@/components/chart/ImagesBarChart';
import PostsBarChart from '@/components/chart/PostsBarChart';
import TagPieChart from '@/components/chart/TagPieChart';
import { Main, Section, Side, Title } from '@/components/layout/PageLayout';
import { auth, signIn } from '@/lib/auth';
import { getHeaders, getNext } from '@/lib/fetchingFunc';
import { getPostsProps } from '@/lib/getPosts';

export default async function Dashboard() {
  const session: Session | null = await auth();
  if (!session) {
    await signIn('GitHub');
    return (
      <Main>
        <Side></Side>
        <Section>
          <Title>要ログイン</Title>
        </Section>
      </Main>
    );
  }

  if (session.user?.id !== process.env.GIT_USERNAME!) {
    return (
      <Main>
        <Side></Side>
        <Section>
          <Title>管理者のみアクセス可能です！</Title>
          <SessionButton />
        </Section>
      </Main>
    );
  }

  const apiRateResponse = await fetch(`https://api.github.com/rate_limit`, {
    ...getHeaders(),
    ...getNext(5),
  }).then((res) => res.json());

  const posts = await getPostsProps();

  return (
    <main className='p-4'>
      <Title>ダッシュボード</Title>
      <div className='flex flex-wrap items-start justify-center gap-4 sm:p-2 md:justify-start'>
        <section className='w-full overflow-hidden rounded-lg border border-red-400 sm:w-96'>
          <div className='px-4 py-2'>
            <h2 className='text-lg font-bold'>APIレート制限</h2>
            {apiRateResponse.rate.remaining} / {apiRateResponse.rate.limit}
          </div>
          <div className='bg-red-400 px-4 py-1 font-bold text-white'>
            リセット予定時間：{new Date(apiRateResponse.rate.reset * 1000).toLocaleTimeString('ja-JP')}
          </div>
        </section>

        <section className='w-full overflow-hidden rounded-lg border border-blue-400 sm:w-96'>
          <div className='bg-blue-400 px-4 py-1 font-bold text-white'>
            <h2 className='text-lg font-bold'>投稿につけられたタグ数</h2>
          </div>
          <div className='flex justify-center px-4 py-2'>
            <TagPieChart posts={posts} />
          </div>
        </section>

        <section className='w-full overflow-hidden rounded-lg border border-blue-400 sm:w-96'>
          <div className='bg-blue-400 px-4 py-1 font-bold text-white'>
            <h2 className='text-lg font-bold'>画像数</h2>
          </div>
          <div className='flex justify-center px-4 py-2'>
            <ImagesBarChart posts={posts} />
          </div>
        </section>

        <section className='w-full overflow-hidden rounded-lg border border-blue-400 sm:w-96'>
          <div className='bg-blue-400 px-4 py-1 font-bold text-white'>
            <h2 className='text-lg font-bold'>投稿数</h2>
          </div>
          <div className='flex justify-center px-4 py-2'>
            <PostsBarChart posts={posts} />
          </div>
        </section>
      </div>
    </main>
  );
}
