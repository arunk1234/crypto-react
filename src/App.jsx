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

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🐕</span>
            <h1>DogeWatch</h1>
          </div>
          <div className="status">
            <span className="live-indicator">🟢 Live</span>
          </div>
        </header>

        <main className="main-content">
          {loading && !priceData ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading Dogecoin data...</p>
            </div>
          ) : error ? (
            <div className="error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : priceData ? (
            <div className="price-card">
              <div className="price-header">
                <h2>DOGE/USDT</h2>
                <div className={`price-change ${priceData.priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(priceData.priceChangePercent)}
                </div>
              </div>

              <div className="price-display">
                <div className="current-price">
                  {formatPrice(priceData.price)}
                </div>
              </div>

              <div className="price-stats">
                <div className="stat">
                  <span className="stat-label">24h High</span>
                  <span className="stat-value">{formatPrice(priceData.highPrice)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">24h Low</span>
                  <span className="stat-value">{formatPrice(priceData.lowPrice)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">24h Volume</span>
                  <span className="stat-value">{formatVolume(priceData.volume)} DOGE</span>
                </div>
              </div>

              <div className="last-updated">
                Last updated: {lastUpdated?.toLocaleTimeString()}
              </div>
            </div>
          ) : null}
        </main>

        <footer className="footer">
          <p>Data provided by Binance US API</p>
        </footer>
      </div>
    </div>
  )
}

export default App
