import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import CategoriesManagementPage from '@/features/CategoriesManagementPage/CategoriesManagementPage';

export default async function KategoriePage() {
    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // Проверяем роль - только admin имеет доступ к управлению категориями
    if (user.role !== 'admin') {
        redirect('/profil');
    }

    return <CategoriesManagementPage user={user} />;
}