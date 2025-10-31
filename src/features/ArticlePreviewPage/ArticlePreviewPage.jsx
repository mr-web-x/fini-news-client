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

    const handleApprove = async () => {
        if (!window.confirm('Naozaj chcete schváliť tento článok?')) {
            return;
        }

        setIsProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await approveArticle(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol úspešne schválený' });
                setTimeout(() => {
                    router.push('/profil/vsetky-clanky');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: result.message || 'Chyba pri schvaľovaní článku' });
            }
        } catch (error) {
            console.error('Error approving article:', error);
            setMessage({ type: 'error', text: 'Neočakávaná chyba' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setMessage({ type: 'error', text: 'Prosím, uveďte dôvod zamietnutia' });
            return;
        }

        setIsProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await rejectArticle(articleId, rejectReason.trim());

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol zamietnutý' });
                setShowRejectModal(false);
                setRejectReason('');
                setTimeout(() => {
                    router.push('/profil/vsetky-clanky');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: result.message || 'Chyba pri zamietaní článku' });
            }
        } catch (error) {
            console.error('Error rejecting article:', error);
            setMessage({ type: 'error', text: 'Neočakávaná chyba' });
        } finally {
            setIsProcessing(false);
        }
    };

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
                    <h2>❌ {error}</h2>
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
                    {/* ✅ ИСПРАВЛЕНО: Кнопка "Upraviť" для Author */}
                    {user.role === 'author' && (article.status === 'draft' || article.status === 'rejected') && (
                        <Link
                            href={`/profil/moje-clanky/${articleId}/upravit`}
                            className="article-preview__action-btn article-preview__action-btn--edit"
                        >
                            ✏️ Upraviť
                        </Link>
                    )}

                    {/* ✅ НОВОЕ: Кнопка "Upraviť" для Admin (для всех неопубликованных статей) */}
                    {user.role === 'admin' && article.status !== 'published' && (
                        <Link
                            href={`/profil/moje-clanky/${articleId}/upravit`}
                            className="article-preview__action-btn article-preview__action-btn--edit"
                        >
                            ✏️ Upraviť
                        </Link>
                    )}

                    {/* Действия для Admin - модерация */}
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

            {/* ✅ Модальное окно для отклонения (только для admin) */}
            {user.role === 'admin' && (
                <Modal
                    isOpen={showRejectModal}
                    onClose={() => {
                        setShowRejectModal(false);
                        setRejectReason('');
                    }}
                    title="Zamietnuť článok"
                >
                    <div className="reject-modal">
                        <p className="reject-modal__description">
                            Uveďte dôvod zamietnutia článku. Autor dostane túto správu.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Napríklad: Článok neobsahuje dostatočné zdroje..."
                            className="reject-modal__textarea"
                            rows={5}
                            disabled={isProcessing}
                        />
                        <div className="reject-modal__actions">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="reject-modal__btn reject-modal__btn--cancel"
                                disabled={isProcessing}
                            >
                                Zrušiť
                            </button>
                            <button
                                onClick={handleReject}
                                className="reject-modal__btn reject-modal__btn--submit"
                                disabled={isProcessing || !rejectReason.trim()}
                            >
                                {isProcessing ? 'Odosiela sa...' : 'Zamietnuť článok'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ArticlePreviewPage;