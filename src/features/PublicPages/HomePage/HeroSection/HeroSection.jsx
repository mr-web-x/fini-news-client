"use client"
import "./HeroSection.scss"
import Link from "next/link"
import Image from "next/image"
import { getArticleImageUrl } from "@/utils/imageHelpers"

const HeroSection = ({ topArticle }) => {
    // Если нет статьи, показываем fallback
    if (!topArticle) {
        return (
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-image">
                            <div className="hero-image-placeholder">
                                <span>📰</span>
                            </div>
                        </div>
                        <div className="hero-text">
                            <span className="hero-category">Ekonomika</span>
                            <h1 className="hero-title">
                                Vitajte na{' '}
                                <span className="hero-title--muted">
                                    Fini.sk
                                </span>
                            </h1>
                            <p className="hero-description">
                                Váš spoľahlivý zdroj finančných správ a analýz zo Slovenska a sveta.
                            </p>
                            <div className="hero-meta">
                                <span className="hero-author">Redakcia</span>
                                <span className="hero-date">Dnes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // Форматирование даты
    const formatDate = (isoDate) => {
        if (!isoDate) return "Dnes"
        const date = new Date(isoDate)
        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year = date.getFullYear()
        return `${day}.${month}.${year}`
    }

    // Вычисление времени чтения
    const calculateReadTime = (content) => {
        if (!content) return 5;
        const text = content.replace(/<[^>]*>/g, '');
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return minutes > 0 ? minutes : 1;
    }

    // Получение имени автора
    const getAuthorName = (author) => {
        if (!author) return "Redakcia";
        if (typeof author === 'string') return author;
        return `${author.firstName || ''} ${author.lastName || ''}`.trim() || "Redakcia";
    }

    const readTime = topArticle.readTime || calculateReadTime(topArticle.content);

    return (
        <section className="hero-section">
            <div className="container">
                <div className="hero-content">
                    <div className="hero-image">
                        <Link href={`/spravy/${topArticle.slug}`}>
                            <Image
                                src={getArticleImageUrl(topArticle.coverImage)}
                                alt={topArticle.title}
                                width={600}
                                height={400}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                                priority
                            />
                        </Link>
                    </div>
                    <div className="hero-text">
                        {topArticle.category && (
                            <span
                                className="hero-category"
                                style={{ backgroundColor: topArticle.category.color || "#2563eb" }}
                            >
                                {topArticle.category.name}
                            </span>
                        )}
                        <Link href={`/spravy/${topArticle.slug}`}>
                            <h1 className="hero-title">
                                {(() => {
                                    const title = topArticle.title;
                                    const words = title.split(' ');

                                    // Делим заголовок пополам
                                    const halfLength = Math.ceil(words.length / 2);
                                    const firstHalf = words.slice(0, halfLength).join(' ');
                                    const secondHalf = words.slice(halfLength).join(' ');

                                    return (
                                        <>
                                            {firstHalf}
                                            {secondHalf && (
                                                <>
                                                    {' '}
                                                    <span className="hero-title--muted">
                                                        {secondHalf}
                                                    </span>
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                            </h1>
                        </Link>
                        {topArticle.excerpt && (
                            <p className="hero-description">
                                {topArticle.excerpt}
                            </p>
                        )}
                        <div className="hero-meta">
                            <span className="hero-author">
                                {getAuthorName(topArticle.author)}
                            </span>
                            <span className="hero-date">
                                {formatDate(topArticle.publishedAt || topArticle.createdAt)}
                            </span>
                            <span className="hero-time">
                                {readTime} min čítania
                            </span>
                            <span className="hero-views">
                                {topArticle.views || 0} zobrazení
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection