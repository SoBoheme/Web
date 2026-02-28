/* ============================================================
   SO'BÔHÈME — Script
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. ICÔNES THÈME
   ------------------------------------------------------------ */
const ICONS = {
    sun:  `<circle cx="12" cy="12" r="5"/>
           <line x1="12" y1="1"  x2="12" y2="3"/>
           <line x1="12" y1="21" x2="12" y2="23"/>
           <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
           <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
           <line x1="1"  y1="12" x2="3"  y2="12"/>
           <line x1="21" y1="12" x2="23" y2="12"/>
           <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
           <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>`,
    moon: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`
};


/* ------------------------------------------------------------
   2. THÈME CLAIR / SOMBRE
   ------------------------------------------------------------ */

/** Met à jour l'icône du bouton selon le thème actif */
function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
        || (!document.documentElement.getAttribute('data-theme')
            && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const icon = document.getElementById('theme-icon');
    if (icon) icon.innerHTML = isDark ? ICONS.moon : ICONS.sun;
}

/** Bascule entre le mode clair et sombre */
function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    if (!current) {
        current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    updateThemeIcon();
}


/* ------------------------------------------------------------
   3. HEADER — STICKY + MASQUAGE AU SCROLL
   ------------------------------------------------------------ */
function initHeader() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    let lastY   = 0;
    let ticking = false;

    function handleScroll() {
        const y = window.scrollY;

        // Fond glassmorphism après 80 px
        header.classList.toggle('scrolled', y > 80);

        // Masquer en descente, réafficher en remontée
        if (y > lastY && y > 220) {
            header.classList.add('hidden');
        } else if (y < lastY - 8) {
            header.classList.remove('hidden');
        }

        lastY   = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });
}


/* ------------------------------------------------------------
   4. MENU MOBILE
   ------------------------------------------------------------ */
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const btn  = document.getElementById('burgerBtn');
    if (!menu) return;

    const isOpen = menu.classList.toggle('open');
    btn?.classList.toggle('active', isOpen);
    btn?.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}


/* ------------------------------------------------------------
   5. SCROLL REVEAL — INTERSECTION OBSERVER
   ------------------------------------------------------------ */
function initReveal() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


/* ------------------------------------------------------------
   6. PARALLAX LÉGER SUR LES IMAGES ESPRIT
   ------------------------------------------------------------ */
function initParallax() {
    const imgs = document.querySelectorAll('.esprit-img-wrap');
    if (!imgs.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function applyParallax() {
        imgs.forEach(el => {
            const rect  = el.getBoundingClientRect();
            const viewH = window.innerHeight;
            const pct   = (viewH - rect.top) / (viewH + rect.height);
            const offset = (pct - 0.5) * 50; // amplitude douce
            el.style.transform = `translateY(${offset.toFixed(1)}px)`;
        });
    }

    window.addEventListener('scroll', () => requestAnimationFrame(applyParallax), { passive: true });
    applyParallax();
}


/* ------------------------------------------------------------
   7. LIGHTBOX (remplace la modale produit)
   ------------------------------------------------------------ */

/** Ouvre la lightbox avec l'image et l'alt voulus */
function openLightbox(src, alt) {
    const lb  = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    if (!lb || !img) return;

    img.src = src;
    img.alt = alt || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
}

/** Ferme la lightbox — force=true pour fermer sans vérification de cible */
function closeLightbox(event, force = false) {
    const lb = document.getElementById('lightbox');
    if (!lb) return;

    if (force || (event && event.target === lb)) {
        lb.classList.remove('open');
        document.body.style.overflow = '';
    }
}


/* ------------------------------------------------------------
   8. HORAIRES DYNAMIQUES
   ------------------------------------------------------------ */

/** Table des plages d'ouverture (heure décimale) */
const SCHEDULE = {
    0: { name: 'Dimanche',  slots: [] },
    1: { name: 'Lundi',     slots: [{ o: 14, c: 19 }] },
    2: { name: 'Mardi',     slots: [{ o: 9, c: 12 }, { o: 14, c: 19 }] },
    3: { name: 'Mercredi',  slots: [{ o: 9, c: 12 }, { o: 14, c: 19 }] },
    4: { name: 'Jeudi',     slots: [{ o: 9, c: 12 }, { o: 14, c: 19 }] },
    5: { name: 'Vendredi',  slots: [{ o: 9, c: 12 }, { o: 14, c: 19 }] },
    6: { name: 'Samedi',    slots: [{ o: 9, c: 12 }, { o: 14, c: 18 }] },
};

/** Formate un nombre décimal en "HHhMM" */
function fmtH(decimal) {
    const hh = Math.floor(decimal);
    const mm = Math.round((decimal - hh) * 60);
    return `${String(hh).padStart(2, '0')}h${mm > 0 ? String(mm).padStart(2, '0') : '00'}`;
}

function isOpenNow() {
    const now  = new Date();
    const day  = now.getDay();
    const h    = now.getHours() + now.getMinutes() / 60;
    return (SCHEDULE[day]?.slots || []).some(s => h >= s.o && h < s.c);
}

function getNextOpen() {
    const now = new Date();
    const day = now.getDay();
    const h   = now.getHours() + now.getMinutes() / 60;

    // Prochain créneau aujourd'hui ?
    for (const s of (SCHEDULE[day]?.slots || [])) {
        if (h < s.o) return `Ouvre aujourd'hui à ${fmtH(s.o)}`;
    }

    // Prochain jour ouvré
    for (let d = 1; d <= 7; d++) {
        const nd    = (day + d) % 7;
        const slots = SCHEDULE[nd]?.slots || [];
        if (slots.length) {
            const label = d === 1 ? 'demain' : SCHEDULE[nd].name.toLowerCase();
            return `Ouvre ${label} à ${fmtH(slots[0].o)}`;
        }
    }
    return '';
}

function updateHoursUI() {
    const badge    = document.getElementById('statusBadge');
    const statusTx = document.getElementById('statusText');
    const nextEl   = document.getElementById('nextOpening');
    if (!badge || !statusTx) return;

    const open = isOpenNow();
    badge.className   = `status-pill ${open ? 'open' : 'closed'}`;
    statusTx.textContent = open ? 'Ouvert maintenant' : 'Fermé';

    if (nextEl) nextEl.textContent = open ? '' : getNextOpen();

    // Jour courant mis en valeur
    const today = new Date().getDay();
    document.querySelectorAll('.schedule-table tr').forEach(r => r.classList.remove('is-today'));
    document.getElementById(`day-${today}`)?.classList.add('is-today');
}


/* ------------------------------------------------------------
   9. GÉNÉRATION VCARD
   ------------------------------------------------------------ */
async function downloadVCard() {
    let photo = '';
    try {
        const res  = await fetch('images/logo.png');
        const blob = await res.blob();
        photo = await new Promise(resolve => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result.split(',')[1]);
            r.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Logo VCard non chargé :', e);
    }

    const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "FN:SO'BÔHÈME",
        "ORG:SO'BÔHÈME;Boutique de mode & accessoires",
        "TITLE:Boutique de mode féminine",
        "TEL;TYPE=CELL,VOICE:+33622411978",
        "TEL;TYPE=WORK,VOICE:+33956918541",
        "EMAIL:boutique.soboheme@gmail.com",
        "ADR;TYPE=WORK:;;56 RUE DE LA REPUBLIQUE;Guebwiller;68500;France",
        "URL:https://soboheme.github.io/Web/",
        "NOTE:Boutique de mode féminine & accessoires uniques à Guebwiller.\\n" +
        "HORAIRES : Lun Fermé/14h-19h · Mar-Ven 9h-12h/14h-19h · Sam 9h-12h/14h-18h · Dim Fermé",
        photo ? `PHOTO;ENCODING=b;TYPE=PNG:${photo}` : null,
        "END:VCARD"
    ].filter(Boolean).join('\n');

    const url = URL.createObjectURL(new Blob([lines], { type: 'text/vcard;charset=utf-8' }));
    Object.assign(document.createElement('a'), { href: url, download: 'SoBoheme.vcf' }).click();
    URL.revokeObjectURL(url);
}


/* ------------------------------------------------------------
   10. INITIALISATION GLOBALE
   ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {

    // --- FIX MOBILE : Verrouillage de la hauteur du Hero ---
    fixHero(); 

    // Thème
    updateThemeIcon();
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', updateThemeIcon);

    // Navigation
    initHeader();

    // Animations
    initReveal();
    initParallax();

    // Horaires (init + rafraîchissement toutes les 60 s)
    updateHoursUI();
    setInterval(updateHoursUI, 60_000);

    // Fermeture menu mobile au clic sur un lien
    document.querySelectorAll('.mobile-menu a').forEach(a => {
        a.addEventListener('click', () => { document.body.style.overflow = ''; });
    });

    // Fermeture lightbox & menus avec Échap
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        closeLightbox(null, true);
        if (document.getElementById('mobileMenu')?.classList.contains('open')) {
            toggleMobileMenu();
        }
    });

    // Accessibilité : lien-row cliquable via clavier
    document.querySelectorAll('.link-row[role="button"]').forEach(el => {
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
        });
    });

});

/* ------------------------------------------------------------
   11. FONCTIONS UTILES (Mobile Fix, etc.)
   ------------------------------------------------------------ */
function fixHero() {
    // On calcule la hauteur réelle en pixels et on l'applique
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--hero-height', `${vh}px`);
}

// On recalcule UNIQUEMENT si on tourne le téléphone (pas au scroll)
window.addEventListener('orientationchange', () => {
    setTimeout(fixHero, 200);
});