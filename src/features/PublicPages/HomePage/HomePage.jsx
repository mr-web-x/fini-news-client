import "./HomePage.scss"
import HeroSection from "./HeroSection/HeroSection"
import LatestNews from "./LatestNews/LatestNews"
import CategoriesGrid from "./CategoriesGrid/CategoriesGrid"
import PopularArticles from "./PopularArticles/PopularArticles"
import AuthorsBlock from "./AuthorsBlock/AuthorsBlock"

const HomePage = ({ articles, categoriesData, popularArticles, topAuthors, topArticle }) => {
    return (
        <div className="home-page">
            <HeroSection topArticle={topArticle} />
            <LatestNews articles={articles} />
            <CategoriesGrid categoriesData={categoriesData} />
            <PopularArticles articles={popularArticles} />
            <AuthorsBlock authors={topAuthors} />
        </div>
    )
}

export default HomePage