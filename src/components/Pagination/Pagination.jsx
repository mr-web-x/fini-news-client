"use client"
import "./Pagination.scss"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const Pagination = ({ currentPage = 1, totalPages = 1 }) => {
    const searchParams = useSearchParams()

    if (totalPages <= 1) return null

    // Функция для создания URL с сохранением текущих параметров
    const createPageUrl = (page) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', page)
        return `/spravy?${params.toString()}`
    }

    // Генерация массива страниц для отображения
    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5 // максимум видимых кнопок

        if (totalPages <= maxVisible) {
            // Если страниц мало - показываем все
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Логика для многих страниц
            if (currentPage <= 3) {
                // Начало
                pages.push(1, 2, 3, 4, "...", totalPages)
            } else if (currentPage >= totalPages - 2) {
                // Конец
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                // Середина
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
            }
        }

        return pages
    }

    const pages = getPageNumbers()

    return (
        <div className="pagination">
            {/* Кнопка "Предыдущая" */}
            {currentPage > 1 ? (
                <Link
                    href={createPageUrl(currentPage - 1)}
                    className="pagination__button pagination__button--prev"
                >
                    ← Predchádzajúca
                </Link>
            ) : (
                <span className="pagination__button pagination__button--prev pagination__button--disabled">
                    ← Predchádzajúca
                </span>
            )}

            {/* Номера страниц */}
            <div className="pagination__numbers">
                {pages.map((page, index) => {
                    if (page === "...") {
                        return (
                            <span key={`dots-${index}`} className="pagination__dots">
                                ...
                            </span>
                        )
                    }

                    return (
                        <Link
                            key={page}
                            href={createPageUrl(page)}
                            className={`pagination__number ${page === currentPage ? "pagination__number--active" : ""
                                }`}
                        >
                            {page}
                        </Link>
                    )
                })}
            </div>

            {/* Кнопка "Следующая" */}
            {currentPage < totalPages ? (
                <Link
                    href={createPageUrl(currentPage + 1)}
                    className="pagination__button pagination__button--next"
                >
                    Ďalšia →
                </Link>
            ) : (
                <span className="pagination__button pagination__button--next pagination__button--disabled">
                    Ďalšia →
                </span>
            )}
        </div>
    )
}

export default Pagination