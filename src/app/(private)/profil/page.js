import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import DashboardPage from '@/features/DashboardPage/DashboardPage';

export default async function ProfilPage() {
    // Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    return <DashboardPage user={user} />;
}