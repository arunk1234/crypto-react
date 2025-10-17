import { useState, useEffect } from 'react'
import './NewsPage.css'

function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Helper to format relative time
  const formatTimeAgo = (input) => {
    const date = typeof input === 'string' ? new Date(input) : input
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    let interval = seconds / 31536000
    if (interval >= 1) return `${Math.floor(interval)} year${Math.floor(interval) > 1 ? 's' : ''} ago`
    interval = seconds / 2592000
    if (interval >= 1) return `${Math.floor(interval)} month${Math.floor(interval) > 1 ? 's' : ''} ago`
    interval = seconds / 86400
    if (interval >= 1) return `${Math.floor(interval)} day${Math.floor(interval) > 1 ? 's' : ''} ago`
    interval = seconds / 3600
    if (interval >= 1) return `${Math.floor(interval)} hour${Math.floor(interval) > 1 ? 's' : ''} ago`
    interval = seconds / 60
    if (interval >= 1) return `${Math.floor(interval)} minute${Math.floor(interval) > 1 ? 's' : ''} ago`
    return `${Math.max(1, Math.floor(seconds))} seconds ago`
  }

  // Sort helper: newest first
  const byDateDesc = (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()

  // Fetch Google News RSS via rss2json (CORS-friendly), fallback to Reddit
  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const googleNewsRss = 'https://news.google.com/rss/search?q=dogecoin&hl=en-US&gl=US&ceid=US:en'
      const rssToJson = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(googleNewsRss)}`

      const res = await fetch(rssToJson)
      if (!res.ok) throw new Error(`Google News RSS failed: ${res.status}`)
      const data = await res.json()

      const items = (data.items || []).map((item) => {
        const url = item.link
        const source = item.author || (new URL(url).hostname.replace('www.', ''))
        return {
          id: item.guid || item.link,
          title: item.title,
          url,
          source,
          publishedAt: item.pubDate,
        }
      }).sort(byDateDesc)

      setNews(items)
    } catch (e) {
      // Fallback to Reddit community posts if RSS fails or rate-limits
      try {
        const response = await fetch('https://www.reddit.com/r/dogecoin/hot.json?limit=20')
        const data = await response.json()
        const posts = (data?.data?.children || []).map((post) => ({
          id: post.data.id,
          title: post.data.title,
          url: `https://www.reddit.com${post.data.permalink}`,
          source: `r/${post.data.subreddit}`,
          publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
        })).sort(byDateDesc)
        setNews(posts)
      } catch (err) {
        console.error('Error fetching news:', err)
        setError('Failed to fetch news. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 300000) // refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="news-page">
        <div className="news-header">
          <h1>🐕 Dogecoin News</h1>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading news...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="news-page">
        <div className="news-header">
          <h1>🐕 Dogecoin News</h1>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchNews} className="retry-button">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="news-page">
      <div className="news-header">
        <h1>🐕 Dogecoin News</h1>
      </div>

      <div className="news-grid">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-card"
          >
            <div className="news-card-header">
              <h3 className="news-title">{item.title}</h3>
            </div>
            <div className="news-card-meta">
              <span className="news-author">� {item.source}</span>
            </div>
            <div className="news-card-footer">
              <span className="news-time">{formatTimeAgo(item.publishedAt)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default NewsPage
