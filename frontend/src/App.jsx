// Importa os Hooks para controlar os dados e os efeitos da tela.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// Importa ícones leves para deixar as ações mais fáceis de identificar.
import { ArrowDownUp, ChevronLeft, ChevronRight, Laptop, LayoutDashboard, Monitor, Mouse, Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';

// Define o endereço padrão da API; pode ser trocado com VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Mantém os valores de status iguais aos aceitos pelo servidor.
const STATUS = ['disponível', 'emprestado', 'manutenção'];
// Representa o formulário vazio usado para cadastrar um equipamento.
const FORM_VAZIO = { nome: '', categoria: 'Notebook', numero_serie: '', status: 'disponível', data_aquisicao: '' };

// Escolhe um ícone de acordo com a categoria informada no cadastro.
function IconeCategoria({ categoria }) {
  if (categoria.toLowerCase().includes('notebook')) return <Laptop size={18} />;
  if (categoria.toLowerCase().includes('monitor')) return <Monitor size={18} />;
  if (categoria.toLowerCase().includes('mouse')) return <Mouse size={18} />;
  return <Package size={18} />;
}

// Monta a janela numérica de páginas sem exibir uma lista muito extensa.
function criarNumerosPagina(atual, total) {
  const inicio = Math.max(1, Math.min(atual - 2, total - 4));
  return Array.from({ length: Math.max(0, Math.min(5, total)) }, (_, indice) => inicio + indice);
}

// Exibe um modal acessível para criar ou editar os dados do equipamento.
function ModalEquipamento({ aberto, inicial, salvando, aoFechar, aoSalvar }) {
  const [form, setForm] = useState(inicial || FORM_VAZIO);

  // Atualiza o estado local sempre que o usuário escolhe editar outro registro.
  useEffect(() => setForm(inicial || FORM_VAZIO), [inicial, aberto]);

  // Mantém o modal fora do DOM quando não está sendo usado.
  if (!aberto) return null;

  // Atualiza apenas o campo digitado e preserva os outros valores do formulário.
  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  // Envia os dados ao componente principal, que salva na API.
  function enviar(evento) {
    evento.preventDefault();
    aoSalvar(form);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div className="modal-topo">
          <div><p className="eyebrow">INVENTÁRIO</p><h2 id="modal-titulo">{inicial?.id ? 'Editar equipamento' : 'Novo equipamento'}</h2></div>
          <button className="icon-button" type="button" aria-label="Fechar formulário" onClick={aoFechar}><X size={20} /></button>
        </div>
        <form onSubmit={enviar}>
          <label>Nome do equipamento<input autoFocus required maxLength="120" name="nome" value={form.nome} onChange={alterarCampo} placeholder="Ex.: MacBook Pro 14”" /></label>
          <div className="form-row">
            <label>Categoria<select name="categoria" value={form.categoria} onChange={alterarCampo}><option>Notebook</option><option>Monitor</option><option>Mouse</option><option>Teclado</option><option>Outro</option></select></label>
            <label>Status<select name="status" value={form.status} onChange={alterarCampo}>{STATUS.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          </div>
          <div className="form-row">
            <label>Número de série<input required maxLength="100" name="numero_serie" value={form.numero_serie} onChange={alterarCampo} placeholder="Ex.: SN-2024-001" /></label>
            <label>Data de aquisição<input required type="date" name="data_aquisicao" value={form.data_aquisicao} onChange={alterarCampo} /></label>
          </div>
          <div className="modal-acoes"><button className="button button-ghost" type="button" onClick={aoFechar}>Cancelar</button><button className="button button-primary" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar equipamento'}</button></div>
        </form>
      </section>
    </div>
  );
}

// Componente principal: carrega o inventário paginado e coordena as ações CRUD.
export default function App() {
  // Guarda os itens da página atualmente exibida.
  const [equipamentos, setEquipamentos] = useState([]);
  // Guarda os totais gerais calculados no banco, sem limitar à página visível.
  const [resumo, setResumo] = useState({ total: 0, disponiveis: 0, emprestados: 0, manutencao: 0 });
  // Guarda a página atual, a quantidade por página e os totais informados pela API.
  const [paginacao, setPaginacao] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 });
  // Controla os estados de carregamento e envio para dar retorno visual.
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  // Guarda mensagens de sucesso ou falha mostradas ao usuário.
  const [mensagem, setMensagem] = useState('');
  // Controla a abertura do formulário e o registro que está sendo editado.
  const [modalAberto, setModalAberto] = useState(false);
  const [equipamentoEditando, setEquipamentoEditando] = useState(null);
  // Guarda o texto usado para filtrar visualmente os registros da página atual.
  const [busca, setBusca] = useState('');

  // Busca a página solicitada no servidor; o banco aplica LIMIT e OFFSET.
  const carregarEquipamentos = useCallback(async (pagina) => {
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/equipamentos?page=${pagina}&limit=${paginacao.limit}`);
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.error || 'Não foi possível carregar os equipamentos.');
      setEquipamentos(corpo.data);
      setResumo(corpo.summary);
      setPaginacao(corpo.pagination);
      setMensagem('');
    } catch (erro) {
      setMensagem(erro.message);
    } finally {
      setCarregando(false);
    }
  }, [paginacao.limit]);

  // Carrega os dados ao abrir a aplicação e quando a página muda.
  useEffect(() => { carregarEquipamentos(paginacao.page); }, [carregarEquipamentos, paginacao.page]);

  // Filtra os itens já carregados sem alterar a paginação real feita no banco.
  const equipamentosVisiveis = useMemo(() => equipamentos.filter((item) =>
    `${item.nome} ${item.categoria} ${item.numero_serie}`.toLowerCase().includes(busca.toLowerCase())), [equipamentos, busca]);
  // Calcula as páginas que aparecem como botões numerados no rodapé.
  const numerosPagina = criarNumerosPagina(paginacao.page, paginacao.totalPages);

  // Abre o formulário no modo de cadastro ou edição.
  function abrirFormulario(equipamento = null) {
    setEquipamentoEditando(equipamento);
    setModalAberto(true);
  }

  // Envia POST ou PUT conforme o formulário esteja criando ou editando um item.
  async function salvarEquipamento(dados) {
    setSalvando(true);
    try {
      const editando = Boolean(equipamentoEditando?.id);
      const resposta = await fetch(`${API_URL}/equipamentos${editando ? `/${equipamentoEditando.id}` : ''}`, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const corpo = resposta.status === 204 ? null : await resposta.json();
      if (!resposta.ok) throw new Error(corpo?.error || 'Não foi possível salvar o equipamento.');
      setModalAberto(false);
      setMensagem(editando ? 'Equipamento atualizado com sucesso.' : 'Equipamento cadastrado com sucesso.');
      // Muda a página solicitada; o efeito de carregamento faz a nova requisição.
      setPaginacao((atual) => ({ ...atual, page: editando ? atual.page : 1 }));
    } catch (erro) {
      setMensagem(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  // Solicita confirmação antes de remover um item permanentemente.
  async function excluirEquipamento(equipamento) {
    if (!window.confirm(`Deseja excluir “${equipamento.nome}”?`)) return;
    try {
      const resposta = await fetch(`${API_URL}/equipamentos/${equipamento.id}`, { method: 'DELETE' });
      if (!resposta.ok) {
        const corpo = await resposta.json();
        throw new Error(corpo.error || 'Não foi possível excluir o equipamento.');
      }
      setMensagem('Equipamento excluído com sucesso.');
      const ultimaPagina = Math.max(1, Math.ceil((paginacao.total - 1) / paginacao.limit));
      // Se a última linha da página foi excluída, volta para a página anterior válida.
      setPaginacao((atual) => ({ ...atual, page: Math.min(atual.page, ultimaPagina) }));
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  // Formata datas sem depender do fuso horário local do navegador.
  function formatarData(data) {
    if (!data) return '—';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="TechStock início"><span className="brand-mark"><Package size={21} /></span><span>tech<span>stock</span><small>GESTÃO DE ATIVOS</small></span></a>
        <div className="menu-label">MENU PRINCIPAL</div>
        <a href="#inventario" className="nav-link active"><LayoutDashboard size={18} /> Visão geral</a>
        <div className="sidebar-note"><span className="note-dot" /><div><strong>Inventário organizado</strong><p>Seus ativos, sempre sob controle.</p></div></div>
        <div className="sidebar-footer"><div className="avatar">TS</div><div><strong>TechSolutions</strong><small>Workspace</small></div><span className="online-dot" /></div>
      </aside>

      <main className="main-content" id="inicio">
        <header className="topbar"><div className="breadcrumb">Painel <span>/</span> <strong>Inventário</strong></div><div className="topbar-right"><span className="today-label">Painel de ativos</span><div className="avatar avatar-small">TS</div></div></header>
        <section className="page-content" id="inventario">
          <div className="page-heading"><div><p className="eyebrow">VISÃO GERAL</p><h1>Inventário de ativos</h1><p className="page-subtitle">Acompanhe e gerencie os equipamentos da sua equipe.</p></div><button className="button button-primary" onClick={() => abrirFormulario()}><Plus size={17} /> Novo equipamento</button></div>

          {mensagem && <div className="feedback" role="status"><span>{mensagem}</span><button className="feedback-close" aria-label="Fechar aviso" onClick={() => setMensagem('')}><X size={16} /></button></div>}

          <div className="stats-grid">
            <article className="stat-card"><div className="stat-top"><span>Total de ativos</span><span className="stat-icon icon-lilac"><Package size={17} /></span></div><strong>{resumo.total}</strong><small>Equipamentos cadastrados</small></article>
            <article className="stat-card"><div className="stat-top"><span>Disponíveis</span><span className="stat-icon icon-green"><span className="status-dot available" /></span></div><strong>{resumo.disponiveis}</strong><small>Prontos para uso</small></article>
            <article className="stat-card"><div className="stat-top"><span>Emprestados</span><span className="stat-icon icon-blue"><span className="status-dot loaned" /></span></div><strong>{resumo.emprestados}</strong><small>Em uso pela equipe</small></article>
            <article className="stat-card"><div className="stat-top"><span>Em manutenção</span><span className="stat-icon icon-amber"><span className="status-dot maintenance" /></span></div><strong>{resumo.manutencao}</strong><small>Precisam de atenção</small></article>
          </div>

          <section className="inventory-card">
            <div className="inventory-heading"><div><h2>Equipamentos</h2><p>Lista de todos os ativos cadastrados</p></div><label className="search-box"><Search size={16} /><input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar equipamento..." aria-label="Buscar equipamento" /></label></div>
            <div className="table-wrap"><table><thead><tr><th>Equipamento <ArrowDownUp size={13} /></th><th>Categoria</th><th>Nº de série</th><th>Status</th><th>Aquisição</th><th aria-label="Ações" /></tr></thead>
              <tbody>
                {carregando ? <tr><td className="table-message" colSpan="6"><span className="spinner" /> Carregando equipamentos…</td></tr>
                  : equipamentosVisiveis.length === 0 ? <tr><td className="table-message" colSpan="6">{busca ? 'Nenhum resultado encontrado nesta página.' : 'Nenhum equipamento cadastrado ainda.'}</td></tr>
                    : equipamentosVisiveis.map((equipamento) => <tr key={equipamento.id}>
                      <td><div className="equipment-cell"><span className="equipment-icon"><IconeCategoria categoria={equipamento.categoria} /></span><strong>{equipamento.nome}</strong></div></td>
                      <td><span className="category-label">{equipamento.categoria}</span></td><td className="serial">{equipamento.numero_serie}</td>
                      <td><span className={`status-pill ${equipamento.status === 'disponível' ? 'status-available' : equipamento.status === 'emprestado' ? 'status-loaned' : 'status-maintenance'}`}><span className="status-dot" />{equipamento.status}</span></td>
                      <td className="date-cell">{formatarData(equipamento.data_aquisicao)}</td>
                      <td><div className="row-actions"><button className="icon-button" aria-label={`Editar ${equipamento.nome}`} onClick={() => abrirFormulario(equipamento)}><Pencil size={15} /></button><button className="icon-button danger" aria-label={`Excluir ${equipamento.nome}`} onClick={() => excluirEquipamento(equipamento)}><Trash2 size={15} /></button></div></td>
                    </tr>)}
              </tbody>
            </table></div>
            <div className="table-footer"><span>Mostrando <strong>{paginacao.total === 0 ? 0 : (paginacao.page - 1) * paginacao.limit + 1}–{Math.min(paginacao.page * paginacao.limit, paginacao.total)}</strong> de <strong>{paginacao.total}</strong> equipamentos</span>
              <nav className="pagination" aria-label="Paginação dos equipamentos"><button className="page-arrow" aria-label="Página anterior" disabled={paginacao.page <= 1 || carregando} onClick={() => setPaginacao((atual) => ({ ...atual, page: atual.page - 1 }))}><ChevronLeft size={17} /></button>{numerosPagina.map((numero) => <button key={numero} aria-current={numero === paginacao.page ? 'page' : undefined} className={`page-number ${numero === paginacao.page ? 'selected' : ''}`} disabled={carregando} onClick={() => setPaginacao((atual) => ({ ...atual, page: numero }))}>{numero}</button>)}<button className="page-arrow" aria-label="Próxima página" disabled={paginacao.page >= paginacao.totalPages || carregando} onClick={() => setPaginacao((atual) => ({ ...atual, page: atual.page + 1 }))}><ChevronRight size={17} /></button></nav>
            </div>
          </section>
          <footer className="page-footer"><span>TechStock · Controle de ativos</span><span>Feito para manter tudo em seu lugar <span className="footer-spark">✳</span></span></footer>
        </section>
      </main>

      <ModalEquipamento aberto={modalAberto} inicial={equipamentoEditando} salvando={salvando} aoFechar={() => setModalAberto(false)} aoSalvar={salvarEquipamento} />
    </div>
  );
}
