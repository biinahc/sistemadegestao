import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";

import Header from './Header';
import Header_user from './Header_user';
import Footer from './Footer';
import { useParams } from 'react-router-dom';

export default function Estoque({ onLogout }) {
    let emptyProduct = {
        id: null,
        nome: '',
        marca: '',
        tipo_producto: '',
        quantidade: '0',
        quantidade_minima: '0',
        status: '0',
        cost: '0.00',
        price_cash: '0.00',
        price_card: '0.00',
        quantidade_adicionada: '',
        new_cost: '',
        new_price_cash: '',
        new_price_card: '',
        quantidade_vendida: '',
        forma_pagamento: null,
    };

    const [products, setProducts] = useState(null);
    const [product, setProduct] = useState(emptyProduct);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [addStockDialog, setAddStockDialog] = useState(false);
    const [recordSaleDialog, setRecordSaleDialog] = useState(false);
    const [monthlyProfit, setMonthlyProfit] = useState('0.00');
    const [totalEstoque, setTotalEstoque] = useState('0.00');
    const [totalSaidas, setTotalSaidas] = useState('0.00');
    const toast = useRef(null);
    const dt = useRef(null);
    const { flag } = useParams();

    const formas_pagamento = [
        { name: 'Dinheiro', value: 'Dinheiro' },
        { name: 'Cartão', value: 'Cartão' }
    ];

    const fetchData = async () => {
        try {
            const productsResponse = await axios.get('http://localhost:8080/produtos');
            setProducts(productsResponse.data);

            // CÁLCULO 1: VALOR TOTAL DO ESTOQUE ATUAL
            const valorTotalEstoqueCalculado = productsResponse.data.reduce((sum, product) => {
                const valorItem = parseFloat(product.status || 0) * parseFloat(product.cost || 0);
                return sum + valorItem;
            }, 0);
            setTotalEstoque(valorTotalEstoqueCalculado.toFixed(2));

            // CÁLCULO 2: TOTAL DE SAÍDAS
            // AQUI VOCÊ PRECISA TER UM ENDPOINT NO BACKEND QUE FAÇA ESSE CÁLCULO
            const saidasResponse = await axios.get('http://localhost:8080/produtos/total-saidas');
            setTotalSaidas(saidasResponse.data.totalSaidas.toFixed(2));

            // CÁLCULO 3: LUCRO DO MÊS
            const profitResponse = await axios.get('http://localhost:8080/produtos/lucro-mes');
            setMonthlyProfit(profitResponse.data.lucroTotal.toFixed(2));
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar dados.', life: 3000 });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const hideDialog = () => {
        setSubmitted(false);
        setAddStockDialog(false);
        setRecordSaleDialog(false);
    };

    const onInputChange = (e, name) => {
        const val = e.target.value;
        setProduct(prevProduct => ({ ...prevProduct, [name]: val }));
    };

    const onInputNumberChange = (e, name) => {
        const newValue = e.target.value;
        if (newValue === '' || /^\d+(\.\d{0,2})?$/.test(newValue)) {
            setProduct(prevProduct => ({ ...prevProduct, [name]: newValue }));
        }
    };

    const onInputIntegerChange = (e, name) => {
        const newValue = e.target.value;
        if (newValue === '' || /^\d+$/.test(newValue)) {
            setProduct(prevProduct => ({ ...prevProduct, [name]: newValue }));
        }
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </IconField>
        </div>
    );

    const openAddStockDialog = (product) => {
        setProduct({ ...product, quantidade_adicionada: '', new_cost: product.cost, new_price_cash: product.price_cash, new_price_card: product.price_card });
        setAddStockDialog(true);
    };

    const saveAddStock = async () => {
        setSubmitted(true);
        const { id, quantidade_adicionada, new_cost, new_price_cash, new_price_card } = product;

        if (!quantidade_adicionada || !new_cost || !new_price_cash || !new_price_card) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos.', life: 3000 });
            return;
        }

        const payload = {
            quantidade_adicionada: parseFloat(quantidade_adicionada),
            new_cost: parseFloat(new_cost),
            new_price_cash: parseFloat(new_price_cash),
            new_price_card: parseFloat(new_price_card)
        };

        try {
            await axios.put(`http://localhost:8080/produtos/adicionar-estoque/${id}`, payload);
            toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Estoque e preços atualizados!', life: 3000 });
            hideDialog();
            fetchData();
        } catch (error) {
            console.error("Erro ao adicionar estoque:", error);
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar estoque.', life: 3000 });
        }
    };

    const openRecordSaleDialog = (product) => {
        setProduct({ ...product, quantidade_vendida: '', forma_pagamento: null });
        setRecordSaleDialog(true);
    };

    const saveRecordSale = async () => {
        setSubmitted(true);
        const { id, quantidade_vendida, forma_pagamento, status } = product;
        const quantidade_vendida_num = parseFloat(quantidade_vendida);

        if (!quantidade_vendida || !forma_pagamento) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Preencha a quantidade e a forma de pagamento.', life: 3000 });
            return;
        }

        if (quantidade_vendida_num > parseFloat(status)) {
            toast.current.show({ severity: 'warn', summary: 'Observação', detail: 'Quantidade vendida é maior que a quantidade em estoque.', life: 4000 });
            return;
        }

        const payload = {
            quantidade_vendida: quantidade_vendida_num,
            forma_pagamento: forma_pagamento,
        };

        try {
            await axios.put(`http://localhost:8080/produtos/venda/${id}`, payload);
            toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Venda registrada e estoque atualizado!', life: 3000 });
            hideDialog();
            fetchData();
        } catch (error) {
            console.error("Erro ao registrar venda:", error);
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao registrar venda.', life: 3000 });
        }
    };

    const actionBodyTemplate = (product) => {
        return (
            <React.Fragment>
                <Button label="Venda" icon="pi pi-shopping-cart" className="p-button-rounded p-button-success p-button-sm mr-2" onClick={() => openRecordSaleDialog(product)} />
                <Button label="Entrada" icon="pi pi-plus" className="p-button-rounded p-button-warning p-button-sm" onClick={() => openAddStockDialog(product)} />
            </React.Fragment>
        );
    };

    const statusBodyTemplate = (product) => {
        if (product.quantidade_minima === '0' || product.quantidade_minima === '' || product.quantidade_minima === null) {
            return <Tag value={product.status} severity="info"></Tag>;
        }
        return <Tag value={product.status} severity={getSeverity(product)}></Tag>;
    };

    const getSeverity = (product) => {
        if (parseFloat(product.status) > parseFloat(product.quantidade_minima)) {
            return 'success';
        } else if (parseFloat(product.status) <= parseFloat(product.quantidade_minima)) {
            return 'danger';
        }
        return null;
    };

    const costBodyTemplate = (rowData) => {
        return `R$ ${parseFloat(rowData.cost).toFixed(2)}`;
    };

    const priceCashBodyTemplate = (rowData) => {
        return `R$ ${parseFloat(rowData.price_cash).toFixed(2)}`;
    };

    const priceCardBodyTemplate = (rowData) => {
        return `R$ ${parseFloat(rowData.price_card).toFixed(2)}`;
    };

    const addStockDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" className="p-button-danger p-button-sm" icon="pi pi-times" onClick={hideDialog} />
            <Button label="Salvar Estoque" className="p-button-success p-button-sm" icon="pi pi-check" onClick={saveAddStock} />
        </React.Fragment>
    );

    const recordSaleDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" className="p-button-danger p-button-sm" icon="pi pi-times" onClick={hideDialog} />
            <Button label="Registrar Venda" className="p-button-success p-button-sm" icon="pi pi-check" onClick={saveRecordSale} />
        </React.Fragment>
    );

    return (
        <div>
            {flag === '1' ? <Header onLogout={onLogout} /> : <Header_user onLogout={onLogout} />}
            <Toast ref={toast} />
            <br />
            <div className="container mx-auto p-4 flex justify-between gap-4">
                <div className="card text-center mb-4 p-4 shadow-md rounded-lg bg-gray-100 flex-1">
                    <h5 className="text-xl font-bold text-gray-700">Valor Total do Estoque</h5>
                    <p className="text-4xl font-extrabold text-blue-600 mt-2">R$ {totalEstoque}</p>
                </div>
                <div className="card text-center mb-4 p-4 shadow-md rounded-lg bg-gray-100 flex-1">
                    <h5 className="text-xl font-bold text-gray-700">Total de Saídas (Receita)</h5>
                    <p className="text-4xl font-extrabold text-orange-600 mt-2">R$ {totalSaidas}</p>
                </div>
                <div className="card text-center mb-4 p-4 shadow-md rounded-lg bg-gray-100 flex-1">
                    <h5 className="text-xl font-bold text-gray-700">Lucro do Mês</h5>
                    <p className="text-4xl font-extrabold text-green-600 mt-2">R$ {monthlyProfit}</p>
                </div>
            </div>

            <Toolbar className="mb-4" center={<h4 className="display-7">Controle de Estoque <i className="fas fa-cubes"></i></h4>} />

            <DataTable ref={dt} value={products} stripedRows paginator rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Página {first} a {last} de {totalRecords} produtos"
                globalFilter={globalFilter} header={header} resizableColumns showGridlines>

                <Column body={(rowData, { rowIndex }) => rowIndex + 1} header="#" style={{ minWidth: '3rem' }}></Column>
                <Column field="nome" header="Nome" sortable style={{ minWidth: '8rem' }}></Column>
                <Column field="marca" header="Marca" sortable style={{ minWidth: '8rem' }}></Column>
                <Column field="status" header="Estoque" body={statusBodyTemplate} sortable style={{ minWidth: '6rem' }}></Column>
                <Column field="cost" header="Custo" body={costBodyTemplate} sortable style={{ minWidth: '6rem' }}></Column>
                <Column field="price_cash" header="Venda (Dinheiro)" body={priceCashBodyTemplate} sortable style={{ minWidth: '10rem' }}></Column>
                <Column field="price_card" header="Venda (Cartão)" body={priceCardBodyTemplate} sortable style={{ minWidth: '10rem' }}></Column>
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '15rem' }}></Column>
            </DataTable>

            {/* Modal para Adicionar Estoque e Atualizar Preços */}
            <Dialog visible={addStockDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Adicionar Estoque" modal className="p-fluid" footer={addStockDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nome" className="font-bold">Produto:</label>
                    <InputText disabled id="nome" value={product.nome} />
                </div>
                <div className="field">
                    <label htmlFor="quantidade_adicionada" className="font-bold">Quantidade a Adicionar:</label>
                    <InputText type="number" id="quantidade_adicionada" min={0} value={product.quantidade_adicionada} onChange={(e) => onInputIntegerChange(e, 'quantidade_adicionada')} className={classNames({ 'p-invalid': submitted && !product.quantidade_adicionada })} />
                    {submitted && !product.quantidade_adicionada && <small className="p-error">Campo obrigatório.</small>}
                </div>
                <div className="field">
                    <label htmlFor="new_cost" className="font-bold">Novo Custo (R$):</label>
                    <InputText type="number" id="new_cost" value={product.new_cost} onChange={(e) => onInputNumberChange(e, 'new_cost')} className={classNames({ 'p-invalid': submitted && !product.new_cost })} />
                    {submitted && !product.new_cost && <small className="p-error">Campo obrigatório.</small>}
                </div>
                <div className="field">
                    <label htmlFor="new_price_cash" className="font-bold">Novo Preço de Venda (Dinheiro):</label>
                    <InputText type="number" id="new_price_cash" value={product.new_price_cash} onChange={(e) => onInputNumberChange(e, 'new_price_cash')} className={classNames({ 'p-invalid': submitted && !product.new_price_cash })} />
                    {submitted && !product.new_price_cash && <small className="p-error">Campo obrigatório.</small>}
                </div>
                <div className="field">
                    <label htmlFor="new_price_card" className="font-bold">Novo Preço de Venda (Cartão):</label>
                    <InputText type="number" id="new_price_card" value={product.new_price_card} onChange={(e) => onInputNumberChange(e, 'new_price_card')} className={classNames({ 'p-invalid': submitted && !product.new_price_card })} />
                    {submitted && !product.new_price_card && <small className="p-error">Campo obrigatório.</small>}
                </div>
            </Dialog>

            {/* Modal para Registrar Venda */}
            <Dialog visible={recordSaleDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Registrar Venda" modal className="p-fluid" footer={recordSaleDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nome" className="font-bold">Produto:</label>
                    <InputText disabled id="nome" value={product.nome} />
                </div>
                <div className="field">
                    <label htmlFor="quantidade_vendida" className="font-bold">Quantidade Vendida:</label>
                    <InputText type="number" id="quantidade_vendida" min={0} value={product.quantidade_vendida} onChange={(e) => onInputIntegerChange(e, 'quantidade_vendida')} className={classNames({ 'p-invalid': submitted && !product.quantidade_vendida })} />
                    {submitted && !product.quantidade_vendida && <small className="p-error">Campo obrigatório!</small>}
                    {parseFloat(product.quantidade_vendida) > parseFloat(product.status) && <small className="p-error pi pi-exclamation-triangle mr-3"> Quantidade maior que a disponível em estoque!</small>}
                </div>
                <div className="field">
                    <label htmlFor="forma_pagamento" className="font-bold">Forma de Pagamento:</label>
                    <Dropdown
                        className="w-full md:w-14rem"
                        id="forma_pagamento"
                        options={formas_pagamento}
                        optionLabel="name"
                        value={product.forma_pagamento}
                        onChange={(e) => onInputChange(e, 'forma_pagamento')}
                        placeholder="Selecione a forma de pagamento"
                    />
                    {submitted && !product.forma_pagamento && <small className="p-error">Campo obrigatório!</small>}
                </div>
            </Dialog>

            <Footer />
        </div>
    );
}