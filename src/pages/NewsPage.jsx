import { useState, useEffect } from 'react'
import './NewsPage.css'

function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDogeNews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch top posts from r/dogecoin
      const response = await fetch('https://www.reddit.com/r/dogecoin/hot.json?limit=20')
      const data = await response.json()
      
      const posts = data.data.children.map(post => ({
        id: post.data.id,
        title: post.data.title,
        author: post.data.author,
        score: post.data.score,
        comments: post.data.num_comments,
        url: `https://www.reddit.com${post.data.permalink}`,
        thumbnail: post.data.thumbnail,
        created: new Date(post.data.created_utc * 1000)
      }))
      
      setNews(posts)
    } catch (err) {
      setError('Failed to fetch news. Please try again later.')
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDogeNews()
    // Refresh news every 5 minutes
    const interval = setInterval(fetchDogeNews, 300000)
    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000)
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' years ago'
    
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' months ago'
    
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' days ago'
    
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' hours ago'
    
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' minutes ago'
    
    return Math.floor(seconds) + ' seconds ago'
  }

  if (loading) {
    return (
      <div className="news-page">
        <div className="news-header">
          <h1>🐕 Dogecoin News</h1>
          <p>Latest updates from the Dogecoin community</p>
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
          <p>Latest updates from the Dogecoin community</p>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchDogeNews} className="retry-button">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="news-page">
      <div className="news-header">
        <h1>🐕 Dogecoin News</h1>
        <p>Latest updates from the Dogecoin community</p>
      </div>
      
      <div className="news-grid">
        {news.map(post => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-card"
          >
            <div className="news-card-header">
              <h3 className="news-title">{post.title}</h3>
            </div>
            <div className="news-card-meta">
              <span className="news-author">👤 u/{post.author}</span>
              <span className="news-score">⬆️ {post.score}</span>
              <span className="news-comments">💬 {post.comments}</span>
            </div>
            <div className="news-card-footer">
              <span className="news-time">{formatTimeAgo(post.created)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default NewsPage
