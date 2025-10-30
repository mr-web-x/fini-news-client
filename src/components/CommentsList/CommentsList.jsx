"use client";

import CommentItem from '@/components/CommentItem/CommentItem';
import "./CommentsList.scss";

/**
 * Компонент списка комментариев
 * @param {Array} comments - массив комментариев
 * @param {boolean} loading - состояние загрузки
 * @param {Object} user - объект пользователя
 * @param {Function} onCommentUpdated - callback при обновлении комментария
 * @param {Function} onCommentDeleted - callback при удалении комментария
 */
const CommentsList = ({
    comments = [],
    loading = false,
    user = null,
    onCommentUpdated,
    onCommentDeleted
}) => {

    // Показываем загрузку
    if (loading) {
        return (
            <div className="comments-list">
                <div className="comments-list__loading">
                    <div className="comments-list__spinner"></div>
                    <p>Načítavam komentáre...</p>
                </div>
            </div>
        );
    }

    // Если нет комментариев
    if (!comments || comments.length === 0) {
        return (
            <div className="comments-list">
                <div className="comments-list__empty">
                    <p>💬 Zatiaľ žiadne komentáre</p>
                    <p className="comments-list__empty-subtitle">
                        Buďte prvý, kto pridá komentár!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="comments-list">
            {comments.map((comment) => (
                <CommentItem
                    key={comment._id}
                    comment={comment}
                    user={user}
                    onCommentUpdated={onCommentUpdated}
                    onCommentDeleted={onCommentDeleted}
                />
            ))}
        </div>
    );
};

export default CommentsList;