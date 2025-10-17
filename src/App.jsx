import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [currentPortfolio, setCurrentPortfolio] = useState('harshi')

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

  // Sample portfolio data for two users (you can replace this with real data later)
  const portfolios = {
    harshi: {
      name: 'Harshi',
      totalValue: 1875.00,
      totalChange: 67.50,
      totalChangePercent: 3.74,
      holdings: [
        {
          symbol: 'DOGE',
          quantity: 75000,
          buyPrice: 0.0225,
          investedAmount: 1687.50,
          currentValue: 1875.00,
          profitLoss: 187.50,
          profitLossPercent: 11.11
        }
      ]
    },
    arun: {
      name: 'Arun',
      totalValue: 1125.00,
      totalChange: -45.00,
      totalChangePercent: -3.84,
      holdings: [
        {
          symbol: 'DOGE',
          quantity: 45000,
          buyPrice: 0.0275,
          investedAmount: 1237.50,
          currentValue: 1125.00,
          profitLoss: -112.50,
          profitLossPercent: -9.09
        }
      ]
    }
  }

  // For now, let's use the selected portfolio
  const portfolioData = portfolios[currentPortfolio]

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
          {/* Portfolio Card with Navigation */}
          <div className="dashboard-card portfolio-card">
            <div className="card-header">
              <button
                className="nav-arrow nav-arrow-left"
                onClick={() => setCurrentPortfolio(currentPortfolio === 'harshi' ? 'arun' : 'harshi')}
                aria-label="Previous portfolio"
              >
                ‹
              </button>
              <h3>{portfolioData.name}'s Portfolio</h3>
              <button
                className="nav-arrow nav-arrow-right"
                onClick={() => setCurrentPortfolio(currentPortfolio === 'harshi' ? 'arun' : 'harshi')}
                aria-label="Next portfolio"
              >
                ›
              </button>
            </div>
            <div className="portfolio-content">
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
              <div className="holdings-section">
                <h4>Holdings</h4>
                <div className="holdings-list">
                  {portfolioData.holdings.map((holding, index) => (
                    <div key={index} className="holding-item">
                      <div className="holding-header">
                        <span className="holding-symbol">{holding.symbol}</span>
                      </div>
                      <div className="holding-details">
                        <div className="detail-row">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{holding.quantity.toLocaleString()} coins</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Buy Price:</span>
                          <span className="detail-value">${holding.buyPrice.toFixed(6)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Invested:</span>
                          <span className="detail-value">${holding.investedAmount.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Current Value:</span>
                          <span className="detail-value">${holding.currentValue.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">P/L:</span>
                          <span className={`detail-value ${holding.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                            {holding.profitLoss >= 0 ? '+' : ''}${holding.profitLoss.toFixed(2)}
                            ({holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
