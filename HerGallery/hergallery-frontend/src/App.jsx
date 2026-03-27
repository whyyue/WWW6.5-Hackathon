import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import ExhibitionPage from './pages/ExhibitionPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/exhibition/:id" element={<ExhibitionPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
