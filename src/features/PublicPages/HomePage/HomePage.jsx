import "./HomePage.scss"
import HeroSection from "./HeroSection/HeroSection"
import LatestNews from "./LatestNews/LatestNews"
import CategoriesGrid from "./CategoriesGrid/CategoriesGrid"
import PopularArticles from "./PopularArticles/PopularArticles"
import AuthorsBlock from "./AuthorsBlock/AuthorsBlock" // ✅ ДОБАВЛЕНО

const HomePage = ({ articles, categoriesData, popularArticles, topAuthors }) => { // ✅ ДОБАВЛЕНО topAuthors
    return (
        <div className="home-page">
            <HeroSection />
            <LatestNews articles={articles} />
            <CategoriesGrid categoriesData={categoriesData} />
            <PopularArticles articles={popularArticles} />
            <AuthorsBlock authors={topAuthors} /> {/* ✅ ДОБАВЛЕНО */}
        </div>
    )
}

export default HomePage