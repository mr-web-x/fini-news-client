"use client"
import "./NewsCard.scss"
import Link from "next/link"
import Image from "next/image"

const NewsCard = ({ article }) => {
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
        <Link href={`/spravy/${article.slug}`} className="news-card">
            <article>
                <div className="news-card-image">
                    <Image
                        src={article.coverImage || "/images/placeholder.jpg"}
                        alt={article.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                    />
                    {article.category && (
                        <span className="news-card-category">{article.category.name}</span>
                    )}
                </div>
                <div className="news-card-content">
                    <h3 className="news-card-title">{article.title}</h3>
                    <p className="news-card-excerpt">{article.excerpt}</p>
                    <div className="news-card-meta">
                        <span className="news-card-author">{article.author?.name || "Autor"}</span>
                        <span className="news-card-date">{formatDate(article.publishedAt || article.createdAt)}</span>
                        <span className="news-card-time">{article.readTime || "5"} min</span>
                    </div>
                </div>
            </article>
        </Link>
    )
}

export default NewsCard