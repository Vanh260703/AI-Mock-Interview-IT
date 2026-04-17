import { useState, useEffect } from 'react'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'unreachable' }))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>AI Mock Interview IT</h1>
      <h3>Backend Health</h3>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </div>
  )
}

export default App
