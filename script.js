const sunPath = '<circle cx="12" cy="12" r="6"></circle>';
const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

/**
 * Met à jour l'icône du bouton thème selon le mode actuel
 */
function updateIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                   (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.getElementById('theme-icon').innerHTML = isDark ? moonPath : sunPath;
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
    box.style.display = (box.style.display === 'block') ? 'none' : 'block';
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

// Initialisation
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateIcon);
updateIcon();

/**
 * Marque le jour actuel dans le tableau des horaires
 */
function markCurrentDay() {
    const today = new Date().getDay(); // Retourne 0 pour Dimanche, 1 pour Lundi, etc.
    const activeRow = document.getElementById(`day-${today}`);
    if (activeRow) {
        activeRow.classList.add('is-today');
    }
}

// Appeler la fonction au chargement
window.addEventListener('DOMContentLoaded', markCurrentDay);