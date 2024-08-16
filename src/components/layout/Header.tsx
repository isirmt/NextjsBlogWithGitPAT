import Link from "next/link";
import SearchBoxWrapper from "../SearchBoxWrapper";
import { siteName } from "@/static/constant";
import ThemeSelector from "../ThemeSelector";

export default function Header() {
  return <header className="transition-colors sticky top-0 z-10 bg-gray-100 px-4 dark:bg-slate-900 dark:text-white">
    <nav className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 items-center h-14">
      <div className="flex flex-row">
        <div>
          <Link className="hover:underline" href="/">
            <div className="flex gap-1.5">
              <svg className="transition-colors size-7 dark:fill-white" id="_layer1" data-name="layer1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path d="M327.51,884.46c5.66,7.25,4.38,17.71-2.87,23.38-3.04,2.38-6.66,3.53-10.24,3.53-4.95,0-9.85-2.2-13.13-6.4L21.17,546.55c-15.9-20.34-15.9-48.76,0-69.1L301.26,119.03c5.66-7.25,16.13-8.53,23.38-2.87,7.25,5.66,8.53,16.13,2.87,23.38l-185.64,237.56c-4.98,6.38-7.69,14.24-7.69,22.34v225.14c0,8.09,2.71,15.96,7.69,22.34l185.64,237.56ZM545.09,694.24c-9.12,9.12-21.11,13.68-33.09,13.68-11.99,0-23.97-4.56-33.09-13.68l-29.98-29.98h-42.39c-25.8,0-46.8-20.99-46.8-46.8v-42.39l-29.98-29.98c-18.25-18.25-18.25-47.94,0-66.18l29.98-29.98v-42.39c0-25.8,20.99-46.8,46.8-46.8h42.39l29.98-29.98c8.84-8.84,20.59-13.71,33.09-13.71s24.25,4.87,33.09,13.71l29.98,29.98h42.39c25.8,0,46.8,20.99,46.8,46.8v42.39l29.98,29.98c8.84,8.84,13.71,20.59,13.71,33.09s-4.87,24.25-13.71,33.09l-29.98,29.98v42.39c0,25.8-20.99,46.8-46.8,46.8h-42.39l-29.98,29.98ZM444.56,542.69v22.98c0,7.59,6.18,13.77,13.77,13.77h22.98c1.77,0,3.46.7,4.71,1.95l16.25,16.25c2.6,2.6,6.06,4.03,9.73,4.03s7.13-1.43,9.73-4.03l16.25-16.25c1.25-1.25,2.94-1.95,4.71-1.95h22.98c7.59,0,13.77-6.18,13.77-13.77v-22.98c0-1.77.7-3.46,1.95-4.71l16.25-16.25c5.37-5.37,5.37-14.1,0-19.47l-16.25-16.25c-1.25-1.25-1.95-2.94-1.95-4.71v-22.98c0-7.59-6.18-13.77-13.77-13.77h-22.98c-1.77,0-3.46-.7-4.71-1.95l-16.25-16.25c-5.37-5.36-14.1-5.37-19.47,0l-16.25,16.25c-1.25,1.25-2.94,1.95-4.71,1.95h-22.98c-7.59,0-13.77,6.18-13.77,13.77v22.98c0,1.77-.7,3.46-1.95,4.71l-16.25,16.25c-2.6,2.6-4.03,6.06-4.03,9.73s1.43,7.13,4.03,9.73l16.25,16.25c1.25,1.25,1.95,2.94,1.95,4.71ZM397.65,785.52c-5.66-7.25-16.13-8.53-23.38-2.87-7.25,5.66-8.53,16.13-2.87,23.38l77.32,98.94c3.28,4.2,8.18,6.4,13.13,6.4,3.58,0,7.2-1.15,10.24-3.53,7.25-5.66,8.53-16.13,2.87-23.38l-77.32-98.94ZM323.92,785.52c-5.66-7.25-16.13-8.53-23.38-2.87-7.25,5.66-8.53,16.13-2.87,23.38l77.32,98.94c3.28,4.2,8.18,6.4,13.13,6.4,3.58,0,7.2-1.15,10.24-3.53,7.25-5.66,8.53-16.13,2.87-23.38l-77.32-98.94ZM645.64,782.66c-7.25-5.67-17.71-4.38-23.38,2.87l-77.32,98.94c-5.66,7.25-4.38,17.71,2.87,23.38,3.04,2.38,6.66,3.53,10.24,3.53,4.95,0,9.85-2.2,13.13-6.4l77.32-98.94c5.66-7.25,4.38-17.71-2.87-23.38ZM719.37,782.66c-7.25-5.67-17.71-4.38-23.38,2.87l-77.32,98.94c-5.66,7.25-4.38,17.71,2.87,23.38,3.04,2.38,6.66,3.53,10.24,3.53,4.95,0,9.85-2.2,13.13-6.4l77.32-98.94c5.66-7.25,4.38-17.71-2.87-23.38ZM1002.83,477.45l-182.57-233.62s-.01-.02-.02-.02l-82.55-105.63c-6.71-8.59-16.8-13.95-27.68-14.7-10.89-.76-21.6,3.17-29.43,10.76l-111.31,107.87c-.55.53-1.04,1.1-1.5,1.69-.11.14-.21.27-.32.41-.89,1.21-1.6,2.51-2.12,3.87-.02.06-.05.12-.07.18-.52,1.4-.85,2.86-.98,4.35-.02.23-.04.46-.05.69-.03.71-.03,1.42.02,2.13,0,.07.02.13.03.2.06.68.18,1.34.32,2.01.03.16.07.31.11.47.18.72.4,1.44.68,2.14,0,.02.01.04.02.06.02.05.05.1.07.15.27.64.58,1.26.93,1.87.07.12.14.25.21.37.38.62.79,1.22,1.26,1.8.09.11.19.21.28.32.24.28.47.56.73.83.16.17.34.31.51.47.14.13.28.26.42.39.55.49,1.12.95,1.72,1.35,0,0,0,0,0,0,.62.42,1.27.78,1.93,1.11.12.06.24.12.36.17,1.37.64,2.8,1.07,4.26,1.32.15.03.3.05.45.07.74.1,1.48.16,2.22.17.03,0,.06,0,.08,0h200.44c11.16,0,21.71,5.14,28.58,13.94l68.16,87.22c4.98,6.38,7.69,14.24,7.69,22.34v235.6c0,8.09-2.71,15.96-7.69,22.34l-181.55,232.33c-5.66,7.25-4.38,17.71,2.87,23.38,3.04,2.38,6.66,3.53,10.24,3.53,4.95,0,9.85-2.2,13.13-6.4l280.09-358.42c15.9-20.34,15.9-48.76,0-69.11Z" />
              </svg>
              <span className="text-lg">{siteName}</span>
            </div>
          </Link>
        </div>
      </div>
      <div className="hidden md:block"><SearchBoxWrapper /></div>
      <div className="flex flex-row-reverse gap-1 sm:gap-3">
        <ThemeSelector />
        <span><Link className="hover:underline" href="/tags">タグ</Link></span>
        <span><Link className="hover:underline" href="/series">シリーズ</Link></span>
        <span><Link className="hover:underline" href="/post">投稿</Link></span>
      </div>
    </nav>
  </header>
}