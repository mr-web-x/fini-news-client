import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import UsersManagementPage from '@/features/UsersManagementPage/UsersManagementPage';

export default async function PouzivateliaPage() {
    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // Проверяем роль - только admin имеет доступ к управлению пользователями
    if (user.role !== 'admin') {
        redirect('/profil');
    }

    return <UsersManagementPage user={user} />;
}