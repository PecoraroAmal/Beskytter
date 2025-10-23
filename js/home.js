// Displays passwords in the dedicated section
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

    passwords.forEach(pwd => {
        const card = document.createElement('div');
        card.className = 'preview-card-item';
        card.innerHTML = `
            <h3 class="scrollable-text">${escapeHtml(pwd.platform)}</h3>
            <div class="field-container">
                <label class="field-label">Username</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(pwd.username)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Username')">
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
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Password')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Notes</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(pwd.notes || '-')}" data-note="true">${pwd.notes ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Notes')">
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
                <label class="field-label">Category</label>
                <div class="content-wrapper">
                    <span class="scrollable-text" data-value="${escapeHtml(pwd.category || '-')}" data-field="category">${escapeHtml(pwd.category || '-')}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Displays cards in the dedicated section
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

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'preview-card-item';
        cardElement.innerHTML = `
            <h3 class="scrollable-text">${escapeHtml(card.issuer)}</h3>
            <div class="field-container">
                <label class="field-label">PAN</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(card.pan)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'PAN')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Expiry Date</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(card.expiryDate)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Expiry Date')">
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
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'CVV/CVC2')">
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
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'PIN')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Notes</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(card.notes || '-')}" data-note="true">${card.notes ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Notes')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Network</label>
                <div class="content-wrapper">
                    <span class="scrollable-text" data-value="${escapeHtml(card.network || '-')}" data-field="network">${escapeHtml(card.network || '-')}</span>
                </div>
            </div>
        `;
        container.appendChild(cardElement);
    });
}

// Displays wallets in the dedicated section
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

    wallets.forEach(wallet => {
        const card = document.createElement('div');
        card.className = 'preview-card-item';
        card.innerHTML = `
            <h3 class="scrollable-text">${escapeHtml(wallet.wallet)}</h3>
            <div class="field-container">
                <label class="field-label">User</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(wallet.user)}">••••••••••••</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'User')">
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
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Password')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Key</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(wallet.key || '-')}" data-key="true">${wallet.key ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Key')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Address</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(wallet.address || '-')}" data-address="true">${wallet.address ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Address')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Notes</label>
                <div class="content-wrapper">
                    <span class="hidden-content scrollable-text" data-value="${escapeHtml(wallet.notes || '-')}" data-note="true">${wallet.notes ? '••••••••••••' : '-'}</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-icon toggle-password" onclick="toggleVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon copy-btn" onclick="copyToClipboard(this.closest('.field-container').querySelector('.hidden-content').dataset.value, 'Notes')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="field-container">
                <label class="field-label">Type</label>
                <div class="content-wrapper">
                    <span class="scrollable-text" data-value="${escapeHtml(wallet.type || '-')}" data-field="type">${escapeHtml(wallet.type || '-')}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}