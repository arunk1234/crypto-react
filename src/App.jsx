import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchDogeData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch current price
      const priceResponse = await fetch('https://api.binance.us/api/v3/ticker/price?symbol=DOGEUSDT')
      const priceResult = await priceResponse.json()

      // Fetch 24h stats for additional data
      const statsResponse = await fetch('https://api.binance.us/api/v3/ticker/24hr?symbol=DOGEUSDT')
      const statsResult = await statsResponse.json()

      const combinedData = {
        symbol: priceResult.symbol,
        price: parseFloat(priceResult.price),
        priceChangePercent: parseFloat(statsResult.priceChangePercent),
        volume: parseFloat(statsResult.volume),
        highPrice: parseFloat(statsResult.highPrice),
        lowPrice: parseFloat(statsResult.lowPrice)
      }

      setPriceData(combinedData)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to fetch Dogecoin data. Retrying...')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDogeData()
    const interval = setInterval(fetchDogeData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    }).format(price)
  }

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const formatVolume = (volume) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(volume)
  }

  // Sample portfolio data (you can replace this with real data later)
  const portfolioData = {
    totalValue: 1250.75,
    totalChange: 45.30,
    totalChangePercent: 3.76,
    holdings: [
      { symbol: 'DOGE', amount: 50000, value: 1250.75, change: 45.30 }
    ]
  }

  return (
    <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">🐕</span>
              <div className="price-display">
                {priceData ? (
                  <div className="header-price">
                    <span className="header-price-value">{formatPrice(priceData.price)}</span>
                    <span className={`header-price-change ${priceData.priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercent(priceData.priceChangePercent)}
                    </span>
                  </div>
                ) : (
                  <div className="header-loading">
                    <div className="mini-spinner"></div>
                    <span>Loading...</span>
                  </div>
                )}
              </div>
            </div>
            {priceData && (
              <div className="market-stats">
                <div className="stat-item">
                  <span className="stat-label">24h High:</span>
                  <span className="stat-value">{formatPrice(priceData.highPrice)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">24h Low:</span>
                  <span className="stat-value">{formatPrice(priceData.lowPrice)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">24h Volume:</span>
                  <span className="stat-value">{formatVolume(priceData.volume)} DOGE</span>
                </div>
              </div>
            )}
            <div className="header-status">
              <span className="live-indicator">🟢 Live</span>
              <span className="last-update">
                {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()}`}
              </span>
            </div>
          </div>
        </header>      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Portfolio Overview Card */}
          <div className="dashboard-card portfolio-card">
            <div className="card-header">
              <h3>Portfolio Overview</h3>
              <span className="card-icon">📊</span>
            </div>
            <div className="portfolio-summary">
              <div className="total-value">
                <span className="label">Total Value</span>
                <span className="value">${portfolioData.totalValue.toFixed(2)}</span>
              </div>
              <div className={`total-change ${portfolioData.totalChange >= 0 ? 'positive' : 'negative'}`}>
                <span className="label">24h Change</span>
                <span className="value">
                  {portfolioData.totalChange >= 0 ? '+' : ''}${portfolioData.totalChange.toFixed(2)}
                  ({formatPercent(portfolioData.totalChangePercent)})
                </span>
              </div>
            </div>
          </div>

          {/* Holdings Card */}
          <div className="dashboard-card holdings-card">
            <div className="card-header">
              <h3>My Holdings</h3>
              <span className="card-icon">💰</span>
            </div>
            <div className="holdings-list">
              {portfolioData.holdings.map((holding, index) => (
                <div key={index} className="holding-item">
                  <div className="holding-info">
                    <span className="holding-symbol">{holding.symbol}</span>
                    <span className="holding-amount">{holding.amount.toLocaleString()} coins</span>
                  </div>
                  <div className="holding-value">
                    <span className="value">${holding.value.toFixed(2)}</span>
                    <span className={`change ${holding.change >= 0 ? 'positive' : 'negative'}`}>
                      {holding.change >= 0 ? '+' : ''}${holding.change.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Placeholder Cards for Future Features */}
          <div className="dashboard-card placeholder-card">
            <div className="card-header">
              <h3>Price Alerts</h3>
              <span className="card-icon">🔔</span>
            </div>
            <div className="placeholder-content">
              <p>Coming Soon</p>
              <small>Set price alerts for your favorite coins</small>
            </div>
          </div>

          <div className="dashboard-card placeholder-card">
            <div className="card-header">
              <h3>Market News</h3>
              <span className="card-icon">📰</span>
            </div>
            <div className="placeholder-content">
              <p>Coming Soon</p>
              <small>Latest crypto news and updates</small>
            </div>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>Data provided by Binance US API • Built with React & Vite</p>
      </footer>
    </div>
  )
}

export default App
