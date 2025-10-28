"use client";

import { useState } from "react";
import { createComment } from "@/actions/comments.actions";
import "./CommentModal.scss";

export default function CommentModal({ articleId, isOpen, onClose, onSuccess }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (!content.trim() || content.trim().length < 3) {
            setMessage({ type: "error", text: "Komentár musí obsahovať minimálne 3 znaky." });
            return;
        }

        try {
            setLoading(true);
            const result = await createComment(articleId, content.trim());
            if (result.success) {
                setMessage({ type: "success", text: result.message });
                setContent("");
                onSuccess?.(); // callback для обновления счётчика или списка
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                setMessage({ type: "error", text: result.message });
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            setMessage({ type: "error", text: "Nepodarilo sa pridať komentár." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="comment-modal__overlay" onClick={onClose}>
            <div className="comment-modal__window" onClick={(e) => e.stopPropagation()}>
                <h3>💬 Pridať komentár</h3>

                {message.text && (
                    <div className={`comment-modal__message comment-modal__message--${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="comment-modal__form">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="4"
                        placeholder="Napíšte svoj komentár..."
                        maxLength="1000"
                        disabled={loading}
                        className="comment-modal__textarea"
                    />
                    <div className="comment-modal__actions">
                        <button
                            type="button"
                            className="comment-modal__cancel-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Zrušiť
                        </button>
                        <button
                            type="submit"
                            className="comment-modal__submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Odosielam..." : "Odoslať komentár"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
