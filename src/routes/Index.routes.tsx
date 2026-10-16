import { Routes, Route } from 'react-router';
import MainMenu from '../pages/MainMenu';

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
    </Routes>
  );
}

export default RouterPage;
