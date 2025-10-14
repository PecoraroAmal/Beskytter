/**
 * home.js
 * 
 * Gestisce la logica della pagina principale di Beskytter™, inclusi caricamento file, 
 * decrittazione, visualizzazione e filtraggio di password, carte e wallet.
 * 
 * @file home.js
 * @version 1.0.0
 * @author [Your Name]
 * @license MIT
 * @description Script per la gestione della home page di Beskytter™, con funzionalità di caricamento file JSON, decrittazione e filtraggio dati.
 */

// Variabili globali per gestire i dati caricati e il file
let datiCaricati = null;
let fileCaricato = null;
let fileCaricatoNome = null;

// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    // Aggiungi event listener per gli input e i filtri
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', gestisciCaricamentoFile);
    }
    const decryptBtn = document.getElementById('decryptBtn');
    if (decryptBtn) {
        decryptBtn.addEventListener('click', apriFile);
    }
    const passwordSearchInput = document.getElementById('passwordSearchInput');
    if (passwordSearchInput) {
        passwordSearchInput.addEventListener('input', filtraDati);
    }
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filtraDati);
    }
    const cardSearchInput = document.getElementById('cardSearchInput');
    if (cardSearchInput) {
        cardSearchInput.addEventListener('input', filtraDati);
    }
    const circuitFilter = document.getElementById('circuitFilter');
    if (circuitFilter) {
        circuitFilter.addEventListener('change', filtraDati);
    }
    const walletSearchInput = document.getElementById('walletSearchInput');
    if (walletSearchInput) {
        walletSearchInput.addEventListener('input', filtraDati);
    }
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', filtraDati);
    }
    const decryptPassword = document.getElementById('decryptPassword');
    if (decryptPassword) {
        decryptPassword.addEventListener('keypress', e => {
            if (e.key === 'Enter') apriFile();
        });
    }

    // Gestione drag and drop e click per il caricamento del file
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone) {
        uploadZone.addEventListener('dragover', e => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
        uploadZone.addEventListener('drop', e => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) gestisciCaricamentoFile({ target: { files: [file] } });
        });
        // Aggiungi evento click per aprire l'esplora file
        uploadZone.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.click();
            }
        });
    }

    // Gestione toggle sezioni
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => toggleSection('passwordContainer', togglePasswordBtn));
    }
    const toggleCardBtn = document.getElementById('toggleCardBtn');
    if (toggleCardBtn) {
        toggleCardBtn.addEventListener('click', () => toggleSection('cardContainer', toggleCardBtn));
    }
    const toggleWalletBtn = document.getElementById('toggleWalletBtn');
    if (toggleWalletBtn) {
        toggleWalletBtn.addEventListener('click', () => toggleSection('walletContainer', toggleWalletBtn));
    }
});

// Gestisce il caricamento del file selezionato
function gestisciCaricamentoFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        mostraMessaggio('Errore: seleziona un file JSON valido', 'errore');
        return;
    }

    fileCaricatoNome = file.name;
    const reader = new FileReader();
    reader.onload = e => {
        fileCaricato = e.target.result;
        const fileNameElement = document.querySelector('.file-name');
        if (fileNameElement) {
            fileNameElement.textContent = fileCaricatoNome;
        }
        mostraMessaggio('File caricato. Premi "Apri File" per visualizzarlo.', 'info');
    };
    reader.readAsText(file);
}

// Apre il file caricato, con eventuale decrittazione
async function apriFile() {
    if (!fileCaricato) {
        mostraMessaggio('Seleziona prima un file JSON valido', 'errore');
        return;
    }

    const password = document.getElementById('decryptPassword')?.value || '';
    const btn = document.getElementById('decryptBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Apertura...';
    }

    try {
        let dati;
        try {
            dati = password ? 
                await decriptaDati(fileCaricato, password) : 
                JSON.parse(fileCaricato);
        } catch (e) {
            throw new Error('Errore nel parsing o decrittazione del JSON: ' + e.message);
        }

        if (!validaStrutturaJSON(dati)) throw new Error('Struttura JSON non valida');

        // Inizializza sezioni mancanti con array vuoti
        datiCaricati = {
            passwords: Array.isArray(dati.passwords) ? dati.passwords : [],
            cards: Array.isArray(dati.cards) ? dati.cards : [],
            wallets: Array.isArray(dati.wallets) ? dati.wallets : []
        };
        ordinaDati();
        mostraDati(datiCaricati);
        popolaFiltri(datiCaricati);

        if (document.getElementById('decryptPassword')) {
            document.getElementById('decryptPassword').value = '';
        }
        fileCaricato = null;
        fileCaricatoNome = null;
        if (document.getElementById('fileInput')) {
            document.getElementById('fileInput').value = '';
        }
        const fileNameElement = document.querySelector('.file-name');
        if (fileNameElement) {
            fileNameElement.textContent = '';
        }

        mostraMessaggio('File aperto con successo!', 'successo');
    } catch (errore) {
        console.error('Errore apertura file:', errore);
        mostraMessaggio(password ? 
            'Password errata o file corrotto' : 
            'File non valido. Se è criptato, inserisci la password', 'errore');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-unlock"></i> Apri File';
        }
    }
}

// Valida la struttura del JSON caricato
function validaStrutturaJSON(dati) {
    // Verifica che i dati siano un oggetto e che ogni sezione, se presente, sia un array
    return dati && typeof dati === 'object' &&
           (dati.passwords === undefined || Array.isArray(dati.passwords)) &&
           (dati.cards === undefined || Array.isArray(dati.cards)) &&
           (dati.wallets === undefined || Array.isArray(dati.wallets));
}

// Ordina i dati alfabeticamente
function ordinaDati() {
    if (!datiCaricati) return;
    datiCaricati.passwords.sort((a, b) => a.piattaforma.localeCompare(b.piattaforma, 'it', { sensitivity: 'base' }));
    datiCaricati.cards?.sort((a, b) => a.ente.localeCompare(b.ente, 'it', { sensitivity: 'base' }));
    datiCaricati.wallets.sort((a, b) => a.wallet.localeCompare(b.wallet, 'it', { sensitivity: 'base' }));
}

// Funzione per gestire il toggle delle sezioni
function toggleSection(containerId, button) {
    const container = document.getElementById(containerId);
    if (container) {
        const isHidden = container.classList.contains('hidden');
        container.classList.toggle('hidden');
        button.innerHTML = isHidden ? 
            `<i class="fas fa-eye-slash"></i> Nascondi ${containerId.replace('Container', '')}`:
            `<i class="fas fa-eye"></i> Mostra ${containerId.replace('Container', '')}`;
    }
}

// Mostra tutti i dati nelle rispettive sezioni
function mostraDati(dati) {
    mostraPassword(dati.passwords || []);
    mostraCarte(dati.cards || []);
    mostraWallet(dati.wallets || []);
}

// Mostra le password nella sezione dedicata
function mostraPassword(passwords) {
    const container = document.getElementById('passwordContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!passwords.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lock"></i>
                <p>Nessuna password salvata</p>
            </div>`;
        return;
    }

    passwords.forEach(pwd => {
        const card = document.createElement('div');
        card.className = 'preview-card-item';
        card.innerHTML = `
            <h3 class="scrollable-text">${escapeHtml(pwd.piattaforma)}</h3>
            <div class="field-container">
                <label class="field-label">Username</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(pwd.username)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Username')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Password</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(pwd.password)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Password')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Nota</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(pwd.nota || '-')}" data-nota="true">${pwd.nota ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Nota')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">URL</label>
                <div class="content-wrapper">
                    <a href="${escapeHtml(pwd.url || '#')}" class="url-field scrollable-text" data-value="${escapeHtml(pwd.url || '-')}" data-field="url" target="_blank" rel="noopener noreferrer">${escapeHtml(pwd.url || '-')}</a>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Categoria</label>
                <div class="content-wrapper">
                    <span class="scrollable-text" data-value="${escapeHtml(pwd.categoria || '-')}" data-field="categoria">${escapeHtml(pwd.categoria || '-')}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Mostra le carte nella sezione dedicata
function mostraCarte(cards) {
    const container = document.getElementById('cardContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!cards.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-credit-card"></i>
                <p>Nessuna carta salvata</p>
            </div>`;
        return;
    }

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'preview-card-item';
        cardElement.innerHTML = `
            <h3 class="scrollable-text">${escapeHtml(card.ente)}</h3>
            <div class="field-container">
                <label class="field-label">PAN</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(card.pan)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'PAN')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Data scadenza</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(card.dataScadenza)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Data scadenza')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">CVV/CVC2</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(card.cvv)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'CVV/CVC2')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">PIN</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(card.pin)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'PIN')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Nota</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(card.nota || '-')}" data-nota="true">${card.nota ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Nota')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Circuito</label>
                <div class="content-wrapper">
                    <span class="scrollable-text" data-value="${escapeHtml(card.circuito || '-')}" data-field="circuito">${escapeHtml(card.circuito || '-')}</span>
                </div>
            </div>
        `;
        container.appendChild(cardElement);
    });
}

// Mostra i wallet nella sezione dedicata
function mostraWallet(wallets) {
    const container = document.getElementById('walletContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!wallets.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wallet"></i>
                <p>Nessun wallet salvato</p>
            </div>`;
        return;
    }

    wallets.forEach(wallet => {
        const card = document.createElement('div');
        card.className = 'preview-card-item';
        card.innerHTML = `
            <h3 class="scrollable-text">${escapeHtml(wallet.wallet)}</h3>
            <div class="field-container">
                <label class="field-label">Utente</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(wallet.utente)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Utente')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Password</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(wallet.password)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Password')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Chiave</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(wallet.key || '-')}" data-key="true">${wallet.key ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Chiave')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Indirizzo</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(wallet.indirizzo || '-')}" data-indirizzo="true">${wallet.indirizzo ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Indirizzo')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Nota</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(wallet.nota || '-')}" data-nota="true">${wallet.nota ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Nota')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Tipologia</label>
                <div class="content-wrapper">
                    <span class="scrollable-text" data-value="${escapeHtml(wallet.tipologia || '-')}" data-field="tipologia">${escapeHtml(wallet.tipologia || '-')}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Gestisce la visibilità dei contenuti sensibili
function toggleVisibility(button) {
    const parent = button.closest('.field-container');
    const span = parent?.querySelector('.hidden-content');
    if (!span) return;

    const value = span.dataset.value;
    const isHidden = span.textContent === '••••••••••••' || span.textContent === '-';

    if (isHidden && value !== '-') {
        span.textContent = value;
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        span.textContent = value && value !== '-' ? '••••••••••••' : '-';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Copia il testo negli appunti
function copiaTestoAppunti(testo, tipo) {
    if (testo === '-') return;
    navigator.clipboard.writeText(testo)
        .then(() => mostraMessaggio(`${tipo} copiato negli appunti!`, 'successo'))
        .catch(() => mostraMessaggio('Errore durante la copia', 'errore'));
}

// Filtra i dati in base agli input di ricerca e filtri
function filtraDati() {
    if (!datiCaricati) return;

    const passwordSearchInput = document.getElementById('passwordSearchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const cardSearchInput = document.getElementById('cardSearchInput');
    const circuitFilter = document.getElementById('circuitFilter');
    const walletSearchInput = document.getElementById('walletSearchInput');
    const typeFilter = document.getElementById('typeFilter');

    if (!passwordSearchInput || !categoryFilter || !cardSearchInput || !circuitFilter || !walletSearchInput || !typeFilter) return;

    const ricercaPassword = passwordSearchInput.value.toLowerCase();
    const categoria = categoryFilter.value.toLowerCase();
    const ricercaCarte = cardSearchInput.value.toLowerCase();
    const circuito = circuitFilter.value.toLowerCase();
    const ricercaWallet = walletSearchInput.value.toLowerCase();
    const tipologia = typeFilter.value.toLowerCase();

    // Filtro password
    const passwordsFiltrate = (datiCaricati.passwords || []).filter(pwd => {
        const matchRicerca = !ricercaPassword || 
            pwd.piattaforma.toLowerCase().includes(ricercaPassword) ||
            pwd.username.toLowerCase().includes(ricercaPassword) ||
            pwd.password.toLowerCase().includes(ricercaPassword) ||
            (pwd.url && pwd.url.toLowerCase().includes(ricercaPassword)) ||
            (pwd.nota && pwd.nota.toLowerCase().includes(ricercaPassword)) ||
            (pwd.categoria && pwd.categoria.toLowerCase().includes(ricercaPassword));

        const matchCategoria = !categoria || 
            (pwd.categoria && pwd.categoria.toLowerCase() === categoria);

        return matchRicerca && matchCategoria;
    }).sort((a, b) => a.piattaforma.localeCompare(b.piattaforma, 'it', { sensitivity: 'base' }));

    // Filtro carte
    const carteFiltrate = (datiCaricati.cards || []).filter(card => {
        const matchRicerca = !ricercaCarte || 
            card.ente.toLowerCase().includes(ricercaCarte) ||
            card.pan.toLowerCase().includes(ricercaCarte) ||
            card.dataScadenza.toLowerCase().includes(ricercaCarte) ||
            card.cvv.toLowerCase().includes(ricercaCarte) ||
            card.pin.toLowerCase().includes(ricercaCarte) ||
            (card.circuito && card.circuito.toLowerCase().includes(ricercaCarte)) ||
            (card.nota && card.nota.toLowerCase().includes(ricercaCarte));

        const matchCircuito = !circuito || 
            (card.circuito && card.circuito.toLowerCase() === circuito);

        return matchRicerca && matchCircuito;
    }).sort((a, b) => a.ente.localeCompare(b.ente, 'it', { sensitivity: 'base' }));

    // Filtro wallet
    const walletsFiltrati = (datiCaricati.wallets || []).filter(wallet => {
        const matchRicerca = !ricercaWallet || 
            wallet.wallet.toLowerCase().includes(ricercaWallet) ||
            (wallet.utente && wallet.utente.toLowerCase().includes(ricercaWallet)) ||
            wallet.password.toLowerCase().includes(ricercaWallet) ||
            (wallet.key && wallet.key.toLowerCase().includes(ricercaWallet)) ||
            (wallet.indirizzo && wallet.indirizzo.toLowerCase().includes(ricercaWallet)) ||
            (wallet.tipologia && wallet.tipologia.toLowerCase().includes(ricercaWallet)) ||
            (wallet.nota && wallet.nota.toLowerCase().includes(ricercaWallet));

        const matchTipologia = !tipologia || 
            (wallet.tipologia && wallet.tipologia.toLowerCase() === tipologia);

        return matchRicerca && matchTipologia;
    }).sort((a, b) => a.wallet.localeCompare(b.wallet, 'it', { sensitivity: 'base' }));

    mostraPassword(passwordsFiltrate);
    mostraCarte(carteFiltrate);
    mostraWallet(walletsFiltrati);
}

// Popola i filtri per categorie, circuiti e tipologie
function popolaFiltri(dati) {
    popolaFiltroCategorie(dati);
    popolaFiltroCircuiti(dati);
    popolaFiltroTipologie(dati);
}

// Popola il filtro delle categorie per le password
function popolaFiltroCategorie(dati) {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    const categorie = new Set();
    (dati.passwords || []).forEach(pwd => {
        if (pwd.categoria) categorie.add(pwd.categoria);
    });

    select.innerHTML = '<option value="">Tutte le categorie</option>';
    Array.from(categorie).sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

// Popola il filtro dei circuiti per le carte
function popolaFiltroCircuiti(dati) {
    const select = document.getElementById('circuitFilter');
    if (!select) return;

    const circuiti = new Set();
    (dati.cards || []).forEach(card => {
        if (card.circuito) circuiti.add(card.circuito);
    });

    select.innerHTML = '<option value="">Tutti i circuiti</option>';
    Array.from(circuiti).sort().forEach(circ => {
        const option = document.createElement('option');
        option.value = circ;
        option.textContent = circ;
        select.appendChild(option);
    });
}

// Popola il filtro delle tipologie per i wallet
function popolaFiltroTipologie(dati) {
    const select = document.getElementById('typeFilter');
    if (!select) return;

    const tipologie = new Set();
    (dati.wallets || []).forEach(wallet => {
        if (wallet.tipologia) tipologie.add(wallet.tipologia);
    });

    select.innerHTML = '<option value="">Tutte le tipologie</option>';
    Array.from(tipologie).sort().forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        select.appendChild(option);
    });
}

// Mostra un messaggio toast per feedback all'utente
function mostraMessaggio(testo, tipo) {
    const vecchioMessaggio = document.querySelector('.toast-message');
    if (vecchioMessaggio) vecchioMessaggio.remove();

    const messaggio = document.createElement('div');
    messaggio.className = `toast-message toast-${tipo}`;
    messaggio.textContent = testo;
    messaggio.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${tipo === 'successo' ? 'var(--success)' : 
                     tipo === 'errore' ? 'var(--danger)' : 
                     'var(--primary-color)'};
        color: white;
        border-radius: var(--border-radius);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(messaggio);
    setTimeout(() => {
        messaggio.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messaggio.remove(), 300);
    }, 3000);
}

// Escapa il testo per prevenire XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}