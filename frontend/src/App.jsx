import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import NotesList from './components/NotesList.jsx';
import NoteForm from './components/NoteForm.jsx';
import './components/styles.css';

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Sidebar on the left */}
        <Sidebar />

        {/* Right-hand side with header and routes */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header at the top */}
          <Header />

          {/* Main content area where routed components render */}
          <div
            className="content"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: '#242424',
            }}
          >
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/notes" element={<NotesList />} />
              <Route path="/notes/new" element={<NoteForm />} />
              <Route path="/notes/:id" element={<NoteForm />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
