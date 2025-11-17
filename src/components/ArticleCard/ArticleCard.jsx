"use client";

import Link from 'next/link';
import Image from 'next/image';
import { getArticleImageUrl } from '@/utils/imageHelpers';
import "./ArticleCard.scss";

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
                {variant === 'admin' && article.author && (
                    <span className="article-card__author">
                        👤 {article.author.firstName} {article.author.lastName}
                    </span>
                )}
            </div>

            {/* Cover Image */}
            {article.coverImage && (
                <div className="article-card__image">
                    <Image
                        src={getArticleImageUrl(article.coverImage)}
                        alt={article.title}
                        width={400}
                        height={250}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="article-card__content">
                <h3 className="article-card__title">{article.title}</h3>
                <p className="article-card__excerpt">{article.excerpt}</p>

                {article.status === 'rejected' && article.rejectionReason && (
                    <div className="article-card__moderation-note">
                        <strong>Dôvod zamietnutia:</strong> {article.rejectionReason}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="article-card__footer">
                {/* Statistics */}
                <div className="article-card__stats">
                    <span className="article-card__stat">👁️ {article.views || 0}</span>
                    <span className="article-card__stat">💬 {article.commentsCount || 0}</span>
                </div>

                {/* Actions */}
                <div className="article-card__actions">
                    {/* ==================== AUTHOR VARIANT ==================== */}
                    {variant === 'author' && (
                        <>
                            {/* Для published - просмотр на сайте */}
                            {article.status === 'published' && (
                                <Link
                                    href={`/spravy/${article.slug}`}
                                    className="article-card__action-btn article-card__action-btn--view"
                                >
                                    👁️ Zobraziť
                                </Link>
                            )}

                            {/* ✨ FIX: Для draft - ДОБАВИЛ предпросмотр + редактирование */}
                            {article.status === 'draft' && (
                                <>
                                    <Link
                                        href={`/profil/moje-clanky/${article.slug}/ukazka`}
                                        className="article-card__action-btn article-card__action-btn--preview"
                                    >
                                        👁️ Náhľad
                                    </Link>

                                    <Link
                                        href={`/profil/moje-clanky/${article.slug}/upravit`}
                                        className="article-card__action-btn article-card__action-btn--edit"
                                    >
                                        ✏️ Upraviť
                                    </Link>

                                    <button
                                        onClick={() => onSubmitForReview(article._id)}
                                        className="article-card__action-btn article-card__action-btn--submit"
                                    >
                                        📤 Odoslať na moderáciu
                                    </button>

                                    <button
                                        onClick={() => onDelete(article._id)}
                                        className="article-card__action-btn article-card__action-btn--delete"
                                    >
                                        🗑️ Vymazať
                                    </button>
                                </>
                            )}

                            {/* Для rejected - редактирование */}
                            {article.status === 'rejected' && (
                                <>
                                    <Link
                                        href={`/profil/moje-clanky/${article.slug}/ukazka`}
                                        className="article-card__action-btn article-card__action-btn--preview"
                                    >
                                        👁️ Náhľad
                                    </Link>

                                    <Link
                                        href={`/profil/moje-clanky/${article.slug}/upravit`}
                                        className="article-card__action-btn article-card__action-btn--edit"
                                    >
                                        ✏️ Upraviť
                                    </Link>

                                    <button
                                        onClick={() => onSubmitForReview(article._id)}
                                        className="article-card__action-btn article-card__action-btn--submit"
                                    >
                                        📤 Odoslať na moderáciu
                                    </button>

                                    <button
                                        onClick={() => onDelete(article._id)}
                                        className="article-card__action-btn article-card__action-btn--delete"
                                    >
                                        🗑️ Vymazať
                                    </button>
                                </>
                            )}

                            {/* Для pending - только предпросмотр */}
                            {article.status === 'pending' && (
                                <Link
                                    href={`/profil/moje-clanky/${article.slug}/ukazka`}
                                    className="article-card__action-btn article-card__action-btn--preview"
                                >
                                    👁️ Náhľad
                                </Link>
                            )}
                        </>
                    )}

                    {/* ==================== ADMIN VARIANT ==================== */}
                    {variant === 'admin' && (
                        <>
                            {/* Предпросмотр для всех статусов */}
                            <Link
                                href={`/profil/vsetky-clanky/${article.slug}`}
                                className="article-card__action-btn article-card__action-btn--preview"
                            >
                                👁️ Náhľad
                            </Link>

                            {/* Approve/Reject для pending */}
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

                            {/* Edit для draft */}
                            {article.status === 'draft' && (
                                <Link
                                    href={`/profil/vsetky-clanky/${article.slug}/upravit`}
                                    className="article-card__action-btn article-card__action-btn--edit"
                                >
                                    ✏️ Upraviť
                                </Link>
                            )}

                            {/* Delete (кроме pending) */}
                            {article.status !== 'pending' && (
                                <button
                                    onClick={() => onDelete(article._id)}
                                    className="article-card__action-btn article-card__action-btn--delete"
                                >
                                    🗑️ Vymazať
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;