import { Eye, Pencil } from 'lucide-react'
import mockProducts from '../../data/mockProducts'

function ProductTable() {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>PRODUCT CODE</th>
            <th>PRODUCT DESCRIPTION</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>


        <tbody>
          {mockProducts.map(product => (
            <tr key={product.id}>
              <td>{product.code}</td>
              <td>{product.description}</td>

              <td>
                <span className="status-badge">
                  {product.status}
                </span>
              </td>

              <td className="actions">
                <Eye size={18} />
                <Pencil size={18} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
  )
}

export default ProductTable