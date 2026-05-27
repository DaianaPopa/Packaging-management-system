import ProductTable from '../components/products/ProductTable'
import ProductFilters from '../components/products/ProductFilters.jsx'

function Products() {
  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <p>Manage and view all product information</p>
      </div>

      <ProductFilters />

      <ProductTable />
    </div>
  )
}

export default Products