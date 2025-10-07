document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadExample');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadEsempio);
    }
});

async function downloadEsempio() {
    const esempioJson = {
        "passwords": [
            {
                "piattaforma": "Amazon",
                "username": "user@email.com",
                "password": "Amz_2023_Shop!",
                "nota": "Account principale Amazon",
                "url": "https://amazon.it",
                "categoria": "Shopping"
            },
            {
                "piattaforma": "Apple ID",
                "username": "apple.user@icloud.com",
                "password": "Apple2023_ID!",
                "nota": "Account Apple principale",
                "url": "https://appleid.apple.com",
                "categoria": "Tech"
            },
            {
                "piattaforma": "iPhone",
                "username": "",
                "password": "123456",
                "nota": "Codice sblocco iPhone",
                "url": "",
                "categoria": "Dispositivi"
            }
        ],
        "cards": [
            {
                "ente": "Banca XYZ",
                "pan": "1234567890123456",
                "dataScadenza": "12/25",
                "cvv": "123",
                "pin": "1234",
                "nota": "Carta principale",
                "circuito": "Visa"
            },
            {
                "ente": "Banca ABC",
                "pan": "9876543210987654",
                "dataScadenza": "06/26",
                "cvv": "456",
                "pin": "5678",
                "nota": "Carta secondaria",
                "circuito": "MasterCard"
            }
        ],
        "wallets": [
            {
                "wallet": "MetaMask",
                "utente": "crypto_user",
                "password": "MetaMask2023!",
                "key": "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3",
                "indirizzo": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                "nota": "Wallet principale ETH",
                "tipologia": "Crypto"
            },
            {
                "wallet": "Apple Wallet",
                "utente": "apple.user@icloud.com",
                "password": "AppleWallet2023!",
                "key": "",
                "indirizzo": "",
                "nota": "Apple Pay e carte",
                "tipologia": "Carte"
            },
            {
                "wallet": "Samsung Pay",
                "utente": "samsung.user@email.com",
                "password": "SamsungPay2023!",
                "key": "",
                "indirizzo": "",
                "nota": "Samsung Pay e carte associate",
                "tipologia": "Carte"
            },
            {
                "wallet": "Google Pay",
                "utente": "user.gmail@gmail.com",
                "password": "GooglePay2023!",
                "key": "",
                "indirizzo": "",
                "nota": "Google Pay e carte digitali",
                "tipologia": "Carte"
            }
        ]
    };

    try {
        const blob = new Blob([JSON.stringify(esempioJson, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'Beskytter_esempio.json';
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostraMessaggio('File di esempio scaricato con successo!', 'successo');
    } catch (error) {
        console.error('Errore durante il download:', error);
        mostraMessaggio('Errore durante il download del file', 'errore');
    }
}


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
        background: ${tipo === 'successo' ? 'var(--success)' : 'var(--danger)'};
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