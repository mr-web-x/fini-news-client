import { redirect } from 'next/navigation';
import { getMe } from '@/actions/auth.actions';
import PrivateLayout from '@/features/PrivateLayout/PrivateLayout';

export default async function ProfilLayout({ children }) {
    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // SSR: Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // Передаем данные прямо в PrivateLayout
    return (
        <PrivateLayout user={user}>
            {children}
        </PrivateLayout>
    );
}