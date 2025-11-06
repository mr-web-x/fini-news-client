import { notFound } from "next/navigation";
import ArticleDetailPage from "@/features/PublicPages/ArticleDetailPage/ArticleDetailPage";
import articlesService from "@/services/articles.service";
import commentsService from "@/services/comments.service";
import authService from "@/services/auth.service";
import { cookies } from "next/headers";

export default async function ClanokDetailPage({ params }) {
    const resolvedParams = await params;
    const clanokId = resolvedParams.clanokId;

    if (!clanokId) {
        notFound();
    }

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
        article = await articlesService.getArticleBySlug(clanokId);

        if (!article || article.status !== 'published') {
            notFound();
        }

        // ✅ ДОБАВЬТЕ ПРОВЕРКУ ДАННЫХ НА СЕРВЕРЕ
        console.log('🔍 SERVER - Article Author Data:', {
            author: article.author,
            bio: article.author?.bio,
            bioExists: !!article.author?.bio,
            bioLength: article.author?.bio?.length,
            authorId: article.author?._id
        });

        try {
            await articlesService.incrementViews(article._id);
            article.views = (article.views || 0) + 1;
        } catch (error) {
            console.error('Error incrementing views:', error);
        }

    } catch (error) {
        console.error('Error loading article:', error);
        notFound();
    }

    try {
        if (article.category?._id) {
            const relatedResponse = await articlesService.getAllArticles({
                category: article.category._id,
                limit: 6,
                sort: '-views'
            });

            relatedArticles = (relatedResponse?.articles || relatedResponse || [])
                .filter(a => a._id !== article._id);
        }
    } catch (error) {
        console.error('Error loading related articles:', error);
    }

    try {
        const commentsResponse = await commentsService.getArticleComments(article._id, {
            limit: 100,
            sort: '-createdAt'
        });

        comments = commentsResponse?.comments || commentsResponse || [];
    } catch (error) {
        console.error('Error loading comments:', error);
        comments = [];
    }

    return (
        <ArticleDetailPage
            article={article}
            relatedArticles={relatedArticles}
            comments={comments}
            user={user}
        />
    );
}