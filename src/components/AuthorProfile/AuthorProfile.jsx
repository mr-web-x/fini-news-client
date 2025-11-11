import "./AuthorProfile.scss"
import Link from "next/link"

const AuthorProfile = ({ author }) => {
    // Полное имя автора
    const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Autor'

    // Avatar по умолчанию если нет
    const avatarUrl = author.avatar || '/images/default-avatar.png'

    // Форматирование даты регистрации
    const formatDate = (date) => {
        if (!date) return ''
        const d = new Date(date)
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = d.getFullYear()
        return `${day}.${month}.${year}`
    }

    return (
        <div className="author-profile">
            {/* Аватар с verification badge */}
            <div className="author-profile__avatar-wrapper">
                <div className="author-profile__avatar">
                    <img
                        src={avatarUrl}
                        alt={fullName}
                        onError={(e) => {
                            e.target.src = '/images/default-avatar.png'
                        }}
                    />
                </div>
                {/* Verification badge */}
                <div className="author-profile__verified">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                </div>
            </div>

            {/* Имя и badge */}
            <div className="author-profile__header">
                <h1 className="author-profile__name">{fullName}</h1>

                {/* Badge для админа */}
                {author.role === 'admin' && (
                    <span className="author-profile__badge author-profile__badge--admin">
                        ADMINISTRÁTOR
                    </span>
                )}

                {/* Badge для эксперта */}
                {author.role === 'author' && (
                    <span className="author-profile__badge author-profile__badge--expert">
                        EXPERT
                    </span>
                )}
            </div>

            {/* Должность */}
            {author.position && (
                <p className="author-profile__position">{author.position}</p>
            )}

            {/* Статистика */}
            {author.stats && (
                <div className="author-profile__stats">
                    <div className="author-profile__stat">
                        <span className="author-profile__stat-icon">📅</span>
                        <span className="author-profile__stat-value">
                            {formatDate(author.stats.memberSince)}
                        </span>
                    </div>
                    <div className="author-profile__stat">
                        <span className="author-profile__stat-icon">📝</span>
                        <span className="author-profile__stat-value">
                            {author.stats.articlesCount} {author.stats.articlesCount === 1 ? 'článok' : 'článkov'}
                        </span>
                    </div>
                </div>
            )}

            {/* Контактная информация */}
            <div className="author-profile__contact">
                <h3 className="author-profile__contact-title">KONTAKT EXPERTA</h3>

                {/* Email */}
                {author.email && (
                    <a
                        href={`mailto:${author.email}`}
                        className="author-profile__contact-item"
                    >
                        <span className="author-profile__contact-icon">📧</span>
                        <span className="author-profile__contact-text">{author.email}</span>
                    </a>
                )}

                {/* LinkedIn placeholder - можно добавить поле в модель User */}
                {author.linkedin && (
                    <a
                        href={author.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="author-profile__contact-item"
                    >
                        <span className="author-profile__contact-icon">💼</span>
                        <span className="author-profile__contact-text">LinkedIn</span>
                    </a>
                )}
            </div>
        </div>
    )
}

export default AuthorProfile