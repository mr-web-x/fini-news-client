import "./NewsListPage.scss"
import NewsFilters from "@/components/NewsFilters/NewsFilters"
import NewsList from "@/components/NewsList/NewsList"
import Sidebar from "@/components/Sidebar/Sidebar"

const NewsListPage = ({
    articles = [],
    categories = [],
    topArticles = [],
    currentPage = 1,
    totalPages = 1,
    selectedCategory = null,
    selectedSort = 'createdAt'
}) => {
    return (
        <div className="news-list-page">
            <div className="container">
                <div className="news-list-page__header">
                    <h1 className="news-list-page__title">Všetky správy</h1>
                    <p className="news-list-page__subtitle">
                        Sledujte najnovšie finančné správy a analýzy zo Slovenska
                    </p>
                </div>

                <div className="news-list-page__content">
                    {/* Основной контент */}
                    <div className="news-list-page__main">
                        <NewsFilters
                            categories={categories}
                            selectedCategory={selectedCategory}
                            selectedSort={selectedSort}
                        />

                        <NewsList
                            articles={articles}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            selectedCategory={selectedCategory}
                        />
                    </div>

                    {/* Сайдбар */}
                    <div className="news-list-page__sidebar">
                        <Sidebar topArticles={topArticles} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewsListPage