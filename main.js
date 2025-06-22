// Cache per le liste dei Pokémon in base ai filtri
    let cachedLists = {
      all: [],
      normal: null,
      fire: null,
      water: null,
      electric: null,
      grass: null,
      ice: null,
      fighting: null,
      poison: null,
      ground: null,
      flying: null,
      psychic: null,
      bug: null,
      rock: null,
      ghost: null,
      dragon: null,
      dark: null,
      steel: null,
      fairy: null
    };
    let currentDisplayList = [];
    let currentPage = 1;
    const pageSize = 50;

    // Estrae l'ID dal link del Pokémon per generare l'URL dell'immagine
    function extractIdFromUrl(url) {
      const parts = url.split('/').filter(Boolean);
      return parts[parts.length - 1];
    }

    // Crea una card per ciascun Pokémon
    function createPokemonCard(pokemon) {
      const col = document.createElement('div');
      col.className = 'col-md-3 col-sm-6 mb-3';
      
      const card = document.createElement('div');
      card.className = 'card pokemon-card';
      card.style.cursor = 'pointer';
      
      // Costruisce l'URL dell'immagine usando l'ID estratto
      const id = extractIdFromUrl(pokemon.url);
      const img = document.createElement('img');
      img.className = 'card-img-top';
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      img.alt = pokemon.name;
      card.appendChild(img);
      
      // Corpo della card con il nome del Pokémon
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body text-center';
      const title = document.createElement('h5');
      title.className = 'card-title';
      title.textContent = pokemon.name;
      cardBody.appendChild(title);
      card.appendChild(cardBody);
      
      // Al click, mostra i dettagli del Pokémon nel modal
      card.addEventListener('click', () => {
        showPokemonDetail(pokemon.url);
      });
      
      col.appendChild(card);
      document.getElementById('pokemonContainer').appendChild(col);
    }

    // Visualizza, con paginazione, i Pokémon della lista corrente
    function displayPokemons(list, page) {
      const container = document.getElementById('pokemonContainer');
      container.innerHTML = '';
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const subset = list.slice(startIndex, endIndex);
      subset.forEach(pokemon => {
        createPokemonCard(pokemon);
      });
    }

    // Aggiorna la barra di paginazione in base alla lista corrente
    function updatePagination() {
      const paginationContainer = document.getElementById('pagination');
      paginationContainer.innerHTML = '';
      const totalPages = Math.ceil(currentDisplayList.length / pageSize);
      
      // Bottone "Previous"
      const prevLi = document.createElement('li');
      prevLi.className = 'page-item ' + (currentPage === 1 ? 'disabled' : '');
      const prevLink = document.createElement('a');
      prevLink.className = 'page-link';
      prevLink.href = '#';
      prevLink.textContent = 'Previous';
      prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
          currentPage--;
          displayPokemons(currentDisplayList, currentPage);
          updatePagination();
        }
      });
      prevLi.appendChild(prevLink);
      paginationContainer.appendChild(prevLi);
      
      // Pulsanti per ogni pagina
      for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item ' + (i === currentPage ? 'active' : '');
        const link = document.createElement('a');
        link.className = 'page-link';
        link.href = '#';
        link.textContent = i;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          currentPage = i;
          displayPokemons(currentDisplayList, currentPage);
          updatePagination();
        });
        li.appendChild(link);
        paginationContainer.appendChild(li);
      }
      
      // Bottone "Next"
      const nextLi = document.createElement('li');
      nextLi.className = 'page-item ' + (currentPage === totalPages ? 'disabled' : '');
      const nextLink = document.createElement('a');
      nextLink.className = 'page-link';
      nextLink.href = '#';
      nextLink.textContent = 'Next';
      nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
          currentPage++;
          displayPokemons(currentDisplayList, currentPage);
          updatePagination();
        }
      });
      nextLi.appendChild(nextLink);
      paginationContainer.appendChild(nextLi);
    }

    // Carica la lista globale di Pokémon (tutti)
    async function loadGlobalPokemons() {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1118');
        const data = await response.json();
        cachedLists.all = data.results;
        currentDisplayList = cachedLists.all;
        currentPage = 1;
        displayPokemons(currentDisplayList, currentPage);
        updatePagination();
      } catch (error) {
        console.error('Errore nel recupero dei Pokémon globali:', error);
      }
    }

    // Carica la lista dei Pokémon per un determinato tipo (es. "fire", "water", ecc.)
    async function loadTypePokemons(type) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const data = await response.json();
        // Estrae la lista dei Pokémon per quel tipo
        const pokemons = data.pokemon.map(item => item.pokemon);
        cachedLists[type] = pokemons;
        currentDisplayList = pokemons;
        currentPage = 1;
        displayPokemons(currentDisplayList, currentPage);
        updatePagination();
      } catch (error) {
        console.error(`Errore nel recupero dei Pokémon del tipo ${type}:`, error);
      }
    }

    // Funzione per gestire il filtro in base al tipo selezionato
    function filterPokemons(type, event) {
      // Aggiorna lo stato active dei pulsanti
      const buttons = document.querySelectorAll('.btn-group button');
      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      
      if (type === 'all') {
        currentDisplayList = cachedLists.all;
        currentPage = 1;
        displayPokemons(currentDisplayList, currentPage);
        updatePagination();
      } else {
        // Se già presente in cache, utilizza direttamente la lista; altrimenti effettua il fetch
        if (cachedLists[type]) {
          currentDisplayList = cachedLists[type];
          currentPage = 1;
          displayPokemons(currentDisplayList, currentPage);
          updatePagination();
        } else {
          loadTypePokemons(type);
        }
      }
    }
    // Rende filterPokemons accessibile globalmente
    window.filterPokemons = filterPokemons;

    // Mostra i dettagli del Pokémon in un modal
    async function showPokemonDetail(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        document.getElementById('pokemonModalLabel').textContent = data.name;
        const imageUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
        document.getElementById('pokemonImage').src = imageUrl;
        document.getElementById('pokemonInfo').innerHTML = `
          <strong>Altezza:</strong> ${data.height} | <strong>Peso:</strong> ${data.weight}
        `;
        
        const statsList = document.getElementById('pokemonStats');
        statsList.innerHTML = '';
        data.stats.forEach(stat => {
          const li = document.createElement('li');
          li.className = 'list-group-item text-capitalize';
          li.textContent = `${stat.stat.name}: ${stat.base_stat}`;
          statsList.appendChild(li);
        });
        
        const modalEl = document.getElementById('pokemonModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      } catch (error) {
        console.error('Errore nel recupero dei dettagli del Pokémon:', error);
      }
    }

    // Inizializzazione al caricamento del DOM
    document.addEventListener('DOMContentLoaded', loadGlobalPokemons);
