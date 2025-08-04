import dotenv from "dotenv";
import axios from "axios";
import cron from "node-cron";

dotenv.config();

async function getAIHeadlines() {
  const apiKey = process.env.NEWS_API;
  
  // Get current time and 24 hours ago
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  
  // Format dates for NewsAPI (ISO format)
  const fromDate = twentyFourHoursAgo.toISOString();
  const toDate = now.toISOString();
  
  const params = {
    q: 'artificial intelligence OR AI OR machine learning OR deep learning OR neural network OR ChatGPT OR OpenAI OR Google AI OR Microsoft AI',
    from: fromDate,
    to: toDate,
    sortBy: 'publishedAt',
    pageSize: 30, // Get more results to ensure we can find 5 good ones
    language: 'en',
    apiKey: apiKey
  };
  
  try {    
    const response = await axios.get('https://newsapi.org/v2/everything', { params });
    
    if (!response.data.articles || response.data.articles.length === 0) {
      console.log("No AI articles found in the last 24 hours, trying last 48 hours...");
      
      // Fallback: try last 48 hours
      const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
      params.from = fortyEightHoursAgo.toISOString();
      
      const fallbackResponse = await axios.get('https://newsapi.org/v2/everything', { params });
      
      if (!fallbackResponse.data.articles || fallbackResponse.data.articles.length === 0) {
        throw new Error("No AI articles found in the last 48 hours");
      }
      
      const headlines = fallbackResponse.data.articles
        .filter(article => {
          const title = article.title.toLowerCase();
          const description = (article.description || '').toLowerCase();
          return title.includes('ai') || title.includes('artificial intelligence') || 
                 title.includes('machine learning') || title.includes('chatgpt') ||
                 title.includes('openai') || title.includes('neural') ||
                 description.includes('ai') || description.includes('artificial intelligence');
        })
        .slice(0, 5) // Get exactly 5 headlines
        .map(article => article.title.trim()); // Keep full headlines, no word limit
      
      return headlines;
    }
    
    // Filter and process articles from last 24 hours
    const headlines = response.data.articles
      .filter(article => {
        const title = article.title.toLowerCase();
        const description = (article.description || '').toLowerCase();
        return title.includes('ai') || title.includes('artificial intelligence') || 
               title.includes('machine learning') || title.includes('chatgpt') ||
               title.includes('openai') || title.includes('neural') ||
               description.includes('ai') || description.includes('artificial intelligence');
      })
      .slice(0, 5) // Get exactly 5 headlines
      .map(article => article.title.trim()); // Keep full headlines, no word limit
    
    return headlines;
  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
      
      if (err.response.status === 426) {
        console.error("Tip: You might need to upgrade your NewsAPI plan for more recent articles");
      }
      if (err.response.status === 429) {
        console.error("Tip: You've hit the rate limit. Wait a bit before trying again");
      }
    } else {
      console.error("Network Error:", err.message);
    }
    return [];
  }
}

async function fetchAndDisplayHeadlines() {
  console.log(`\n🕐 Fetching AI headlines at ${new Date().toLocaleString()}...`);
  
  if (!process.env.NEWS_API) {
    console.error("NEWS_API environment variable not found!");
    return;
  }
  
  const headlines = await getAIHeadlines();
  
  if (headlines.length === 0) {
    console.log("No AI headlines found.");
    return;
  }
  
  console.log("📰 Top 5 AI Headlines (Last 24 Hours):");
  headlines.forEach((headline, index) => {
    console.log(`${index + 1}. ${headline}`);
  });
  console.log("─".repeat(80));
}

async function main() {
  console.log("🤖 AI News Scheduler Started!");
  console.log("📅 Headlines will be fetched daily at 12:00 PM");
  console.log("🔄 You can also trigger manual fetch by restarting the script");
  
  // Fetch headlines immediately on startup
  await fetchAndDisplayHeadlines();
  
  // Schedule to run every day at 12:00 PM (noon)
  // Cron format: second minute hour day month dayOfWeek
  // "0 0 12 * * *" = At 12:00:00 PM every day
  cron.schedule('0 0 12 * * *', async () => {
    await fetchAndDisplayHeadlines();
  }, {
    scheduled: true,
    timezone: "America/New_York" // Change this to your preferred timezone
  });
  
  // Optional: Schedule additional times (uncomment if needed)
  // cron.schedule('0 0 6 * * *', fetchAndDisplayHeadlines);  // 6 AM
  // cron.schedule('0 0 18 * * *', fetchAndDisplayHeadlines); // 6 PM
  
  console.log("⏰ Scheduler is running... Press Ctrl+C to stop");
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down AI News Scheduler...');
    process.exit(0);
  });
}

main().catch(console.error);