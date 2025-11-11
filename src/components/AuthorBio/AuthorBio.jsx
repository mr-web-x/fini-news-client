import "./AuthorBio.scss"
import { useState } from "react"

const AuthorBio = ({ bio, fullName }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    // Если биографии нет, показываем дефолтный текст
    const bioText = bio || `${fullName} je odborník na financie s dlhoročnou praxou v odbore. Pravidelne píše články a analýzy pre fini.sk.`

    // Определяем, нужна ли кнопка "Čítať viac"
    const needsExpansion = bioText.length > 400
    const displayText = needsExpansion && !isExpanded
        ? `${bioText.substring(0, 400)}...`
        : bioText

    return (
        <div className="author-bio">
            <div className="author-bio__content">
                <p className="author-bio__text">{displayText}</p>

                {needsExpansion && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="author-bio__toggle"
                    >
                        {isExpanded ? 'Zobraziť ménej' : 'Čítať viac'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default AuthorBio