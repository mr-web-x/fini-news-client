import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import NewArticlePage from '@/features/NewArticlePage/NewArticlePage';

export default async function NovyClanokPage() {
    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // Проверяем роль - только author и admin могут создавать статьи
    if (user.role !== 'author' && user.role !== 'admin') {
        redirect('/profil');
    }

    return <NewArticlePage user={user} />;
}