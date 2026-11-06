const api = GepisegAPI.criar();
const modal = new bootstrap.Modal(document.getElementById('modalDetalhes'));

function carregarFiltros() {
  api.filtros().then(function (f) {
    f.temas.forEach(function (t) {
      document.getElementById('artigo-tema').innerHTML += '<option value="' + t + '">' + t + '</option>';
    });
    f.anos.forEach(function (a) {
      document.getElementById('artigo-ano').innerHTML += '<option value="' + a + '">' + a + '</option>';
    });
    f.areas.forEach(function (ar) {
      document.getElementById('pesq-area').innerHTML += '<option value="' + ar + '">' + ar + '</option>';
    });
    f.titulacoes.forEach(function (ti) {
      document.getElementById('pesq-titulacao').innerHTML += '<option value="' + ti + '">' + ti + '</option>';
    });
  });
}

function carregarDestaques() {
  api.artigos.listar({ ordenar: 'citacoes', porPagina: 3 }).then(function (res) {
    const itens = document.getElementById('carousel-itens');
    itens.innerHTML = '';

    res.results.forEach(function (art, i) {
      const ativo = i === 0 ? 'active' : '';
      itens.innerHTML +=
        '<div class="carousel-item ' + ativo + '">' +
          '<div class="carousel-item-destaque" style="background-image: url(\'' + art.imagem + '\')">' +
            '<div class="carousel-overlay text-white">' +
              '<div>' +
                '<span class="badge bg-success mb-2">' + art.tema + ' (' + art.ano + ')</span>' +
                '<h3 class="h4 fw-bold">' + art.titulo + '</h3>' +
                '<p class="small mb-3">' + art.resumo + '</p>' +
                '<button class="btn btn-sm btn-light" onclick="verArtigo(' + art.id + ')">Ver publicação</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
  });
}

function carregarArtigos(pagina) {
  const lista = document.getElementById('lista-artigos');
  const alerta = document.getElementById('alerta-artigos');
  const paginacao = document.getElementById('paginacao-artigos');

  lista.innerHTML = '';
  paginacao.innerHTML = '';
  alerta.classList.add('d-none');

  const filtros = {
    q: document.getElementById('artigo-q').value,
    tema: document.getElementById('artigo-tema').value,
    ano: document.getElementById('artigo-ano').value,
    ordenar: document.getElementById('artigo-ordenar').value,
    pagina: pagina || 1,
    porPagina: 6
  };

  api.artigos.listar(filtros).then(function (res) {
    document.getElementById('contador-artigos').textContent = res.info.count + ' artigos';

    res.results.forEach(function (art) {
      lista.innerHTML +=
        '<div class="col-md-6 col-lg-4">' +
          '<div class="card h-100 card-custom">' +
            '<img src="' + art.imagem + '" class="card-img-top card-img-artigo" alt="' + art.titulo + '">' +
            '<div class="card-body d-flex flex-column">' +
              '<div class="mb-2">' +
                '<span class="badge badge-tema">' + art.tema + '</span> ' +
                '<span class="badge bg-light text-dark border">' + art.ano + '</span>' +
              '</div>' +
              '<h5 class="card-title h6 fw-bold">' + art.titulo + '</h5>' +
              '<p class="card-text small text-secondary">' + art.resumo + '</p>' +
              '<div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">' +
                '<small class="text-muted">' + art.autorPrincipal.nome + '</small>' +
                '<small class="fw-bold text-success">' + art.citacoes + ' citações</small>' +
              '</div>' +
              '<button class="btn btn-gepiseg btn-sm mt-3 w-100" onclick="verArtigo(' + art.id + ')">Detalhes</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    });

    for (let i = 1; i <= res.info.pages; i++) {
      const ativo = i === (pagina || 1) ? 'active' : '';
      paginacao.innerHTML +=
        '<li class="page-item ' + ativo + '">' +
          '<button class="page-link" onclick="carregarArtigos(' + i + ')">' + i + '</button>' +
        '</li>';
    }
  }).catch(function (erro) {
    document.getElementById('contador-artigos').textContent = '0 artigos';
    alerta.textContent = erro.corpo ? erro.corpo.error : 'Nenhum artigo encontrado.';
    alerta.classList.remove('d-none');
  });
}

function carregarPesquisadores() {
  const lista = document.getElementById('lista-pesquisadores');
  const alerta = document.getElementById('alerta-pesquisadores');

  lista.innerHTML = '';
  alerta.classList.add('d-none');

  const filtros = {
    q: document.getElementById('pesq-q').value,
    area: document.getElementById('pesq-area').value,
    titulacao: document.getElementById('pesq-titulacao').value,
    ordenar: document.getElementById('pesq-ordenar').value
  };

  api.pesquisadores.listar(filtros).then(function (res) {
    document.getElementById('contador-pesquisadores').textContent = res.info.count + ' pesquisadores';

    res.results.forEach(function (p) {
      lista.innerHTML +=
        '<div class="col-md-6 col-lg-4">' +
          '<div class="card h-100 card-custom">' +
            '<div class="card-body d-flex flex-column">' +
              '<div class="d-flex align-items-center mb-3">' +
                '<img src="' + p.imagem + '" class="avatar-pesquisador me-3" alt="' + p.nome + '">' +
                '<div>' +
                  '<h5 class="h6 fw-bold mb-0">' + p.nome + '</h5>' +
                  '<small class="text-muted">' + p.titulacao + ' - ' + p.cargo + '</small>' +
                '</div>' +
              '</div>' +
              '<p class="small text-secondary mb-3">' + p.linhaPesquisa + '</p>' +
              '<div class="mt-auto pt-2 border-top d-flex justify-content-between small text-muted mb-3">' +
                '<span>Artigos: <strong>' + p.metricas.totalArtigos + '</strong></span>' +
                '<span>Citações: <strong>' + p.metricas.totalCitacoes + '</strong></span>' +
                '<span>Índice H: <strong>' + p.metricas.indiceH + '</strong></span>' +
              '</div>' +
              '<button class="btn btn-outline-gepiseg btn-sm w-100" onclick="verPesquisador(' + p.id + ')">Ver perfil</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
  }).catch(function (erro) {
    document.getElementById('contador-pesquisadores').textContent = '0 pesquisadores';
    alerta.textContent = erro.corpo ? erro.corpo.error : 'Nenhum pesquisador encontrado.';
    alerta.classList.remove('d-none');
  });
}

function verArtigo(id) {
  api.artigos.porId(id).then(function (art) {
    api.seguir(art.autores).then(function (autores) {
      document.getElementById('modalDetalhesTitulo').textContent = art.titulo;

      let botoesAutores = '';
      autores.forEach(function (a) {
        botoesAutores += '<button class="btn btn-sm btn-outline-secondary me-2 mb-1" onclick="verPesquisador(' + a.id + ')">' + a.nome + '</button>';
      });

      document.getElementById('modalDetalhesCorpo').innerHTML =
        '<img src="' + art.imagem + '" class="img-fluid rounded mb-3 w-100" style="max-height:220px; object-fit:cover;">' +
        '<p><strong>Tema:</strong> ' + art.tema + ' | <strong>Ano:</strong> ' + art.ano + ' | <strong>Citações:</strong> ' + art.citacoes + '</p>' +
        '<p><strong>Veículo:</strong> ' + art.veiculo + ' (págs. ' + art.paginas + ')</p>' +
        '<hr>' +
        '<p style="white-space: pre-line;">' + art.conteudo + '</p>' +
        '<hr>' +
        '<p class="mb-2"><strong>Autores:</strong></p>' +
        '<div>' + botoesAutores + '</div>';

      modal.show();
    });
  });
}

function verPesquisador(id) {
  api.pesquisadores.porId(id).then(function (p) {
    api.seguir(p.artigos).then(function (artigos) {
      document.getElementById('modalDetalhesTitulo').textContent = p.nome;

      let listaArtigos = '';
      artigos.forEach(function (a) {
        listaArtigos +=
          '<li class="list-group-item d-flex justify-content-between align-items-center">' +
            '<span class="small">' + a.titulo + ' (' + a.ano + ')</span>' +
            '<button class="btn btn-sm btn-gepiseg" onclick="verArtigo(' + a.id + ')">Ler</button>' +
          '</li>';
      });

      document.getElementById('modalDetalhesCorpo').innerHTML =
        '<div class="d-flex align-items-center mb-3">' +
          '<img src="' + p.imagem + '" class="avatar-pesquisador me-3">' +
          '<div>' +
            '<h6 class="mb-0 fw-bold">' + p.titulacao + ' - ' + p.cargo + '</h6>' +
            '<small class="text-muted">' + p.email + '</small>' +
          '</div>' +
        '</div>' +
        '<p>' + p.bio + '</p>' +
        '<p><strong>Linha de Pesquisa:</strong> ' + p.linhaPesquisa + '</p>' +
        '<p><strong>Áreas:</strong> ' + p.areas.join(', ') + '</p>' +
        '<h6 class="fw-bold mt-3">Artigos Publicados (' + p.metricas.totalArtigos + ')</h6>' +
        '<ul class="list-group">' + listaArtigos + '</ul>';

      modal.show();
    });
  });
}
