import "./PopularArticles.scss"
import NewsCard from "@/components/NewsCard/NewsCard"

const PopularArticles = ({ articles }) => {
    // Если статей нет, не показываем секцию
    if (!articles || articles.length === 0) {
        return null
    }

    return (
        <section className="popular-articles">
            <div className="container">
                <div className="content__container">
                    <div className="popular-articles__header">
                        <h2 className="popular-articles__title">Najviac čítané</h2>
                        <p className="popular-articles__subtitle">
                            Najčítanejšie články za posledných 30 dní
                        </p>
                    </div>

                    <div className="popular-articles__grid">
                        {articles.map((article) => (
                            <NewsCard key={article._id || article.id} article={article} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PopularArticles