"use client";

import { useState } from 'react';
import { createComment } from '@/actions/comments.actions';
import "./CommentForm.scss";

/**
 * Форма для добавления комментария (inline внутри страницы)
 * @param {string} articleId - ID статьи
 * @param {Object} user - текущий пользователь
 * @param {Function} onCommentAdded - callback при успешном добавлении комментария
 */
const CommentForm = ({ articleId, user, onCommentAdded }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Обработчик отправки формы
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            setError('Komentár nemôže byť prázdny');
            return;
        }

        if (trimmedContent.length < 3) {
            setError('Komentár musí obsahovať minimálne 3 znaky');
            return;
        }

        if (content.length > 2000) {
            setError('Komentár môže obsahovať maximálne 2000 znakov');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await createComment({
                article: articleId,
                content: trimmedContent
            });

            if (result.success) {
                // Успешно добавлен - закрываем форму
                setContent('');
                setIsOpen(false);
                onCommentAdded && onCommentAdded();
            } else {
                setError(result.message || 'Chyba pri pridávaní komentára');
            }
        } catch (err) {
            console.error('Error creating comment:', err);
            setError('Chyba pri pridávaní komentára');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Обработчик изменения текста
     */
    const handleChange = (e) => {
        setContent(e.target.value);
        setError('');
    };

    /**
     * Обработчик клика по компактной кнопке - открываем форму
     */
    const handleOpenForm = () => {
        setIsOpen(true);
    };

    /**
     * Обработчик отмены - сворачиваем форму
     */
    const handleCancel = () => {
        setContent('');
        setError('');
        setIsOpen(false);
    };

    /**
     * Получение цвета счетчика символов
     */
    const getCharCountColor = () => {
        if (content.length > 2000) return 'comment-form__char-count--error';
        if (content.length > 1800) return 'comment-form__char-count--warning';
        return 'comment-form__char-count--normal';
    };

    return (
        <div className={`comment-form ${isOpen ? 'comment-form--open' : ''}`}>
            <div className="comment-form__container">
                {/* Аватар пользователя */}
                <div className="comment-form__avatar">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.firstName}
                            className="comment-form__avatar-img"
                        />
                    ) : (
                        <div className="comment-form__avatar-placeholder">
                            {user.firstName?.charAt(0).toUpperCase() || ''}
                            {user.lastName?.charAt(0).toUpperCase() || ''}
                        </div>
                    )}
                </div>

                {/* Компактная кнопка (когда форма закрыта) */}
                {!isOpen && (
                    <button
                        type="button"
                        onClick={handleOpenForm}
                        className="comment-form__compact-button"
                    >
                        Napíšte komentár...
                    </button>
                )}

                {/* Полная форма (когда форма открыта) */}
                {isOpen && (
                    <form onSubmit={handleSubmit} className="comment-form__form">
                        {/* Поле ввода */}
                        <textarea
                            value={content}
                            onChange={handleChange}
                            placeholder="Napíšte komentár..."
                            className="comment-form__textarea"
                            rows={4}
                            maxLength={2001}
                            disabled={loading}
                            autoFocus
                        />

                        {/* Расширенная часть формы */}
                        <div className="comment-form__footer">
                            {/* Ошибка */}
                            {error && (
                                <div className="comment-form__error">
                                    {error}
                                </div>
                            )}

                            {/* Нижняя панель с счетчиком и кнопками */}
                            <div className="comment-form__actions">
                                {/* Счетчик символов */}
                                <span className={`comment-form__char-count ${getCharCountColor()}`}>
                                    {content.length} / 2000
                                </span>

                                {/* Кнопки */}
                                <div className="comment-form__buttons">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="comment-form__btn comment-form__btn--cancel"
                                        disabled={loading}
                                    >
                                        Zrušiť
                                    </button>
                                    <button
                                        type="submit"
                                        className="comment-form__btn comment-form__btn--submit"
                                        disabled={loading || content.trim().length < 3 || content.length > 2000}
                                    >
                                        {loading ? 'Odosielam...' : 'Pridať komentár'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CommentForm;