import { supabase } from "./supabaseclient.js";

// Função para verificar se o usuário está logado
async function verificarUsuario() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erro ao verificar usuário:", error.message);
    return;
  }

  const user = data.user;
  if (!user) {
    // Se não estiver logado, redireciona
    window.location.href = "Login.html";
  } else {
    const nomeUsuario = document.getElementById("usuario-nome");
    if (nomeUsuario) nomeUsuario.textContent = user.email;
  }
}

// Função para carregar todos os livros
async function carregarLivros() {
  const { data, error } = await supabase
    .from("livros")
    .select("id, titulo, autor, genero, imagem_url");

  const lista = document.getElementById("lista-livros");

  if (error) {
    console.error("Erro ao carregar livros:", error.message);
    lista.innerHTML = "<p>Erro ao carregar livros.</p>";
    return;
  }

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum livro encontrado.</p>";
    return;
  }

  lista.innerHTML = "";
  data.forEach((livro) => {
    const card = document.createElement("div");
    card.classList.add("livro-card");

    card.innerHTML = `
      <img src="${livro.imagem_url || 'https://via.placeholder.com/120x160?text=Sem+Imagem'}" alt="${livro.titulo}" class="livro-img">
      <div class="livro-info">
        <h3>${livro.titulo}</h3>
        <p><b>Autor:</b> ${livro.autor}</p>
        <p><b>Gênero:</b> ${livro.genero}</p>
      </div>
    `;
    lista.appendChild(card);
  });
}

// Função para pesquisar livros por título ou gênero
async function pesquisarLivros() {
  const termo = document.getElementById("campo-pesquisa").value.trim();

  if (termo === "") {
    carregarLivros();
    return;
  }

  const { data, error } = await supabase
    .from("livros")
    .select("id, titulo, autor, genero, imagem_url")
    .or(`titulo.ilike.%${termo}%,genero.ilike.%${termo}%`);

  const lista = document.getElementById("lista-livros");
  if (error) {
    console.error("Erro ao pesquisar:", error.message);
    lista.innerHTML = "<p>Erro na pesquisa.</p>";
    return;
  }

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    return;
  }

  lista.innerHTML = "";
  data.forEach((livro) => {
    const card = document.createElement("div");
    card.classList.add("livro-card");

    card.innerHTML = `
      <img src="${livro.imagem_url || 'https://via.placeholder.com/120x160?text=Sem+Imagem'}" alt="${livro.titulo}" class="livro-img">
      <div class="livro-info">
        <h3>${livro.titulo}</h3>
        <p><b>Autor:</b> ${livro.autor}</p>
        <p><b>Gênero:</b> ${livro.genero}</p>
      </div>
    `;
    lista.appendChild(card);
  });
}

// Função para sair do sistema
async function sair() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erro ao sair:", error.message);
  } else {
    window.location.href = "Login.html";
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  verificarUsuario();
  carregarLivros();

  document.getElementById("btn-pesquisar")?.addEventListener("click", pesquisarLivros);
  document.getElementById("btn-sair")?.addEventListener("click", sair);
});
