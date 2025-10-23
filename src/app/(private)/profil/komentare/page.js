import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import CommentsPage from '@/features/CommentsPage/CommentsPage';

export default async function KomentarePage() {
    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    return <CommentsPage user={user} />;
}