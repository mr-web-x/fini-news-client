"use client"
import "./AuthorsListPage.scss"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AuthorCard from "@/components/AuthorCard/AuthorCard"
import Pagination from "@/components/Pagination/Pagination"

const AuthorsListPage = ({ authors = [], currentPage = 1, totalPages = 1, total = 0 }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

    // Обработчик поиска
    const handleSearch = (e) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())

        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim())
        } else {
            params.delete('search')
        }

        params.delete('page') // Reset to first page
        router.push(`/autori?${params.toString()}`)
    }

    // Очистка поиска
    const handleClearSearch = () => {
        setSearchTerm('')
        const params = new URLSearchParams(searchParams.toString())
        params.delete('search')
        params.delete('page')
        router.push(`/autori?${params.toString()}`)
    }

    return (
        <div className="authors-list-page">
            <div className="container">
                {/* Header секция */}
                <div className="authors-list-page__header">
                    <h1 className="authors-list-page__title">
                        Naši autori a finančné experti
                    </h1>

                    {/* Вступительный текст */}
                    <div className="authors-list-page__intro">
                        <p>
                            Náš tým tvoria skúsení finanční analytici, investiční poradcovia a odborníci
                            na rôzne oblasti financií. Každý z našich autorov má niekoľkoročnú prax
                            vo svojom odbore a pravidelnú publikačnú činnosť.
                        </p>
                        <p>
                            Prinášame vám kvalitné, overené a aktuálne informácie z oblasti financií,
                            investícií, bankovníctva a ekonomiky. Naše články sú založené na dôkladnej
                            analýze a faktoch, aby ste mohli robiť informované finančné rozhodnutia.
                        </p>
                        <p>
                            Dôverujte odborníkom, ktorí skutočne rozumejú finančnému svetu a majú
                            preukázateľné skúsenosti v praxi. Transparentnosť a expertíza sú našimi
                            základnými hodnotami.
                        </p>
                    </div>
                </div>

                {/* Poisk */}
                <div className="authors-list-page__search">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Hľadať autora podľa mena..."
                            className="search-form__input"
                        />
                        <button type="submit" className="search-form__button btn">
                            🔍 Hľadať
                        </button>
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="search-form__clear btn"
                            >
                                ✕ Vymazať
                            </button>
                        )}
                    </form>

                    {/* Результаты поиска */}
                    {searchParams.get('search') && (
                        <div className="search-results">
                            <p>
                                Nájdených {total} {total === 1 ? 'autor' : total < 5 ? 'autori' : 'autorov'}
                                pre "<strong>{searchParams.get('search')}</strong>"
                            </p>
                        </div>
                    )}
                </div>

                {/* Список авторов */}
                {authors.length === 0 ? (
                    <div className="authors-list-page__empty">
                        <div className="empty-icon">👤</div>
                        <h3>Žiadni autori nenájdení</h3>
                        <p>
                            {searchParams.get('search')
                                ? 'Skúste zmeniť hľadaný výraz'
                                : 'Momentálne nemáme žiadnych autorov'}
                        </p>
                        {searchParams.get('search') && (
                            <button
                                onClick={handleClearSearch}
                                className="empty-button"
                            >
                                Zobraziť všetkých autorov
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="authors-list-page__grid">
                            {authors.map((author) => (
                                <AuthorCard key={author.id} author={author} />
                            ))}
                        </div>

                        {/* Пагинация */}
                        {totalPages > 1 && (
                            <div className="authors-list-page__pagination">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default AuthorsListPage