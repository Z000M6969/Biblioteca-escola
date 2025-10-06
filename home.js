import { supabase } from './supabaseClient.js';

const generoSelect = document.getElementById('generoSelect');
const container = document.getElementById('carrosseisContainer');
const pesquisaInput = document.getElementById('campo-pesquisa');
const btnPesquisar = document.getElementById('btn-pesquisar');

let livros = [];

// 🔹 Carregar livros do banco
async function carregarLivros() {
  const { data, error } = await supabase.from('livros').select('*');
  if (error) {
    console.error('Erro ao carregar livros:', error);
    return;
  }
  livros = data;
  carregarGeneros();
  exibirLivros(livros);
}

// 🔹 Preencher select de gêneros
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

// 🔹 Exibir livros em carrossel
function exibirLivros(lista) {
  container.innerHTML = '';
  const livrosPorGenero = {};

  lista.forEach(livro => {
    const genero = livro.genero || 'Sem gênero';
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
        <p>${l.titulo}</p>
      `;
      carrossel.appendChild(item);
    });

    // Botões de rolagem
    wrapper.querySelector('.btn-left').addEventListener('click', () => carrossel.scrollBy({ left: -200, behavior: 'smooth' }));
    wrapper.querySelector('.btn-right').addEventListener('click', () => carrossel.scrollBy({ left: 200, behavior: 'smooth' }));

    container.appendChild(wrapper);
  });
}

// 🔹 Filtro por gênero
generoSelect.addEventListener('change', () => {
  const genero = generoSelect.value;
  if (genero === 'todos') {
    exibirLivros(livros);
  } else {
    exibirLivros(livros.filter(l => l.genero === genero));
  }
});

// 🔹 Pesquisa por título ou gênero
btnPesquisar.addEventListener('click', () => {
  const termo = pesquisaInput.value.toLowerCase();
  const filtrados = livros.filter(l => 
    (l.titulo && l.titulo.toLowerCase().includes(termo)) || 
    (l.genero && l.genero.toLowerCase().includes(termo))
  );
  exibirLivros(filtrados);
});

// 🔹 Executar ao abrir
carregarLivros();
