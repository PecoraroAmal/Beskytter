document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadExample');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadEsempio);
    }
});

async function downloadEsempio() {
    try {
        const response = await fetch('test.json');
        if (!response.ok) throw new Error('Errore nel caricamento del file di esempio');
        
        const contenuto = await response.text();
        const blob = new Blob([contenuto], { type: 'application/json' });
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