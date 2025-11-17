"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getArticleComments } from '@/actions/comments.actions';
import { getArticleImageUrl } from '@/utils/imageHelpers';
import CommentsList from '@/components/CommentsList/CommentsList';
import CommentForm from '@/components/CommentForm/CommentForm';
import "./ArticleViewPage.scss";

/**
 * Страница просмотра статьи с комментариями
 * @param {Object} article - объект статьи
 * @param {Object} user - объект пользователя (может быть null)
 */
const ArticleViewPage = ({ article, user }) => {
    const router = useRouter();
    const commentsRef = useRef(null);

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsCount, setCommentsCount] = useState(0);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Загружаем комментарии при монтировании
    useEffect(() => {
        loadComments();
    }, [article._id]);

    // Скролл к комментариям при загрузке, если есть хеш #comments
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#comments') {
            setTimeout(() => {
                commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }, []);

    // ✅ useEffect для обёртывания таблиц в wrapper
    useEffect(() => {
        if (article && article.content) {
            const wrapTables = () => {
                const bodyElement = document.querySelector('.article-view__body');
                if (!bodyElement) return;

                const tables = bodyElement.querySelectorAll('table');

                tables.forEach(table => {
                    if (!table.parentElement.classList.contains('table-wrapper')) {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'table-wrapper';

                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);
                    }
                });
            };

            const timer = setTimeout(wrapTables, 500);
            return () => clearTimeout(timer);
        }
    }, [article]);

    /**
     * Загрузка комментариев к статье
     */
    const loadComments = async () => {
        setCommentsLoading(true);
        try {
            const result = await getArticleComments(article._id);

            if (result.success) {
                setComments(result.data.comments || []);
                setCommentsCount(result.data.total || 0);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            setMessage({ type: 'error', text: 'Chyba pri načítavaní komentárov' });
        } finally {
            setCommentsLoading(false);
        }
    };

    /**
     * Обработчик успешного добавления комментария
     */
    const handleCommentAdded = () => {
        loadComments();
        setMessage({ type: 'success', text: 'Komentár bol úspešne pridaný' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    /**
     * Обработчик успешного обновления комментария
     */
    const handleCommentUpdated = () => {
        loadComments();
        setMessage({ type: 'success', text: 'Komentár bol úspešne upravený' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    /**
     * Обработчик успешного удаления комментария
     */
    const handleCommentDeleted = () => {
        loadComments();
        setMessage({ type: 'success', text: 'Komentár bol úspešne vymazaný' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    /**
     * Форматирование даты
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('sk-SK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Получение статуса статьи на словацком
     */
    const getStatusLabel = (status) => {
        switch (status) {
            case 'draft': return 'Koncept';
            case 'pending': return 'Na moderácii';
            case 'published': return 'Publikované';
            case 'rejected': return 'Zamietnuté';
            default: return status;
        }
    };

    return (
        <div className="article-view-page">
            {/* Навигация назад */}
            <div className="article-view__header">
                <Link href="/profil/vsetky-clanky" className="article-view__back-link">
                    ← Späť na všetky články
                </Link>
            </div>

            {/* Сообщения */}
            {message.text && (
                <div className={`article-view__message article-view__message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Контент статьи */}
            <article className="article-view__content">
                {/* Мета информация */}
                <div className="article-view__meta">
                    <span className={`article-view__status article-view__status--${article.status}`}>
                        {getStatusLabel(article.status)}
                    </span>
                    <span className="article-view__date">
                        {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                    {article.category && (
                        <span className="article-view__category">
                            📁 {article.category.name}
                        </span>
                    )}
                </div>

                {/* Заголовок */}
                <h1 className="article-view__title">{article.title}</h1>

                {/* Автор */}
                {article.author && (
                    <div className="article-view__author">
                        {article.author.avatar && (
                            <img
                                src={article.author.avatar}
                                alt={`${article.author.firstName} ${article.author.lastName}`}
                                className="article-view__author-avatar"
                            />
                        )}
                        <div className="article-view__author-info">
                            <span className="article-view__author-name">
                                {article.author.firstName} {article.author.lastName}
                            </span>
                            {article.author.position && (
                                <span className="article-view__author-position">
                                    {article.author.position}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* ✨ NEW: Cover Image */}
                {article.coverImage && (
                    <div className="article-view__cover-image">
                        <Image
                            src={getArticleImageUrl(article.coverImage)}
                            alt={article.title}
                            width={1200}
                            height={630}
                            style={{ width: '100%', height: 'auto' }}
                            priority
                        />
                    </div>
                )}

                {/* Краткое описание */}
                {article.excerpt && (
                    <div className="article-view__excerpt">
                        {article.excerpt}
                    </div>
                )}

                {/* Основной контент будет автоматически обёрнут в table-wrapper */}
                {article.content && article.content.trim() !== '' && (
                    <div
                        className="article-view__body"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                )}

                {/* Теги */}
                {article.tags && article.tags.length > 0 && (
                    <div className="article-view__tags">
                        {article.tags.map((tag, index) => (
                            <span key={index} className="article-view__tag">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Статистика */}
                <div className="article-view__stats">
                    <span className="article-view__stat">👁️ {article.views || 0} zobrazení</span>
                    <span className="article-view__stat">💬 {commentsCount} komentárov</span>
                </div>
            </article>

            {/* Секция комментариев */}
            <section id="comments" ref={commentsRef} className="article-view__comments-section">
                <h2 className="article-view__comments-title">
                    Komentáre ({commentsCount})
                </h2>

                {/* Список комментариев */}
                <CommentsList
                    comments={comments}
                    loading={commentsLoading}
                    user={user}
                    onCommentUpdated={handleCommentUpdated}
                    onCommentDeleted={handleCommentDeleted}
                />
            </section>

            {/* Форма для добавления комментария (position: fixed) */}
            {user && (
                <CommentForm
                    articleId={article._id}
                    user={user}
                    onCommentAdded={handleCommentAdded}
                />
            )}

            {/* Сообщение для неавторизованных пользователей */}
            {!user && (
                <div className="article-view__login-prompt">
                    <p>Prihláste sa, aby ste mohli pridať komentár</p>
                    <Link href="/prihlasenie" className="article-view__login-button">
                        Prihlásiť sa
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ArticleViewPage;