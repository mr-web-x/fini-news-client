"use client"
import "./AuthorDetailPage.scss"
import Link from "next/link"
import AuthorProfile from "@/components/AuthorProfile/AuthorProfile"
import AuthorBio from "@/components/AuthorBio/AuthorBio"
import AuthorStats from "@/components/AuthorStats/AuthorStats"
import AuthorArticlesList from "@/components/AuthorArticlesList/AuthorArticlesList"

const AuthorDetailPage = ({
    author,
    articles = [],
    currentPage = 1,
    totalPages = 1,
    total = 0
}) => {
    // Полное имя автора
    const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Autor'

    // ✅ НОВОЕ: URL автора для пагинации (slug с fallback на ID)
    const authorUrl = author.slug || author.id;

    return (
        <div className="author-detail-page">
            <div className="container">
                {/* Breadcrumbs */}
                <nav className="breadcrumbs">
                    <Link href="/">Domov</Link>
                    <span>/</span>
                    <Link href="/autori">Autori</Link>
                    <span>/</span>
                    <span className="breadcrumbs__current">{fullName}</span>
                </nav>

                {/* Верхняя секция: профиль + биография */}
                <div className="author-detail-page__header">
                    <div className="author-detail-page__profile">
                        <AuthorProfile author={author} />
                    </div>

                    <div className="author-detail-page__bio">
                        <AuthorBio
                            bio={author.bio}
                            fullName={fullName}
                        />
                    </div>
                </div>

                {/* Статистика */}
                {author.stats && (
                    <AuthorStats stats={author.stats} />
                )}

                {/* Список статей автора */}
                <AuthorArticlesList
                    articles={articles}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={total}
                    authorName={fullName}
                    authorSlug={authorUrl}
                />
            </div>
        </div>
    )
}

export default AuthorDetailPage