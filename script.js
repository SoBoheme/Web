const sunPath = '<circle cx="12" cy="12" r="6"></circle>';
const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

function updateIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                   (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.getElementById('theme-icon').innerHTML = isDark ? moonPath : sunPath;
}

function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    if (!current) { current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    updateIcon();
}

function openFull(el) { 
    const img = el.querySelector('img');
    if(img) {
        document.getElementById('lightbox-img').src = img.src; 
        document.getElementById('lightbox').style.display = 'flex'; 
    }
}

function downloadVCard() {
    const vcard = "BEGIN:VCARD\nVERSION:3.0\nFN:So Bohème\nORG:So Bohème;\nEMAIL:boutique.soboheme@gmail.com\nADR;TYPE=WORK:;;56 RUE DE LA REPUBLIQUE;Guebwiller;68500;France\nEND:VCARD";
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); 
    a.href = url; a.download = "So_Boheme.vcf"; a.click();
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateIcon);
updateIcon();