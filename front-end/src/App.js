import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './AuthPage';
import ChatPage from './ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;