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

    // Форматирование времени
    const formatTime = (isoDate) => {
        if (!isoDate) return ""
        const date = new Date(isoDate)
        const hours = String(date.getHours()).padStart(2, "0")
        const minutes = String(date.getMinutes()).padStart(2, "0")
        return `${hours}:${minutes}`
    }

    // Расчёт времени чтения
    const calculateReadTime = (text) => {
        if (!text) return 1
        const wordsPerMinute = 200
        const plainText = text.replace(/<[^>]+>/g, " ")
        const words = plainText.trim().split(/\s+/).length
        return Math.max(1, Math.ceil(words / wordsPerMinute))
    }

    const readTime = article.readTime || calculateReadTime(article.content || article.body || article.excerpt || "")

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
                        <span className="news-card-time">{formatTime(article.publishedAt || article.createdAt)} min</span>
                    </div>
                </div>
            </article>
        </Link>
    )
}

export default NewsCard
