"use client";

import "./SearchDropdown.scss";
import Link from "next/link";
import { Eye, Calendar, X } from "lucide-react";

const SearchDropdown = ({ results, isLoading, onClose, query }) => {

    // Форматирование даты
    const formatDate = (isoDate) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Форматирование просмотров (1234 → 1.2k)
    const formatViews = (views) => {
        if (!views) return "0";
        if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}k`;
        }
        return views.toString();
    };

    return (
        <div className="search-dropdown">
            {/* Header с кнопкой закрытия */}
            <div className="search-dropdown__header">
                <span className="search-dropdown__title">
                    Výsledky vyhľadávania: "{query}"
                </span>
                <button
                    onClick={onClose}
                    className="search-dropdown__close"
                    aria-label="Zavrieť"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Loading состояние */}
            {isLoading && (
                <div className="search-dropdown__loading">
                    <div className="search-dropdown__spinner"></div>
                    <span>Hľadám...</span>
                </div>
            )}

            {/* Результаты */}
            {!isLoading && results.length > 0 && (
                <div className="search-dropdown__results">
                    {results.map((article) => (
                        <Link
                            key={article._id}
                            href={`/spravy/${article.slug}`}
                            className="search-dropdown__item"
                            onClick={onClose} // Закрываем dropdown при клике
                        >
                            {/* Картинка (опционально) */}
                            {article.coverImage && (
                                <div className="search-dropdown__image">
                                    <img
                                        src={article.coverImage}
                                        alt={article.title}
                                    />
                                </div>
                            )}

                            {/* Контент */}
                            <div className="search-dropdown__content">
                                <h4 className="search-dropdown__item-title">
                                    {article.title}
                                </h4>

                                {/* Метаданные */}
                                <div className="search-dropdown__meta">
                                    {/* Просмотры */}
                                    <span className="search-dropdown__meta-item">
                                        <Eye size={14} />
                                        {formatViews(article.views)}
                                    </span>

                                    {/* Дата публикации */}
                                    <span className="search-dropdown__meta-item">
                                        <Calendar size={14} />
                                        {formatDate(article.publishedAt || article.createdAt)}
                                    </span>

                                    {/* Категория (опционально) */}
                                    {article.category && (
                                        <span className="search-dropdown__category">
                                            {article.category.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Пустой результат */}
            {!isLoading && results.length === 0 && (
                <div className="search-dropdown__empty">
                    <p>Nenašli sa žiadne články pre "{query}"</p>
                    <span>Skúste iný vyhľadávací výraz</span>
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;