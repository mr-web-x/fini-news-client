// src/components/NewsList/NewsList.jsx
import NewsCard from "@/components/NewsCard/NewsCard"
import Pagination from "@/components/Pagination/Pagination"
import "./NewsList.scss"

const NewsList = ({ articles, currentPage, totalPages }) => {
    if (!articles || articles.length === 0) {
        return (
            <div className="news-list-empty">
                <div className="empty-icon">📰</div>
                <h3>Žiadne články nenájdené</h3>
                <p>Skúste zmeniť filter alebo vyhľadávanie</p>
            </div>
        )
    }

    return (
        <div className="news-list">
            <div className="news-list-grid">
                {articles.map((article) => (
                    <NewsCard key={article._id} article={article} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="news-list-pagination">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </div>
            )}
        </div>
    )
}

export default NewsList