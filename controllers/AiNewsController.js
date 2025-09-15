const dotenv = require("dotenv");
const axios = require("axios");
const AINews = require("../models/AiNews");

dotenv.config();

async function fetchAIHeadlines() {
  console.log("🔄 Fetching 30 AI headlines...");

  // Normalize today's date (UTC start of day)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

  console.log(`🔍 Checking DB for existing AI headlines for ${todayStart.toDateString()}...`);

  // ✅ Check DB if headlines already exist for today
  const existing = await AINews.findOne({
    date: { $gte: todayStart, $lt: tomorrowStart },
  });

  if (existing && existing.headlines && existing.headlines.length > 0) {
    console.log("✅ AI headlines already stored for today, skipping API call.");
    console.log("📰 Returning stored AI headlines...");
    existing.headlines.forEach((headline, i) => {
      console.log(`   ${i + 1}. ${headline}`);
    });

    return existing.headlines.map((headline) => ({
      title: headline,
      url: "#", // placeholder since only titles stored
      description: "",
      publishedAt: existing.date,
    }));
  }

  console.log("📡 No existing AI headlines found, calling News API...");

  const apiKey = process.env.NEWS_API;
  if (!apiKey) {
    console.error("❌ NEWS_API environment variable missing!");
    return [];
  }

  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const params = {
      q: "artificial intelligence OR AI OR machine learning OR deep learning OR neural network OR ChatGPT OR OpenAI OR Google AI OR Microsoft AI",
      from: twentyFourHoursAgo.toISOString(),
      to: now.toISOString(),
      sortBy: "publishedAt",
      pageSize: 60, // ✅ get 30 articles
      language: "en",
      apiKey,
    };

    console.log("🌐 Calling NewsAPI for 30 AI headlines...");
    let articles = (
      await axios.get("https://newsapi.org/v2/everything", { params })
    ).data.articles || [];

    if (articles.length === 0) {
      console.log("⚠️ No articles in last 24h, trying last 48h...");
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      params.from = fortyEightHoursAgo.toISOString();
      articles = (
        await axios.get("https://newsapi.org/v2/everything", { params })
      ).data.articles || [];
    }

    console.log(`📊 Found ${articles.length} articles, filtering for AI...`);

    const filteredArticles = articles.filter((article) => {
      const title = article.title.toLowerCase();
      const description = (article.description || "").toLowerCase();
      return (
        title.includes("ai") ||
        title.includes("artificial intelligence") ||
        title.includes("machine learning") ||
        title.includes("chatgpt") ||
        title.includes("openai") ||
        title.includes("neural") ||
        description.includes("ai") ||
        description.includes("artificial intelligence")
      );
    });

    console.log(`🎯 Found ${filteredArticles.length} AI-related articles`);

    const headlines = filteredArticles.slice(0, 30).map((article) => ({
      title: article.title.trim(),
      url: article.url,
      description: article.description,
      publishedAt: article.publishedAt,
    }));

    if (headlines.length > 0) {
      const headlineTitles = headlines.map((h) => h.title);

      await AINews.create({
        date: todayStart,
        headlines: headlineTitles,
      });

      console.log("💾 30 AI headlines saved to DB:");
      headlineTitles.forEach((t, i) => console.log(`   ${i + 1}. ${t}`));
    }

    return headlines;
  } catch (err) {
    if (err.response && err.response.status) {
      console.error("❌ API Error:", err.response.status, err.response.data);

      if (err.response.status === 426) {
        console.error("💡 Upgrade NewsAPI plan for more access.");
      }
      if (err.response.status === 429) {
        console.error("💡 Rate limit hit, wait before retrying.");
      }
    } else {
      console.error("❌ Network/API Error:", err.message || err);
    }
    return [];
  }
}

// Route handler
async function getAIHeadlines(req, res) {
  try {
    const headlines = await fetchAIHeadlines();

    if (headlines.length === 0) {
      return res.status(500).json({ error: "Failed to fetch AI headlines" });
    }

    res.json(headlines);
  } catch (error) {
    console.error("❌ Error in getAIHeadlines:", error.message);
    res.status(500).json({ error: "Failed to fetch AI headlines" });
  }
}

module.exports = { fetchAIHeadlines, getAIHeadlines };