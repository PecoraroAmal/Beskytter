// Variabili globali
let datiCaricati = { "passwords": [], "cards": [], "wallets": [] };
let fileCaricato = null;
let fileCaricatoNome = null;

// Funzione per generare un ID univoco
function generaIdUnivoco() {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    });
}

// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners
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
    const downloadPlainBtn = document.getElementById('downloadPlainBtn');
    if (downloadPlainBtn) {
        downloadPlainBtn.addEventListener('click', () => scaricaFile(false));
    }
    const downloadEncryptedBtn = document.getElementById('downloadEncryptedBtn');
    if (downloadEncryptedBtn) {
        downloadEncryptedBtn.addEventListener('click', () => scaricaFile(true));
    }
    const addPasswordBtn = document.getElementById('addPasswordBtn');
    if (addPasswordBtn) {
        addPasswordBtn.addEventListener('click', aggiungiPassword);
    }
    const addCardBtn = document.getElementById('addCardBtn');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', aggiungiCarta);
    }
    const addWalletBtn = document.getElementById('addWalletBtn');
    if (addWalletBtn) {
        addWalletBtn.addEventListener('click', aggiungiWallet);
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
        uploadZone.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.click();
            }
        });
    }
});

// Gestione caricamento file
function gestisciCaricamentoFile(event) {
    const files = event.target?.files || event.dataTransfer?.files;
    const file = files?.[0];
    
    if (!file) {
        mostraMessaggio('Nessun file selezionato', 'errore');
        return;
    }
    
    if (!file.name.endsWith('.json')) {
        mostraMessaggio('Errore: seleziona un file JSON valido', 'errore');
        if (event.target) event.target.value = '';
        return;
    }
    
    fileCaricatoNome = file.name;
    const reader = new FileReader();
    
    reader.onerror = () => {
        mostraMessaggio('Errore nella lettura del file', 'errore');
        fileCaricato = null;
        fileCaricatoNome = null;
        if (event.target) event.target.value = '';
    };
    
    reader.onload = e => {
        try {
            fileCaricato = e.target.result;
            const fileNameElement = document.querySelector('.file-name');
            if (fileNameElement) {
                fileNameElement.textContent = fileCaricatoNome;
            }
            mostraMessaggio('File caricato. Premi "Apri File" per visualizzarlo.', 'info');
        } catch (error) {
            mostraMessaggio('Errore nel caricamento del file', 'errore');
            fileCaricato = null;
            fileCaricatoNome = null;
            if (event.target) event.target.value = '';
        }
    };
    
    reader.readAsText(file);
}

// Apertura file
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
        
        // Aggiungi ID univoci se non presenti
        datiCaricati.passwords.forEach(pwd => {
            if (!pwd.id) pwd.id = generaIdUnivoco();
        });
        datiCaricati.cards.forEach(card => {
            if (!card.id) card.id = generaIdUnivoco();
        });
        datiCaricati.wallets.forEach(wallet => {
            if (!wallet.id) wallet.id = generaIdUnivoco();
        });
        
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
            'Password errata o file corrotto: ' + errore.message : 
            'File non valido. Se è criptato, inserisci la password: ' + errore.message, 'errore');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-unlock"></i> Apri File';
        }
    }
}

// Valida la struttura del JSON
function validaStrutturaJSON(dati) {
    // Verifica che i dati siano un oggetto e che ogni sezione, se presente, sia un array
    return dati && typeof dati === 'object' &&
           (dati.passwords === undefined || Array.isArray(dati.passwords)) &&
           (dati.cards === undefined || Array.isArray(dati.cards)) &&
           (dati.wallets === undefined || Array.isArray(dati.wallets));
}

// Ordinamento dati
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

// Mostra tutti i dati
function mostraDati(dati) {
    mostraPassword(dati.passwords);
    mostraCarte(dati.cards || []);
    mostraWallet(dati.wallets);
}

// Mostra password
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
    
    passwords.forEach((pwd, index) => {
        const card = document.createElement('div');
        card.className = 'preview-card-item';
        card.innerHTML = `
            <h3 class="editable-field scrollable-text" data-value="${escapeHtml(pwd.piattaforma)}" data-field="piattaforma" data-id="${pwd.id}" data-type="password">${escapeHtml(pwd.piattaforma)}</h3>
            <div class="field-container">
                <label class="field-label">Username</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(pwd.username)}" data-field="username" data-id="${pwd.id}" data-type="password">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Username')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Password</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(pwd.password)}" data-field="password" data-id="${pwd.id}" data-type="password">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Password')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Nota</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(pwd.nota || '-')}" data-field="nota" data-id="${pwd.id}" data-type="password" data-nota="true">${pwd.nota ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Nota')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">URL</label>
                <div class="content-wrapper">
                    <span href="${escapeHtml(pwd.url || '#')}" class="editable-field url-field scrollable-text" data-value="${escapeHtml(pwd.url || '-')}" data-field="url" data-id="${pwd.id}" data-type="password" target="_blank" rel="noopener noreferrer">${escapeHtml(pwd.url || '-')}</span>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Categoria</label>
                <div class="content-wrapper">
                    <span class="editable-field scrollable-text" data-value="${escapeHtml(pwd.categoria || '-')}" data-field="categoria" data-id="${pwd.id}" data-type="password">${escapeHtml(pwd.categoria || '-')}</span>
                </div>
            </div>
            <div class="btn-container">
                <button class="btn btn-danger" onclick="mostraModaleEliminazione('${pwd.id}', 'password')">
                    <i class="fas fa-trash"></i> Elimina
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    aggiungiEventListenersEditabili();
}

// Mostra carte
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
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'preview-card-item';
        cardElement.innerHTML = `
            <h3 class="editable-field scrollable-text" data-value="${escapeHtml(card.ente)}" data-field="ente" data-id="${card.id}" data-type="card">${escapeHtml(card.ente)}</h3>    
            <div class="field-container">
                <label class="field-label">PAN</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(card.pan)}" data-field="pan" data-id="${card.id}" data-type="card">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'PAN')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Data scadenza</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(card.dataScadenza)}" data-field="dataScadenza" data-id="${card.id}" data-type="card">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Data scadenza')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">CVV/CVC2</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(card.cvv)}" data-field="cvv" data-id="${card.id}" data-type="card">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'CVV/CVC2')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">PIN</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(card.pin)}" data-field="pin" data-id="${card.id}" data-type="card">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'PIN')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Nota</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(card.nota || '-')}" data-field="nota" data-id="${card.id}" data-type="card" data-nota="true">${card.nota ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Nota')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Circuito</label>
                <div class="content-wrapper">
                    <span class="editable-field scrollable-text" data-value="${escapeHtml(card.circuito || '-')}" data-field="circuito" data-id="${card.id}" data-type="card">${escapeHtml(card.circuito || '-')}</span>
                </div>
            </div>
            <div class="btn-container">
                <button class="btn btn-danger" onclick="mostraModaleEliminazione('${card.id}', 'card')">
                    <i class="fas fa-trash"></i> Elimina
                </button>
            </div>
        `;
        container.appendChild(cardElement);
    });

    aggiungiEventListenersEditabili();
}

// Mostra wallet
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
    
    wallets.forEach((wallet, index) => {
        const card = document.createElement('div');
        card.className = 'preview-card-item';
        card.innerHTML = `
            <h3 class="editable-field scrollable-text" data-value="${escapeHtml(wallet.wallet)}" data-field="wallet" data-id="${wallet.id}" data-type="wallet">${escapeHtml(wallet.wallet)}</h3>
            <div class="field-container">
                <label class="field-label">Utente</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(wallet.utente)}" data-field="utente" data-id="${wallet.id}" data-type="wallet">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Utente')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Password</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(wallet.password)}" data-field="password" data-id="${wallet.id}" data-type="wallet">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Password')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Chiave</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(wallet.key || '-')}" data-field="key" data-id="${wallet.id}" data-type="wallet" data-key="true">${wallet.key ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Chiave')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Indirizzo</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(wallet.indirizzo || '-')}" data-field="indirizzo" data-id="${wallet.id}" data-type="wallet" data-indirizzo="true">${wallet.indirizzo ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Indirizzo')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Nota</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(wallet.nota || '-')}" data-field="nota" data-id="${wallet.id}" data-type="wallet" data-nota="true">${wallet.nota ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copiaTestoAppunti(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Nota')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Tipologia</label>
                <div class="content-wrapper">
                    <span class="editable-field scrollable-text" data-value="${escapeHtml(wallet.tipologia || '-')}" data-field="tipologia" data-id="${wallet.id}" data-type="wallet">${escapeHtml(wallet.tipologia || '-')}</span>
                </div>
            </div>
            <div class="btn-container">
                <button class="btn btn-danger" onclick="mostraModaleEliminazione('${wallet.id}', 'wallet')">
                    <i class="fas fa-trash"></i> Elimina
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    aggiungiEventListenersEditabili();
}

// Aggiungi event listeners a tutti i campi editabili
function aggiungiEventListenersEditabili() {
    document.querySelectorAll('.editable-field').forEach(field => {
        field.removeEventListener('click', handleFieldEdit);
        field.addEventListener('click', handleFieldEdit);
    });
}

// Gestione modifica campi con conferma
function handleFieldEdit(event) {
    const element = event.target;
    if (element.tagName !== 'SPAN' && element.tagName !== 'A' && element.tagName !== 'H3') return;

    const value = element.dataset.value;
    const field = element.dataset.field;
    const id = element.dataset.id;
    const type = element.dataset.type;

    // Crea contenitore per input e pulsanti
    const container = document.createElement('div');
    container.className = 'edit-field-container';

    // Crea input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value === '-' ? '' : value;
    input.className = 'input-field';
    container.appendChild(input);

    // Crea pulsanti Conferma e Annulla
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group edit-buttons';
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary btn-icon';
    confirmBtn.innerHTML = '<i class="fas fa-check"></i>';
    confirmBtn.title = 'Conferma modifica';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary btn-icon';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    cancelBtn.title = 'Annulla';
    buttonGroup.appendChild(confirmBtn);
    buttonGroup.appendChild(cancelBtn);
    container.appendChild(buttonGroup);

    // Gestisci conferma con modale
    confirmBtn.addEventListener('click', () => {
        const newValue = input.value.trim();
        
        // Mostra modale di conferma
        mostraModaleConfermaModifica(value, newValue, () => {
            applicaModifica(element, container, newValue, field, id, type);
        }, () => {
            annullaModifica(element, container, value, field, id, type);
        });
    });

    // Gestisci annullamento
    cancelBtn.addEventListener('click', () => {
        annullaModifica(element, container, value, field, id, type);
    });

    // Gestisci invio da tastiera
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmBtn.click();
        } else if (e.key === 'Escape') {
            cancelBtn.click();
        }
    });

    // Sostituisci l'elemento con il contenitore
    element.replaceWith(container);
    input.focus();
    input.select();
}

// Mostra modale di conferma modifica
function mostraModaleConfermaModifica(oldValue, newValue, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h3');
    title.textContent = 'Conferma Modifica';
    modalContent.appendChild(title);
    
    const message = document.createElement('p');
    message.innerHTML = `Vuoi salvare questa modifica?<br><br><strong>Da:</strong> ${escapeHtml(oldValue || '-')}<br><strong>A:</strong> ${escapeHtml(newValue || '-')}`;
    modalContent.appendChild(message);
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';
    
    const confirmBtnModal = document.createElement('button');
    confirmBtnModal.className = 'btn btn-primary';
    confirmBtnModal.innerHTML = '<i class="fas fa-check"></i> Salva';
    
    const cancelBtnModal = document.createElement('button');
    cancelBtnModal.className = 'btn btn-secondary';
    cancelBtnModal.innerHTML = '<i class="fas fa-times"></i> Annulla';
    
    btnContainer.appendChild(confirmBtnModal);
    btnContainer.appendChild(cancelBtnModal);
    modalContent.appendChild(btnContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    confirmBtnModal.addEventListener('click', () => {
        document.body.removeChild(modal);
        onConfirm();
    });
    
    cancelBtnModal.addEventListener('click', () => {
        document.body.removeChild(modal);
        onCancel();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            onCancel();
        }
    });
}

// Applica la modifica al campo
function applicaModifica(originalElement, container, newValue, field, id, type) {
    const isSensitive = field === 'username' || field === 'password' || field === 'nota' || 
                       field === 'pan' || field === 'dataScadenza' || 
                       field === 'cvv' || field === 'pin' || field === 'utente' || 
                       field === 'key' || field === 'indirizzo';
    
    if (field === 'url') {
        const newElement = document.createElement('a');
        newElement.href = newValue || '#';
        newElement.className = 'editable-field url-field scrollable-text';
        newElement.dataset.value = newValue || '-';
        newElement.dataset.field = field;
        newElement.dataset.id = id;
        newElement.dataset.type = type;
        newElement.textContent = newValue || '-';
        newElement.target = '_blank';
        newElement.rel = 'noopener noreferrer';
        container.replaceWith(newElement);
    } else {
        const tagName = originalElement.tagName === 'H3' ? 'h3' : 'span';
        const newElement = document.createElement(tagName);
        newElement.textContent = isSensitive && newValue ? '••••••••••••' : (newValue || '-');
        newElement.dataset.value = newValue || '-';
        newElement.dataset.field = field;
        newElement.dataset.id = id;
        newElement.dataset.type = type;
        newElement.className = `editable-field scrollable-text${isSensitive ? ' hidden-content' : ''}${field === 'url' ? ' url-field' : ''}`;
        if (isSensitive && (field === 'nota' || field === 'key' || field === 'indirizzo')) {
            newElement.dataset[field] = 'true';
        }
        container.replaceWith(newElement);
    }

    // Aggiorna i dati
    if (type === 'password') {
        modificaPassword(id, field, newValue);
    } else if (type === 'card') {
        modificaCarta(id, field, newValue);
    } else if (type === 'wallet') {
        modificaWallet(id, field, newValue);
    }

    aggiungiEventListenersEditabili();
    mostraMessaggio('Modifica salvata con successo!', 'successo');
}

// Annulla la modifica
function annullaModifica(originalElement, container, value, field, id, type) {
    if (field === 'url') {
        const newElement = document.createElement('a');
        newElement.href = value || '#';
        newElement.className = 'editable-field url-field scrollable-text';
        newElement.dataset.value = value || '-';
        newElement.dataset.field = field;
        newElement.dataset.id = id;
        newElement.dataset.type = type;
        newElement.textContent = value || '-';
        newElement.target = '_blank';
        newElement.rel = 'noopener noreferrer';
        container.replaceWith(newElement);
    } else {
        const tagName = originalElement.tagName === 'H3' ? 'h3' : 'span';
        const newElement = document.createElement(tagName);
        const isSensitive = field === 'username' || field === 'password' || field === 'nota' || 
                            field === 'pan' || field === 'dataScadenza' || 
                            field === 'cvv' || field === 'pin' || field === 'utente' || 
                            field === 'key' || field === 'indirizzo';
        newElement.textContent = isSensitive && value !== '-' ? '••••••••••••' : (value || '-');
        newElement.dataset.value = value || '-';
        newElement.dataset.field = field;
        newElement.dataset.id = id;
        newElement.dataset.type = type;
        newElement.className = `editable-field scrollable-text${isSensitive ? ' hidden-content' : ''}${field === 'url' ? ' url-field' : ''}`;
        if (isSensitive && (field === 'nota' || field === 'key' || field === 'indirizzo')) {
            newElement.dataset[field] = 'true';
        }
        container.replaceWith(newElement);
    }

    aggiungiEventListenersEditabili();
}

// Gestione contenuti nascosti
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

// Copia negli appunti
function copiaTestoAppunti(testo, tipo) {
    if (testo === '-') return;
    navigator.clipboard.writeText(testo)
        .then(() => mostraMessaggio(`${tipo} copiato negli appunti!`, 'successo'))
        .catch(() => mostraMessaggio('Errore durante la copia', 'errore'));
}

// Aggiungi password
function aggiungiPassword() {
    const nuovaPassword = {
        id: generaIdUnivoco(),
        piattaforma: '-',
        username: '',
        password: generaPasswordCasuale(),
        url: '',
        categoria: '',
        nota: ''
    };
    datiCaricati.passwords.push(nuovaPassword);
    ordinaDati();
    mostraDati(datiCaricati);
    popolaFiltri(datiCaricati);
    mostraMessaggio('Nuova password aggiunta! Clicca sui campi per modificarli.', 'successo');
}

// Aggiungi carta
function aggiungiCarta() {
    if (!datiCaricati.cards) datiCaricati.cards = [];
    const nuovaCarta = {
        id: generaIdUnivoco(),
        ente: 'Nuovo Ente',
        pan: '',
        dataScadenza: '',
        cvv: '',
        pin: '',
        nota: '',
        circuito: ''
    };
    datiCaricati.cards.push(nuovaCarta);
    ordinaDati();
    mostraDati(datiCaricati);
    popolaFiltri(datiCaricati);
    mostraMessaggio('Nuova carta aggiunta! Clicca sui campi per modificarli.', 'successo');
}

// Aggiungi wallet
function aggiungiWallet() {
    const nuovoWallet = {
        id: generaIdUnivoco(),
        wallet: 'Nuovo Wallet',
        utente: '',
        password: generaPasswordCasuale(),
        key: '',
        indirizzo: '',
        tipologia: '',
        nota: ''
    };
    datiCaricati.wallets.push(nuovoWallet);
    ordinaDati();
    mostraDati(datiCaricati);
    popolaFiltri(datiCaricati);
    mostraMessaggio('Nuovo wallet aggiunto! Clicca sui campi per modificarli.', 'successo');
}

// Modifica password
function modificaPassword(id, field, value) {
    const password = datiCaricati.passwords.find(pwd => pwd.id === id);
    if (password) {
        password[field] = value;
        popolaFiltri(datiCaricati);
        ordinaDati();
        mostraDati(datiCaricati);
    }
}

// Modifica carta
function modificaCarta(id, field, value) {
    if (datiCaricati.cards) {
        const card = datiCaricati.cards.find(card => card.id === id);
        if (card) {
            card[field] = value;
            popolaFiltri(datiCaricati);
            ordinaDati();
            mostraDati(datiCaricati);
        }
    }
}

// Modifica wallet
function modificaWallet(id, field, value) {
    const wallet = datiCaricati.wallets.find(wallet => wallet.id === id);
    if (wallet) {
        wallet[field] = value;
        popolaFiltri(datiCaricati);
        ordinaDati();
        mostraDati(datiCaricati);
    }
}

// Mostra modale per confermare eliminazione
function mostraModaleEliminazione(id, type) {
    let itemName = '';
    if (type === 'password') {
        const pwd = datiCaricati.passwords.find(pwd => pwd.id === id);
        itemName = pwd?.piattaforma || 'Password';
    } else if (type === 'card') {
        const card = datiCaricati.cards.find(card => card.id === id);
        itemName = card?.ente || 'Carta';
    } else if (type === 'wallet') {
        const wallet = datiCaricati.wallets.find(wallet => wallet.id === id);
        itemName = wallet?.wallet || 'Wallet';
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h3');
    title.textContent = 'Conferma Eliminazione';
    modalContent.appendChild(title);
    
    const message = document.createElement('p');
    message.innerHTML = `Sei sicuro di voler eliminare <strong>"${escapeHtml(itemName)}"</strong>?<br><br>Questa azione non può essere annullata.`;
    modalContent.appendChild(message);
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-danger';
    confirmBtn.innerHTML = '<i class="fas fa-trash"></i> Elimina';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i> Annulla';
    
    btnContainer.appendChild(confirmBtn);
    btnContainer.appendChild(cancelBtn);
    modalContent.appendChild(btnContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    confirmBtn.addEventListener('click', () => {
        if (type === 'password') {
            datiCaricati.passwords = datiCaricati.passwords.filter(pwd => pwd.id !== id);
            mostraMessaggio('Password eliminata con successo!', 'successo');
        } else if (type === 'card') {
            datiCaricati.cards = datiCaricati.cards.filter(card => card.id !== id);
            mostraMessaggio('Carta eliminata con successo!', 'successo');
        } else if (type === 'wallet') {
            datiCaricati.wallets = datiCaricati.wallets.filter(wallet => wallet.id !== id);
            mostraMessaggio('Wallet eliminato con successo!', 'successo');
        }
        mostraDati(datiCaricati);
        popolaFiltri(datiCaricati);
        document.body.removeChild(modal);
    });

    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Filtra i dati
function filtraDati() {
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
    const passwordsFiltrate = datiCaricati.passwords.filter(pwd => {
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
    const walletsFiltrati = datiCaricati.wallets.filter(wallet => {
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

// Popola tutti i filtri
function popolaFiltri(dati) {
    popolaFiltroCategorie(dati);
    popolaFiltroCircuiti(dati);
    popolaFiltroTipologie(dati);
}

// Popola filtro categorie per password
function popolaFiltroCategorie(dati) {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    
    const categorie = new Set();
    dati.passwords.forEach(pwd => {
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

// Popola filtro circuiti per carte
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

// Popola filtro tipologie per wallet
function popolaFiltroTipologie(dati) {
    const select = document.getElementById('typeFilter');
    if (!select) return;
    
    const tipologie = new Set();
    dati.wallets.forEach(wallet => {
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

// Scarica file
async function scaricaFile(encrypted) {
    if (!datiCaricati) {
        mostraMessaggio('Nessun dato da salvare', 'errore');
        return;
    }

    const password = document.getElementById('encryptPassword')?.value || '';
    
    if (encrypted && password.length < 8) {
        mostraMessaggio('La password deve essere di almeno 8 caratteri', 'errore');
        return;
    }
    
    try {
        let contenuto;
        if (encrypted) {
            mostraMessaggio('Crittografia in corso...', 'info');
            contenuto = await criptaDati(datiCaricati, password);
        } else {
            contenuto = JSON.stringify(datiCaricati, null, 2);
        }
        
        const blob = new Blob([contenuto], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passwords${encrypted ? '_encrypted' : ''}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostraMessaggio('File scaricato con successo!', 'successo');
    } catch (errore) {
        console.error('Errore salvataggio:', errore);
        mostraMessaggio('Errore durante il salvataggio: ' + errore.message, 'errore');
    }
}

// Genera una password casuale
function generaPasswordCasuale(lunghezza = 16) {
    const caratteri = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?éèçò°ùà§';
    const array = new Uint8Array(lunghezza);
    window.crypto.getRandomValues(array);
    
    let password = '';
    for (let i = 0; i < lunghezza; i++) {
        password += caratteri[array[i] % caratteri.length];
    }
    return password;
}

// Utility per mostrare messaggi toast
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

// Utility per escapare HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}