import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NeuroNav from './components/NeuroNav';
import NeuroNavDashboard from './components/NeuroNavDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<NeuroNav />} />
          <Route path="/neuronavdashboard" element={<NeuroNavDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
