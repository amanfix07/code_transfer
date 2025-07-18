import logo from './logo.svg';
import './App.css';
import Landing from './Pages/Landing';
import { Routes,Route } from 'react-router-dom';
import Upload from './Pages/Upload';
import Navbar from './Pages/Navbar';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/upload" element={<Upload />} />

      </Routes>
    </div>
  );                
}

export default App;
