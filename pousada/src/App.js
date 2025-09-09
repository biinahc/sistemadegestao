import Home from './components/Home';
import Home_user from './components/Home_user';
import Users from './components/Users';
import Produtos from './components/Produtos';
import Login from './components/Login';
import Categorias from './components/Categorias';
import Senhas from './components/Senhas';
import TabelaDePreco from './components/tabela-de-preco';
import Estoque from './components/estoque';
import Boletos from './components/Boletos'; 
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Financeiro from './components/Financeiro';

function App() {
  // 🔹 inicializa estados direto do localStorage
  const role = localStorage.getItem('role');

  const [isAuthenticated, setIsAuthenticated] = useState(role === 'admin' || role === 'user');
  const [isAdmin, setIsAdmin] = useState(role === 'admin');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsAdmin(false);
    localStorage.setItem('role', 'user');
  };

  const handleAdmin = () => {
    setIsAuthenticated(true);
    setIsAdmin(true);
    localStorage.setItem('role', 'admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} onAdmin={handleAdmin} onLogout={handleLogout} />} />
        <Route path="/home" element={isAdmin ? <Home /> : <Navigate to="/" />} />
        <Route path="/home_user" element={isAuthenticated ? <Home_user /> : <Navigate to="/" />} />
        <Route path="/usuarios" element={isAdmin ? <Users /> : <Navigate to="/" />} />
        <Route path="/produtos/:flag" element={isAuthenticated ? <Produtos /> : <Navigate to="/" />} />
        <Route path="/categorias" element={isAdmin ? <Categorias /> : <Navigate to="/" />} />
        <Route path="/senhas" element={isAdmin ? <Senhas /> : <Navigate to="/" />} />
        <Route path="/tabela-de-preco" element={isAuthenticated ? <TabelaDePreco /> : <Navigate to="/" />} />
        <Route path="/estoque" element={isAuthenticated ? <Estoque /> : <Navigate to="/" />} />
         <Route path="/Financeiro" element={isAdmin ? <Financeiro onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/boletos" element={isAdmin ? <Boletos onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}


export default App;
