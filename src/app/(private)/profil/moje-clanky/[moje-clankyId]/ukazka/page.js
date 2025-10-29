import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import ArticlePreviewPage from '@/features/ArticlePreviewPage/ArticlePreviewPage';

export default async function UkazkaPage({ params, searchParams }) {
    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // Проверяем роль - доступ для author и admin
    if (user.role !== 'author' && user.role !== 'admin') {
        redirect('/profil');
    }

    // Получаем ID статьи из динамического параметра
    const articleId = params['moje-clankyId'];

    // Если нет ID - редирект на список статей
    if (!articleId) {
        redirect('/profil/moje-clanky');
    }

    return <ArticlePreviewPage user={user} articleId={articleId} />;
}