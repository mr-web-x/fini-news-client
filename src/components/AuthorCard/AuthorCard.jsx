import "./AuthorCard.scss"
import Link from "next/link"
import Image from "next/image"

const AuthorCard = ({ author }) => {
    // Полное имя автора
    const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Autor'

    // Avatar по умолчанию если нет
    const avatarUrl = author.avatar || '/icons/user-placeholder.svg'

    // Биография с ограничением длины
    const shortBio = author.bio && author.bio.length > 150
        ? `${author.bio.substring(0, 150)}...`
        : author.bio || 'Finančný expert a autor na fini.sk'

    // ✅ НОВОЕ: Используем slug для URL, fallback на ID если slug отсутствует
    const authorUrl = author.slug || author.id;

    // ✅ НОВОЕ: Проверяем, является ли изображение внешним
    const isExternalImage = avatarUrl && (
        avatarUrl.startsWith('http://') ||
        avatarUrl.startsWith('https://') ||
        avatarUrl.includes('googleusercontent.com') ||
        avatarUrl.includes('gravatar.com')
    );

    return (
        <div className="author-card">
            {/* Фото автора */}
            <div className="author-card__avatar">
                {isExternalImage ? (
                    // ✅ Для внешних изображений используем обычный img
                    <img
                        src={avatarUrl}
                        alt={fullName}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/icons/user-placeholder.svg';
                        }}
                    />
                ) : (
                    // ✅ Для внутренних изображений используем Next.js Image
                    <Image
                        src={avatarUrl}
                        alt={fullName}
                        width={50}
                        height={50}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/icons/user-placeholder.svg';
                        }}
                    />
                )}
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
                    className="author-card__link btn"
                >
                    Stránka autora
                </Link>
            </div>
        </div>
    )
}

export default AuthorCard