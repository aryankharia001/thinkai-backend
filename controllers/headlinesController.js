import dotenv from "dotenv";
import axios from "axios";
import News from "../models/news.js";

dotenv.config();

export async function fetchHeadlines() {
  console.log("🔄 Fetching headlines...");
  
  // Create today's date (normalized to start of day in UTC)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

  console.log(`🔍 Checking for existing headlines for ${todayStart.toDateString()}...`);

  // ✅ FIRST: Check if headlines already exist in database
  const existing = await News.findOne({
    date: { $gte: todayStart, $lt: tomorrowStart }
  });

  if (existing && existing.headlines && existing.headlines.length > 0) {
    console.log("✅ Headlines already stored for today. Skipping API call.");
    console.log("📰 Returning stored headlines:");
    existing.headlines.forEach((headline, index) => {
      console.log(`   ${index + 1}. ${headline}`);
    });
    
    // Convert stored string headlines back to object format for API response
    return existing.headlines.map(headline => ({
      title: headline,
      url: '#', // Placeholder since we only store titles
      description: '',
      publishedAt: existing.date
    }));
  }

  console.log("📡 No existing headlines found - fetching from News API...");

  // ✅ SECOND: Fetch from News API only if no data exists
  const apiKey = process.env.NEWS_API;
  if (!apiKey) {
    console.error("❌ NEWS_API environment variable not configured!");
    return [];
  }

  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const params = {
      q: 'artificial intelligence OR AI OR machine learning OR deep learning OR neural network OR ChatGPT OR OpenAI OR Google AI OR Microsoft AI',
      from: twentyFourHoursAgo.toISOString(),
      to: now.toISOString(),
      sortBy: 'publishedAt',
      pageSize: 30,
      language: 'en',
      apiKey
    };

    console.log("🌐 Calling News API...");
    let articles = (await axios.get('https://newsapi.org/v2/everything', { params })).data.articles || [];

    if (articles.length === 0) {
      console.log("⚠️  No articles found in last 24 hours, trying 48 hours...");
      const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
      params.from = fortyEightHoursAgo.toISOString();
      articles = (await axios.get('https://newsapi.org/v2/everything', { params })).data.articles || [];
    }

    console.log(`📊 Found ${articles.length} total articles, filtering for AI content...`);

    const filteredArticles = articles.filter(article => {
      const title = article.title.toLowerCase();
      const description = (article.description || '').toLowerCase();
      return (
        title.includes('ai') || title.includes('artificial intelligence') ||
        title.includes('machine learning') || title.includes('chatgpt') ||
        title.includes('openai') || title.includes('neural') ||
        description.includes('ai') || description.includes('artificial intelligence')
      );
    });

    console.log(`🎯 Found ${filteredArticles.length} AI-related articles`);

    const headlines = filteredArticles
      .slice(0, 5)
      .map(article => ({
        title: article.title.trim(),
        url: article.url,
        description: article.description,
        publishedAt: article.publishedAt
      }));

    if (headlines.length > 0) {
      // ✅ THIRD: Save to database (store only titles as strings to match schema)
      const headlineTitles = headlines.map(h => h.title);
      
      await News.create({ 
        date: todayStart, 
        headlines: headlineTitles 
      });
      
      console.log("💾 Headlines saved to database:");
      headlineTitles.forEach((title, index) => {
        console.log(`   ${index + 1}. ${title}`);
      });
    }

    return headlines;
    
  } catch (err) {
    if (err.response && err.response.status) {
      console.error("❌ API Error:", err.response.status, err.response.data);
      
      if (err.response.status === 426) {
        console.error("💡 Tip: You might need to upgrade your NewsAPI plan for more recent articles");
      }
      if (err.response.status === 429) {
        console.error("💡 Tip: You've hit the rate limit. Wait a bit before trying again");
      }
    } else {
      console.error("❌ Network/API Error:", err.message || err);
    }
    return [];
  }
}

// Route handler for API endpoint
export async function getHeadlines(req, res) {
  try {
    const headlines = await fetchHeadlines();
    
    if (headlines.length === 0) {
      return res.status(500).json({ error: "Failed to fetch headlines" });
    }
    
    res.json(headlines);
  } catch (error) {
    console.error("❌ Error in getHeadlines:", error.message);
    res.status(500).json({ error: "Failed to fetch headlines" });
  }
}