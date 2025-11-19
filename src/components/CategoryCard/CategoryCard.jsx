"use client"
import "./CategoryCard.scss"
import Link from "next/link"

const CategoryCard = ({ category, articles = [] }) => {
    // Форматирование даты
    const formatDate = (isoDate) => {
        if (!isoDate) return ""
        const date = new Date(isoDate)
        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year = date.getFullYear()
        return `${day}.${month}.${year}`
    }

    return (
        <div className="category-card">
            <div className="category-header">
                <h3 className="category-name">{category.name}</h3>
                <Link
                    href={`/spravy?category=${category.slug}`}
                    className="category-link"
                >
                    Všetky správy →
                </Link>
            </div>
            <div className="category-articles">
                {articles.length === 0 ? (
                    <div className="category-empty">
                        <p>Zatiaľ nie sú dostupné žiadne články</p>
                    </div>
                ) : (
                    articles.map((article, index) => (
                        <Link
                            key={article._id}
                            href={`/spravy/${article.slug}`}
                            className="category-article"
                        >
                            <div className="article-number">{index + 1}</div>
                            <div className="article-info">
                                <h4 className="article-title">{article.title}</h4>
                                <div className="article-meta">
                                    <span className="article-date">
                                        {formatDate(article.publishedAt || article.createdAt)}
                                    </span>
                                    <span className="article-views">{article.views || 0} zobrazení</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}

export default CategoryCard