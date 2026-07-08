import Header from './Header'
import Sidebar from './SideBar'

function Layout({ children }) {
  return (
    <div className="app-layout">

      <Header />

      <div className="main-layout">

        <Sidebar />

        <main className="page-content">
          {children}
        </main>

      </div>
    </div>
  )
}

export default Layout