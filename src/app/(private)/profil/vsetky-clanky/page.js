import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import AllArticlesPage from '@/features/AllArticlesPage/AllArticlesPage';

export default async function VsetkyClankyPage() {
    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // Проверяем роль - только admin имеет доступ ко всем статьям
    if (user.role !== 'admin') {
        redirect('/profil');
    }

    return <AllArticlesPage user={user} />;
}