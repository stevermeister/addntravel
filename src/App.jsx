import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Wishlist from './pages/Wishlist';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Wishlist />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
