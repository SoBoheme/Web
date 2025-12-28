const sunPath = '<circle cx="12" cy="12" r="6"></circle>';
const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

/**
 * Met à jour l'icône du bouton thème selon le mode actuel
 */
function updateIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                   (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.innerHTML = isDark ? moonPath : sunPath;
}

/**
 * Alterne entre le mode sombre et le mode clair
 */
function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    if (!current) { current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    updateIcon();
}

/**
 * Affiche/Masque les mentions légales
 */
function toggleLegal() {
    const box = document.getElementById('legal-box');
    if (box) box.style.display = (box.style.display === 'block') ? 'none' : 'block';
}

/**
 * Ouvre une image du slider en plein écran (lightbox)
 */
function openFull(el) { 
    const img = el.querySelector('img');
    if(img) {
        document.getElementById('lightbox-img').src = img.src; 
        document.getElementById('lightbox').style.display = 'flex'; 
    }
}

/**
 * Génère et télécharge la VCard (contact)
 */
function downloadVCard() {
    const vcard = "BEGIN:VCARD\nVERSION:3.0\nFN:So Bohème\nORG:So Bohème;\nEMAIL:boutique.soboheme@gmail.com\nADR;TYPE=WORK:;;56 RUE DE LA REPUBLIQUE;Guebwiller;68500;France\nEND:VCARD";
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); 
    a.href = url; 
    a.download = "So_Boheme.vcf"; 
    a.click();
}

/**
 * Initialisation de l'effet de vague sur la description
 */
const waveText = document.querySelector('.desc');
if (waveText) {
    const content = waveText.innerText;
    // On découpe le texte en lettres isolées pour pouvoir les animer
    waveText.innerHTML = content.split('').map((letter, index) => {
        return letter === ' ' ? ' ' : `<span class="letter" style="animation-delay: ${index * 0.05}s">${letter}</span>`;
    }).join('');

    // Déclenchement de l'animation au clic
    waveText.addEventListener('click', () => {
        waveText.classList.remove('wave-active');
        void waveText.offsetWidth; // "Re-flow" pour relancer l'animation
        waveText.classList.add('wave-active');
        
        // On retire la classe après 2 secondes pour pouvoir recliquer
        setTimeout(() => {
            waveText.classList.remove('wave-active');
        }, 2000);
    });
}

// Initialisation au chargement
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateIcon);
document.addEventListener('DOMContentLoaded', updateIcon);