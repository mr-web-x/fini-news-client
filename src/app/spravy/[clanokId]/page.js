import { notFound } from "next/navigation";
import ArticleDetailPage from "@/features/PublicPages/ArticleDetailPage/ArticleDetailPage";
import articlesService from "@/services/articles.service";
import commentsService from "@/services/comments.service";
import authService from "@/services/auth.service";
import { cookies } from "next/headers";

export default async function ClanokDetailPage({ params }) {
    // Получаем slug статьи из параметров
    const resolvedParams = await params;
    const clanokId = resolvedParams.clanokId;

    if (!clanokId) {
        notFound();
    }

    // ✅ Получаем токен и пользователя через сервис
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value || null;

    let user = null;
    if (token) {
        try {
            user = await authService.getCurrentUser(token);
        } catch (error) {
            console.error('Error getting user:', error);
        }
    }

    let article = null;
    let relatedArticles = [];
    let comments = [];

    try {
        // Получаем статью по slug через сервис
        article = await articlesService.getArticleBySlug(clanokId);

        // Если статья не найдена или не опубликована - 404
        if (!article || article.status !== 'published') {
            notFound();
        }

        // ✅ ВАЖНО: Увеличиваем счётчик просмотров +1
        try {
            await articlesService.incrementViews(article._id);
            // Обновляем локальное значение views для отображения
            article.views = (article.views || 0) + 1;
        } catch (error) {
            console.error('Error incrementing views:', error);
            // Продолжаем даже если не удалось увеличить счётчик
        }

    } catch (error) {
        console.error('Error loading article:', error);
        notFound();
    }

    try {
        // Получаем похожие статьи (из той же категории) через сервис
        if (article.category?._id) {
            const relatedResponse = await articlesService.getAllArticles({
                category: article.category._id,
                limit: 6,
                sort: '-views'
            });

            relatedArticles = (relatedResponse?.articles || relatedResponse || [])
                .filter(a => a._id !== article._id); // Исключаем текущую статью
        }
    } catch (error) {
        console.error('Error loading related articles:', error);
    }

    // ✅ Загружаем комментарии на сервере
    try {
        const commentsResponse = await commentsService.getArticleComments(article._id, {
            limit: 100,
            sort: '-createdAt' // Новые сверху
        });

        comments = commentsResponse?.comments || commentsResponse || [];
    } catch (error) {
        console.error('Error loading comments:', error);
        // Если ошибка - передаём пустой массив
        comments = [];
    }

    return (
        <ArticleDetailPage
            article={article}
            relatedArticles={relatedArticles}
            comments={comments} // ✅ Передаём комментарии
            user={user}
        />
    );
}