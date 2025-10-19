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
            "Utente": "",
            "Password": "",
            "Nota": "Account principale Amazon",
            "url": "https://amazon.it",
            "categoria": "Shopping"
        },
        {
            "piattaforma": "eBay",
            "Utente": "",
            "Password": "",
            "Nota": "Account per acquisti online",
            "url": "https://ebay.com",
            "categoria": "Shopping"
        },
        {
            "piattaforma": "AliExpress",
            "Utente": "",
            "Password": "",
            "Nota": "Acquisti internazionali",
            "url": "https://aliexpress.com",
            "categoria": "Shopping"
        },
        {
            "piattaforma": "Etsy",
            "Utente": "",
            "Password": "",
            "Nota": "Acquisti di prodotti artigianali",
            "url": "https://etsy.com",
            "categoria": "Shopping"
        },
        {
            "piattaforma": "Zalando",
            "Utente": "",
            "Password": "",
            "Nota": "Acquisti di moda",
            "url": "https://zalando.com",
            "categoria": "Shopping"
        },
        {
            "piattaforma": "Shein",
            "Utente": "",
            "Password": "",
            "Nota": "Abbigliamento economico",
            "url": "https://shein.com",
            "categoria": "Shopping"
        },
        {
            "piattaforma": "Facebook",
            "Utente": "",
            "Password": "",
            "Nota": "Account personale",
            "url": "https://facebook.com",
            "categoria": "Social"
        },
        {
            "piattaforma": "Instagram",
            "Utente": "",
            "Password": "",
            "Nota": "Account per foto e storie",
            "url": "https://instagram.com",
            "categoria": "Social"
        },
        {
            "piattaforma": "LinkedIn",
            "Utente": "",
            "Password": "",
            "Nota": "Profilo professionale",
            "url": "https://linkedin.com",
            "categoria": "Social"
        },
        {
            "piattaforma": "X",
            "Utente": "",
            "Password": "",
            "Nota": "Account per microblogging",
            "url": "https://x.com",
            "categoria": "Social"
        },
        {
            "piattaforma": "TikTok",
            "Utente": "",
            "Password": "",
            "Nota": "Account per video brevi",
            "url": "https://tiktok.com",
            "categoria": "Social"
        },
        {
            "piattaforma": "Snapchat",
            "Utente": "",
            "Password": "",
            "Nota": "Account per snap e storie",
            "url": "https://snapchat.com",
            "categoria": "Social"
        },
        {
            "piattaforma": "Reddit",
            "Utente": "",
            "Password": "",
            "Nota": "Account per forum e discussioni",
            "url": "https://reddit.com",
            "categoria": "Social"
        },
        {
            "piattaforma": "Discord",
            "Utente": "",
            "Password": "",
            "Nota": "Account per community gaming",
            "url": "https://discord.com",
            "categoria": "Social"
        },
        {
            "piattaforma": "Pinterest",
            "Utente": "",
            "Password": "",
            "Nota": "Account per ispirazioni",
            "url": "https://pinterest.com",
            "categoria": "Social"
        },
        {
            "piattaforma": "Netflix",
            "Utente": "",
            "Password": "",
            "Nota": "Account streaming principale",
            "url": "https://netflix.com",
            "categoria": "Streaming"
        },
        {
            "piattaforma": "Spotify",
            "Utente": "",
            "Password": "",
            "Nota": "Account per musica",
            "url": "https://spotify.com",
            "categoria": "Streaming"
        },
        {
            "piattaforma": "YouTube Premium",
            "Utente": "",
            "Password": "",
            "Nota": "Account per video senza pubblicità",
            "url": "https://youtube.com/premium",
            "categoria": "Streaming"
        },
        {
            "piattaforma": "Disney+",
            "Utente": "",
            "Password": "",
            "Nota": "Account per film e serie Disney",
            "url": "https://disneyplus.com",
            "categoria": "Streaming"
        },
        {
            "piattaforma": "Amazon Prime Video",
            "Utente": "",
            "Password": "",
            "Nota": "Account per streaming Prime",
            "url": "https://primevideo.com",
            "categoria": "Streaming"
        },
        {
            "piattaforma": "Banca Generica",
            "Utente": "",
            "Password": "",
            "Nota": "Conto corrente principale",
            "url": "https://banca-generica.com",
            "categoria": "Banca"
        },
        {
            "piattaforma": "Apple ID",
            "Utente": "",
            "Password": "",
            "Nota": "Account Apple principale",
            "url": "https://appleid.apple.com",
            "categoria": "Tech"
        },
        {
            "piattaforma": "Telefono",
            "Utente": "",
            "Password": "",
            "Nota": "Codice sblocco telefono",
            "url": "",
            "categoria": "Dispositivi"
        }
    ],
    "cards": [
        {
            "ente": "Banca Generica",
            "pan": "1111222233334444",
            "dataScadenza": "09/27",
            "cvv": "012",
            "pin": "0123",
            "Nota": "Carta di debito generica",
            "circuito": "Maestro"
        }
    ],
    "wallets": [
        {
            "wallet": "MetaMask",
            "Utente": "",
            "Password": "",
            "key": "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3",
            "indirizzo": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            "Nota": "Wallet principale ETH",
            "tipologia": "Crypto"
        },
        {
            "wallet": "Apple Wallet",
            "Utente": "",
            "Password": "",
            "key": "",
            "indirizzo": "",
            "Nota": "Apple Pay e carte",
            "tipologia": "Carte"
        },
        {
            "wallet": "Samsung Pay",
            "Utente": "",
            "Password": "",
            "key": "",
            "indirizzo": "",
            "Nota": "Samsung Pay e carte associate",
            "tipologia": "Carte"
        },
        {
            "wallet": "Google Pay",
            "Utente": "",
            "Password": "",
            "key": "",
            "indirizzo": "",
            "Nota": "Google Pay e carte digitali",
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
        a.download = 'Beskytter™_esempio.json';
        
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