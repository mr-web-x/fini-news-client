import { getArticleBySlug } from '@/actions/articles.actions';
import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import ArticleViewPage from '@/features/ArticleViewPage/ArticleViewPage';

/**
 * ========================================
 * ОБНОВЛЕННАЯ АДМИНСКАЯ СТРАНИЦА ПРОСМОТРА
 * ========================================
 * 
 * Route: /profil/vsetky-clanky/[articleSlug]
 * 
 * ИЗМЕНЕНИЯ:
 * 1. Параметр изменён с [vsetky-clankyId] на [articleSlug]
 * 2. Используется getArticleBySlug() вместо getArticleById()
 * 3. URL: /profil/vsetky-clanky/nova-sprava-o-financiach
 * 
 * @param {Object} params - параметры маршрута
 * @param {string} params.articleSlug - slug статьи
 */
export default async function VsetkyClankyDetailPage({ params }) {
    // ✅ ИЗМЕНЕНО: Получаем SLUG статьи из параметров вместо ID
    const resolvedParams = await params;
    const articleSlug = resolvedParams['articleSlug'];

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

    // Если нет slug - редирект на список всех статей
    if (!articleSlug) {
        redirect('/profil/vsetky-clanky');
    }

    // ✅ ИЗМЕНЕНО: Получаем статью по SLUG вместо ID
    const result = await getArticleBySlug(articleSlug);

    // Если статья не найдена - редирект на список
    if (!result.success || !result.data) {
        redirect('/profil/vsetky-clanky');
    }

    const article = result.data;

    // Передаем данные в клиентский компонент
    return <ArticleViewPage article={article} user={user} />;
}