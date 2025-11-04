"use client"
import "./LatestNews.scss"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import NewsCard from "@/components/NewsCard/NewsCard"
import { getAllArticles } from "@/actions/articles.actions"

const LatestNews = ({ cardsToShow = 6 }) => {
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const result = await getAllArticles({
                    limit: cardsToShow,
                    sort: '-createdAt' // сортировка по дате (новые первыми)
                })

                if (result.success) {
                    // getAllArticles возвращает объект { articles: [], total, page, ... }
                    setArticles(result.data?.articles || result.data || [])
                } else {
                    setError(result.message || "Nepodarilo sa načítať články")
                }
            } catch (err) {
                setError(err.message || "Chyba pri načítaní článkov")
            } finally {
                setLoading(false)
            }
        }

        fetchArticles()
    }, [cardsToShow])

    const articlesToDisplay = useMemo(() => {
        return articles.slice(0, cardsToShow)
    }, [articles, cardsToShow])

    return (
        <section className="latest-news">
            <div className="container">
                <div className="latest-news-header">
                    <h2 className="latest-news-title">Najnovšie správy</h2>
                    <Link href="/spravy" className="latest-news-link">
                        Zobraziť všetky →
                    </Link>
                </div>

                {loading ? (
                    <div className="latest-news-loader">
                        <div className="spinner"></div>
                        <p>Načítavanie článkov...</p>
                    </div>
                ) : error ? (
                    <div className="latest-news-error">
                        <p>{error}</p>
                    </div>
                ) : articlesToDisplay.length === 0 ? (
                    <div className="latest-news-empty">
                        <p>Zatiaľ nie sú dostupné žiadne články</p>
                    </div>
                ) : (
                    <div className="news-grid">
                        {articlesToDisplay.map((article) => (
                            <NewsCard key={article._id} article={article} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default LatestNews