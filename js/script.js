const api = GepisegAPI.criar();
const modal = new bootstrap.Modal(document.getElementById('modalDetalhes'));

async function carregarCabecalho() {
  try {
    const pesquisador = await api.pesquisadores.porId(1);

    document.getElementById('nav-instituicao').textContent = pesquisador.instituicao;
    document.getElementById('titulo-unidade').textContent = pesquisador.unidade;
    document.getElementById('subtitulo-unidade').textContent = 'Portal de publicações e pesquisadores - ' + pesquisador.instituicao;
    document.getElementById('rodape-texto').textContent = pesquisador.unidade + ' - ' + pesquisador.instituicao;
  } catch (erro) {
    console.error(erro);
  }
}

async function carregarFiltros() {
  try {
    const filtros = await api.filtros();

    filtros.temas.forEach(tema => {
      const opcao = document.createElement('option');
      opcao.value = tema;
      opcao.textContent = tema;
      document.getElementById('artigo-tema').appendChild(opcao);
    });

    filtros.anos.forEach(ano => {
      const opcao = document.createElement('option');
      opcao.value = ano;
      opcao.textContent = ano;
      document.getElementById('artigo-ano').appendChild(opcao);
    });

    filtros.areas.forEach(area => {
      const opcao = document.createElement('option');
      opcao.value = area;
      opcao.textContent = area;
      document.getElementById('pesq-area').appendChild(opcao);
    });

    filtros.titulacoes.forEach(titulacao => {
      const opcao = document.createElement('option');
      opcao.value = titulacao;
      opcao.textContent = titulacao;
      document.getElementById('pesq-titulacao').appendChild(opcao);
    });
  } catch (erro) {
    console.error(erro);
  }
}

async function carregarDestaques() {
  const itens = document.getElementById('carousel-itens');

  try {
    const resposta = await api.artigos.listar({ ordenar: 'citacoes', porPagina: 3 });
    itens.innerHTML = '';

    resposta.results.forEach((artigo, indice) => {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      if (indice === 0) {
        item.classList.add('active');
      }

      item.innerHTML =
        '<div class="carousel-item-destaque">' +
          '<div class="carousel-overlay text-white">' +
            '<div>' +
              '<span class="badge bg-success mb-2"></span>' +
              '<h3 class="h4 fw-bold"></h3>' +
              '<p class="small mb-3"></p>' +
              '<button type="button" class="btn btn-sm btn-light">Ver publicação</button>' +
            '</div>' +
          '</div>' +
        '</div>';

      item.querySelector('.carousel-item-destaque').style.backgroundImage = 'url("' + artigo.imagem + '")';
      item.querySelector('.badge').textContent = artigo.tema + ' (' + artigo.ano + ')';
      item.querySelector('h3').textContent = artigo.titulo;
      item.querySelector('p').textContent = artigo.resumo;
      item.querySelector('button').addEventListener('click', () => verArtigo(artigo.id));

      itens.appendChild(item);
    });
  } catch (erro) {
    itens.textContent = 'Não foi possível carregar os destaques.';
    console.error(erro);
  }
}

async function carregarArtigos(pagina) {
  const lista = document.getElementById('lista-artigos');
  const alerta = document.getElementById('alerta-artigos');
  const paginacao = document.getElementById('paginacao-artigos');
  const contador = document.getElementById('contador-artigos');

  lista.innerHTML = '';
  paginacao.innerHTML = '';
  alerta.classList.add('d-none');

  const filtros = {
    q: document.getElementById('artigo-q').value,
    tema: document.getElementById('artigo-tema').value,
    ano: document.getElementById('artigo-ano').value,
    ordenar: document.getElementById('artigo-ordenar').value,
    pagina: pagina,
    porPagina: 6
  };

  try {
    const resposta = await api.artigos.listar(filtros);
    contador.textContent = resposta.info.count + ' artigos';

    resposta.results.forEach(artigo => {
      const coluna = document.createElement('div');
      coluna.className = 'col-md-6 col-lg-4';
      coluna.innerHTML =
        '<div class="card h-100 card-custom">' +
          '<img class="card-img-top card-img-artigo">' +
          '<div class="card-body d-flex flex-column">' +
            '<div class="mb-2">' +
              '<span class="badge badge-tema tema"></span> ' +
              '<span class="badge bg-light text-dark border ano"></span>' +
            '</div>' +
            '<h5 class="card-title h6 fw-bold"></h5>' +
            '<p class="card-text small text-secondary"></p>' +
            '<div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">' +
              '<small class="text-muted autor"></small>' +
              '<small class="fw-bold text-success citacoes"></small>' +
            '</div>' +
            '<button type="button" class="btn btn-gepiseg btn-sm mt-3 w-100">Detalhes</button>' +
          '</div>' +
        '</div>';

      const imagem = coluna.querySelector('img');
      imagem.src = artigo.imagem;
      imagem.alt = artigo.titulo;

      coluna.querySelector('.tema').textContent = artigo.tema;
      coluna.querySelector('.ano').textContent = artigo.ano;
      coluna.querySelector('.card-title').textContent = artigo.titulo;
      coluna.querySelector('.card-text').textContent = artigo.resumo;
      coluna.querySelector('.autor').textContent = artigo.autorPrincipal.nome;
      coluna.querySelector('.citacoes').textContent = artigo.citacoes + ' citações';
      coluna.querySelector('button').addEventListener('click', () => verArtigo(artigo.id));

      lista.appendChild(coluna);
    });

    for (let i = 1; i <= resposta.info.pages; i++) {
      const item = document.createElement('li');
      item.className = 'page-item';
      if (i === pagina) {
        item.classList.add('active');
      }

      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'page-link';
      botao.textContent = i;
      botao.addEventListener('click', () => carregarArtigos(i));

      item.appendChild(botao);
      paginacao.appendChild(item);
    }
  } catch (erro) {
    contador.textContent = '0 artigos';
    alerta.textContent = erro.corpo ? erro.corpo.error : 'Nenhum artigo encontrado.';
    alerta.classList.remove('d-none');
    console.error(erro);
  }
}

async function carregarPesquisadores() {
  const lista = document.getElementById('lista-pesquisadores');
  const alerta = document.getElementById('alerta-pesquisadores');
  const contador = document.getElementById('contador-pesquisadores');

  lista.innerHTML = '';
  alerta.classList.add('d-none');

  const filtros = {
    q: document.getElementById('pesq-q').value,
    area: document.getElementById('pesq-area').value,
    titulacao: document.getElementById('pesq-titulacao').value,
    ordenar: document.getElementById('pesq-ordenar').value
  };

  try {
    const resposta = await api.pesquisadores.listar(filtros);
    contador.textContent = resposta.info.count + ' pesquisadores';

    resposta.results.forEach(pesquisador => {
      const coluna = document.createElement('div');
      coluna.className = 'col-md-6 col-lg-4';
      coluna.innerHTML =
        '<div class="card h-100 card-custom">' +
          '<div class="card-body d-flex flex-column">' +
            '<div class="d-flex align-items-center mb-3">' +
              '<img class="avatar-pesquisador me-3">' +
              '<div>' +
                '<h5 class="h6 fw-bold mb-0"></h5>' +
                '<small class="text-muted"></small>' +
              '</div>' +
            '</div>' +
            '<p class="small text-secondary mb-3"></p>' +
            '<div class="mt-auto pt-2 border-top d-flex justify-content-between small text-muted mb-3">' +
              '<span>Artigos: <strong class="artigos"></strong></span>' +
              '<span>Citações: <strong class="citacoes"></strong></span>' +
              '<span>Índice H: <strong class="indice"></strong></span>' +
            '</div>' +
            '<button type="button" class="btn btn-outline-gepiseg btn-sm w-100">Ver perfil</button>' +
          '</div>' +
        '</div>';

      const foto = coluna.querySelector('img');
      foto.src = pesquisador.imagem;
      foto.alt = pesquisador.nome;

      coluna.querySelector('h5').textContent = pesquisador.nome;
      coluna.querySelector('small').textContent = pesquisador.titulacao + ' - ' + pesquisador.cargo;
      coluna.querySelector('p').textContent = pesquisador.linhaPesquisa;
      coluna.querySelector('.artigos').textContent = pesquisador.metricas.totalArtigos;
      coluna.querySelector('.citacoes').textContent = pesquisador.metricas.totalCitacoes;
      coluna.querySelector('.indice').textContent = pesquisador.metricas.indiceH;
      coluna.querySelector('button').addEventListener('click', () => verPesquisador(pesquisador.id));

      lista.appendChild(coluna);
    });
  } catch (erro) {
    contador.textContent = '0 pesquisadores';
    alerta.textContent = erro.corpo ? erro.corpo.error : 'Nenhum pesquisador encontrado.';
    alerta.classList.remove('d-none');
    console.error(erro);
  }
}

async function verArtigo(id) {
  const corpo = document.getElementById('modalDetalhesCorpo');

  try {
    const artigo = await api.artigos.porId(id);
    const autores = await api.seguir(artigo.autores);

    document.getElementById('modalDetalhesTitulo').textContent = artigo.titulo;

    corpo.innerHTML =
      '<img class="img-fluid rounded mb-3 w-100" style="max-height:220px; object-fit:cover;">' +
      '<p><strong>Tema:</strong> <span class="tema"></span> | <strong>Ano:</strong> <span class="ano"></span> | <strong>Citações:</strong> <span class="citacoes"></span></p>' +
      '<p><strong>Veículo:</strong> <span class="veiculo"></span></p>' +
      '<hr>' +
      '<p class="conteudo" style="white-space: pre-line;"></p>' +
      '<hr>' +
      '<p class="mb-2"><strong>Autores:</strong></p>' +
      '<div class="autores"></div>';

    const imagem = corpo.querySelector('img');
    imagem.src = artigo.imagem;
    imagem.alt = artigo.titulo;

    corpo.querySelector('.tema').textContent = artigo.tema;
    corpo.querySelector('.ano').textContent = artigo.ano;
    corpo.querySelector('.citacoes').textContent = artigo.citacoes;
    corpo.querySelector('.veiculo').textContent = artigo.veiculo + ' (págs. ' + artigo.paginas + ')';
    corpo.querySelector('.conteudo').textContent = artigo.conteudo;

    autores.forEach(autor => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'btn btn-sm btn-outline-secondary me-2 mb-1';
      botao.textContent = autor.nome;
      botao.addEventListener('click', () => verPesquisador(autor.id));
      corpo.querySelector('.autores').appendChild(botao);
    });

    modal.show();
  } catch (erro) {
    console.error(erro);
  }
}

async function verPesquisador(id) {
  const corpo = document.getElementById('modalDetalhesCorpo');

  try {
    const pesquisador = await api.pesquisadores.porId(id);
    const artigos = await api.seguir(pesquisador.artigos);

    document.getElementById('modalDetalhesTitulo').textContent = pesquisador.nome;

    corpo.innerHTML =
      '<div class="d-flex align-items-center mb-3">' +
        '<img class="avatar-pesquisador me-3">' +
        '<div>' +
          '<h6 class="mb-0 fw-bold"></h6>' +
          '<small class="text-muted"></small>' +
        '</div>' +
      '</div>' +
      '<p class="bio"></p>' +
      '<p><strong>Linha de Pesquisa:</strong> <span class="linha"></span></p>' +
      '<p><strong>Áreas:</strong> <span class="areas"></span></p>' +
      '<h6 class="fw-bold mt-3 total"></h6>' +
      '<ul class="list-group"></ul>';

    const foto = corpo.querySelector('img');
    foto.src = pesquisador.imagem;
    foto.alt = pesquisador.nome;

    corpo.querySelector('h6').textContent = pesquisador.titulacao + ' - ' + pesquisador.cargo;
    corpo.querySelector('small').textContent = pesquisador.email;
    corpo.querySelector('.bio').textContent = pesquisador.bio;
    corpo.querySelector('.linha').textContent = pesquisador.linhaPesquisa;
    corpo.querySelector('.areas').textContent = pesquisador.areas.join(', ');
    corpo.querySelector('.total').textContent = 'Artigos Publicados (' + pesquisador.metricas.totalArtigos + ')';

    artigos.forEach(artigo => {
      const item = document.createElement('li');
      item.className = 'list-group-item d-flex justify-content-between align-items-center';
      item.innerHTML = '<span class="small"></span><button type="button" class="btn btn-sm btn-gepiseg">Ler</button>';

      item.querySelector('span').textContent = artigo.titulo + ' (' + artigo.ano + ')';
      item.querySelector('button').addEventListener('click', () => verArtigo(artigo.id));

      corpo.querySelector('.list-group').appendChild(item);
    });

    modal.show();
  } catch (erro) {
    console.error(erro);
  }
}
