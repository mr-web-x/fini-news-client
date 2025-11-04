"use client"
import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import NewsCard from "@/components/NewsCard/NewsCard"
import { getAllArticles } from "@/actions/articles.actions"
import "./NewsListPage.scss"

const NewsListPage = () => {
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [totalPages, setTotalPages] = useState(1)
    const searchParams = useSearchParams()
    const currentPage = parseInt(searchParams.get('page') || '1')
    const itemsPerPage = 12

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true)
                const result = await getAllArticles({
                    page: currentPage,
                    limit: itemsPerPage,
                    sort: '-createdAt'
                })

                if (result.success) {
                    setArticles(result.data?.articles || result.data || [])
                    setTotalPages(result.data?.totalPages || Math.ceil((result.data?.total || 0) / itemsPerPage))
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
    }, [currentPage])

    const generatePageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }

        return pages
    }

    if (loading) {
        return (
            <main className="news-list-page">
                <div className="container">
                    <div className="news-list-loader">
                        <div className="spinner"></div>
                        <p>Načítavanie článkov...</p>
                    </div>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="news-list-page">
                <div className="container">
                    <div className="news-list-error">
                        <h1>Správy</h1>
                        <p>{error}</p>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="news-list-page">
            <div className="container">
                <div className="news-list-header">
                    <h1 className="news-list-title">Všetky správy</h1>
                    <p className="news-list-subtitle">
                        Zobrazených {articles.length} článkov
                    </p>
                </div>

                {articles.length === 0 ? (
                    <div className="news-list-empty">
                        <p>Zatiaľ nie sú dostupné žiadne články</p>
                    </div>
                ) : (
                    <>
                        <div className="news-grid">
                            {articles.map((article) => (
                                <NewsCard key={article._id} article={article} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="news-list-pagination">
                                <div className="pagination">
                                    {currentPage > 1 && (
                                        <Link
                                            href={`/spravy?page=${currentPage - 1}`}
                                            className="pagination-arrow pagination-prev"
                                        >
                                            ← Predchádzajúca
                                        </Link>
                                    )}

                                    <div className="pagination-numbers">
                                        {generatePageNumbers().map((pageNum) => (
                                            <Link
                                                key={pageNum}
                                                href={`/spravy?page=${pageNum}`}
                                                className={`pagination-number ${pageNum === currentPage ? 'active' : ''}`}
                                            >
                                                {pageNum}
                                            </Link>
                                        ))}
                                    </div>

                                    {currentPage < totalPages && (
                                        <Link
                                            href={`/spravy?page=${currentPage + 1}`}
                                            className="pagination-arrow pagination-next"
                                        >
                                            Ďalšia →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    )
}

export default NewsListPage