import { getArticleById } from '@/actions/articles.actions';
import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import ArticleViewPage from '@/features/ArticleViewPage/ArticleViewPage';

/**
 * Серверная страница просмотра статьи в приватной зоне
 * Route: /profil/vsetky-clanky/[vsetky-clankyId]
 * @param {Object} props
 * @param {Promise<Object>} props.params - параметры маршрута (async в Next.js 15)
 */
export default async function VsetkyClankyDetailPage({ params }) {
    // ✅ ИСПРАВЛЕНО: await params для Next.js 15
    const resolvedParams = await params;

    // Получаем ID статьи из параметров маршрута
    const articleId = resolvedParams['vsetky-clankyId'];

    // Получаем данные пользователя (обязательно для приватной зоны)
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // Проверяем роль - доступ только для админа
    if (user.role !== 'admin') {
        redirect('/profil');
    }

    // Если нет ID - редирект на список всех статей
    if (!articleId) {
        redirect('/profil/vsetky-clanky');
    }

    // Получаем статью по ID
    const result = await getArticleById(articleId);

    // Если статья не найдена - редирект на список
    if (!result.success || !result.data) {
        redirect('/profil/vsetky-clanky');
    }

    const article = result.data;

    // Передаем данные в клиентский компонент
    return <ArticleViewPage article={article} user={user} />;
}