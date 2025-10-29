"use client";

import { useEffect } from 'react';
import './Modal.scss';

/**
 * Универсальный компонент модального окна
 * 
 * @param {boolean} isOpen - состояние открытия модалки
 * @param {function} onClose - функция закрытия модалки
 * @param {string} title - заголовок модалки
 * @param {ReactNode} children - содержимое модалки
 * @param {string} size - размер модалки (small, medium, large)
 * @param {boolean} showCloseButton - показывать ли кнопку закрытия (по умолчанию true)
 */
const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'medium',
    showCloseButton = true 
}) => {
    
    // Блокируем скролл body когда модалка открыта
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Закрытие по клавише Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Если модалка закрыта - не рендерим
    if (!isOpen) return null;

    // Закрытие по клику на overlay (вне модалки)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className={`modal modal--${size}`}>
                {/* Header */}
                <div className="modal__header">
                    <h2 className="modal__title">{title}</h2>
                    {showCloseButton && (
                        <button 
                            className="modal__close-btn" 
                            onClick={onClose}
                            aria-label="Zavrieť"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="modal__content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;