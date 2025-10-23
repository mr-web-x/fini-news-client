import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import SettingsPage from '@/features/SettingsPage/SettingsPage';

export default async function NastaveniaPage() {
    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    return <SettingsPage user={user} />;
}