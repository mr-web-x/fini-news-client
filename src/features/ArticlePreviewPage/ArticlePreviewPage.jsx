"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getArticleById, approveArticle, rejectArticle } from '@/actions/articles.actions';
import Modal from '@/components/Modal/Modal';
import './ArticlePreviewPage.scss';

const ArticlePreviewPage = ({ user, articleId }) => {
    const router = useRouter();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Состояния для модерации (admin)
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadArticle();
    }, [articleId]);

    const loadArticle = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getArticleById(articleId);

            if (!result.success) {
                setError(result.message);
                return;
            }

            const articleData = result.data;

            // Проверка прав доступа
            if (user.role === 'author') {
                // Author может просматривать только свои статьи
                const authorId = articleData.author?.id || articleData.author;
                const userId = user.id;

                // Сравниваем как строки
                if (String(authorId) !== String(userId)) {
                    setError('Nemáte oprávnenie na prezeranie tohto článku');
                    return;
                }
            }
            // Admin может просматривать любые статьи

            setArticle(articleData);
        } catch (err) {
            console.error('Error loading article:', err);
            setError('Chyba pri načítavaní článku');
        } finally {
            setLoading(false);
        }
    };

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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ==================== ДЕЙСТВИЯ ДЛЯ ADMIN ====================

    const handleApprove = async () => {
        if (!confirm('Schváliť a publikovať tento článok?')) return;

        setIsProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await approveArticle(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol schválený a publikovaný' });
                setTimeout(() => {
                    router.push('/profil/vsetky-clanky');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Error approving article:', error);
            setMessage({ type: 'error', text: 'Chyba pri schvaľovaní článku' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason || rejectReason.trim().length < 10) {
            setMessage({ type: 'error', text: 'Dôvod zamietnutia musí mať minimálne 10 znakov' });
            return;
        }

        setIsProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await rejectArticle(articleId, rejectReason);

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol zamietnutý' });
                setShowRejectModal(false);
                setTimeout(() => {
                    router.push('/profil/vsetky-clanky');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Error rejecting article:', error);
            setMessage({ type: 'error', text: 'Chyba pri zamietaní článku' });
        } finally {
            setIsProcessing(false);
        }
    };

    // ==================== РЕНДЕР ====================

    if (loading) {
        return (
            <div className="article-preview">
                <div className="article-preview__loading">
                    <div className="spinner"></div>
                    <p>Načítavam článok...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="article-preview">
                <div className="article-preview__error">
                    <div className="article-preview__error-icon">⚠️</div>
                    <h2>Chyba</h2>
                    <p>{error}</p>
                    <Link
                        href={user.role === 'admin' ? '/profil/vsetky-clanky' : '/profil/moje-clanky'}
                        className="article-preview__back-btn"
                    >
                        🔙 Späť na zoznam
                    </Link>
                </div>
            </div>
        );
    }

    if (!article) {
        return null;
    }

    return (
        <div className="article-preview">
            {/* Header с действиями */}
            <div className="article-preview__header">
                <Link
                    href={user.role === 'admin' ? '/profil/vsetky-clanky' : '/profil/moje-clanky'}
                    className="article-preview__back-link"
                >
                    ← Späť na zoznam
                </Link>

                <div className="article-preview__actions">
                    {/* Действия для Author */}
                    {user.role === 'author' && article.status !== 'published' && (
                        <Link
                            href={`/profil/novy-clanok?id=${articleId}`}
                            className="article-preview__action-btn article-preview__action-btn--edit"
                        >
                            ✏️ Upraviť
                        </Link>
                    )}

                    {/* Действия для Admin */}
                    {user.role === 'admin' && article.status === 'pending' && (
                        <>
                            <button
                                onClick={handleApprove}
                                className="article-preview__action-btn article-preview__action-btn--approve"
                                disabled={isProcessing}
                            >
                                ✅ Schváliť
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="article-preview__action-btn article-preview__action-btn--reject"
                                disabled={isProcessing}
                            >
                                ❌ Zamietnuť
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`article-preview__message article-preview__message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Article Content */}
            <article className="article-preview__content">
                {/* Meta Info */}
                <div className="article-preview__meta">
                    <span className={`article-preview__status ${getStatusColor(article.status)}`}>
                        {getStatusLabel(article.status)}
                    </span>
                    <span className="article-preview__date">
                        {formatDate(article.createdAt)}
                    </span>
                    {user.role === 'admin' && article.author && (
                        <span className="article-preview__author">
                            👤 {article.author.displayName || article.author.email}
                        </span>
                    )}
                </div>

                {/* Category */}
                {article.category && (
                    <div className="article-preview__category">
                        🏷️ {article.category.name || 'Bez kategórie'}
                    </div>
                )}

                {/* Title */}
                <h1 className="article-preview__title">{article.title}</h1>

                {/* Perex (Excerpt) */}
                {article.excerpt && (
                    <div className="article-preview__excerpt">
                        {article.excerpt}
                    </div>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                    <div className="article-preview__tags">
                        {article.tags.map((tag, index) => (
                            <span key={index} className="article-preview__tag">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Main Content (HTML from TinyMCE) */}
                <div
                    className="article-preview__body"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Statistics */}
                <div className="article-preview__stats">
                    <div className="article-preview__stat">
                        <span className="article-preview__stat-icon">👁️</span>
                        <span className="article-preview__stat-value">{article.views || 0}</span>
                        <span className="article-preview__stat-label">zobrazení</span>
                    </div>
                    <div className="article-preview__stat">
                        <span className="article-preview__stat-icon">💬</span>
                        <span className="article-preview__stat-value">{article.commentsCount || 0}</span>
                        <span className="article-preview__stat-label">komentárov</span>
                    </div>
                </div>

                {/* ✅ ИСПРАВЛЕНО: moderationNote → rejectionReason */}
                {article.status === 'rejected' && article.rejectionReason && (
                    <div className="article-preview__moderation-note">
                        <strong>Dôvod zamietnutia:</strong> {article.rejectionReason}
                    </div>
                )}
            </article>

            {/* Modal для отклонения статьи (Admin) */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Zamietnuť článok"
                size="medium"
            >
                <div className="reject-modal">
                    <p className="reject-modal__description">
                        Uveďte dôvod zamietnutia článku (minimálne 10 znakov):
                    </p>
                    <textarea
                        className="reject-modal__textarea"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Napr: Článok neobsahuje dostatočné informácie..."
                        rows={5}
                        disabled={isProcessing}
                    />
                    <div className="reject-modal__actions">
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="reject-modal__btn reject-modal__btn--cancel"
                            disabled={isProcessing}
                        >
                            Zrušiť
                        </button>
                        <button
                            onClick={handleRejectSubmit}
                            className="reject-modal__btn reject-modal__btn--submit"
                            disabled={!rejectReason || rejectReason.trim().length < 10 || isProcessing}
                        >
                            {isProcessing ? 'Spracúvam...' : 'Zamietnuť článok'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ArticlePreviewPage;