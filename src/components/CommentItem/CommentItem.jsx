"use client";

import { useState } from 'react';
import { updateComment, deleteComment } from '@/actions/comments.actions';
import "./CommentItem.scss";

/**
 * Компонент отдельного комментария
 * @param {Object} comment - объект комментария
 * @param {Object} user - текущий пользователь
 * @param {Function} onCommentUpdated - callback при обновлении
 * @param {Function} onCommentDeleted - callback при удалении
 */
const CommentItem = ({ comment, user, onCommentUpdated, onCommentDeleted }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Проверяем, является ли текущий пользователь автором комментария
    const isAuthor = user && comment.user && comment.user._id === user._id;

    // Проверяем, является ли текущий пользователь админом
    const isAdmin = user && user.role === 'admin';

    // Можно ли редактировать (только автор)
    const canEdit = isAuthor;

    // Можно ли удалить (автор или админ)
    const canDelete = isAuthor || isAdmin;

    /**
     * Форматирование даты
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // Только что
        if (diffMins < 1) return 'Práve teraz';

        // Минуты назад
        if (diffMins < 60) {
            if (diffMins === 1) return 'Pred 1 minútou';
            if (diffMins < 5) return `Pred ${diffMins} minútami`;
            return `Pred ${diffMins} minútami`;
        }

        // Часы назад
        if (diffHours < 24) {
            if (diffHours === 1) return 'Pred 1 hodinou';
            if (diffHours < 5) return `Pred ${diffHours} hodinami`;
            return `Pred ${diffHours} hodinami`;
        }

        // Дни назад
        if (diffDays < 7) {
            if (diffDays === 1) return 'Pred 1 dňom';
            return `Pred ${diffDays} dňami`;
        }

        // Полная дата
        return date.toLocaleDateString('sk-SK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Получение инициалов из имени
     */
    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last || '?';
    };

    /**
     * Обработчик сохранения отредактированного комментария
     */
    const handleSave = async () => {
        if (!editContent.trim()) {
            setError('Komentár nemôže byť prázdny');
            return;
        }

        if (editContent.trim() === comment.content) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await updateComment(comment._id, { content: editContent.trim() });

            if (result.success) {
                setIsEditing(false);
                onCommentUpdated && onCommentUpdated();
            } else {
                setError(result.message || 'Chyba pri ukladaní komentára');
            }
        } catch (err) {
            console.error('Error updating comment:', err);
            setError('Chyba pri ukladaní komentára');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Обработчик отмены редактирования
     */
    const handleCancel = () => {
        setEditContent(comment.content);
        setIsEditing(false);
        setError('');
    };

    /**
     * Обработчик удаления комментария
     */
    const handleDelete = async () => {
        if (!window.confirm('Naozaj chcete vymazať tento komentár?')) {
            return;
        }

        setLoading(true);

        try {
            const result = await deleteComment(comment._id);

            if (result.success) {
                onCommentDeleted && onCommentDeleted();
            } else {
                alert(result.message || 'Chyba pri mazaní komentára');
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert('Chyba pri mazaní komentára');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`comment-item ${loading ? 'comment-item--loading' : ''}`}>
            {/* Аватар пользователя */}
            <div className="comment-item__avatar">
                {comment.user?.avatar ? (
                    <img
                        src={comment.user.avatar}
                        alt={`${comment.user.firstName} ${comment.user.lastName}`}
                        className="comment-item__avatar-img"
                    />
                ) : (
                    <div className="comment-item__avatar-placeholder">
                        {getInitials(comment.user?.firstName, comment.user?.lastName)}
                    </div>
                )}
            </div>

            {/* Контент комментария */}
            <div className="comment-item__content">
                {/* Заголовок с именем и датой */}
                <div className="comment-item__header">
                    <div className="comment-item__author">
                        <span className="comment-item__author-name">
                            {comment.user?.firstName} {comment.user?.lastName}
                        </span>
                        {comment.user?.role === 'admin' && (
                            <span className="comment-item__badge comment-item__badge--admin">
                                Admin
                            </span>
                        )}
                        {comment.user?.role === 'author' && (
                            <span className="comment-item__badge comment-item__badge--author">
                                Autor
                            </span>
                        )}
                    </div>
                    <span className="comment-item__date">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>

                {/* Текст комментария или поле редактирования */}
                {isEditing ? (
                    <div className="comment-item__edit">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="comment-item__textarea"
                            rows={4}
                            maxLength={2000}
                            disabled={loading}
                        />
                        <div className="comment-item__char-count">
                            {editContent.length} / 2000
                        </div>
                        {error && (
                            <div className="comment-item__error">
                                {error}
                            </div>
                        )}
                        <div className="comment-item__edit-actions">
                            <button
                                onClick={handleCancel}
                                className="comment-item__btn comment-item__btn--cancel"
                                disabled={loading}
                            >
                                Zrušiť
                            </button>
                            <button
                                onClick={handleSave}
                                className="comment-item__btn comment-item__btn--save"
                                disabled={loading || !editContent.trim()}
                            >
                                {loading ? 'Ukladám...' : 'Uložiť'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="comment-item__text">
                            {comment.content}
                        </p>

                        {/* Кнопки действий */}
                        {(canEdit || canDelete) && (
                            <div className="comment-item__actions">
                                {canEdit && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="comment-item__action-btn comment-item__action-btn--edit"
                                        disabled={loading}
                                    >
                                        ✏️ Upraviť
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className="comment-item__action-btn comment-item__action-btn--delete"
                                        disabled={loading}
                                    >
                                        🗑️ Vymazať
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentItem;