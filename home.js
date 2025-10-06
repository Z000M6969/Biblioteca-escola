import { supabase } from './supabaseClient.js';

const generoSelect = document.getElementById('generoSelect');
const container = document.getElementById('carrosseisContainer');
const pesquisaInput = document.getElementById('campo-pesquisa');
const btnPesquisar = document.getElementById('btn-pesquisar');

let livros = [];

// 🔹 Buscar livros do banco
async function carregarLivros() {
  const { data, error } = await supabase.from('livros').select('*');
  if (error) {
    console.error("Erro ao carregar livros:", error);
    return;
  }
  livros = data;
  carregarGeneros();
  exibirLivros(livros);
}

// 🔹 Carregar gêneros únicos
function carregarGeneros() {
  const generos = [...new Set(livros.map(l => l.genero).filter(Boolean))];
  generoSelect.innerHTML = `<option value="todos">Todos os gêneros</option>`;
  generos.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    generoSelect.appendChild(opt);
  });
}

// 🔹 Exibir livros
function exibirLivros(lista) {
  container.innerHTML = '';
  const livrosPorGenero = {};

  lista.forEach(livro => {
    const genero = livro.genero || "Sem gênero";
    if (!livrosPorGenero[genero]) livrosPorGenero[genero] = [];
    livrosPorGenero[genero].push(livro);
  });

  Object.keys(livrosPorGenero).forEach(genero => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('carrossel-wrapper');
    wrapper.innerHTML = `
      <h2>${genero}</h2>
      <button class="btn-carrossel btn-left">❮</button>
      <div class="carrossel"></div>
      <button class="btn-carrossel btn-right">❯</button>
    `;
    const carrossel = wrapper.querySelector('.carrossel');

    livrosPorGenero[genero].forEach(l => {
      const item = document.createElement('div');
      item.classList.add('livro');
      item.innerHTML = `
        <img src="${l.imagem || 'placeholder.jpg'}" alt="${l.titulo}">
        <p><strong>${l.titulo}</strong></p>
        <p>${l.autor || 'Autor desconhecido'}</p>
      `;
      item.addEventListener('click', () => abrirModal(l));
      carrossel.appendChild(item);
    });

    wrapper.querySelector('.btn-left').addEventListener('click', () => carrossel.scrollBy({ left: -200, behavior: 'smooth' }));
    wrapper.querySelector('.btn-right').addEventListener('click', () => carrossel.scrollBy({ left: 200, behavior: 'smooth' }));

    container.appendChild(wrapper);
  });
}

// 🔹 Modal
const modal = document.getElementById('modal');
const livroTitulo = document.getElementById('livroTitulo');
const sinopse = document.getElementById('sinopse');
const estoque = document.getElementById('estoque');
const dataDevolucao = document.getElementById('dataDevolucao');
const btnEmprestar = document.getElementById('btnEmprestar');
const closeModal = document.querySelector('.close');

function abrirModal(livro) {
  livroTitulo.textContent = livro.titulo;
  sinopse.textContent = livro.sinopse || "Sem sinopse";
  estoque.textContent = `Em estoque: ${livro.estoque}`;
  dataDevolucao.textContent = livro.data_devolucao || 'Não disponível';
  modal.style.display = 'flex';
}

closeModal.addEventListener('click', () => modal.style.display = 'none');

btnEmprestar.addEventListener('click', async () => {
  const livroId = livroTitulo.textContent;
  const { error } = await supabase
    .from('livros')
    .update({ estoque: supabase.raw('estoque - 1') })
    .eq('titulo', livroId);
  
  if (error) {
    alert('Erro ao realizar o empréstimo!');
    console.error(error);
  } else {
    alert('Livro emprestado com sucesso!');
    modal.style.display = 'none';
    carregarLivros();
  }
});

// 🔹 Filtrar por gênero
generoSelect.addEventListener('change', () => {
  const genero = generoSelect.value;
  if (genero === 'todos') {
    exibirLivros(livros);
  } else {
    exibirLivros(livros.filter(l => l.genero === genero));
  }
});

// 🔹 Pesquisa por título ou autor
btnPesquisar.addEventListener('click', () => {
  const termo = pesquisaInput.value.toLowerCase();
  const filtrados = livros.filter(l =>
    l.titulo.toLowerCase().includes(termo) ||
    (l.autor && l.autor.toLowerCase().includes(termo)) ||
    (l.genero && l.genero.toLowerCase().includes(termo))
  );
  exibirLivros(filtrados);
});

// 🔹 Inicializar
carregarLivros();
