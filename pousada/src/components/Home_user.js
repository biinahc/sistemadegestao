import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import Footer from './Footer';
import { Chart } from 'primereact/chart';
import axios from 'axios';
import Header_user from './Header_user';
import Logo from './login.png';







function Home_user() {
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

        <div>
            <Header_user />


            <br />
            <br />



            <div className="homeuser container text-center">



                <div className="row justify">

                    <div className="col-sm-3">

                        <br />
                        <br />
                        <br />
                        <br />


                        <div className="card">
                            <div className="bg-image hover-overlay" data-mdb-ripple-init data-mdb-ripple-color="light">
                                <img src="https://media.istockphoto.com/id/1195741045/pt/foto/technician-using-digital-tablet-while-working-in-the-production-line-of-a-factory-checking.jpg?s=612x612&w=0&k=20&c=3ql0nbl8byATlrExwwU9VQhKId2wGcZQfDUsi4rdwZQ=" className="img-fluid" />
                                <a href="#!">
                                    <div className="mask" style={{ background: '#87CEEB' }}></div>
                                </a>
                            </div>
                            <div className="card-body">
                                <h6 className="card-title">Gerênciar</h6>
                                <p className="card-text"></p>
                                <a href="#!" className="btn btn-info btn-md" data-mdb-ripple-init><Link to="/produtos/" style={link}> Produtos</Link></a>
                            </div>
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



                    <div className="col">
                        <br />
                        <br />




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

export default Home_user;
