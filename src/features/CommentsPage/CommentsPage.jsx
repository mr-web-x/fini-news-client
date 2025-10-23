"use client";

import { useState, useEffect } from "react";
import "./CommentsPage.scss";

const CommentsPage = ({ user }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, recent, popular
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        loadUserComments();
    }, [filter]);

    const loadUserComments = async () => {
        setLoading(true);
        try {
            // TODO: заменить на реальный API вызов
            // const result = await getUserComments(user.id, filter);

            // Моковые данные
            const mockComments = [
                {
                    id: 1,
                    content: "Veľmi zaujímavý článok! Mám však otázku ohľadom tretieho bodu...",
                    articleTitle: "Nové úroky hypoték 2025",
                    articleSlug: "nove-uroky-hypotek-2025",
                    createdAt: "2025-01-20T10:30:00Z",
                    updatedAt: "2025-01-20T10:30:00Z",
                    likes: 5,
                    replies: 2
                },
                {
                    id: 2,
                    content: "Súhlasím s autorom. Takéto opatrenia sú naozaj potrebné.",
                    articleTitle: "Daňové zmeny od januára",
                    articleSlug: "danove-zmeny-januar",
                    createdAt: "2025-01-19T15:45:00Z",
                    updatedAt: "2025-01-19T15:45:00Z",
                    likes: 12,
                    replies: 0
                },
                {
                    id: 3,
                    content: "Môžete prosím objasniť posledný bod? Nie je mi to úplne jasné.",
                    articleTitle: "Investície pre začiatočníkov",
                    articleSlug: "investicie-pre-zaciatocnikov",
                    createdAt: "2025-01-18T09:15:00Z",
                    updatedAt: "2025-01-18T09:15:00Z",
                    likes: 3,
                    replies: 1
                }
            ];

            setComments(mockComments);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.content);
    };

    const handleSaveEdit = async (commentId) => {
        try {
            // TODO: API call to update comment
            // await updateComment(commentId, editText);

            setComments(prev => prev.map(comment =>
                comment.id === commentId
                    ? { ...comment, content: editText, updatedAt: new Date().toISOString() }
                    : comment
            ));

            setEditingComment(null);
            setEditText('');
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Ste si istí, že chcete vymazať tento komentár?')) {
            return;
        }

        try {
            // TODO: API call to delete comment
            // await deleteComment(commentId);

            setComments(prev => prev.filter(comment => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('sk-SK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                <h1>Moje komentáre</h1>
                <p>Spravujte svoje komentáre pod článkami</p>
            </div>

            {/* Filter Tabs */}
            <div className="comments__filters">
                <button
                    onClick={() => setFilter('all')}
                    className={`comments__filter-btn ${filter === 'all' ? 'active' : ''}`}
                >
                    Všetky ({comments.length})
                </button>
                <button
                    onClick={() => setFilter('recent')}
                    className={`comments__filter-btn ${filter === 'recent' ? 'active' : ''}`}
                >
                    Najnovšie
                </button>
                <button
                    onClick={() => setFilter('popular')}
                    className={`comments__filter-btn ${filter === 'popular' ? 'active' : ''}`}
                >
                    Najpopulárnejšie
                </button>
            </div>

            {/* Comments List */}
            <div className="comments__list">
                {comments.length === 0 ? (
                    <div className="comments__empty">
                        <div className="comments__empty-icon">💬</div>
                        <h3>Zatiaľ žiadne komentáre</h3>
                        <p>Začnite diskutovať pod článkami a vaše komentáre sa zobrazia tu.</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-card">
                            <div className="comment-card__header">
                                <div className="comment-card__article">
                                    <a
                                        href={`/clanky/${comment.articleSlug}`}
                                        className="comment-card__article-link"
                                    >
                                        📄 {comment.articleTitle}
                                    </a>
                                </div>
                                <div className="comment-card__date">
                                    {formatDate(comment.createdAt)}
                                    {comment.updatedAt !== comment.createdAt && (
                                        <span className="comment-card__edited">(upravené)</span>
                                    )}
                                </div>
                            </div>

                            <div className="comment-card__content">
                                {editingComment === comment.id ? (
                                    <div className="comment-card__edit">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="comment-card__edit-textarea"
                                            rows="3"
                                        />
                                        <div className="comment-card__edit-actions">
                                            <button
                                                onClick={() => handleSaveEdit(comment.id)}
                                                className="comment-card__save-btn"
                                            >
                                                Uložiť
                                            </button>
                                            <button
                                                onClick={() => setEditingComment(null)}
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
                                <div className="comment-card__stats">
                                    <span className="comment-card__stat">
                                        👍 {comment.likes}
                                    </span>
                                    <span className="comment-card__stat">
                                        💬 {comment.replies}
                                    </span>
                                </div>

                                <div className="comment-card__actions">
                                    <button
                                        onClick={() => handleEdit(comment)}
                                        className="comment-card__action-btn comment-card__edit-btn"
                                    >
                                        ✏️ Upraviť
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="comment-card__action-btn comment-card__delete-btn"
                                    >
                                        🗑️ Vymazať
                                    </button>
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