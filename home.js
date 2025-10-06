import { supabase } from "./supabaseclient.js";

// ========== VERIFICAR LOGIN ==========
async function verificarUsuario() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erro ao verificar usuário:", error.message);
    return;
  }

  const user = data.user;
  if (!user) {
    window.location.href = "Login.html";
  } else {
    const nomeUsuario = document.getElementById("usuario-nome");
    if (nomeUsuario) nomeUsuario.textContent = user.email;
  }
}

// ========== CARREGAR GÊNEROS ==========
async function carregarGeneros() {
  const { data, error } = await supabase
    .from("livros")
    .select("genero");

  if (error) {
    console.error("Erro ao buscar gêneros:", error.message);
    return;
  }

  const generos = [...new Set(data.map(l => l.genero))].sort();
  const select = document.getElementById("filtro-genero");
  select.innerHTML = '<option value="">Todos os gêneros</option>';

  generos.forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    select.appendChild(option);
  });
}

// ========== CARREGAR LIVROS ==========
async function carregarLivros(filtroGenero = "", termo = "") {
  let query = supabase.from("livros").select("id, titulo, autor, genero, imagem_url");

  if (filtroGenero) query = query.eq("genero", filtroGenero);
  if (termo) query = query.or(`titulo.ilike.%${termo}%,genero.ilike.%${termo}%`);

  const { data, error } = await query;
  const carrossel = document.getElementById("carrossel");

  if (error) {
    console.error("Erro ao carregar livros:", error.message);
    carrossel.innerHTML = "<p>Erro ao carregar livros.</p>";
    return;
  }

  if (!data || data.length === 0) {
    carrossel.innerHTML = "<p>Nenhum livro encontrado.</p>";
    return;
  }

  carrossel.innerHTML = "";
  data.forEach(livro => {
    const item = document.createElement("div");
    item.classList.add("livro-card");
    item.innerHTML = `
      <img src="${livro.imagem_url || 'https://via.placeholder.com/120x160?text=Sem+Imagem'}" alt="${livro.titulo}">
      <h3>${livro.titulo}</h3>
      <p>${livro.autor}</p>
      <span>${livro.genero}</span>
    `;
    carrossel.appendChild(item);
  });
}

// ========== PESQUISAR ==========
function pesquisar() {
  const termo = document.getElementById("campo-pesquisa").value.trim();
  const genero = document.getElementById("filtro-genero").value;
  carregarLivros(genero, termo);
}

// ========== SAIR ==========
async function sair() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Erro ao sair:", error.message);
  else window.location.href = "Login.html";
}

// ========== CARROSSEL AUTOMÁTICO ==========
function iniciarCarrossel() {
  const carrossel = document.getElementById("carrossel");
  let scrollAmount = 0;
  setInterval(() => {
    if (carrossel.scrollWidth - carrossel.clientWidth <= scrollAmount) {
      scrollAmount = 0;
    } else {
      scrollAmount += 250;
    }
    carrossel.scrollTo({
      left: scrollAmount,
      behavior: "smooth"
    });
  }, 2500);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", async () => {
  verificarUsuario();
  await carregarGeneros();
  await carregarLivros();
  iniciarCarrossel();

  document.getElementById("btn-pesquisar")?.addEventListener("click", pesquisar);
  document.getElementById("filtro-genero")?.addEventListener("change", pesquisar);
  document.getElementById("btn-sair")?.addEventListener("click", sair);
});
