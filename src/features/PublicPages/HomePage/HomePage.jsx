import "./HomePage.scss"
import HeroSection from "./HeroSection/HeroSection"
import LatestNews from "./LatestNews/LatestNews"
import CategoriesGrid from "./CategoriesGrid/CategoriesGrid"

const HomePage = ({ articles, categoriesData }) => {
    return (
        <div className="home-page">
            <HeroSection />
            <LatestNews articles={articles} />
            <CategoriesGrid categoriesData={categoriesData} />
        </div>
    )
}

export default HomePage