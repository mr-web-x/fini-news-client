import HomePage from "@/features/PublicPages/HomePage/HomePage";
import articlesService from "@/services/articles.service";
import categoriesService from "@/services/categories.service";

export default async function Home() {
  // Загружаем данные на сервере через services
  let articles = [];
  let categoriesData = [];

  try {
    // Получаем последние 6 статей
    const articlesResponse = await articlesService.getAllArticles({
      limit: 6,
      sort: '-createdAt'
    });
    articles = articlesResponse?.articles || articlesResponse || [];
  } catch (error) {
    console.error('Error loading articles:', error);
  }

  try {
    // Получаем все категории
    const categoriesResponse = await categoriesService.getAllCategories();

    // Обрабатываем разные структуры ответа
    let categories = [];
    if (Array.isArray(categoriesResponse)) {
      categories = categoriesResponse;
    } else if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
      categories = categoriesResponse.data;
    } else if (categoriesResponse?.categories && Array.isArray(categoriesResponse.categories)) {
      categories = categoriesResponse.categories;
    }

    // Для каждой категории получаем топ 3 статьи
    const categoryStyles = {
      "banky": { icon: "🏦", color: "#2563eb" },
      "uvery": { icon: "💳", color: "#7c3aed" },
      "poistenie": { icon: "🛡️", color: "#059669" },
      "dane": { icon: "📊", color: "#dc2626" },
      "ekonomika": { icon: "📈", color: "#ea580c" }
    };

    categoriesData = await Promise.all(
      categories.map(async (category) => {
        try {
          const articlesResponse = await articlesService.getAllArticles({
            category: category.slug,
            limit: 3,
            sort: '-views'
          });

          const categoryArticles = articlesResponse?.articles || articlesResponse || [];
          const style = categoryStyles[category.slug] || { icon: "📰", color: "#2563eb" };

          return {
            ...category,
            icon: style.icon,
            color: style.color,
            articles: categoryArticles
          };
        } catch (error) {
          console.error(`Error loading articles for ${category.slug}:`, error);
          return {
            ...category,
            articles: []
          };
        }
      })
    );
  } catch (error) {
    console.error('Error loading categories:', error);
  }

  return (
    <HomePage
      articles={articles}
      categoriesData={categoriesData}
    />
  );
}