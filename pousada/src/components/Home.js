import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from './Header';
import Footer from './Footer';
import { Chart } from 'primereact/chart';
import axios from 'axios';



function Home() {
  const [chartData, setChartData] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8080/produtos')
      .then(response => setProdutos(response.data));
  }, []);



  const quantidade = produtos.map(data => data.quantidade);
  const status = produtos.filter(data => data.status <= data.quantidade_minima);
  const resul = status.map(data => data.status);
  const nome_produto = status.map(data => data.nome);


  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');


    const data = {
      labels: nome_produto,
      datasets: [
        {
          label: 'Quantidade Padrão',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          data: quantidade


        },
        {
          label: 'Quantidade restante ',
          backgroundColor: documentStyle.getPropertyValue('--pink-600'),
          borderColor: documentStyle.getPropertyValue('--pink-600'),
          data: resul
        }
      ]
    };
    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            fontColor: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

    setChartData(data);
    setChartOptions(options);
  }, [produtos]);
  const link = {
    textDecoration: 'none',
    color: '#FFFFFF'
  };


  return (

    <div className="home">
      <Header />


      <br />
      <br />



      <div className="container text-center">



        <div className="row justify">

          <div className="col-sm-2">
            <div className="card">
              <div className="bg-image hover-overlay" data-mdb-ripple-init data-mdb-ripple-color="light">
                <img src="https://media.istockphoto.com/id/1147449038/photo/internet-communication-and-data-exchanges-global-network-structure.jpg?b=1&s=612x612&w=0&k=20&c=WCWsX82X5qbnkHIqgC0Q8Q83aoA6NxRf8UEFzrGr578=" className="img-fluid" />
                <a href="#!">
                  <div className="mask" style={{ background: '#87CEEB' }}></div>
                </a>
              </div>
              <div className="card-body">
                <h6 className="card-title">Usuários</h6>
                <p className="card-text"></p>
                <a className="btn btn-info btn-sm" data-mdb-ripple-init>
                  <Link to="/usuarios" style={link}> Gerênciar</Link>
                </a>
              </div>
            </div>

            <br />

            <div className="card">
              <div className="bg-image hover-overlay" data-mdb-ripple-init data-mdb-ripple-color="light">
                <img src="https://media.istockphoto.com/id/1195741045/pt/foto/technician-using-digital-tablet-while-working-in-the-production-line-of-a-factory-checking.jpg?s=612x612&w=0&k=20&c=3ql0nbl8byATlrExwwU9VQhKId2wGcZQfDUsi4rdwZQ=" className="img-fluid" />
                <a href="#!">
                  <div className="mask" style={{ background: '#87CEEB' }}></div>
                </a>
              </div>
              <div className="card-body">
                <h6 className="card-title">Produtos</h6>
                <p className="card-text"></p>
                <a href="#!" className="btn btn-info btn-sm" data-mdb-ripple-init><Link to="/produtos/1" style={link}> Gerênciar</Link></a>
              </div>
            </div>


          </div>

          <div className="col-sm-2">
            <div className="card">
              <div className="bg-image hover-overlay" data-mdb-ripple-init data-mdb-ripple-color="light">
                <img src="https://media.istockphoto.com/id/2153987538/es/foto/business-performance-monitoring-and-evaluation-concept-take-an-assessment-business-man-using.jpg?s=612x612&w=0&k=20&c=SMF2mivD0CKRggrWJV-bJDGKU8ToBobBtpL--e1A7Qs=" className="img-fluid" />
                <a href="#!">
                  <div className="mask" style={{ background: '#87CEEB' }}></div>
                </a>
              </div>
              <div className="card-body">
                <h6 className="card-title">Categorias</h6>
                <p className="card-text"></p>
                <a className="btn btn-info btn-sm" data-mdb-ripple-init>
                  <Link to="/categorias" style={link}>Gerênciar</Link>
                </a>
              </div>
            </div>

            <br />

            <div className="card">
              <div className="bg-image hover-overlay" data-mdb-ripple-init data-mdb-ripple-color="light">
                <img src="https://media.istockphoto.com/id/1450730292/es/foto/candado-en-el-teclado-de-la-computadora-seguridad-de-red-seguridad-de-datos-y-protecci%C3%B3n.jpg?s=612x612&w=0&k=20&c=xLI-zMks4mGYAV5nNWQddCb46qTjscUcu0S-zK1Z8DU=" className="img-fluid" />
                <a href="#!">
                  <div className="mask" style={{ background: '#87CEEB' }}></div>
                </a>
              </div>
              <div className="card-body">
                <h6 className="card-title">Senhas</h6>
                <p className="card-text"></p>
                <a href="#!" className="btn btn-info btn-sm" data-mdb-ripple-init><Link to="/senhas" style={link}>Gerênciar</Link></a>
              </div>
            </div>

            <br />
            <div className="card">
              <div className="bg-image hover-overlay" data-mdb-ripple-init data-mdb-ripple-color="light">
                <img
                  src="https://kinsta.com/pt/wp-content/uploads/sites/3/2019/07/plugins-wordpress-de-reviews-1024x512.jpg"
                  className="img-preco"
                  style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
                />

                <a href="#!">
                  <div className="mask" style={{ background: '#87CEEB' }}></div>
                </a>
              </div>
              <div className="card-body">
                <h6 className="card-title">Tabela de Preço</h6>
                <p className="card-text"></p>
                <a href="#!" className="btn btn-info btn-md" data-mdb-ripple-init><Link to="/tabela-de-preco/" style={link}> Gerênciar</Link></a>
              </div>
            </div>

          </div>

          <div className="col">

            <h4 className="display-6">Monitoramento de Estoque <i className="fas fa-chart-column"></i></h4>
            <div className="card">

              <Chart type="bar" data={chartData} options={chartOptions} />
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
