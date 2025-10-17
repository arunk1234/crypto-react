import { useState, useEffect } from 'react'

function Dashboard() {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [currentPortfolio, setCurrentPortfolio] = useState('harshi')
  const [portfolioApiData, setPortfolioApiData] = useState(null)

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

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/arunk1234/financial-calculators/master/price.json')
      const data = await response.json()
      setPortfolioApiData(data)
    } catch (err) {
      console.error('Error fetching portfolio data:', err)
    }
  }

  useEffect(() => {
    fetchDogeData()
    fetchPortfolioData()
    const interval = setInterval(fetchDogeData, 5000) // Update every 5 seconds
    const portfolioInterval = setInterval(fetchPortfolioData, 30000) // Update portfolio data every 30 seconds
    return () => {
      clearInterval(interval)
      clearInterval(portfolioInterval)
    }
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

  // Build portfolio data from API
  const buildPortfolioFromApi = () => {
    if (!portfolioApiData) {
      // Fallback to default values if API hasn't loaded yet
      return {
        harshi: {
          name: 'Harshi',
          holdings: [
            {
              symbol: 'DOGE',
              quantity: 75000,
              buyPrice: 0.0225,
              investedAmount: 1687.50
            }
          ]
        },
        arun: {
          name: 'Arun',
          holdings: [
            {
              symbol: 'DOGE',
              quantity: 45000,
              buyPrice: 0.0275,
              investedAmount: 1237.50
            }
          ]
        }
      }
    }

    // Parse API data and build portfolios
    const portfolios = {}
    portfolioApiData.forEach(item => {
      const name = item.name || item.harhsi // Handle the typo in the API response
      if (name) {
        portfolios[name.toLowerCase()] = {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          holdings: [
            {
              symbol: 'DOGE',
              quantity: item.quantity,
              buyPrice: item.price,
              investedAmount: item.quantity * item.price
            }
          ]
        }
      }
    })
    return portfolios
  }

  const staticPortfolios = buildPortfolioFromApi()

  // Calculate dynamic portfolio values based on current price
  const calculatePortfolioData = (portfolio, currentPrice) => {
    if (!currentPrice) {
      // Return portfolio with zero values when price is not available
      return {
        ...portfolio,
        totalValue: 0,
        totalChange: 0,
        totalChangePercent: 0,
        holdings: portfolio.holdings.map(holding => ({
          ...holding,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercent: 0
        }))
      };
    }

    const updatedHoldings = portfolio.holdings.map(holding => {
      const currentValue = holding.quantity * currentPrice;
      const profitLoss = currentValue - holding.investedAmount;
      const profitLossPercent = (profitLoss / holding.investedAmount) * 100;

      return {
        ...holding,
        currentValue,
        profitLoss,
        profitLossPercent
      };
    });

    const totalValue = updatedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
    const totalInvested = updatedHoldings.reduce((sum, holding) => sum + holding.investedAmount, 0);
    const totalChange = totalValue - totalInvested;
    const totalChangePercent = (totalChange / totalInvested) * 100;

    return {
      ...portfolio,
      totalValue,
      totalChange,
      totalChangePercent,
      holdings: updatedHoldings
    };
  };

  // Get current portfolio data with real-time calculations
  const portfolioData = calculatePortfolioData(staticPortfolios[currentPortfolio], priceData?.price);

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
              <div className="holdings-section">
                <div className="holdings-list">
                  {portfolioData.holdings.map((holding, index) => (
                    <div key={index} className="holding-card">
                      <div className="holding-details">
                        <div className="detail-line detail-line-1">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{holding.quantity.toLocaleString()}</span>
                        </div>
                        <div className="detail-line detail-line-2">
                          <span className="detail-label">Buy Price:</span>
                          <span className="detail-value">${holding.buyPrice.toFixed(6)}</span>
                        </div>
                        <div className="detail-line detail-line-1">
                          <span className="detail-label">Invested:</span>
                          <span className="detail-value">${holding.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="detail-line detail-line-2">
                          <span className="detail-label">Current Value:</span>
                          <span className={`detail-value ${holding.currentValue >= holding.investedAmount ? 'positive' : 'negative'}`}>
                            ${holding.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="detail-line detail-line-1">
                          <span className="detail-label">P/L:</span>
                          <span className={`detail-value ${holding.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                            {holding.profitLoss >= 0 ? '+' : ''}${holding.profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      <footer className="portfolio-summary-footer">
        <div className="summary-container">
          <h3>Portfolio Summary</h3>
          <div className="summary-total-card">
            <div className="summary-details">
              {(() => {
                const arunPortfolio = calculatePortfolioData(staticPortfolios.arun, priceData?.price);
                const harshiPortfolio = calculatePortfolioData(staticPortfolios.harshi, priceData?.price);
                const totalInvested = arunPortfolio.holdings[0]?.investedAmount + harshiPortfolio.holdings[0]?.investedAmount;
                const totalCurrent = arunPortfolio.totalValue + harshiPortfolio.totalValue;
                const totalPL = totalCurrent - totalInvested;
                const totalPLPercent = (totalPL / totalInvested) * 100;
                
                return (
                  <>
                    <div className="summary-row">
                      <span className="summary-label">Total Invested:</span>
                      <span className="summary-value">
                        ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Arun P/L:</span>
                      <span className={`summary-value ${arunPortfolio.totalChange >= 0 ? 'positive' : 'negative'}`}>
                        {arunPortfolio.totalChange >= 0 ? '+' : ''}${arunPortfolio.totalChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        ({arunPortfolio.totalChangePercent >= 0 ? '+' : ''}{arunPortfolio.totalChangePercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Harshi P/L:</span>
                      <span className={`summary-value ${harshiPortfolio.totalChange >= 0 ? 'positive' : 'negative'}`}>
                        {harshiPortfolio.totalChange >= 0 ? '+' : ''}${harshiPortfolio.totalChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        ({harshiPortfolio.totalChangePercent >= 0 ? '+' : ''}{harshiPortfolio.totalChangePercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="summary-row summary-row-total">
                      <span className="summary-label">Total P/L:</span>
                      <span className={`summary-value ${totalPL >= 0 ? 'positive' : 'negative'}`}>
                        {totalPL >= 0 ? '+' : ''}${totalPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        ({totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
