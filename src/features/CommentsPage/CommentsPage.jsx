"use client";

import { useState, useEffect } from "react";
import { getMyComments, getAllCommentsForAdmin, updateComment, deleteComment, moderateComment } from "@/actions/comments.actions";
import "./CommentsPage.scss";

const CommentsPage = ({ user }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('my'); // my (мои), all (все - только для админа)
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [counts, setCounts] = useState({ my: 0, all: 0 }); // ✅ ДОБАВЛЕНО: отдельные счетчики

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        loadComments();
    }, [filter]);

    const loadComments = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let result;

            // Админ может переключаться между своими и всеми комментариями
            if (isAdmin && filter === 'all') {
                result = await getAllCommentsForAdmin({ sort: '-createdAt', limit: 100 });

                if (result.success) {
                    const commentsData = result.data.comments || result.data || [];
                    setComments(commentsData);
                    setCounts(prev => ({ ...prev, all: commentsData.length })); // ✅ Устанавливаем счетчик для всех комментариев

                    // ✅ ДОБАВЛЕНО: Загружаем отдельно счетчик для моих комментариев
                    const myCommentsResult = await getMyComments({ sort: '-createdAt', limit: 100 });
                    if (myCommentsResult.success) {
                        const myCommentsData = myCommentsResult.data.comments || myCommentsResult.data || [];
                        setCounts(prev => ({ ...prev, my: myCommentsData.length }));
                    }
                }
            } else {
                // Обычные пользователи и админ в режиме "мои комментарии"
                result = await getMyComments({ sort: '-createdAt', limit: 100 });

                if (result.success) {
                    const commentsData = result.data.comments || result.data || [];
                    setComments(commentsData);
                    setCounts(prev => ({ ...prev, my: commentsData.length })); // ✅ Устанавливаем счетчик для моих комментариев

                    // ✅ ДОБАВЛЕНО: Если админ, загружаем счетчик для всех комментариев
                    if (isAdmin) {
                        const allCommentsResult = await getAllCommentsForAdmin({ sort: '-createdAt', limit: 100 });
                        if (allCommentsResult.success) {
                            const allCommentsData = allCommentsResult.data.comments || allCommentsResult.data || [];
                            setCounts(prev => ({ ...prev, all: allCommentsData.length }));
                        }
                    }
                }
            }

            if (!result.success) {
                setMessage({ type: 'error', text: result.message });
                setComments([]);
                setLoading(false);
                return;
            }

        } catch (error) {
            console.error('Error loading comments:', error);
            setMessage({ type: 'error', text: 'Chyba pri načítavaní komentárov' });
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (comment) => {
        setEditingComment(comment._id);
        setEditText(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditText('');
    };

    const handleSaveEdit = async (commentId) => {
        if (!editText || editText.trim().length < 3) {
            setMessage({ type: 'error', text: 'Komentár musí obsahovať minimálne 3 znaky' });
            return;
        }

        try {
            const result = await updateComment(commentId, editText.trim());

            if (result.success) {
                setMessage({ type: 'success', text: 'Komentár bol upravený' });

                // Обновляем комментарий в списке
                setComments(prev => prev.map(comment =>
                    comment._id === commentId
                        ? { ...comment, content: editText.trim(), updatedAt: new Date().toISOString() }
                        : comment
                ));

                setEditingComment(null);
                setEditText('');

                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            setMessage({ type: 'error', text: 'Chyba pri úprave komentára' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    const handleDelete = async (comment) => {
        const isMyComment = comment.user?._id === user?.id || comment.user?._id === user?._id;

        if (!confirm('Ste si istí, že chcete vymazať tento komentár?')) {
            return;
        }

        try {
            let result;

            // Админ может удалять любые комментарии через moderateComment
            // Обычные пользователи - только свои через deleteComment
            if (isAdmin && !isMyComment) {
                result = await moderateComment(comment._id);
            } else {
                result = await deleteComment(comment._id);
            }

            if (result.success) {
                setMessage({ type: 'success', text: 'Komentár bol vymazaný' });

                // Убираем комментарий из списка
                setComments(prev => prev.filter(c => c._id !== comment._id));

                // ✅ ОБНОВЛЯЕМ счетчики после удаления
                setCounts(prev => ({
                    my: isMyComment ? prev.my - 1 : prev.my,
                    all: prev.all - 1
                }));

                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            setMessage({ type: 'error', text: 'Chyba pri mazaní komentára' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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

    const isMyComment = (comment) => {
        return comment.user?._id === user?.id || comment.user?._id === user?._id;
    };

    // ✅ НОВАЯ ФУНКЦИЯ: Получение правильной ссылки на статью
    const getArticleLink = (comment) => {
        // Если нет информации о статье
        if (!comment.article?._id) {
            return '#';
        }

        // Для админа - ссылка на предпросмотр в приватной зоне
        if (isAdmin) {
            return `/profil/moje-clanky/${comment.article._id}/ukazka`;
        }

        // Для обычных пользователей и авторов:
        // Если статья опубликована - публичная ссылка
        if (comment.article?.status === 'published' && comment.article?.slug) {
            return `/clanky/${comment.article.slug}`;
        }

        // Если статья не опубликована - ссылка на предпросмотр в приватной зоне
        return `/profil/moje-clanky/${comment.article._id}/ukazka`;
    };

    if (loading) {
        return (
            <div className="comments-loading">
                <div className="spinner"></div>
                <p>Načítavam komentáre...</p>
            </div>
        );
    }

    return (
        <div className="comments-page">
            <div className="comments__header">
                <h1>{isAdmin && filter === 'all' ? 'Všetky komentáre' : 'Moje komentáre'}</h1>
                <p>
                    {isAdmin && filter === 'all'
                        ? 'Spravujte všetky komentáre v systéme a vykonávajte moderáciu'
                        : 'Spravujte svoje komentáre pod článkami'
                    }
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`comments__message comments__message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Filter Tabs - только для админа */}
            {isAdmin && (
                <div className="comments__filters">
                    <button
                        onClick={() => setFilter('my')}
                        className={`comments__filter-btn ${filter === 'my' ? 'active' : ''}`}
                    >
                        {/* ✅ ИСПРАВЛЕНО: Используем отдельные счетчики */}
                        Moje komentáre ({counts.my})
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`comments__filter-btn ${filter === 'all' ? 'active' : ''}`}
                    >
                        {/* ✅ ИСПРАВЛЕНО: Используем отдельные счетчики */}
                        Všetky komentáre ({counts.all})
                    </button>
                </div>
            )}

            {/* Comments List */}
            <div className="comments__list">
                {comments.length === 0 ? (
                    <div className="comments__empty">
                        <div className="comments__empty-icon">💬</div>
                        <h3>Zatiaľ žiadne komentáre</h3>
                        <p>
                            {isAdmin && filter === 'all'
                                ? 'V systéme zatiaľ nie sú žiadne komentáre.'
                                : 'Začnite diskutovať pod článkami a vaše komentáre sa zobrazia tu.'
                            }
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="comment-card">
                            <div className="comment-card__header">
                                <div className="comment-card__article">
                                    {/* ✅ ИСПРАВЛЕНО: Используем функцию getArticleLink */}
                                    <a
                                        href={getArticleLink(comment)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="comment-card__article-link"
                                    >
                                        📄 {comment.article?.title || 'Článok bol vymazaný'}
                                    </a>
                                </div>
                                <div className="comment-card__date">
                                    {formatDate(comment.createdAt)}
                                    {comment.updatedAt !== comment.createdAt && (
                                        <span className="comment-card__edited">(upravené)</span>
                                    )}
                                </div>
                            </div>

                            {/* Показываем автора если админ смотрит все комментарии */}
                            {isAdmin && filter === 'all' && (
                                <div className="comment-card__author-info">
                                    <span className="comment-card__author-label">Autor:</span>
                                    <span className="comment-card__author-name">
                                        {(() => {
                                            // Пытаемся получить полное имя
                                            if (comment.user?.firstName && comment.user?.lastName) {
                                                return `${comment.user.firstName} ${comment.user.lastName}`;
                                            }
                                            // Если есть только firstName
                                            if (comment.user?.firstName) {
                                                return comment.user.firstName;
                                            }
                                            // Если есть только lastName
                                            if (comment.user?.lastName) {
                                                return comment.user.lastName;
                                            }
                                            // Fallback на email
                                            if (comment.user?.email) {
                                                return comment.user.email;
                                            }
                                            // Последний fallback
                                            return 'Neznámy autor';
                                        })()}
                                    </span>
                                    {isMyComment(comment) && (
                                        <>
                                            {' '}
                                            <span className="comment-card__author-badge">Vy</span>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="comment-card__content">
                                {editingComment === comment._id ? (
                                    <div className="comment-card__edit">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="comment-card__edit-textarea"
                                            rows="3"
                                            maxLength="1000"
                                        />
                                        <div className="comment-card__edit-info">
                                            {editText.length}/1000 znakov
                                        </div>
                                        <div className="comment-card__edit-actions">
                                            <button
                                                onClick={() => handleSaveEdit(comment._id)}
                                                className="comment-card__save-btn"
                                                disabled={editText.trim().length < 3}
                                            >
                                                Uložiť
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="comment-card__cancel-btn"
                                            >
                                                Zrušiť
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="comment-card__text">{comment.content}</p>
                                )}
                            </div>

                            <div className="comment-card__footer">
                                {/* ✅ ИСПРАВЛЕНО: Удалена секция с ID комментария */}

                                <div className="comment-card__actions">
                                    {/* Редактировать можно только свои комментарии */}
                                    {isMyComment(comment) && editingComment !== comment._id && (
                                        <button
                                            onClick={() => handleEdit(comment)}
                                            className="comment-card__action-btn comment-card__edit-btn"
                                        >
                                            ✏️ Upraviť
                                        </button>
                                    )}

                                    {/* Админ может удалять любые комментарии, обычные юзеры - только свои */}
                                    {(isAdmin || isMyComment(comment)) && editingComment !== comment._id && (
                                        <button
                                            onClick={() => handleDelete(comment)}
                                            className="comment-card__action-btn comment-card__delete-btn"
                                        >
                                            🗑️ Vymazať
                                        </button>
                                    )}

                                    {/* Показываем статус "чужой комментарий" для админа */}
                                    {isAdmin && !isMyComment(comment) && (
                                        <span className="comment-card__moderation-badge">
                                            Moderácia
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentsPage;