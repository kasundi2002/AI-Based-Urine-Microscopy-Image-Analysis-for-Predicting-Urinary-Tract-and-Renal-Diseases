
import { useState } from 'react'
import './App.css'
import UploadImage from './components/UploadImage'
import ResultViewer from './components/ResultViewer'
import api from './api'

function App() {
  const [results, setResults] = useState(null)
  const [currentImageFile, setCurrentImageFile] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async (file) => {
    setError(null)
    setCurrentImageFile(file)
    
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await api.post('/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setResults(response.data)
    } catch (err) {
      console.error(err)
      setError("Analysis failed. Please check the backend connection.")
      setResults(null)
    }
  }

  const handleReset = () => {
    setResults(null)
    setCurrentImageFile(null)
    setError(null)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Urine Crystal AI Analysis</h1>
        <p>Microscopy Image Analysis Pipeline</p>
      </header>

      <main className="app-content">
        {error && <div className="error-message" style={{color: 'red'}}>{error}</div>}

        {!results ? (
          <UploadImage onAnalyze={handleAnalyze} />
        ) : (
          <ResultViewer 
            imageFile={currentImageFile} 
            results={results} 
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  )
}

export default App
