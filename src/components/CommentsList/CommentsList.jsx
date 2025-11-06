"use client";

import CommentItem from '@/components/CommentItem/CommentItem';
import "./CommentsList.scss";

/**
 * Презентационный компонент списка комментариев
 * Получает комментарии через props (загружаются в page.js)
 * @param {Array} comments - массив комментариев
 * @param {Object} user - объект пользователя
 * @param {Function} onCommentUpdated - callback при обновлении комментария
 * @param {Function} onCommentDeleted - callback при удалении комментария
 */
const CommentsList = ({
    comments = [],
    user = null,
    onCommentUpdated,
    onCommentDeleted
}) => {
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
            <div className="comments-list__count">
                {comments.length} {comments.length === 1 ? 'komentár' :
                    comments.length < 5 ? 'komentáre' : 'komentárov'}
            </div>
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