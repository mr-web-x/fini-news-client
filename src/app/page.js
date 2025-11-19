import HomePage from "@/features/PublicPages/HomePage/HomePage";
import articlesService from "@/services/articles.service";
import categoriesService from "@/services/categories.service";
import usersService from "@/services/users.service";

export default async function Home() {
  // Загружаем данные на сервере через services
  let articles = [];
  let categoriesData = [];
  let popularArticles = [];
  let topAuthors = [];
  let topArticle = null; // ✅ ДОБАВЛЕНО

  // ✅ ДОБАВЛЕНО: Загрузка самой популярной статьи для Hero
  try {
    const topArticleResponse = await articlesService.getAllArticles({
      limit: 1,
      sortBy: 'views'
    });

    // Берём первую статью из ответа
    const topArticleData = topArticleResponse?.articles || topArticleResponse || [];
    topArticle = topArticleData.length > 0 ? topArticleData[0] : null;

    console.log('✅ Loaded top article for Hero:', topArticle?.title);
  } catch (error) {
    console.error('Error loading top article:', error);
  }

  try {
    // Получаем последние 3 статьи (было 6)
    const articlesResponse = await articlesService.getAllArticles({
      limit: 3,
      sort: '-createdAt'
    });
    articles = articlesResponse?.articles || articlesResponse || [];
  } catch (error) {
    console.error('Error loading articles:', error);
  }

  try {
    const popularResponse = await articlesService.getAllArticles({
      limit: 3,
      sortBy: 'views',
      days: 30
    });

    popularArticles = popularResponse?.articles || popularResponse || [];
  } catch (error) {
    console.error('Error loading popular articles:', error);
  }

  // Загрузка топ-3 авторов
  try {
    const authorsResponse = await usersService.getAllAuthors({
      limit: 3,
      page: 1
    });

    // Обрабатываем разные структуры ответа
    if (authorsResponse?.data?.authors) {
      topAuthors = authorsResponse.data.authors;
    } else if (authorsResponse?.authors) {
      topAuthors = authorsResponse.authors;
    } else if (Array.isArray(authorsResponse)) {
      topAuthors = authorsResponse;
    }

    // Сортируем по количеству статей (убывание)
    topAuthors.sort((a, b) => (b.articlesCount || 0) - (a.articlesCount || 0));

    console.log('✅ Loaded top authors:', topAuthors.length);
  } catch (error) {
    console.error('Error loading authors:', error);
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
      "akcie": { icon: "📊", color: "#10b981" },
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
      popularArticles={popularArticles}
      topAuthors={topAuthors}
      topArticle={topArticle} // ✅ ДОБАВЛЕНО
    />
  );
}