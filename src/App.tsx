import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HCPDetails from './pages/HCPDetails';
import HCPList from './pages/HCPList';
import Carousel from './pages/Carousel';
import InfoSlider from './pages/InfoSlider';
import TakePledge from './pages/TakePledge';
import ThankYou from './pages/ThankYou';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hcp-details" element={<HCPDetails />} />
        <Route path="/hcp-list" element={<HCPList />} />
        <Route path="/carousel" element={<Carousel />} />
        <Route path="/info-slider" element={<InfoSlider />} />
        <Route path="/take-pledge" element={<TakePledge />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </Router>
  );
}

export default App;
