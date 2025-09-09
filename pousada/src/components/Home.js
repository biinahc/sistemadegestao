import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Chart } from 'primereact/chart';
import axios from 'axios';
import './Home.css';

const menuItems = [
  { title: 'Usuários', image: 'https://media.istockphoto.com/id/1147449038/photo/internet-communication-and-data-exchanges-global-network-structure.jpg?b=1&s=612x612&w=0&k=20&c=WCWsX82X5qbnkHIqgC0Q8Q83aoA6NxRf8UEFzrGr578=', link: '/usuarios' },
  { title: 'Produtos', image: 'https://media.istockphoto.com/id/1195741045/pt/foto/technician-using-digital-tablet-while-working-in-the-production-line-of-a-factory-checking.jpg?s=612x612&w=0&k=20&c=3ql0nbl8byATlrExwwU9VQhKId2wGcZQfDUsi4rdwZQ=', link: '/produtos/1' },
  { title: 'Estoque', image: 'https://media.istockphoto.com/id/1195741045/pt/foto/technician-using-digital-tablet-while-working-in-the-production-line-of-a-factory-checking.jpg?s=612x612&w=0&k=20&c=3ql0nbl8byATlrExwwU9VQhKId2wGcZQfDUsi4rdwZQ=', link: '/estoque' },
  { title: 'Categorias', image: 'https://media.istockphoto.com/id/2153987538/es/foto/business-performance-monitoring-and-evaluation-concept-take-an-assessment-business-man-using.jpg?s=612x612&w=0&k=20&c=SMF2mivD0CKRggrWJV-bJDGKU8ToBobBtpL--e1A7Qs=', link: '/categorias' },
  { title: 'Senhas', image: 'https://media.istockphoto.com/id/1450730292/es/foto/candado-en-el-teclado-de-la-computadora-seguridad-de-red-seguridad-de-datos-y-protecci%C3%B3n.jpg?s=612x612&w=0&k=20&c=xLI-zMks4mGYAV5nNWQddCb46qTjscUcu0S-zK1Z8DU=', link: '/senhas' },
  { title: 'Financeiro', image: 'https://media.istockphoto.com/id/1450730292/es/foto/candado-en-el-teclado-de-la-computadora-seguridad-de-red-seguridad-de-datos-y-protecci%C3%B3n.jpg?s=612x612&w=0&k=20&c=xLI-zMks4mGYAV5nNWQddCb46qTjscUcu0S-zK1Z8DU=', link: '/financeiro' },
  { title: 'Tabela de Preço', image: 'https://kinsta.com/pt/wp-content/uploads/sites/3/2019/07/plugins-wordpress-de-reviews-1024x512.jpg', link: '/tabela-de-preco/' },
  { title: 'Boletos', image: 'https://kinsta.com/pt/wp-content/uploads/sites/3/2019/07/plugins-wordpress-de-reviews-1024x512.jpg', link: '/boletos' },
];

const NavigationCard = ({ item }) => (
  <div className="card navigation-card">
    <div className="bg-image hover-overlay">
      <img src={item.image} className="img-fluid" alt={item.title} />
      <div className="mask" style={{ background: '#87CEEB' }}></div>
    </div>
    <div className="card-body">
      <h6 className="card-title">{item.title}</h6>
      <Link to={item.link} className="btn btn-info btn-sm">
        Gerenciar
      </Link>
    </div>
  </div>
);

const getChartOptions = (documentStyle) => ({
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        fontColor: documentStyle.getPropertyValue('--text-color'),
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: documentStyle.getPropertyValue('--text-color-secondary'),
        font: { weight: 500 },
      },
      grid: { display: false, drawBorder: false },
    },
    y: {
      ticks: { color: documentStyle.getPropertyValue('--text-color-secondary') },
      grid: { color: documentStyle.getPropertyValue('--surface-border'), drawBorder: false },
    },
  },
});

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [boletoChartData, setBoletoChartData] = useState({});
  const [boletoChartOptions, setBoletoChartOptions] = useState({});

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/produtos');
        setProdutos(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };
    fetchProdutos();
  }, []);

  useEffect(() => {
    if (produtos.length === 0) return;

    const produtosComEstoqueBaixo = produtos.filter(
      (data) => data.status <= data.quantidade_minima
    );
    
    const nomes = produtosComEstoqueBaixo.map((data) => data.nome);
    const quantidadesMinimas = produtosComEstoqueBaixo.map((data) => data.quantidade_minima);
    const quantidadesRestantes = produtosComEstoqueBaixo.map((data) => data.status);

    const documentStyle = getComputedStyle(document.documentElement);
    
    const data = {
      labels: nomes,
      datasets: [
        {
          label: 'Quantidade Mínima',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          data: quantidadesMinimas,
        },
        {
          label: 'Quantidade Restante',
          backgroundColor: documentStyle.getPropertyValue('--pink-600'),
          borderColor: documentStyle.getPropertyValue('--pink-600'),
          data: quantidadesRestantes,
        },
      ],
    };

    const options = getChartOptions(documentStyle);
    setChartData(data);
    setChartOptions(options);
  }, [produtos]);
  
  useEffect(() => {
    const fetchBoletos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/boletos/resumo');
        const { aVencer, vencidos } = response.data;

        const documentStyle = getComputedStyle(document.documentElement);
        const data = {
          labels: ['Boletos A Vencer', 'Boletos Vencidos'],
          datasets: [
            {
              data: [aVencer, vencidos],
              backgroundColor: [
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--red-500')
              ],
              hoverBackgroundColor: [
                documentStyle.getPropertyValue('--green-400'),
                documentStyle.getPropertyValue('--red-400')
              ]
            }
          ]
        };

        const options = {
          maintainAspectRatio: false,
          cutout: '60%', 
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                fontColor: documentStyle.getPropertyValue('--text-color')
              }
            }
          }
        };

        setBoletoChartData(data);
        setBoletoChartOptions(options);

      } catch (error) {
        console.error('Erro ao buscar resumo de boletos:', error);
      }
    };
    fetchBoletos();
  }, []);

  return (
    <div className="home">
      <Header />
      <div className="container text-center">

        <div className="row justify-content-center navigation-row mt-5">
          {menuItems.map((item, index) => (
            <div key={index} className="col-sm-6 col-md-4 col-lg-2 mb-4">
              <NavigationCard item={item} />
            </div>
          ))}
        </div>

        <br />

        {/* Mude 'justify-content-center' para 'justify-content-between' */}
        <div className="row justify-content-between">
          {/* Gráfico de Estoque */}
          <div className="col-12 col-lg-6 chart-container stock-chart-container"> 
            <h4 className="display-6">
              Monitoramento de Estoque <i className="fas fa-chart-column"></i>
            </h4>
            <div className="card">
              <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
          </div>
          
          {/* Gráfico de Boletos */}
          <div className="col-12 col-lg-6 chart-container boleto-chart-container">
            <h4 className="display-6">
              Situação dos Boletos <i className="fas fa-file-invoice"></i>
            </h4>
            <div className="card">
              <Chart type="doughnut" data={boletoChartData} options={boletoChartOptions} />
            </div>
          </div>
        </div>
      </div>
      <Outlet />
      <Footer />
    </div>
  );
}

export default Home;