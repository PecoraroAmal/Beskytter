// Global variables (avoid conflicts with homedit.js)
let editLoadedData = { passwords: [], cards: [], wallets: [] };
let editLoadedFile = null;
let editLoadedFileName = null;

// Function to generate a unique ID
function generateUniqueId() {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    });
}

// Initialisation on page load
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners for file input and buttons
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    const decryptBtn = document.getElementById('decryptBtn');
    if (decryptBtn) {
        // Remove any existing listeners to avoid conflicts with homedit.js
        decryptBtn.removeEventListener('click', openFile);
        decryptBtn.addEventListener('click', openFile);
    }
    const decryptPassword = document.getElementById('decryptPassword');
    if (decryptPassword) {
        decryptPassword.addEventListener('keypress', e => {
            if (e.key === 'Enter') openFile();
        });
    }
    const downloadPlainBtn = document.getElementById('downloadPlainBtn');
    if (downloadPlainBtn) {
        downloadPlainBtn.addEventListener('click', () => downloadFile(false));
    }
    const downloadEncryptedBtn = document.getElementById('downloadEncryptedBtn');
    if (downloadEncryptedBtn) {
        downloadEncryptedBtn.addEventListener('click', () => downloadFile(true));
    }
    const addPasswordBtn = document.getElementById('addPasswordBtn');
    if (addPasswordBtn) {
        addPasswordBtn.addEventListener('click', addPassword);
    }
    const addCardBtn = document.getElementById('addCardBtn');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', addCard);
    }
    const addWalletBtn = document.getElementById('addWalletBtn');
    if (addWalletBtn) {
        addWalletBtn.addEventListener('click', addWallet);
    }
});

// Handle file upload (triggered by file input or drag-and-drop from homedit.js)
function handleFileUpload(event) {
    const files = event.target?.files || event.dataTransfer?.files;
    const file = files?.[0];
    
    if (!file) {
        showMessage('No file selected', 'error');
        return;
    }
    
    if (!file.name.endsWith('.json')) {
        showMessage('Error: select a valid JSON file', 'error');
        if (event.target) event.target.value = '';
        return;
    }
    
    editLoadedFileName = file.name;
    const reader = new FileReader();
    
    reader.onerror = () => {
        showMessage('Error reading file', 'error');
        editLoadedFile = null;
        editLoadedFileName = null;
        if (event.target) event.target.value = '';
    };
    
    reader.onload = e => {
        try {
            editLoadedFile = e.target.result;
            const fileNameElement = document.querySelector('.file-name');
            if (fileNameElement) {
                fileNameElement.textContent = editLoadedFileName;
            }
            showMessage('File uploaded. Click "Open File" to view it.', 'info');
        } catch (error) {
            showMessage('Error uploading file', 'error');
            editLoadedFile = null;
            editLoadedFileName = null;
            if (event.target) event.target.value = '';
        }
    };
    
    reader.readAsText(file);
}

// Open the uploaded file, with optional decryption
async function openFile() {
    if (!editLoadedFile) {
        showMessage('Select a valid JSON file first', 'error');
        return;
    }
    
    const password = document.getElementById('decryptPassword')?.value || '';
    const btn = document.getElementById('decryptBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening...';
    }
    
    try {
        let data;
        try {
            data = password ? 
                await decryptData(editLoadedFile, password) : 
                JSON.parse(editLoadedFile);
        } catch (e) {
            throw new Error('Error parsing or decrypting JSON: ' + e.message);
        }
        
        if (!validateJSONStructure(data)) throw new Error('Invalid JSON structure');
        
        // Initialize missing sections with empty arrays and add unique IDs
        editLoadedData = {
            passwords: Array.isArray(data.passwords) ? data.passwords : [],
            cards: Array.isArray(data.cards) ? data.cards : [],
            wallets: Array.isArray(data.wallets) ? data.wallets : []
        };
        
        editLoadedData.passwords.forEach(pwd => {
            if (!pwd.id) pwd.id = generateUniqueId();
            // Rename fields to match edit.js
            pwd.platform = pwd.piattaforma || pwd.platform || '-';
            pwd.username = pwd.username || '';
            pwd.password = pwd.password || '';
            pwd.url = pwd.url || '';
            pwd.category = pwd.categoria || pwd.category || '';
            pwd.note = pwd.nota || pwd.note || '';
        });
        editLoadedData.cards.forEach(card => {
            if (!card.id) card.id = generateUniqueId();
            card.issuer = card.ente || card.issuer || 'New Issuer';
            card.pan = card.pan || '';
            card.expiryDate = card.dataScadenza || card.expiryDate || '';
            card.cvv = card.cvv || '';
            card.pin = card.pin || '';
            card.note = card.nota || card.note || '';
            card.network = card.circuito || card.network || '';
        });
        editLoadedData.wallets.forEach(wallet => {
            if (!wallet.id) wallet.id = generateUniqueId();
            wallet.wallet = wallet.wallet || 'New Wallet';
            wallet.user = wallet.utente || wallet.user || '';
            wallet.password = wallet.password || '';
            wallet.key = wallet.key || '';
            wallet.address = wallet.indirizzo || wallet.address || '';
            wallet.type = wallet.tipologia || wallet.type || '';
            wallet.note = wallet.nota || wallet.note || '';
        });
        
        sortData();
        displayData(editLoadedData);
        populateFilters(editLoadedData);
        
        if (document.getElementById('decryptPassword')) {
            document.getElementById('decryptPassword').value = '';
        }
        editLoadedFile = null;
        editLoadedFileName = null;
        if (document.getElementById('fileInput')) {
            document.getElementById('fileInput').value = '';
        }
        const fileNameElement = document.querySelector('.file-name');
        if (fileNameElement) {
            fileNameElement.textContent = '';
        }
        
        showMessage('File opened successfully!', 'success');
    } catch (error) {
        console.error('Error opening file:', error);
        showMessage(password ? 
            'Incorrect password or corrupted file' : 
            'Invalid file. If encrypted, enter the password', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-unlock"></i> Open File';
        }
    }
}

// Display passwords
function displayPasswords(passwords) {
    const container = document.getElementById('passwordContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!passwords.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lock"></i>
                <p>No passwords saved</p>
            </div>`;
        return;
    }
    
    passwords.forEach((pwd, index) => {
        const card = document.createElement('div');
        card.className = 'preview-card-item';
        card.innerHTML = `
            <h3 class="editable-field scrollable-text" data-value="${escapeHtml(pwd.platform)}" data-field="platform" data-id="${pwd.id}" data-type="password">${escapeHtml(pwd.platform)}</h3>
            <div class="field-container">
                <label class="field-label">Username</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(pwd.username)}" data-field="username" data-id="${pwd.id}" data-type="password">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Username')">
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
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Password')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Note</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(pwd.note || '-')}" data-field="note" data-id="${pwd.id}" data-type="password" data-note="true">${pwd.note ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Note')">
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
                <label class="field-label">Category</label>
                <div class="content-wrapper">
                    <span class="editable-field scrollable-text" data-value="${escapeHtml(pwd.category || '-')}" data-field="category" data-id="${pwd.id}" data-type="password">${escapeHtml(pwd.category || '-')}</span>
                </div>
            </div>
            <div class="btn-container">
                <button class="btn btn-danger" onclick="showDeleteModal('${pwd.id}', 'password')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    addEditableEventListeners();
}

// Display cards
function displayCards(cards) {
    const container = document.getElementById('cardContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!cards.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-credit-card"></i>
                <p>No cards saved</p>
            </div>`;
        return;
    }
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'preview-card-item';
        cardElement.innerHTML = `
            <h3 class="editable-field scrollable-text" data-value="${escapeHtml(card.issuer)}" data-field="issuer" data-id="${card.id}" data-type="card">${escapeHtml(card.issuer)}</h3>    
            <div class="field-container">
                <label class="field-label">PAN</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(card.pan)}" data-field="pan" data-id="${card.id}" data-type="card">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'PAN')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Expiry Date</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(card.expiryDate)}" data-field="expiryDate" data-id="${card.id}" data-type="card">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Expiry Date')">
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
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'CVV')">
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
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'PIN')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Note</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(card.note || '-')}" data-field="note" data-id="${card.id}" data-type="card" data-note="true">${card.note ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Note')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Network</label>
                <div class="content-wrapper">
                    <span class="editable-field scrollable-text" data-value="${escapeHtml(card.network || '-')}" data-field="network" data-id="${card.id}" data-type="card">${escapeHtml(card.network || '-')}</span>
                </div>
            </div>
            <div class="btn-container">
                <button class="btn btn-danger" onclick="showDeleteModal('${card.id}', 'card')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        container.appendChild(cardElement);
    });

    addEditableEventListeners();
}

// Display wallets
function displayWallets(wallets) {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!wallets.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wallet"></i>
                <p>No wallets saved</p>
            </div>`;
        return;
    }
    
    wallets.forEach((wallet, index) => {
        const walletElement = document.createElement('div');
        walletElement.className = 'preview-card-item';
        walletElement.innerHTML = `
            <h3 class="editable-field scrollable-text" data-value="${escapeHtml(wallet.wallet)}" data-field="wallet" data-id="${wallet.id}" data-type="wallet">${escapeHtml(wallet.wallet)}</h3>
            <div class="field-container">
                <label class="field-label">User</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(wallet.user)}" data-field="user" data-id="${wallet.id}" data-type="wallet">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'User')">
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
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Password')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Key</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(wallet.key || '-')}" data-field="key" data-id="${wallet.id}" data-type="wallet" data-key="true">${wallet.key ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Key')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Address</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(wallet.address || '-')}" data-field="address" data-id="${wallet.id}" data-type="wallet" data-address="true">${wallet.address ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Address')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Type</label>
                <div class="content-wrapper">
                    <span class="editable-field scrollable-text" data-value="${escapeHtml(wallet.type || '-')}" data-field="type" data-id="${wallet.id}" data-type="wallet">${escapeHtml(wallet.type || '-')}</span>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Note</label>
                <div class="content-wrapper">
                    <span class="editable-field hidden-content scrollable-text" data-value="${escapeHtml(wallet.note || '-')}" data-field="note" data-id="${wallet.id}" data-type="wallet" data-note="true">${wallet.note ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, 'Note')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="btn-container">
                <button class="btn btn-danger" onclick="showDeleteModal('${wallet.id}', 'wallet')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        container.appendChild(walletElement);
    });

    addEditableEventListeners();
}

// Add event listeners for editable fields
function addEditableEventListeners() {
    const editableFields = document.querySelectorAll('.editable-field');
    editableFields.forEach(field => {
        field.addEventListener('click', () => {
            const value = field.dataset.value;
            const id = field.dataset.id;
            const type = field.dataset.type;
            const fieldName = field.dataset.field;
            const parent = field.closest('.field-container') || field.parentElement;
            const label = parent?.querySelector('.field-label') || null;

            // Create input field
            const input = document.createElement('input');
            input.type = fieldName === 'password' || fieldName === 'cvv' || fieldName === 'pin' || fieldName === 'key' ? 'password' : 'text';
            input.className = 'input-field scrollable-text';
            input.value = value !== '-' ? value : '';

            // Create buttons
            const saveButton = document.createElement('button');
            saveButton.className = 'btn btn-icon';
            saveButton.innerHTML = '<i class="fas fa-save"></i>';
            saveButton.addEventListener('click', () => saveEdit(field, parent, input.value, fieldName, id, type, label));

            const cancelButton = document.createElement('button');
            cancelButton.className = 'btn btn-icon';
            cancelButton.innerHTML = '<i class="fas fa-times"></i>';
            cancelButton.addEventListener('click', () => cancelEdit(field, parent, value, fieldName, id, type, label));

            // Create button group
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'button-group';
            buttonGroup.appendChild(saveButton);
            buttonGroup.appendChild(cancelButton);

            // Create content wrapper for input
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'content-wrapper';
            contentWrapper.appendChild(input);

            // Rebuild parent structure
            parent.innerHTML = '';
            if (label) parent.appendChild(label);
            parent.appendChild(contentWrapper);
            parent.appendChild(buttonGroup);
            input.focus();

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEdit(field, parent, input.value, fieldName, id, type, label);
                }
            });
        });
    });
}

// Save edit
function saveEdit(originalElement, container, newValue, field, id, type, label) {
    const isSensitive = field === 'username' || field === 'password' || field === 'note' ||
                        field === 'pan' || field === 'expiryDate' ||
                        field === 'cvv' || field === 'pin' || field === 'user' ||
                        field === 'key' || field === 'address';

    let newElement;
    if (field === 'url') {
        newElement = document.createElement('a');
        newElement.href = newValue || '#';
        newElement.className = 'editable-field url-field scrollable-text';
        newElement.target = '_blank';
        newElement.rel = 'noopener noreferrer';
    } else {
        const tagName = originalElement.tagName === 'H3' ? 'h3' : 'span';
        newElement = document.createElement(tagName);
        newElement.className = `editable-field scrollable-text${isSensitive ? ' hidden-content' : ''}${field === 'url' ? ' url-field' : ''}`;
    }

    newElement.textContent = isSensitive && newValue !== '-' ? '••••••••••••' : (newValue || '-');
    newElement.dataset.value = newValue || '-';
    newElement.dataset.field = field;
    newElement.dataset.id = id;
    newElement.dataset.type = type;
    if (isSensitive && (field === 'note' || field === 'key' || field === 'address')) {
        newElement.dataset[field] = 'true';
    }

    // Rebuild field container
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';
    contentWrapper.appendChild(newElement);

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    if (isSensitive) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'btn btn-icon toggle-password';
        toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
        toggleButton.setAttribute('onclick', 'toggleVisibility(this)');
        buttonGroup.appendChild(toggleButton);

        const copyButton = document.createElement('button');
        copyButton.className = 'btn btn-icon copy-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.setAttribute('onclick', `copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, '${field.charAt(0).toUpperCase() + field.slice(1)}')`);
        buttonGroup.appendChild(copyButton);
    }

    container.innerHTML = '';
    if (label) container.appendChild(label);
    container.appendChild(contentWrapper);
    if (isSensitive) container.appendChild(buttonGroup);

    // Update data
    if (type === 'password') {
        editPassword(id, field, newValue);
    } else if (type === 'card') {
        editCard(id, field, newValue);
    } else if (type === 'wallet') {
        editWallet(id, field, newValue);
    }

    addEditableEventListeners();
    showMessage('Edit saved successfully!', 'success');
}

// Cancel edit
function cancelEdit(originalElement, container, value, field, id, type, label) {
    const isSensitive = field === 'username' || field === 'password' || field === 'note' ||
                        field === 'pan' || field === 'expiryDate' ||
                        field === 'cvv' || field === 'pin' || field === 'user' ||
                        field === 'key' || field === 'address';

    let newElement;
    if (field === 'url') {
        newElement = document.createElement('a');
        newElement.href = value || '#';
        newElement.className = 'editable-field url-field scrollable-text';
        newElement.target = '_blank';
        newElement.rel = 'noopener noreferrer';
    } else {
        const tagName = originalElement.tagName === 'H3' ? 'h3' : 'span';
        newElement = document.createElement(tagName);
        newElement.className = `editable-field scrollable-text${isSensitive ? ' hidden-content' : ''}${field === 'url' ? ' url-field' : ''}`;
    }

    newElement.textContent = isSensitive && value !== '-' ? '••••••••••••' : (value || '-');
    newElement.dataset.value = value || '-';
    newElement.dataset.field = field;
    newElement.dataset.id = id;
    newElement.dataset.type = type;
    if (isSensitive && (field === 'note' || field === 'key' || field === 'address')) {
        newElement.dataset[field] = 'true';
    }

    // Rebuild field container
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';
    contentWrapper.appendChild(newElement);

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    if (isSensitive) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'btn btn-icon toggle-password';
        toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
        toggleButton.setAttribute('onclick', 'toggleVisibility(this)');
        buttonGroup.appendChild(toggleButton);

        const copyButton = document.createElement('button');
        copyButton.className = 'btn btn-icon copy-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.setAttribute('onclick', `copyToClipboard(this.closest('.field-container').querySelector('.editable-field').dataset.value, '${field.charAt(0).toUpperCase() + field.slice(1)}')`);
        buttonGroup.appendChild(copyButton);
    }

    container.innerHTML = '';
    if (label) container.appendChild(label);
    container.appendChild(contentWrapper);
    if (isSensitive) container.appendChild(buttonGroup);

    addEditableEventListeners();
}

// Add password
function addPassword() {
    const newPassword = {
        id: generateUniqueId(),
        platform: '-',
        username: '',
        password: generateRandomPassword(),
        url: '',
        category: '',
        note: ''
    };
    editLoadedData.passwords.push(newPassword);
    sortData();
    displayData(editLoadedData);
    populateFilters(editLoadedData);
    showMessage('New password added! Click on fields to edit them.', 'success');
}

// Add card
function addCard() {
    if (!editLoadedData.cards) editLoadedData.cards = [];
    const newCard = {
        id: generateUniqueId(),
        issuer: 'New Issuer',
        pan: '',
        expiryDate: '',
        cvv: '',
        pin: '',
        note: '',
        network: ''
    };
    editLoadedData.cards.push(newCard);
    sortData();
    displayData(editLoadedData);
    populateFilters(editLoadedData);
    showMessage('New card added! Click on fields to edit them.', 'success');
}

// Add wallet
function addWallet() {
    const newWallet = {
        id: generateUniqueId(),
        wallet: 'New Wallet',
        user: '',
        password: generateRandomPassword(),
        key: '',
        address: '',
        type: '',
        note: ''
    };
    editLoadedData.wallets.push(newWallet);
    sortData();
    displayData(editLoadedData);
    populateFilters(editLoadedData);
    showMessage('New wallet added! Click on fields to edit them.', 'success');
}

// Edit password
function editPassword(id, field, value) {
    const password = editLoadedData.passwords.find(pwd => pwd.id === id);
    if (password) {
        password[field] = value;
        populateFilters(editLoadedData);
        sortData();
        displayData(editLoadedData);
    }
}

// Edit card
function editCard(id, field, value) {
    if (editLoadedData.cards) {
        const card = editLoadedData.cards.find(card => card.id === id);
        if (card) {
            card[field] = value;
            populateFilters(editLoadedData);
            sortData();
            displayData(editLoadedData);
        }
    }
}

// Edit wallet
function editWallet(id, field, value) {
    const wallet = editLoadedData.wallets.find(wallet => wallet.id === id);
    if (wallet) {
        wallet[field] = value;
        populateFilters(editLoadedData);
        sortData();
        displayData(editLoadedData);
    }
}

// Show modal for confirming deletion
function showDeleteModal(id, type) {
    let itemName = '';
    if (type === 'password') {
        const pwd = editLoadedData.passwords.find(pwd => pwd.id === id);
        itemName = pwd?.platform || 'Password';
    } else if (type === 'card') {
        const card = editLoadedData.cards.find(card => card.id === id);
        itemName = card?.issuer || 'Card';
    } else if (type === 'wallet') {
        const wallet = editLoadedData.wallets.find(wallet => wallet.id === id);
        itemName = wallet?.wallet || 'Wallet';
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h3');
    title.textContent = 'Confirm Deletion';
    modalContent.appendChild(title);
    
    const message = document.createElement('p');
    message.innerHTML = `Are you sure you want to delete <strong>"${escapeHtml(itemName)}"</strong>?<br><br>This action cannot be undone.`;
    modalContent.appendChild(message);
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-danger';
    confirmBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
    
    btnContainer.appendChild(confirmBtn);
    btnContainer.appendChild(cancelBtn);
    modalContent.appendChild(btnContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    confirmBtn.addEventListener('click', () => {
        if (type === 'password') {
            editLoadedData.passwords = editLoadedData.passwords.filter(pwd => pwd.id !== id);
            showMessage('Password deleted successfully!', 'success');
        } else if (type === 'card') {
            editLoadedData.cards = editLoadedData.cards.filter(card => card.id !== id);
            showMessage('Card deleted successfully!', 'success');
        } else if (type === 'wallet') {
            editLoadedData.wallets = editLoadedData.wallets.filter(wallet => wallet.id !== id);
            showMessage('Wallet deleted successfully!', 'success');
        }
        displayData(editLoadedData);
        populateFilters(editLoadedData);
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

// Download file
async function downloadFile(encrypted) {
    if (!editLoadedData) {
        showMessage('No data to save', 'error');
        return;
    }

    const password = document.getElementById('encryptPassword')?.value || '';
    
    if (encrypted && password.length < 8) {
        showMessage('The password must be at least 8 characters long', 'error');
        return;
    }
    
    try {
        let content;
        if (encrypted) {
            showMessage('Encrypting...', 'info');
            content = await encryptData(editLoadedData, password);
        } else {
            content = JSON.stringify(editLoadedData, null, 2);
        }
        
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passwords${encrypted ? '_encrypted' : ''}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('File downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error saving:', error);
        showMessage('Error during saving: ' + error.message, 'error');
    }
}

// Generate a random password
function generateRandomPassword(length = 16) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?éèçò°ùà§';
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += characters[array[i] % characters.length];
    }
    return password;
}