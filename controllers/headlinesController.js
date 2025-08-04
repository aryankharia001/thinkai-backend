import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export async function getHeadlines(req, res) {
  const apiKey = process.env.NEWS_API;
  
  if (!apiKey) {
    return res.status(500).json({ error: "News API key not configured" });
  }
  
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  
  const fromDate = twentyFourHoursAgo.toISOString();
  const toDate = now.toISOString();
  
  const params = {
    q: 'artificial intelligence OR AI OR machine learning OR deep learning OR neural network OR ChatGPT OR OpenAI OR Google AI OR Microsoft AI',
    from: fromDate,
    to: toDate,
    sortBy: 'publishedAt',
    pageSize: 30,
    language: 'en',
    apiKey: apiKey
  };
  
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', { params });
    
    let articles = response.data.articles || [];
    
    if (articles.length === 0) {
      // Fallback to 48 hours
      const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
      params.from = fortyEightHoursAgo.toISOString();
      
      const fallbackResponse = await axios.get('https://newsapi.org/v2/everything', { params });
      articles = fallbackResponse.data.articles || [];
    }
    
    const headlines = articles
      .filter(article => {
        const title = article.title.toLowerCase();
        const description = (article.description || '').toLowerCase();
        return title.includes('ai') || title.includes('artificial intelligence') || 
               title.includes('machine learning') || title.includes('chatgpt') ||
               title.includes('openai') || title.includes('neural') ||
               description.includes('ai') || description.includes('artificial intelligence');
      })
      .slice(0, 5)
      .map(article => ({
        title: article.title.trim(),
        url: article.url,
        description: article.description,
        publishedAt: article.publishedAt
      }));
    
    res.json(headlines);
  } catch (err) {
    console.error("API Error:", err.message);
    res.status(500).json({ error: "Failed to fetch headlines" });
  }
}