import { Search, Filter } from 'lucide-react'

function ProductFilters() {
  return (
    <div className="filters-bar">
      <div className="search-box">
        <Search size={20} />
        <input type="text" placeholder="Search products..." />
      </div>

      <button className="filter-btn">
        <Filter size={18} />
        Filters
      </button>

      <button className="new-product-btn">
        New Product
      </button>
       </div>
  )
}

export default ProductFilters