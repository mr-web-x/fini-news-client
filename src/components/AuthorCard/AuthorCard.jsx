import "./AuthorCard.scss"
import Link from "next/link"

const AuthorCard = ({ author }) => {
    // Полное имя автора
    const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Autor'

    // Avatar по умолчанию если нет
    const avatarUrl = author.avatar || '/images/default-avatar.png'

    // Биография с ограничением длины
    const shortBio = author.bio && author.bio.length > 150
        ? `${author.bio.substring(0, 150)}...`
        : author.bio || 'Finančný expert a autor na fini.sk'

    // ✅ НОВОЕ: Используем slug для URL, fallback на ID если slug отсутствует
    const authorUrl = author.slug || author.id;

    return (
        <div className="author-card">
            {/* Фото автора */}
            <div className="author-card__avatar">
                <img
                    src={avatarUrl}
                    alt={fullName}
                    onError={(e) => {
                        e.target.src = '/images/default-avatar.png'
                    }}
                />
            </div>

            {/* Информация об авторе */}
            <div className="author-card__info">
                <h3 className="author-card__name">{fullName}</h3>

                {/* Должность/специализация */}
                {author.position && (
                    <p className="author-card__position">{author.position}</p>
                )}

                {/* Краткая биография */}
                <p className="author-card__bio">{shortBio}</p>

                {/* Количество статей */}
                <div className="author-card__stats">
                    <span className="author-card__articles-count">
                        📝 {author.articlesCount || 0} {author.articlesCount === 1 ? 'článok' : 'článkov'}
                    </span>
                </div>

                {/* ✅ ИСПРАВЛЕНО: Кнопка "Všetky články" теперь использует slug */}
                <Link
                    href={`/autori/${authorUrl}`}
                    className="author-card__link"
                >
                    Stránka autora →
                </Link>
            </div>
        </div>
    )
}

export default AuthorCard