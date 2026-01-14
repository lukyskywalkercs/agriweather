import './CategorySelector.css'

function CategorySelector({ categories, onSelect }) {
  return (
    <div className="category-selector">
      <div className="category-grid">
        {categories.map(category => (
          <button
            key={category.id}
            className="category-card"
            onClick={() => onSelect(category.id)}
            style={{ '--category-color': category.color }}
          >
            <div className="category-icon-large">{category.icon}</div>
            <h3>{category.name}</h3>
            <p className="category-hint">Importa tus datos para ver estadísticas</p>
          </button>
        ))}
      </div>
      <div className="info-section">
        <h3>¿Cómo funciona?</h3>
        <ol>
          <li>Descarga tus datos de la plataforma (CSV, JSON, etc.)</li>
          <li>Selecciona una categoría arriba</li>
          <li>Importa el archivo en el dashboard</li>
          <li>Visualiza tus gastos con estadísticas detalladas</li>
        </ol>
      </div>
    </div>
  )
}

export default CategorySelector


