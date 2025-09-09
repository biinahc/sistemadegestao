import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';

import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Financeiro.css';

// Importa os componentes Header e Footer
import Header from './Header'; 
import Footer from './Footer';

export default function Financeiro({ onLogout }) {
  const [relatorioMensal, setRelatorioMensal] = useState([]);
  const [totalEstoque, setTotalEstoque] = useState('0.00');
  const [totalSaidas, setTotalSaidas] = useState('0.00');
  const [monthlyProfit, setMonthlyProfit] = useState('0.00');
  const toast = React.useRef(null);
  const dt = React.useRef(null);

  const fetchData = async () => {
    try {
      const estoqueResponse = await axios.get('http://localhost:8080/produtos/total-estoque');
      setTotalEstoque(parseFloat(estoqueResponse.data.totalEstoque).toFixed(2));

      const saidasResponse = await axios.get('http://localhost:8080/produtos/total-saidas');
      setTotalSaidas(parseFloat(saidasResponse.data.totalSaidas).toFixed(2));
      
      const lucroResponse = await axios.get('http://localhost:8080/produtos/lucro-mensal');
      setMonthlyProfit(parseFloat(lucroResponse.data.lucroTotal).toFixed(2));

      const dadosFinanceirosMensais = [
        { mes: 'Janeiro', receita: 15000, custos: 8000 },
        { mes: 'Fevereiro', receita: 18000, custos: 9500 },
        { mes: 'Março', receita: 22000, custos: 11000 },
      ];

      const relatorioComLucro = dadosFinanceirosMensais.map(item => ({
        ...item,
        lucro: item.receita - item.custos,
      }));
      setRelatorioMensal(relatorioComLucro);
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar dados financeiros.', life: 3000 });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const lucroBodyTemplate = (rowData) => {
    const lucro = parseFloat(rowData.lucro);
    return (
      <Tag value={`R$ ${lucro.toFixed(2)}`} severity={lucro >= 0 ? 'success' : 'danger'} />
    );
  };
  
  const currencyBodyTemplate = (rowData, field) => {
    return `R$ ${parseFloat(rowData[field]).toFixed(2)}`;
  };

  const headerTable = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4>Relatório Mensal Detalhado</h4>
    </div>
  );

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  return (
    <div>
      {/* Adiciona o Header no topo */}
      <Header onLogout={onLogout} />

      <div className="financeiro-container">
        <Toast ref={toast} />
        
        <div className="header-container">
          <h2 className="title">Controle Financeiro</h2>
        </div>
        
        <div className="card-container">
          <div className="financial-card card-stock">
            <h5 className="card-title">Valor Total do Estoque (Custo)</h5>
            <p className="card-value">R$ {totalEstoque}</p>
          </div>
          <div className="financial-card card-revenue">
            <h5 className="card-title">Total de Saídas (Receita)</h5>
            <p className="card-value">R$ {totalSaidas}</p>
          </div>
          <div className="financial-card card-profit">
            <h5 className="card-title">Lucro do Mês</h5>
            <p className="card-value">R$ {monthlyProfit}</p>
          </div>
        </div>

        <Toolbar className="mb-4" right={<Button label="Exportar CSV" icon="pi pi-upload" onClick={exportCSV} />} />
        
        <div className="datatable-container">
          <DataTable ref={dt} value={relatorioMensal} header={headerTable}
            paginator rows={5} rowsPerPageOptions={[5, 10, 20]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            className="p-datatable-striped"
          >
            <Column field="mes" header="Mês" sortable />
            <Column field="receita" header="Receita" body={(rowData) => currencyBodyTemplate(rowData, 'receita')} sortable />
            <Column field="custos" header="Custo com Boletos" body={(rowData) => currencyBodyTemplate(rowData, 'custos')} sortable />
            <Column field="lucro" header="Lucro Líquido" body={lucroBodyTemplate} sortable />
          </DataTable>
        </div>
      </div>

      {/* Adiciona o Footer no rodapé */}
      <Footer />
    </div>
  );
}