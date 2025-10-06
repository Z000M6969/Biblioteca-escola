import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Conexão Supabase
const supabaseUrl = 'https://uhohygfsqwpmymjhzirs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVob2h5Z2ZzcXdwbXltaGp6aXJzIiwiaWF0IjoxNjk0NTMyMjc5LCJleHAiOjIwMTAxMDgyNzl9.GQtYcOnH3Qu8Z8OEVvVNNu3WYN7GEAKfHvL44RgNWZg';
const supabase = createClient(supabaseUrl, supabaseKey);

const generoSelect = document.getElementById('generoSelect');
const container = document.getElementById('carrosseisContainer');
const pesquisaInput = document.getElementById('pesquisa');
const btnPesquisar = document.getElementById('btnPesquisar');

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

// 🔹 Pegar lista de gêneros únicos
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

// 🔹 Mostrar livros em carrossel
function exibirLivros(lista) {
  container.innerHTML = '';
  const livrosPorGenero = {};

  lista.forEach(livro => {
    if (!livrosPorGenero[livro.genero]) livrosPorGenero[livro.genero] = [];
    livrosPorGenero[livro.genero].push(livro);
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

    // Rolagem
    wrapper.querySelector('.btn-left').addEventListener('click', () => carrossel.scrollBy({ left: -200, behavior: 'smooth' }));
    wrapper.querySelector('.btn-right').addEventListener('click', () => carrossel.scrollBy({ left: 200, behavior: 'smooth' }));

    container.appendChild(wrapper);
  });
}

// 🔹 Filtrar por gênero
generoSelect.addEventListener('change', () => {
  const genero = generoSelect.value;
  if (genero === 'todos') {
    exibirLivros(livros);
  } else {
    exibirLivros(livros.filter(l => l.genero === genero));
  }
});

// 🔹 Pesquisa
btnPesquisar.addEventListener('click', () => {
  const termo = pesquisaInput.value.toLowerCase();
  const filtrados = livros.filter(l => 
    l.titulo.toLowerCase().includes(termo) || 
    l.genero.toLowerCase().includes(termo)
  );
  exibirLivros(filtrados);
});

// 🔹 Executar ao abrir
carregarLivros();
