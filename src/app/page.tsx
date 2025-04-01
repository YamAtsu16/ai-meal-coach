import { redirect } from 'next/navigation';

/**
 * ホームページ
 * @returns ホームページ
 */
export default function Home() {
  // ホームページ（ダッシュボード）にリダイレクト
  redirect('/home');
}
