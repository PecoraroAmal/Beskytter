// Global variables
let loadedData = null;
let loadedFile = null;
let loadedFileName = null;

// Initialization on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for inputs and filters
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    const decryptBtn = document.getElementById('decryptBtn');
    if (decryptBtn) {
        decryptBtn.addEventListener('click', openFile);
    }
    const passwordSearchInput = document.getElementById('passwordSearchInput');
    if (passwordSearchInput) {
        passwordSearchInput.addEventListener('input', filterData);
    }
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterData);
    }
    const cardSearchInput = document.getElementById('cardSearchInput');
    if (cardSearchInput) {
        cardSearchInput.addEventListener('input', filterData);
    }
    const circuitFilter = document.getElementById('circuitFilter');
    if (circuitFilter) {
        circuitFilter.addEventListener('change', filterData);
    }
    const walletSearchInput = document.getElementById('walletSearchInput');
    if (walletSearchInput) {
        walletSearchInput.addEventListener('input', filterData);
    }
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', filterData);
    }
    const decryptPassword = document.getElementById('decryptPassword');
    if (decryptPassword) {
        decryptPassword.addEventListener('keypress', e => {
            if (e.key === 'Enter') openFile();
        });
    }

    // Handle drag and drop and click for file upload
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
            if (file) handleFileUpload({ target: { files: [file] } });
        });
        uploadZone.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.click();
            }
        });
    }

    // Handle section toggles
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

// Handles the upload of the selected file
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        showMessage('Error: select a valid JSON file', 'error');
        return;
    }

    loadedFileName = file.name;
    const reader = new FileReader();
    reader.onload = e => {
        loadedFile = e.target.result;
        const fileNameElement = document.querySelector('.file-name');
        if (fileNameElement) {
            fileNameElement.textContent = loadedFileName;
        }
        showMessage('File uploaded. Click "Open File" to view it.', 'info');
    };
    reader.readAsText(file);
}

// Opens the uploaded file, with optional decryption
async function openFile() {
    if (!loadedFile) {
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
                await decryptData(loadedFile, password) : 
                JSON.parse(loadedFile);
        } catch (e) {
            throw new Error('Error parsing or decrypting JSON: ' + e.message);
        }

        if (!validateJSONStructure(data)) throw new Error('Invalid JSON structure');

        // Initialize missing sections with empty arrays
        loadedData = {
            passwords: Array.isArray(data.passwords) ? data.passwords : [],
            cards: Array.isArray(data.cards) ? data.cards : [],
            wallets: Array.isArray(data.wallets) ? data.wallets : []
        };
        sortData();
        displayData(loadedData);
        populateFilters(loadedData);

        if (document.getElementById('decryptPassword')) {
            document.getElementById('decryptPassword').value = '';
        }
        loadedFile = null;
        loadedFileName = null;
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

// Validates the structure of the loaded JSON
function validateJSONStructure(data) {
    // Checks that data is an object and each section, if present, is an array
    return data && typeof data === 'object' &&
           (data.passwords === undefined || Array.isArray(data.passwords)) &&
           (data.cards === undefined || Array.isArray(data.cards)) &&
           (data.wallets === undefined || Array.isArray(data.wallets));
}

// Sorts data alphabetically
function sortData() {
    if (!loadedData) return;
    loadedData.passwords.sort((a, b) => a.platform.localeCompare(b.platform, 'en', { sensitivity: 'base' }));
    loadedData.cards?.sort((a, b) => a.issuer.localeCompare(b.issuer, 'en', { sensitivity: 'base' }));
    loadedData.wallets.sort((a, b) => a.wallet.localeCompare(b.wallet, 'en', { sensitivity: 'base' }));
}

// Toggles section visibility
function toggleSection(containerId, button) {
    const container = document.getElementById(containerId);
    if (container) {
        const isHidden = container.classList.contains('hidden');
        container.classList.toggle('hidden');
        button.innerHTML = isHidden ? 
            `<i class="fas fa-eye-slash"></i> Hide ${containerId.replace('Container', '')}` :
            `<i class="fas fa-eye"></i> Show ${containerId.replace('Container', '')}`;
    }
}

// Displays all data in their respective sections
function displayData(data) {
    displayPasswords(data.passwords || []);
    displayCards(data.cards || []);
    displayWallets(data.wallets || []);
}

// Handles visibility of sensitive content
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

// Copies text to clipboard
function copyToClipboard(text, type) {
    if (text === '-') return;
    navigator.clipboard.writeText(text)
        .then(() => showMessage(`${type} copied to clipboard!`, 'success'))
        .catch(() => showMessage('Error during copy', 'error'));
}

// Filters data based on search inputs and filters
function filterData() {
    if (!loadedData) return;

    const passwordSearchInput = document.getElementById('passwordSearchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const cardSearchInput = document.getElementById('cardSearchInput');
    const circuitFilter = document.getElementById('circuitFilter');
    const walletSearchInput = document.getElementById('walletSearchInput');
    const typeFilter = document.getElementById('typeFilter');

    if (!passwordSearchInput || !categoryFilter || !cardSearchInput || !circuitFilter || !walletSearchInput || !typeFilter) return;

    const passwordSearch = passwordSearchInput.value.toLowerCase();
    const category = categoryFilter.value.toLowerCase();
    const cardSearch = cardSearchInput.value.toLowerCase();
    const network = circuitFilter.value.toLowerCase();
    const walletSearch = walletSearchInput.value.toLowerCase();
    const type = typeFilter.value.toLowerCase();

    // Filter passwords
    const filteredPasswords = (loadedData.passwords || []).filter(pwd => {
        const searchMatch = !passwordSearch || 
            pwd.platform.toLowerCase().includes(passwordSearch) ||
            pwd.username.toLowerCase().includes(passwordSearch) ||
            pwd.password.toLowerCase().includes(passwordSearch) ||
            (pwd.url && pwd.url.toLowerCase().includes(passwordSearch)) ||
            (pwd.notes && pwd.notes.toLowerCase().includes(passwordSearch)) ||
            (pwd.category && pwd.category.toLowerCase().includes(passwordSearch));

        const categoryMatch = !category || 
            (pwd.category && pwd.category.toLowerCase() === category);

        return searchMatch && categoryMatch;
    }).sort((a, b) => a.platform.localeCompare(b.platform, 'en', { sensitivity: 'base' }));

    // Filter cards
    const filteredCards = (loadedData.cards || []).filter(card => {
        const searchMatch = !cardSearch || 
            card.issuer.toLowerCase().includes(cardSearch) ||
            card.pan.toLowerCase().includes(cardSearch) ||
            card.expiryDate.toLowerCase().includes(cardSearch) ||
            card.cvv.toLowerCase().includes(cardSearch) ||
            card.pin.toLowerCase().includes(cardSearch) ||
            (card.network && card.network.toLowerCase().includes(cardSearch)) ||
            (card.notes && card.notes.toLowerCase().includes(cardSearch));

        const networkMatch = !network || 
            (card.network && card.network.toLowerCase() === network);

        return searchMatch && networkMatch;
    }).sort((a, b) => a.issuer.localeCompare(b.issuer, 'en', { sensitivity: 'base' }));

    // Filter wallets
    const filteredWallets = (loadedData.wallets || []).filter(wallet => {
        const searchMatch = !walletSearch || 
            wallet.wallet.toLowerCase().includes(walletSearch) ||
            (wallet.user && wallet.user.toLowerCase().includes(walletSearch)) ||
            wallet.password.toLowerCase().includes(walletSearch) ||
            (wallet.key && wallet.key.toLowerCase().includes(walletSearch)) ||
            (wallet.address && wallet.address.toLowerCase().includes(walletSearch)) ||
            (wallet.type && wallet.type.toLowerCase().includes(walletSearch)) ||
            (wallet.notes && wallet.notes.toLowerCase().includes(walletSearch));

        const typeMatch = !type || 
            (wallet.type && wallet.type.toLowerCase() === type);

        return searchMatch && typeMatch;
    }).sort((a, b) => a.wallet.localeCompare(b.wallet, 'en', { sensitivity: 'base' }));

    displayPasswords(filteredPasswords);
    displayCards(filteredCards);
    displayWallets(filteredWallets);
}

// Populates filters for categories, networks, and types
function populateFilters(data) {
    populateCategoryFilter(data);
    populateNetworkFilter(data);
    populateTypeFilter(data);
}

// Populates the category filter for passwords
function populateCategoryFilter(data) {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    const categories = new Set();
    (data.passwords || []).forEach(pwd => {
        if (pwd.category) categories.add(pwd.category);
    });

    select.innerHTML = '<option value="">All Categories</option>';
    Array.from(categories).sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

// Populates the network filter for cards
function populateNetworkFilter(data) {
    const select = document.getElementById('circuitFilter');
    if (!select) return;

    const networks = new Set();
    (data.cards || []).forEach(card => {
        if (card.network) networks.add(card.network);
    });

    select.innerHTML = '<option value="">All Networks</option>';
    Array.from(networks).sort().forEach(network => {
        const option = document.createElement('option');
        option.value = network;
        option.textContent = network;
        select.appendChild(option);
    });
}

// Populates the type filter for wallets
function populateTypeFilter(data) {
    const select = document.getElementById('typeFilter');
    if (!select) return;

    const types = new Set();
    (data.wallets || []).forEach(wallet => {
        if (wallet.type) types.add(wallet.type);
    });

    select.innerHTML = '<option value="">All Types</option>';
    Array.from(types).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        select.appendChild(option);
    });
}

// Shows a toast message for user feedback
function showMessage(text, type) {
    const oldMessage = document.querySelector('.toast-message');
    if (oldMessage) oldMessage.remove();

    const message = document.createElement('div');
    message.className = `toast-message toast-${type}`;
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'var(--success)' : 
                     type === 'error' ? 'var(--danger)' : 
                     'var(--primary-color)'};
        color: white;
        border-radius: var(--border-radius);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(message);
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Escapes text to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}