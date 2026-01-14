import { useState } from 'react'
import './DataImporter.css'

function DataImporter({ category, onImport, loading }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo')
      return
    }

    try {
      const text = await file.text()
      let data

      // Intentar parsear como JSON
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } 
      // Intentar parsear como CSV
      else if (file.name.endsWith('.csv')) {
        data = parseCSV(text)
      }
      // Intentar parsear como texto plano (formato personalizado)
      else {
        data = text
      }

      await onImport(data, category.id)
    } catch (err) {
      setError(`Error al leer el archivo: ${err.message}`)
      console.error('Import error:', err)
    }
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const obj = {}
      headers.forEach((header, i) => {
        obj[header] = values[i] || ''
      })
      return obj
    })
    return rows
  }

  return (
    <div className="data-importer">
      <div className="importer-header">
        <div className="category-header">
          <span className="category-icon-large">{category.icon}</span>
          <h2>{category.name} Dashboard</h2>
        </div>
        <p className="importer-subtitle">
          Importa tus datos para ver estadísticas detalladas de tus gastos
        </p>
      </div>

      <div className="importer-card">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="file-input"
            accept=".json,.csv,.txt"
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            {file ? file.name : 'Seleccionar archivo'}
          </label>
        </div>

        {file && (
          <button
            className="import-button"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Importar Datos'}
          </button>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="help-section">
          <h4>Formatos soportados:</h4>
          <ul>
            <li><strong>JSON:</strong> Archivos JSON con estructura de datos</li>
            <li><strong>CSV:</strong> Archivos CSV con columnas de fecha, cantidad, moneda, etc.</li>
            <li><strong>TXT:</strong> Archivos de texto plano (se procesarán según la categoría)</li>
          </ul>
          <p className="help-note">
            El sistema detectará automáticamente el formato y procesará los datos.
            Las conversiones de moneda se realizarán usando tasas históricas del BCE.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DataImporter


