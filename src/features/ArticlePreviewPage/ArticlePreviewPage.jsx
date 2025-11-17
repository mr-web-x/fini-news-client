"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getArticleById, approveArticle, rejectArticle } from '@/actions/articles.actions';
import { getArticleImageUrl } from '@/utils/imageHelpers';
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

    // ✅ НОВОЕ: useEffect для обёртывания таблиц в wrapper
    useEffect(() => {
        if (article && article.content) {
            const wrapTables = () => {
                const bodyElement = document.querySelector('.article-preview__body');
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

            setTimeout(wrapTables, 100);
        }
    }, [article]);

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
                const authorId = articleData.author?.id || articleData.author;
                const userId = user.id;

                if (String(authorId) !== String(userId)) {
                    setError('Nemáte oprávnenie na prezeranie tohto článku');
                    return;
                }
            }

            setArticle(articleData);
        } catch (error) {
            console.error('Error loading article:', error);
            setError('Chyba pri načítavaní článku');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('Naozaj chcete schváliť tento článok?')) return;

        setIsProcessing(true);
        try {
            const result = await approveArticle(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol schválený a publikovaný' });
                setTimeout(() => router.push('/profil/moderacia'), 1500);
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
        if (!rejectReason.trim()) {
            setMessage({ type: 'error', text: 'Zadajte dôvod zamietnutia' });
            return;
        }

        setIsProcessing(true);
        try {
            const result = await rejectArticle(articleId, rejectReason);

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol zamietnutý' });
                setShowRejectModal(false);
                setTimeout(() => router.push('/profil/moderacia'), 1500);
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
                    <h2>❌ Chyba</h2>
                    <p>{error}</p>
                    <Link href="/profil/moje-clanky" className="article-preview__back-btn">
                        ← Späť na moje články
                    </Link>
                </div>
            </div>
        );
    }

    if (!article) return null;

    return (
        <div className="article-preview">
            {/* Header */}
            <div className="article-preview__header">
                <Link href="/profil/moje-clanky" className="article-preview__back-link">
                    ← Späť
                </Link>

                <div className="article-preview__actions">
                    {/* Edit button (only for draft/rejected) */}
                    {(article.status === 'draft' || article.status === 'rejected') && (
                        <Link
                            href={`/profil/novy-clanok?id=${article._id}`}
                            className="article-preview__action-btn article-preview__action-btn--edit"
                        >
                            ✏️ Upraviť
                        </Link>
                    )}

                    {/* Admin actions */}
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

            {/* Content */}
            <div className="article-preview__content">
                {/* Meta info */}
                <div className="article-preview__meta">
                    <span className={`article-preview__status ${getStatusColor(article.status)}`}>
                        {getStatusLabel(article.status)}
                    </span>
                    <span className="article-preview__date">
                        📅 {formatDate(article.createdAt)}
                    </span>
                    {article.author && (
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

                {/* ✨ NEW: Cover Image */}
                {article.coverImage && (
                    <div className="article-preview__image">
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

                {/* Main Content */}
                <div
                    className="article-preview__body"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Statistics */}
                <div className="article-preview__stats">
                    <div className="article-preview__stat">
                        <span className="article-preview__stat-label">Zobrazenia:</span>
                        <span className="article-preview__stat-value">{article.views || 0}</span>
                    </div>
                    <div className="article-preview__stat">
                        <span className="article-preview__stat-label">Komentáre:</span>
                        <span className="article-preview__stat-value">{article.commentsCount || 0}</span>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <Modal onClose={() => setShowRejectModal(false)}>
                    <div className="reject-modal">
                        <h3 className="reject-modal__title">Zamietnuť článok</h3>
                        <p className="reject-modal__description">
                            Zadajte dôvod zamietnutia, ktorý uvidí autor:
                        </p>
                        <textarea
                            className="reject-modal__textarea"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Napríklad: Článok obsahuje faktické chyby..."
                            rows={5}
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