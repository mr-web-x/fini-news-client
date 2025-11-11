"use client"
import "./AuthorStats.scss"

const AuthorStats = ({ stats }) => {
    // Форматирование чисел (1000 -> 1 000)
    const formatNumber = (num) => {
        return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || '0'
    }

    // Форматирование даты
    const formatDate = (date) => {
        if (!date) return ''
        const d = new Date(date)
        const months = [
            'januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
            'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'
        ]
        const day = d.getDate()
        const month = months[d.getMonth()]
        const year = d.getFullYear()
        return `${day}. ${month} ${year}`
    }

    return (
        <div className="author-stats">
            <div className="author-stats__grid">
                {/* Количество статей */}
                <div className="author-stats__item">
                    <div className="author-stats__icon">📝</div>
                    <div className="author-stats__content">
                        <div className="author-stats__value">
                            {formatNumber(stats?.articlesCount || 0)}
                        </div>
                        <div className="author-stats__label">
                            Počet článkov
                        </div>
                    </div>
                </div>

                {/* Всего просмотров */}
                <div className="author-stats__item">
                    <div className="author-stats__icon">👁️</div>
                    <div className="author-stats__content">
                        <div className="author-stats__value">
                            {formatNumber(stats?.totalViews || 0)}
                        </div>
                        <div className="author-stats__label">
                            Celkovo zobrazení
                        </div>
                    </div>
                </div>

                {/* Дата регистрации */}
                <div className="author-stats__item">
                    <div className="author-stats__icon">📅</div>
                    <div className="author-stats__content">
                        <div className="author-stats__value author-stats__value--date">
                            {formatDate(stats?.memberSince)}
                        </div>
                        <div className="author-stats__label">
                            Expert od
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthorStats