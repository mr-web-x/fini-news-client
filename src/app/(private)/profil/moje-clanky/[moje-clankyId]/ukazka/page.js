import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import ArticlePreviewPage from '@/features/ArticlePreviewPage/ArticlePreviewPage';

/**
 * Серверная страница предпросмотра статьи
 * Route: /profil/moje-clanky/[moje-clankyId]/ukazka
 * @param {Object} props
 * @param {Promise<Object>} props.params - параметры маршрута (async в Next.js 15)
 */
export default async function UkazkaPage({ params, searchParams }) {
    // ✅ ИСПРАВЛЕНО: await params для Next.js 15
    const resolvedParams = await params;

    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // ✅ ИСПРАВЛЕНО: Проверяем роль - доступ для author и admin
    if (user.role !== 'author' && user.role !== 'admin') {
        redirect('/profil');
    }

    // Получаем ID статьи из динамического параметра
    const articleId = resolvedParams['moje-clankyId'];

    // Если нет ID - редирект на список статей
    if (!articleId) {
        redirect('/profil/moje-clanky');
    }

    // ArticlePreviewPage сам проверит права доступа:
    // - Author может просматривать только СВОИ статьи
    // - Admin может просматривать любые статьи
    return <ArticlePreviewPage user={user} articleId={articleId} />;
}