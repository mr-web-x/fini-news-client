"use client"
import "./AuthorArticlesList.scss"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import NewsCard from "@/components/NewsCard/NewsCard"
import Pagination from "@/components/Pagination/Pagination"

const AuthorArticlesList = ({
    articles = [],
    currentPage = 1,
    totalPages = 1,
    total = 0,
    authorName = '',
    authorSlug = ''
}) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    // ✅ Ref для блока со статьями
    const articlesListRef = useRef(null)

    // ✅ Ref для хранения предыдущих значений
    const prevPageRef = useRef(currentPage)
    const prevSortRef = useRef(searchParams.get('sortBy') || 'createdAt')

    // ✅ Получаем текущую сортировку
    const currentSort = searchParams.get('sortBy') || 'createdAt'

    // ✅ Эффект для прокрутки ТОЛЬКО при изменении page или sortBy
    useEffect(() => {
        // Проверяем, изменились ли page или sortBy
        const pageChanged = prevPageRef.current !== currentPage
        const sortChanged = prevSortRef.current !== currentSort

        // Прокручиваем ТОЛЬКО если что-то изменилось
        if ((pageChanged || sortChanged) && articlesListRef.current) {
            const offsetTop = articlesListRef.current.offsetTop - 70

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            })
        }

        // Обновляем предыдущие значения
        prevPageRef.current = currentPage
        prevSortRef.current = currentSort

    }, [currentPage, currentSort])

    // Обработчик сортировки
    const handleSortChange = (sortValue) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sortBy', sortValue)
        params.delete('page') // Reset to first page
        router.push(`/autori/${authorSlug}?${params.toString()}`)
    }

    const sortOptions = [
        { value: "createdAt", label: "Najnovšie" },
        { value: "views", label: "Najpopulárnejšie" }
    ]

    return (
        <div className="author-articles-list" ref={articlesListRef}>
            {/* Header секция */}
            <div className="author-articles-list__header">
                <div className="author-articles-list__title-wrapper">
                    <h2 className="author-articles-list__title">
                        Články ({total})
                    </h2>
                    <p className="author-articles-list__subtitle">
                        Všetky články, ktoré {authorName} napísal
                    </p>
                </div>

                {/* Сортировка */}
                {articles.length > 0 && (
                    <div className="author-articles-list__sort">
                        <label htmlFor="sort-select">Zoradiť podľa:</label>
                        <select
                            id="sort-select"
                            value={currentSort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="sort-select"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Список статей */}
            {articles.length === 0 ? (
                <div className="author-articles-list__empty">
                    <div className="empty-icon">📝</div>
                    <h3>Žiadne články</h3>
                    <p>
                        {authorName} zatiaľ nenapísal žiadne články
                    </p>
                </div>
            ) : (
                <>
                    <div className="author-articles-list__grid">
                        {articles.map((article) => (
                            <NewsCard key={article._id} article={article} />
                        ))}
                    </div>

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <div className="author-articles-list__pagination">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default AuthorArticlesList