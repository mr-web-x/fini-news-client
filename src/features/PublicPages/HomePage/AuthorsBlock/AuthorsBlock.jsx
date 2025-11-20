"use client"
import "./AuthorsBlock.scss"
import AuthorCard from "@/components/AuthorCard/AuthorCard"
import Link from "next/link"

const AuthorsBlock = ({ authors }) => {
    // Если авторов нет, не показываем секцию
    if (!authors || authors.length === 0) {
        return null
    }

    return (
        <section className="authors-block">
            <div className="container">
                <div className="content__container">
                    
                    <div className="authors-block__header">
                        <h2 className="authors-block__title">Naši experti</h2>
                        <p className="authors-block__subtitle">
                            Zoznámte sa s našimi finančnými expertmi
                        </p>
                    </div>

                    <div className="authors-block__grid">
                        {authors.map((author) => (
                            <AuthorCard
                                key={author.id || author._id}
                                author={author}
                            />
                        ))}
                    </div>

                    {/* Кнопка "Všetci autori" */}
                    <div className="authors-block__footer">
                        <Link href="/autori" className="authors-block__view-all btn">
                            Zobraziť všetkých autorov
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default AuthorsBlock