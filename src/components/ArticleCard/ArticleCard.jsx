"use client";

import Link from 'next/link';
import "./ArticleCard.scss"

/**
 * Универсальный компонент карточки статьи
 * 
 * @param {Object} article - объект статьи
 * @param {string} variant - тип карточки ('author' или 'admin')
 * @param {function} onDelete - функция удаления статьи
 * @param {function} onApprove - функция одобрения статьи (только admin)
 * @param {function} onReject - функция отклонения статьи (только admin)
 * @param {function} onSubmitForReview - функция отправки на модерацию (только author)
 */
const ArticleCard = ({
    article,
    variant = 'author',
    onDelete,
    onApprove,
    onReject,
    onSubmitForReview
}) => {

    const getStatusLabel = (status) => {
        switch (status) {
            case 'draft': return 'Koncept';
            case 'pending': return 'Na moderácii';
            case 'published': return 'Publikované';
            case 'rejected': return 'Zamietnuté';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'status--draft';
            case 'pending': return 'status--pending';
            case 'published': return 'status--published';
            case 'rejected': return 'status--rejected';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('sk-SK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="article-card">
            {/* Header */}
            <div className="article-card__header">
                <span className={`article-card__status ${getStatusColor(article.status)}`}>
                    {getStatusLabel(article.status)}
                </span>
                <span className="article-card__date">
                    {formatDate(article.createdAt)}
                </span>
                {/* Показываем автора только для admin */}
                {variant === 'admin' && article.author && (
                    <span className="article-card__author">
                        👤 {article.author.firstName} {article.author.lastName}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="article-card__content">
                <h3 className="article-card__title">{article.title}</h3>
                <p className="article-card__excerpt">{article.excerpt}</p>

                {/* Причина отклонения (для rejected статей) */}
                {article.status === 'rejected' && article.rejectionReason && (
                    <div className="article-card__moderation-note">
                        <strong>Dôvod zamietnutia:</strong> {article.rejectionReason}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="article-card__footer">
                {/* Статистика */}
                <div className="article-card__stats">
                    <span className="article-card__stat">👁️ {article.views || 0}</span>
                    <span className="article-card__stat">💬 {article.commentsCount || 0}</span>
                </div>

                {/* Действия */}
                <div className="article-card__actions">
                    {/* ==================== AUTHOR VARIANT ==================== */}
                    {variant === 'author' && (
                        <>
                            {/* ✅ НОВОЕ: Для опубликованных статей - просмотр с комментариями */}
                            {article.status === 'published' && (
                                <Link
                                    href={`/profil/moje-clanky/${article.slug}`}
                                    className="article-card__action-btn article-card__action-btn--view"
                                >
                                    👁️ Zobraziť
                                </Link>
                            )}

                            {/* Для статей на модерации - только предпросмотр */}
                            {article.status === 'pending' && (
                                <Link
                                    href={`/profil/moje-clanky/${article.slug}/ukazka`}
                                    className="article-card__action-btn article-card__action-btn--preview"
                                >
                                    👁️ Náhľad
                                </Link>
                            )}

                            {/* ✅ НОВОЕ: Для черновиков и отклоненных - редактирование и предпросмотр */}
                            {(article.status === 'draft' || article.status === 'rejected') && (
                                <>
                                    <Link
                                        href={`/profil/moje-clanky/${article.slug}/upravit`}
                                        className="article-card__action-btn article-card__action-btn--edit"
                                    >
                                        ✏️ Upraviť
                                    </Link>
                                    <Link
                                        href={`/profil/moje-clanky/${article.slug}/ukazka`}
                                        className="article-card__action-btn article-card__action-btn--preview"
                                    >
                                        👁️ Náhľad
                                    </Link>
                                    <button
                                        onClick={() => onSubmitForReview(article._id)}
                                        className="article-card__action-btn article-card__action-btn--submit"
                                    >
                                        📤 Odoslať na moderáciu
                                    </button>
                                </>
                            )}

                            {/* Удаление (для всех кроме published и pending) */}
                            {article.status !== 'published' && article.status !== 'pending' && (
                                <button
                                    onClick={() => onDelete(article._id)}
                                    className="article-card__action-btn article-card__action-btn--delete"
                                >
                                    🗑️ Vymazať
                                </button>
                            )}
                        </>
                    )}

                    {/* ==================== ADMIN VARIANT ==================== */}
                    {variant === 'admin' && (
                        <>
                            {/* Одобрение и отклонение (только для pending) */}
                            {article.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => onApprove(article._id)}
                                        className="article-card__action-btn article-card__action-btn--approve"
                                    >
                                        ✅ Schváliť
                                    </button>
                                    <button
                                        onClick={() => onReject(article._id)}
                                        className="article-card__action-btn article-card__action-btn--reject"
                                    >
                                        ❌ Zamietnuť
                                    </button>
                                </>
                            )}

                            {/* Просмотр статьи БЕЗ скролла к комментариям */}
                            <Link
                                href={`/profil/vsetky-clanky/${article.slug}`}
                                className="article-card__action-btn article-card__action-btn--view"
                            >
                                👁️ Zobraziť článok
                            </Link>

                            {/* Иконка комментариев - скролл к комментариям (с #comments) */}
                            <Link
                                href={`/profil/vsetky-clanky/${article.slug}#comments`}
                                className="article-card__action-btn article-card__action-btn--comment"
                            >
                                💬 Komentáre
                            </Link>

                            {/* Удаление (для всех статусов) */}
                            <button
                                onClick={() => onDelete(article._id)}
                                className="article-card__action-btn article-card__action-btn--delete"
                            >
                                🗑️ Vymazať
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;