import "./LatestNews.scss"
import Link from "next/link"
import NewsCard from "@/components/NewsCard/NewsCard"

const LatestNews = ({ articles = [] }) => {
    return (
        <section className="latest-news">
            <div className="container">
                <div className="latest-news-header">
                    <h2 className="latest-news-title">Najnovšie správy</h2>
                    <Link href="/spravy" className="latest-news-link">
                        Zobraziť všetky →
                    </Link>
                </div>

                {articles.length === 0 ? (
                    <div className="latest-news-empty">
                        <p>Zatiaľ nie sú dostupné žiadne články</p>
                    </div>
                ) : (
                    <div className="news-grid">
                        {articles.map((article) => (
                            <NewsCard key={article._id} article={article} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default LatestNews