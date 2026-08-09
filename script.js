// Default Profile Data (fallback)
const defaultProfile = {
    name: 'Demo',
    tagline: 'Web Developer & Designer',
    bio: 'Passionate about creating beautiful, functional websites and digital experiences. Specializing in modern web technologies and creative design solutions.',
    logo: 'DR',
    phone: '+91 9500388259',
    email: 'dilliraja@example.com',
    whatsapp: '919500388259',
        profileImage: '',
        social: { instagram: '#', facebook: '#', linkedin: '#', naukri: '#', twitter: '#', github: '#', youtube: '#', whatsapp: '#', telegram: '#' },
    stats: { projects: '50', clients: '30', years: '3' },
    copyright: '© 2026 demo. All Rights Reserved. developed by <a href="https://dillistudio.github.io/raj" target="_blank">DilliStudio</a>',
    website: 'https://dilliraja.lovable.app',
    services: [],
    pricing: [],
    links: []
};

// Global config loaded from assets
let adminConfig = null;

// Load admin config from admin.json
async function loadAdminConfig() {
    try {
        const resp = await fetch('admin.json');
        if (resp.ok) {
            adminConfig = await resp.json();
            return adminConfig;
        }
    } catch (e) {}
    return null;
}

// Profile Manager
class ProfileManager {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        this.data = await this.load();
        this.applyAll();
    }

    async load() {
        const saved = localStorage.getItem('profileData');
        if (saved) {
            try { return { ...defaultProfile, ...JSON.parse(saved) }; } catch (e) {}
        }
        // Load from admin.json
        try {
            const resp = await fetch('admin.json');
            if (resp.ok) {
                const adminData = await resp.json();
                return { ...defaultProfile, ...adminData.profile, services: adminData.services || [], pricing: adminData.pricing || [], links: adminData.links || [] };
            }
        } catch (e) {}
        return { ...defaultProfile };
    }

    save() {
        localStorage.setItem('profileData', JSON.stringify(this.data));
    }

    applyAll() {
        const d = this.data;

        // Home page
        this.setText('#homeName', d.name);
        this.setText('#homeTagline', d.tagline);
        this.setText('#logoText', d.logo);
        if (d.profileImage) this.setImg('#homeProfileImg', d.profileImage);

        // About page
        this.setText('#aboutName', d.name);
        this.setText('#aboutRole', d.tagline);
        this.setText('#aboutBio', d.bio);
        if (d.profileImage) this.setImg('#aboutProfileImg', d.profileImage);

        // Contact page
        this.setText('#contactPhone', d.phone);
        this.setAttr('#contactPhone', 'href', 'tel:' + d.phone.replace(/\s/g, ''));
        this.setText('#contactEmail', d.email);
        this.setAttr('#contactEmail', 'href', 'mailto:' + d.email);
        this.setAttr('#contactWhatsapp', 'href', 'https://wa.me/' + d.whatsapp);

        // CTA button
        const cta = document.getElementById('ctaWhatsapp');
        if (cta) cta.href = 'https://wa.me/' + d.whatsapp + '?text=' + encodeURIComponent('Hi! I\'m interested in your services.');

        // Social links
        if (d.social) {
            this.setAttr('#linkInstagram', 'href', d.social.instagram || '#');
            this.setAttr('#linkFacebook', 'href', d.social.facebook || '#');
            this.setAttr('#linkLinkedin', 'href', d.social.linkedin || '#');
            this.setAttr('#linkNaukri', 'href', d.social.naukri || '#');
            this.setAttr('#linkTwitter', 'href', d.social.twitter || '#');
            this.setAttr('#linkGithub', 'href', d.social.github || '#');
        }

        // Upload preview
        if (d.profileImage) this.setImg('#uploadPreviewImg', d.profileImage);

        // Stats
        if (d.stats) {
            document.querySelectorAll('.stat-card .stat-number').forEach(el => {
                const label = el.nextElementSibling?.textContent;
                if (label === 'Projects' && d.stats.projects) el.dataset.count = d.stats.projects;
                if (label === 'Clients' && d.stats.clients) el.dataset.count = d.stats.clients;
                if (label === 'Years Exp' && d.stats.years) el.dataset.count = d.stats.years;
            });
        }

        // Footer
        if (d.copyright || d.website) {
            document.querySelectorAll('.footer-content p').forEach(el => {
                el.innerHTML = `${d.copyright || '© 2026 demo. All Rights Reserved. developed by <a href="https://dillistudio.github.io/raj" target="_blank">DilliStudio</a>'}`;
            });
        }

        // Services
        if (d.services && d.services.length > 0) {
            const grid = document.querySelector('.services-grid');
            if (grid) {
                const serviceImages = JSON.parse(localStorage.getItem('serviceImages') || '{}');
                grid.innerHTML = d.services.slice(0, 4).map(s => `
                    <div class="service-card" data-category="services" data-service="${s.id}">
                        <div class="service-icon-wrap"><i class="${s.icon || 'fas fa-star'}"></i></div>
                        <h3>${s.title}</h3>
                        <p>${s.demos?.[0]?.title || 'Service'}</p>
                    </div>
                `).join('');
            }
        }
    }

    setText(sel, val) {
        const el = document.querySelector(sel);
        if (el && val !== undefined && val !== null) el.textContent = val;
    }

    setImg(sel, src) {
        const el = document.querySelector(sel);
        if (el && src) el.src = src;
    }

    setAttr(sel, attr, val) {
        const el = document.querySelector(sel);
        if (el) el.setAttribute(attr, val || '#');
    }
}

const profile = new ProfileManager();

// Sound System
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.isMuted = localStorage.getItem('soundMuted') === 'true';
        try { this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }

    createSound(freq, type, dur) {
        if (!this.audioContext || this.isMuted) return;
        try {
            if (this.audioContext.state === 'suspended') this.audioContext.resume();
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain); gain.connect(this.audioContext.destination);
            osc.frequency.value = freq; osc.type = type;
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + dur);
            osc.start(); osc.stop(this.audioContext.currentTime + dur);
        } catch (e) {}
    }

    playClick() { this.createSound(800, 'sine', 0.08); }
    playNavigate() { this.createSound(600, 'sine', 0.1); setTimeout(() => this.createSound(800, 'sine', 0.1), 80); }
    playHover() { this.createSound(400, 'sine', 0.04); }
    playSuccess() { this.createSound(523, 'sine', 0.1); setTimeout(() => this.createSound(659, 'sine', 0.1), 80); setTimeout(() => this.createSound(784, 'sine', 0.15), 160); }
    playError() { this.createSound(200, 'square', 0.2); }
    toggleMute() { this.isMuted = !this.isMuted; localStorage.setItem('soundMuted', this.isMuted); return this.isMuted; }
}

const sound = new SoundSystem();

// Theme System - initialized after adminConfig loads
let theme = null;

class ThemeSystem {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || adminConfig?.settings?.theme || 'dark';
        this.currentColor = localStorage.getItem('accentColor') || adminConfig?.settings?.accentColor || '#6c5ce7';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.documentElement.style.setProperty('--accent', this.currentColor);
        document.documentElement.style.setProperty('--accent-light', this.lightenColor(this.currentColor, 40));
        this.applyColor(this.currentColor);
        this.init();
    }

    init() {
        document.querySelectorAll('#colorPickerBtn, #colorPickerBtn2').forEach(btn => {
            btn?.addEventListener('click', () => this.togglePicker());
        });
        document.getElementById('closePicker')?.addEventListener('click', () => this.closePicker());
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setTheme(btn.dataset.theme));
        });
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                this.applyColor(opt.dataset.color);
            });
        });
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('colorPickerPanel');
            if (panel?.classList.contains('active') && !panel.contains(e.target) && !e.target.closest('#colorPickerBtn') && !e.target.closest('#colorPickerBtn2')) {
                this.closePicker();
            }
        });
    }

    togglePicker() {
        const panel = document.getElementById('colorPickerPanel');
        let overlay = document.querySelector('.overlay');
        if (!overlay) { overlay = document.createElement('div'); overlay.className = 'overlay'; document.body.appendChild(overlay); }
        panel.classList.toggle('active');
        overlay.classList.toggle('active');
        overlay.onclick = () => this.closePicker();
    }

    closePicker() {
        document.getElementById('colorPickerPanel')?.classList.remove('active');
        document.querySelector('.overlay')?.classList.remove('active');
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
        sound?.playClick();
    }

    applyColor(color) {
        this.currentColor = color;
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--accent-light', this.lightenColor(color, 40));
        localStorage.setItem('accentColor', color);
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.toggle('active', opt.dataset.color === color));
    }

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0xFF) + amt);
        const B = Math.min(255, (num & 0xFF) + amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }
}

// Theme initialized later after adminConfig loads

// Toast
function showToast(msg, type = 'success') {
    let toast = document.querySelector('.toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>${msg}`;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Navigation
class Navigation {
    constructor() {
        this.currentPage = 'page1';
        this.history = ['page1'];
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                sound.playNavigate();
                const target = e.target.closest('.back-btn').dataset.page;
                if (target) this.navigate(target); else this.goBack();
            });
        });
        document.getElementById('nextBtn')?.addEventListener('click', () => { sound.playNavigate(); this.navigate('page2'); });
        document.getElementById('categoryBtn')?.addEventListener('click', () => { sound.playNavigate(); this.navigate('page2'); });

        // Check for /admin URL
        if (window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')) {
            setTimeout(() => this.navigate('page4'), 100);
        }
    }

    navigate(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId)?.classList.add('active');
        this.currentPage = pageId;
        this.history.push(pageId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Re-apply profile data on every page change
        profile.applyAll();
    }

    goBack() {
        if (this.history.length > 1) {
            this.history.pop();
            const prev = this.history[this.history.length - 1];
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(prev)?.classList.add('active');
            this.currentPage = prev;
        }
    }
}

const nav = new Navigation();

// Category System
class CategorySystem {
    constructor() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => { sound.playNavigate(); this.showCategory(card.dataset.category); });
        });
        document.querySelectorAll('.service-item').forEach(item => {
            item.addEventListener('click', () => { sound.playClick(); this.showServiceDetail(item.dataset.service); });
        });
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', () => {
                sound.playClick();
                const s = card.dataset.service;
                if (s) { this.showCategory('services'); setTimeout(() => this.showServiceDetail(s), 300); }
            });
        });
    }

    showCategory(cat) {
        document.getElementById('page3Title').textContent = { about: 'About Me', services: 'Services', social: 'Social Media', contact: 'Contact', download: 'Download', form: 'Contact Form' }[cat] || cat;
        document.querySelectorAll('.detail-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`${cat}-section`)?.classList.remove('hidden');
        // Populate dynamic content
        if (cat === 'services') this.populateServicesList();
        if (cat === 'social') this.populateSocialLinks();
        if (cat === 'download') this.populateDownloads();
        nav.navigate('page3');
    }

    populateServicesList() {
        const services = profile.data.services || adminConfig?.services || [];
        const container = document.querySelector('#services-section .services-list');
        if (!container || services.length === 0) return;
        const serviceImages = JSON.parse(localStorage.getItem('serviceImages') || '{}');
        container.innerHTML = services.map(s => `
            <div class="service-item" data-service="${s.id}">
                <div class="service-icon"><i class="${s.icon || 'fas fa-star'}"></i></div>
                <div class="service-info"><h3>${s.title}</h3><p>${s.demos?.[0]?.title || 'Service'}</p></div>
                <i class="fas fa-chevron-right"></i>
            </div>
        `).join('');
        container.querySelectorAll('.service-item').forEach(item => {
            item.addEventListener('click', () => { sound.playClick(); this.showServiceDetail(item.dataset.service); });
        });
    }

    populateSocialLinks() {
        const d = profile.data;
        const links = d.social || {};
        const customLinks = d.links || [];
        const socialSection = document.getElementById('social-section');
        if (!socialSection) return;
        let html = '<div class="social-links">';
        html += `<a href="${links.instagram || '#'}" class="social-link instagram" target="_blank"><i class="fab fa-instagram"></i><span>Instagram</span></a>`;
        html += `<a href="${links.facebook || '#'}" class="social-link facebook" target="_blank"><i class="fab fa-facebook"></i><span>Facebook</span></a>`;
        html += `<a href="${links.linkedin || '#'}" class="social-link linkedin" target="_blank"><i class="fab fa-linkedin"></i><span>LinkedIn</span></a>`;
        html += `<a href="${links.naukri || '#'}" class="social-link naukri" target="_blank"><i class="fas fa-briefcase"></i><span>Naukri</span></a>`;
        html += `<a href="${links.twitter || '#'}" class="social-link twitter" target="_blank"><i class="fab fa-twitter"></i><span>Twitter</span></a>`;
        html += `<a href="${links.github || '#'}" class="social-link github" target="_blank"><i class="fab fa-github"></i><span>GitHub</span></a>`;
        html += `<a href="${links.youtube || '#'}" class="social-link youtube" target="_blank"><i class="fab fa-youtube"></i><span>YouTube</span></a>`;
        html += `<a href="${links.whatsapp || '#'}" class="social-link whatsapp" target="_blank"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>`;
        html += `<a href="${links.telegram || '#'}" class="social-link telegram" target="_blank"><i class="fab fa-telegram"></i><span>Telegram</span></a>`;
        customLinks.forEach(l => {
            html += `<a href="${l.url}" class="social-link" target="_blank"><i class="fas fa-link"></i><span>${l.label}</span></a>`;
        });
        html += '</div>';
        socialSection.innerHTML = html;
    }

    populateDownloads() {
        const filesData = JSON.parse(localStorage.getItem('filesData') || '{}');
        const container = document.getElementById('downloadOptions');
        if (!container) return;
        let html = '';
        if (filesData.resumeFile) html += `<button class="download-btn" onclick="contact.downloadFile('resumeFile','Resume')"><i class="fas fa-file-pdf"></i><span>Download Resume</span></button>`;
        if (filesData.businessCardFile) html += `<button class="download-btn" onclick="contact.downloadFile('businessCardFile','BusinessCard')"><i class="fas fa-id-card"></i><span>Download Business Card</span></button>`;
        if (filesData.portfolioFile) html += `<button class="download-btn" onclick="contact.downloadFile('portfolioFile','Portfolio')"><i class="fas fa-book"></i><span>Download Portfolio</span></button>`;
        if (filesData.customFile1) html += `<button class="download-btn" onclick="contact.downloadCustomFile('customFile1')"><i class="fas fa-file"></i><span>${filesData.customFile1.name || 'Custom File 1'}</span></button>`;
        if (filesData.customFile2) html += `<button class="download-btn" onclick="contact.downloadCustomFile('customFile2')"><i class="fas fa-file"></i><span>${filesData.customFile2.name || 'Custom File 2'}</span></button>`;
        html += `<button class="download-btn" onclick="contact.saveContact()"><i class="fas fa-address-book"></i><span>Save Contact</span></button>`;
        html += `<button class="download-btn" onclick="contact.share()"><i class="fas fa-share-alt"></i><span>Share</span></button>`;
        container.innerHTML = html;
    }

    showServiceDetail(service) {
        const services = profile.data.services || adminConfig?.services || [];
        const d = services.find(s => s.id === service);
        if (!d) return;
        const serviceFiles = JSON.parse(localStorage.getItem('serviceFiles') || '{}');
        const svcData = serviceFiles[service] || {};
        let html = `<h2>${d.title}</h2>`;
        d.demos?.forEach(demo => {
            const imgSrc = svcData.image || demo.image || '';
            html += `<div class="service-demo">`;
            if (imgSrc) html += `<img src="${imgSrc}" alt="${demo.title}">`;
            html += `<h3>${demo.title}</h3><p>${demo.description}</p>`;
            if (demo.subs) demo.subs.forEach(sub => { html += `<div class="sub-service"><strong>${sub.title}</strong><p>${sub.desc}</p></div>`; });
            html += '</div>';
        });
        if (svcData.file) {
            html += `<div style="margin-top:15px;padding:12px;background:var(--bg-card);border-radius:12px;border:1px solid var(--border-color)">
                <p style="font-size:0.85rem;margin-bottom:8px"><i class="fas fa-file" style="color:var(--accent)"></i> Attached File</p>
                <button onclick="categories.downloadServiceFile('${service}')" style="background:var(--accent);color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:0.8rem"><i class="fas fa-download"></i> Download ${svcData.fileName || 'File'}</button>
            </div>`;
        }
        document.getElementById('serviceDetailContent').innerHTML = html;
        document.querySelectorAll('.detail-section').forEach(s => s.classList.add('hidden'));
        document.getElementById('service-detail')?.classList.remove('hidden');
    }

    downloadServiceFile(svcId) {
        const serviceFiles = JSON.parse(localStorage.getItem('serviceFiles') || '{}');
        const svcData = serviceFiles[svcId];
        if (!svcData?.file) { showToast('No file attached', 'error'); return; }
        const a = document.createElement('a');
        a.href = svcData.file;
        a.download = svcData.fileName || 'service-file';
        a.click();
        sound.playSuccess();
        showToast('Downloading ' + (svcData.fileName || 'file'));
    }
}

const categories = new CategorySystem();

// Contact System
class ContactSystem {
    constructor() {
        document.getElementById('whatsappBtn')?.addEventListener('click', (e) => {
            e.preventDefault(); sound.playClick();
            window.open(`https://wa.me/${profile.data.whatsapp}?text=${encodeURIComponent('Hi! I\'m interested in your services.')}`, '_blank');
        });
        document.getElementById('saveContact')?.addEventListener('click', () => { sound.playSuccess(); this.saveContact(); });
        document.getElementById('shareBtn')?.addEventListener('click', () => { sound.playClick(); this.share(); });
        document.getElementById('downloadResume')?.addEventListener('click', () => { sound.playSuccess(); this.downloadFile('resumeFile', 'Resume'); });
        document.getElementById('downloadBusiness')?.addEventListener('click', () => { sound.playSuccess(); this.downloadFile('businessCardFile', 'BusinessCard'); });
        document.getElementById('downloadPortfolio')?.addEventListener('click', () => { sound.playSuccess(); this.downloadFile('portfolioFile', 'Portfolio'); });
        document.getElementById('contactForm')?.addEventListener('submit', (e) => { e.preventDefault(); sound.playSuccess(); this.submitForm(); });
    }

    downloadFile(key, fallbackName) {
        const filesData = JSON.parse(localStorage.getItem('filesData') || '{}');
        const file = filesData[key];
        if (!file || !file.data) { showToast('No file uploaded yet!', 'error'); return; }
        const a = document.createElement('a');
        a.href = file.data;
        a.download = file.name || fallbackName;
        a.click();
        showToast('Downloading ' + (file.name || fallbackName));
    }

    downloadCustomFile(key) {
        const filesData = JSON.parse(localStorage.getItem('filesData') || '{}');
        const file = filesData[key];
        if (!file || !file.data) return;
        const a = document.createElement('a');
        a.href = file.data;
        a.download = file.name;
        a.click();
    }

    saveContact() {
        const d = profile.data;
        const vCard = `BEGIN:VCARD\nVERSION:3.0\nN:;${d.name};;;\nFN:${d.name}\nORG:Web Developer & Designer\nTEL;TYPE=CELL:${d.phone}\nEMAIL:${d.email}\nURL:dilliraja.lovable.app\nEND:VCARD`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([vCard], { type: 'text/vcard' }));
        a.download = d.name.replace(/\s/g, '_') + '.vcf';
        a.click();
        showToast('Contact saved!');
    }

    share() {
        const d = profile.data;
        const data = { title: d.name + ' - Web Developer', text: 'Check out ' + d.name, url: 'https://dilliraja.lovable.app' };
        if (navigator.share) navigator.share(data).catch(() => this.fallbackShare());
        else this.fallbackShare();
    }

    fallbackShare() {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out ' + profile.data.name + '\nhttps://dilliraja.lovable.app')}`, '_blank');
    }

    submitForm() {
        const name = document.getElementById('formName')?.value;
        const email = document.getElementById('formEmail')?.value;
        const phone = document.getElementById('formPhone')?.value;
        const svc = document.getElementById('service');
        const svcText = svc?.options[svc.selectedIndex]?.text;
        const msg = encodeURIComponent(`*New Inquiry*\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${svcText}\n\nSent from Portfolio`);
        window.open(`https://wa.me/${profile.data.whatsapp}?text=${msg}`, '_blank');
    }
}

const contact = new ContactSystem();

// Settings System
class SettingsSystem {
    constructor() {
        this.isLoggedIn = false;
        this.maxEdits = adminConfig?.admin?.maxEdits ?? -1;
        // Reset if unlimited
        if (this.maxEdits === -1) {
            this.editCount = 0;
            this.locked = false;
            localStorage.removeItem('profileEdits');
            localStorage.removeItem('profileLocked');
        } else {
            this.editCount = parseInt(localStorage.getItem('profileEdits') || '0');
            this.locked = localStorage.getItem('profileLocked') === 'true';
        }
        this.init();
    }

    init() {
        document.getElementById('loginForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.login(); });
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        document.getElementById('saveSettings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('exportProfile')?.addEventListener('click', () => this.exportProfile());
        document.getElementById('importProfile')?.addEventListener('click', () => document.getElementById('importFileInput')?.click());
        document.getElementById('importFileInput')?.addEventListener('change', (e) => this.importProfile(e));
        document.getElementById('exportAdmin')?.addEventListener('click', () => this.exportAdminConfig());
        document.getElementById('uploadBtn')?.addEventListener('click', () => {
            if (this.locked) { showToast('Profile locked!', 'error'); return; }
            document.getElementById('profileImageInput')?.click();
        });
        document.getElementById('uploadPreview')?.addEventListener('click', () => {
            if (this.locked) { showToast('Profile locked!', 'error'); return; }
            document.getElementById('profileImageInput')?.click();
        });
        document.getElementById('profileImageInput')?.addEventListener('change', (e) => this.handleImageUpload(e));

        // Live dynamic updates - instant preview while typing
        this.bindLive('#settingName', v => document.querySelectorAll('#homeName, #aboutName').forEach(el => el.textContent = v));
        this.bindLive('#settingTagline', v => document.querySelectorAll('#homeTagline, #aboutRole').forEach(el => el.textContent = v));
        this.bindLive('#settingBio', v => { const el = document.getElementById('aboutBio'); if (el) el.textContent = v; });
        this.bindLive('#settingLogo', v => { const el = document.getElementById('logoText'); if (el) el.textContent = v.toUpperCase().slice(0, 2); });
        this.bindLive('#settingPhone', v => { const el = document.getElementById('contactPhone'); if (el) { el.textContent = v; el.href = 'tel:' + v.replace(/\s/g, ''); } });
        this.bindLive('#settingEmail', v => { const el = document.getElementById('contactEmail'); if (el) { el.textContent = v; el.href = 'mailto:' + v; } });
        this.bindLive('#settingWhatsapp', v => { const url = 'https://wa.me/' + v; const el = document.getElementById('contactWhatsapp'); if (el) el.href = url; const cta = document.getElementById('ctaWhatsapp'); if (cta) cta.href = url; });
        this.bindLive('#settingInstagram', v => { const el = document.getElementById('linkInstagram'); if (el) el.href = v || '#'; });
        this.bindLive('#settingFacebook', v => { const el = document.getElementById('linkFacebook'); if (el) el.href = v || '#'; });
        this.bindLive('#settingLinkedin', v => { const el = document.getElementById('linkLinkedin'); if (el) el.href = v || '#'; });
        this.bindLive('#settingNaukri', v => { const el = document.getElementById('linkNaukri'); if (el) el.href = v || '#'; });
        this.bindLive('#settingTwitter', v => { const el = document.getElementById('linkTwitter'); if (el) el.href = v || '#'; });
        this.bindLive('#settingGithub', v => { const el = document.getElementById('linkGithub'); if (el) el.href = v || '#'; });

        if (this.locked) this.showLocked();
        this.loadFormValues();
    }

    bindLive(sel, fn) {
        const el = document.querySelector(sel);
        if (el) el.addEventListener('input', () => { if (!this.locked) fn(el.value); });
    }

    login() {
        const user = document.getElementById('loginUser')?.value;
        const pass = document.getElementById('loginPass')?.value;
        // Get credentials from admin config or use defaults
        const adminUser = adminConfig?.admin?.username || 'dilli';
        const adminPass = adminConfig?.admin?.password || 'illid';

        if (user === adminUser && pass === adminPass) {
            this.isLoggedIn = true;
            document.getElementById('loginCard')?.classList.add('hidden');
            document.getElementById('settingsPanel')?.classList.remove('hidden');
            sound.playSuccess();
            showToast(this.locked ? 'Profile locked!' : (this.maxEdits === -1 ? 'Welcome! Unlimited edits enabled.' : `Welcome! ${this.maxEdits - this.editCount} edit${this.maxEdits - this.editCount !== 1 ? 's' : ''} remaining.`));
            this.loadFormValues();
        } else {
            sound.playError();
            const el = document.getElementById('loginError');
            el.textContent = 'Wrong credentials!';
            el.classList.add('show');
            setTimeout(() => el?.classList.remove('show'), 2500);
        }
    }

    showLocked() {
        document.querySelectorAll('#settingsPanel input, #settingsPanel textarea').forEach(el => el.readOnly = true);
        const btn = document.getElementById('saveSettings');
        if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
    }

    logout() {
        this.isLoggedIn = false;
        document.getElementById('loginCard')?.classList.remove('hidden');
        document.getElementById('settingsPanel')?.classList.add('hidden');
        document.getElementById('loginUser').value = '';
        document.getElementById('loginPass').value = '';
        sound.playClick();
        showToast('Logged out');
        window.location.hash = '';
        nav.navigate('page1');
    }

    loadFormValues() {
        const d = profile.data;
        this.setVal('#settingName', d.name);
        this.setVal('#settingTagline', d.tagline);
        this.setVal('#settingBio', d.bio);
        this.setVal('#settingLogo', d.logo);
        this.setVal('#settingPhone', d.phone);
        this.setVal('#settingEmail', d.email);
        this.setVal('#settingWhatsapp', d.whatsapp);
        if (d.social) {
            this.setVal('#settingInstagram', d.social.instagram);
            this.setVal('#settingFacebook', d.social.facebook);
            this.setVal('#settingLinkedin', d.social.linkedin);
            this.setVal('#settingNaukri', d.social.naukri);
            this.setVal('#settingTwitter', d.social.twitter);
            this.setVal('#settingGithub', d.social.github);
            this.setVal('#settingYoutube', d.social.youtube);
            this.setVal('#settingWhatsappSocial', d.social.whatsapp);
            this.setVal('#settingTelegram', d.social.telegram);
        }
        // Stats
        this.setVal('#settingProjects', d.stats?.projects || '50');
        this.setVal('#settingClients', d.stats?.clients || '30');
        this.setVal('#settingYears', d.stats?.years || '3');
        // Footer
        this.setVal('#settingCopyright', d.copyright || '© 2026 demo. All Rights Reserved. developed by <a href="https://dillistudio.github.io/raj" target="_blank">DilliStudio</a>');
        this.setVal('#settingWebsite', d.website || 'https://dilliraja.lovable.app');
        // Services
        const services = d.services && d.services.length > 0 ? d.services : (adminConfig?.services || []);
        this.renderServicesEditor(services);
        // Pricing
        const pricing = d.pricing && d.pricing.length > 0 ? d.pricing : (adminConfig?.pricing || []);
        this.renderPricingEditor(pricing);
        // Init new features
        this.initFileUploads();
        this.initLinksEditor();
        this.initServiceImagesEditor();
        this.initExportSite();
        this.initContactDownloads();
    }

    setVal(sel, val) { const el = document.querySelector(sel); if (el && val && val !== '#') el.value = val; }

    initFileUploads() {
        const fileMap = [
            { input: 'resumeInput', status: 'resumeStatus', key: 'resumeFile' },
            { input: 'businessCardInput', status: 'businessCardStatus', key: 'businessCardFile' },
            { input: 'portfolioInput', status: 'portfolioStatus', key: 'portfolioFile' },
            { input: 'customFile1Input', status: 'customFile1Status', key: 'customFile1' },
            { input: 'customFile2Input', status: 'customFile2Status', key: 'customFile2' }
        ];
        fileMap.forEach(f => {
            const input = document.getElementById(f.input);
            const status = document.getElementById(f.status);
            if (!input) return;
            const saved = JSON.parse(localStorage.getItem('filesData') || '{}');
            if (saved[f.key]) {
                if (status) { status.textContent = saved[f.key].name; status.classList.add('has-file'); }
            }
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 20 * 1024 * 1024) { showToast('File too large! Max 20MB.', 'error'); return; }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const filesData = JSON.parse(localStorage.getItem('filesData') || '{}');
                    filesData[f.key] = { name: file.name, type: file.type, size: file.size, data: ev.target.result };
                    localStorage.setItem('filesData', JSON.stringify(filesData));
                    if (status) { status.textContent = file.name; status.classList.add('has-file'); }
                    sound.playSuccess();
                    showToast(file.name + ' uploaded!');
                };
                reader.readAsDataURL(file);
            });
        });
    }

    initLinksEditor() {
        const saved = profile.data.links || [];
        this.renderLinksEditor(saved);
        document.getElementById('addLinkBtn')?.addEventListener('click', () => this.addLink());
    }

    renderLinksEditor(links) {
        const container = document.getElementById('linksEditor');
        if (!container) return;
        container.innerHTML = links.map((l, i) => `
            <div class="link-item" data-index="${i}">
                <input type="text" class="link-label" value="${l.label || ''}" placeholder="Label (e.g. YouTube)">
                <input type="url" class="link-url" value="${l.url || ''}" placeholder="https://...">
                <button class="remove-link-btn" onclick="this.closest('.link-item').remove()"><i class="fas fa-times"></i></button>
            </div>
        `).join('');
    }

    addLink() {
        const container = document.getElementById('linksEditor');
        if (!container) return;
        container.insertAdjacentHTML('beforeend', `
            <div class="link-item">
                <input type="text" class="link-label" value="" placeholder="Label (e.g. YouTube)">
                <input type="url" class="link-url" value="" placeholder="https://...">
                <button class="remove-link-btn" onclick="this.closest('.link-item').remove()"><i class="fas fa-times"></i></button>
            </div>
        `);
    }

    collectLinks() {
        return Array.from(document.querySelectorAll('#linksEditor .link-item')).map(el => ({
            label: el.querySelector('.link-label')?.value || '',
            url: el.querySelector('.link-url')?.value || ''
        })).filter(l => l.label && l.url);
    }

    initServiceImagesEditor() {
        const services = profile.data.services || adminConfig?.services || [];
        const container = document.getElementById('serviceImagesEditor');
        if (!container) return;
        const savedData = JSON.parse(localStorage.getItem('serviceFiles') || '{}');
        container.innerHTML = services.map((s, i) => {
            const svcData = savedData[s.id] || {};
            const hasImg = svcData.image;
            const hasFile = svcData.file;
            return `
            <div class="editor-item" style="margin-bottom:12px;padding:12px">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                    <div style="flex:1">
                        <strong style="font-size:0.85rem"><i class="${s.icon || 'fas fa-star'}" style="color:var(--accent);margin-right:6px"></i>${s.title}</strong>
                        <p style="font-size:0.75rem;color:var(--text-secondary)">${s.demos?.[0]?.title || 'Demo'}</p>
                    </div>
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
                    <div style="flex:1;min-width:120px">
                        <label style="font-size:0.75rem;color:var(--text-secondary);display:block;margin-bottom:4px"><i class="fas fa-image"></i> Demo Image</label>
                        <div style="display:flex;align-items:center;gap:6px">
                            <img class="svc-img-preview" src="${hasImg || ''}" alt="" style="width:50px;height:35px;object-fit:cover;border-radius:4px;border:1px solid var(--border-color);${hasImg ? '' : 'display:none'}">
                            <label for="svcImg_${i}" style="background:var(--accent);color:white;padding:5px 10px;border-radius:6px;font-size:0.7rem;cursor:pointer;white-space:nowrap"><i class="fas fa-upload"></i> Image</label>
                            <input type="file" id="svcImg_${i}" accept="image/*" style="display:none" data-svc-id="${s.id}" data-type="image">
                        </div>
                    </div>
                    <div style="flex:1;min-width:120px">
                        <label style="font-size:0.75rem;color:var(--text-secondary);display:block;margin-bottom:4px"><i class="fas fa-file"></i> Demo File (PDF/Doc)</label>
                        <div style="display:flex;align-items:center;gap:6px">
                            <span style="font-size:0.7rem;color:${hasFile ? 'var(--success)' : 'var(--text-secondary)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80px">${svcData.fileName || 'No file'}</span>
                            <label for="svcFile_${i}" style="background:var(--secondary);color:white;padding:5px 10px;border-radius:6px;font-size:0.7rem;cursor:pointer;white-space:nowrap"><i class="fas fa-upload"></i> File</label>
                            <input type="file" id="svcFile_${i}" accept=".pdf,.doc,.docx,.zip,.rar,.txt,.xls,.xlsx,.ppt,.pptx" style="display:none" data-svc-id="${s.id}" data-type="file">
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        container.querySelectorAll('input[type=file]').forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 20 * 1024 * 1024) { showToast('File too large! Max 20MB.', 'error'); return; }
                const svcId = input.dataset.svcId;
                const type = input.dataset.type;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const data = JSON.parse(localStorage.getItem('serviceFiles') || '{}');
                    if (!data[svcId]) data[svcId] = {};
                    if (type === 'image') {
                        data[svcId].image = ev.target.result;
                        const preview = input.closest('div').querySelector('.svc-img-preview');
                        if (preview) { preview.src = ev.target.result; preview.style.display = 'block'; }
                    } else {
                        data[svcId].file = ev.target.result;
                        data[svcId].fileName = file.name;
                        data[svcId].fileType = file.type;
                        const status = input.closest('div').querySelector('span');
                        if (status) { status.textContent = file.name; status.style.color = 'var(--success)'; }
                    }
                    localStorage.setItem('serviceFiles', JSON.stringify(data));
                    sound.playSuccess();
                    showToast(file.name + ' uploaded!');
                };
                reader.readAsDataURL(file);
            });
        });
    }

    initExportSite() {
        document.getElementById('exportSite')?.addEventListener('click', () => this.exportEntireSite());
    }

    async exportEntireSite() {
        showToast('Preparing export...');
        const progress = document.createElement('div');
        progress.className = 'export-progress';
        progress.innerHTML = '<div class="spinner"></div><p>Exporting site...</p>';
        document.body.appendChild(progress);

        try {
            const css = await this.fetchText('styles.css');
            const js = await this.fetchText('script.js');

            const profileData = profile.data;
            const filesData = JSON.parse(localStorage.getItem('filesData') || '{}');
            const serviceImages = JSON.parse(localStorage.getItem('serviceImages') || '{}');
            const themeData = {
                theme: localStorage.getItem('theme') || 'dark',
                accentColor: localStorage.getItem('accentColor') || '#6c5ce7',
                soundMuted: localStorage.getItem('soundMuted') || 'false'
            };

            const adminExport = {
                profile: profileData,
                admin: adminConfig?.admin || { username: 'dilli', password: 'illid', maxEdits: -1 },
                settings: themeData,
                services: profileData.services || [],
                pricing: profileData.pricing || [],
                files: filesData,
                serviceImages: serviceImages,
                serviceFiles: JSON.parse(localStorage.getItem('serviceFiles') || '{}'),
                links: profileData.links || []
            };

            const indexHtml = this.generateSiteHtml();

            const files = {
                'index.html': indexHtml,
                'styles.css': css,
                'script.js': js,
                'admin.json': JSON.stringify(adminExport, null, 2)
            };

            let zipData = '';
            const entries = Object.entries(files);
            for (let i = 0; i < entries.length; i++) {
                const [name, content] = entries[i];
                zipData += content;
                progress.querySelector('p').textContent = `Packing ${name}...`;
                await this.delay(100);
            }

            const blob = new Blob([JSON.stringify(adminExport, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'dilliraja-portfolio-site.json';
            a.click();

            progress.querySelector('p').textContent = 'Site exported as JSON! Import to restore.';
            await this.delay(1500);
            progress.remove();
            sound.playSuccess();
            showToast('Site exported! Re-import to restore all data.');
        } catch (err) {
            progress.remove();
            showToast('Export failed: ' + err.message, 'error');
        }
    }

    generateSiteHtml() {
        const d = profile.data;
        const serviceOpts = (d.pricing || []).map(p => `<option value="${p.value}">${p.label}</option>`).join('');
        const linksHtml = (d.links || []).map(l => `<a href="${l.url}" class="social-link" target="_blank"><i class="fas fa-link"></i><span>${l.label}</span></a>`).join('');

        return `<!DOCTYPE html>
<html lang="en" data-theme="${localStorage.getItem('theme') || 'dark'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${d.name} - Portfolio</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>/* Embedded config for offline */var embeddedAdmin=${JSON.stringify({profile:d,admin:adminConfig?.admin||{username:'dilli',password:'illid',maxEdits:-1},services:d.services||[],pricing:d.pricing||[],links:d.links||[],files:JSON.parse(localStorage.getItem('filesData')||'{}'),serviceImages:JSON.parse(localStorage.getItem('serviceImages')||'{}'),serviceFiles:JSON.parse(localStorage.getItem('serviceFiles')||'{}')})}<\/script>
</head>
<body>${document.body.innerHTML}</body></html>`;
    }

    async fetchText(url) {
        try { const r = await fetch(url); return await r.text(); } catch (e) { return ''; }
    }

    delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    saveSettings() {
        if (this.locked) { showToast('Profile locked!', 'error'); return; }
        const d = profile.data;
        d.name = document.getElementById('settingName')?.value || d.name;
        d.tagline = document.getElementById('settingTagline')?.value || d.tagline;
        d.bio = document.getElementById('settingBio')?.value || d.bio;
        d.logo = document.getElementById('settingLogo')?.value || d.logo;
        d.phone = document.getElementById('settingPhone')?.value || d.phone;
        d.email = document.getElementById('settingEmail')?.value || d.email;
        d.whatsapp = document.getElementById('settingWhatsapp')?.value || d.whatsapp;
        d.social = {
            instagram: document.getElementById('settingInstagram')?.value || '#',
            facebook: document.getElementById('settingFacebook')?.value || '#',
            linkedin: document.getElementById('settingLinkedin')?.value || '#',
            naukri: document.getElementById('settingNaukri')?.value || '#',
            twitter: document.getElementById('settingTwitter')?.value || '#',
            github: document.getElementById('settingGithub')?.value || '#',
            youtube: document.getElementById('settingYoutube')?.value || '#',
            whatsapp: document.getElementById('settingWhatsappSocial')?.value || '#',
            telegram: document.getElementById('settingTelegram')?.value || '#'
        };
        // Stats
        d.stats = {
            projects: document.getElementById('settingProjects')?.value || '50',
            clients: document.getElementById('settingClients')?.value || '30',
            years: document.getElementById('settingYears')?.value || '3'
        };
        // Footer
        d.copyright = document.getElementById('settingCopyright')?.value || '© 2026 demo. All Rights Reserved. developed by <a href="https://dillistudio.github.io/raj" target="_blank">DilliStudio</a>';
        d.website = document.getElementById('settingWebsite')?.value || 'https://dilliraja.lovable.app';
        // Services
        d.services = this.collectServices();
        // Pricing
        d.pricing = this.collectPricing();
        // Links
        d.links = this.collectLinks();

        profile.save();
        profile.applyAll();
        this.updateFrontend();
        this.editCount++;
        localStorage.setItem('profileEdits', this.editCount);
        if (this.maxEdits !== -1 && this.editCount >= this.maxEdits) {
            this.locked = true;
            localStorage.setItem('profileLocked', 'true');
            this.showLocked();
            sound.playSuccess();
            showToast('Profile locked! All edits used.');
        } else {
            sound.playSuccess();
            showToast('Saved successfully!');
        }
    }

    updateFrontend() {
        const d = profile.data;
        // Update stats on home page
        document.querySelectorAll('.stat-number[data-count]').forEach(el => {
            const label = el.nextElementSibling?.textContent;
            if (label === 'Projects' && d.stats?.projects) el.dataset.count = d.stats.projects;
            if (label === 'Clients' && d.stats?.clients) el.dataset.count = d.stats.clients;
            if (label === 'Years Exp' && d.stats?.years) el.dataset.count = d.stats.years;
        });
        // Update footer
        document.querySelectorAll('.footer-content p').forEach(el => {
            el.innerHTML = `${d.copyright || '© 2026 demo. All Rights Reserved. developed by <a href="https://dillistudio.github.io/raj" target="_blank">DilliStudio</a>'}`;
        });
        // Update services on home page
        if (d.services && d.services.length > 0) {
            const grid = document.querySelector('.services-grid');
            if (grid) {
                grid.innerHTML = d.services.slice(0, 4).map(s => `
                    <div class="service-card" data-category="services" data-service="${s.id}">
                        <div class="service-icon-wrap"><i class="${s.icon || 'fas fa-star'}"></i></div>
                        <h3>${s.title}</h3>
                        <p>${s.demos?.[0]?.title || 'Service'}</p>
                    </div>
                `).join('');
            }
        }
        // Update pricing dropdown in form
        const svcSelect = document.getElementById('service');
        if (svcSelect && d.pricing?.length > 0) {
            svcSelect.innerHTML = '<option value="">-- Select --</option>' + d.pricing.map(p => `<option value="${p.value}">${p.label}</option>`).join('');
        }
        // Update custom downloads
        this.initContactDownloads();
    }

    initContactDownloads() {
        const filesData = JSON.parse(localStorage.getItem('filesData') || '{}');
        const container = document.getElementById('customDownloads');
        if (!container) return;
        let html = '';
        if (filesData.customFile1) {
            html += `<button class="download-btn dynamic-file" onclick="contact.downloadCustomFile('customFile1')"><i class="fas fa-file"></i><span>${filesData.customFile1.name || 'Custom File 1'}</span></button>`;
        }
        if (filesData.customFile2) {
            html += `<button class="download-btn dynamic-file" onclick="contact.downloadCustomFile('customFile2')"><i class="fas fa-file"></i><span>${filesData.customFile2.name || 'Custom File 2'}</span></button>`;
        }
        container.innerHTML = html;
    }

    renderServicesEditor(services) {
        const container = document.getElementById('servicesEditor');
        if (!container) return;
        container.innerHTML = services.map((s, i) => `
            <div class="editor-item" data-index="${i}">
                <div class="form-group"><label>Title</label><input type="text" class="svc-title" value="${s.title || ''}"></div>
                <div class="form-group"><label>Icon Class</label><input type="text" class="svc-icon" value="${s.icon || 'fas fa-star'}" placeholder="fas fa-star"></div>
                <div class="form-group"><label>Demo Title</label><input type="text" class="svc-demo-title" value="${s.demos?.[0]?.title || ''}"></div>
                <div class="form-group"><label>Demo Description</label><input type="text" class="svc-demo-desc" value="${s.demos?.[0]?.description || ''}"></div>
                <div class="form-group"><label>Demo Image URL</label><input type="url" class="svc-demo-img" value="${s.demos?.[0]?.image || ''}"></div>
                <button class="remove-item-btn" onclick="this.closest('.editor-item').remove()"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
        document.getElementById('addServiceBtn')?.addEventListener('click', () => {
            container.insertAdjacentHTML('beforeend', `
                <div class="editor-item" data-index="${container.children.length}">
                    <div class="form-group"><label>Title</label><input type="text" class="svc-title" value=""></div>
                    <div class="form-group"><label>Icon Class</label><input type="text" class="svc-icon" value="fas fa-star" placeholder="fas fa-star"></div>
                    <div class="form-group"><label>Demo Title</label><input type="text" class="svc-demo-title" value=""></div>
                    <div class="form-group"><label>Demo Description</label><input type="text" class="svc-demo-desc" value=""></div>
                    <div class="form-group"><label>Demo Image URL</label><input type="url" class="svc-demo-img" value=""></div>
                    <button class="remove-item-btn" onclick="this.closest('.editor-item').remove()"><i class="fas fa-trash"></i></button>
                </div>
            `);
        });
    }

    collectServices() {
        return Array.from(document.querySelectorAll('#servicesEditor .editor-item')).map(el => ({
            id: el.querySelector('.svc-title')?.value.toLowerCase().replace(/\s+/g, '-') || 'service',
            title: el.querySelector('.svc-title')?.value || '',
            icon: el.querySelector('.svc-icon')?.value || 'fas fa-star',
            demos: [{
                title: el.querySelector('.svc-demo-title')?.value || '',
                description: el.querySelector('.svc-demo-desc')?.value || '',
                image: el.querySelector('.svc-demo-img')?.value || ''
            }]
        }));
    }

    renderPricingEditor(pricing) {
        const container = document.getElementById('pricingEditor');
        if (!container) return;
        container.innerHTML = pricing.map((p, i) => `
            <div class="editor-item pricing-item" data-index="${i}">
                <div class="form-group"><label>Value (ID)</label><input type="text" class="price-value" value="${p.value || ''}"></div>
                <div class="form-group"><label>Label</label><input type="text" class="price-label" value="${p.label || ''}"></div>
                <button class="remove-item-btn" onclick="this.closest('.editor-item').remove()"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
        document.getElementById('addPricingBtn')?.addEventListener('click', () => {
            container.insertAdjacentHTML('beforeend', `
                <div class="editor-item pricing-item" data-index="${container.children.length}">
                    <div class="form-group"><label>Value (ID)</label><input type="text" class="price-value" value=""></div>
                    <div class="form-group"><label>Label</label><input type="text" class="price-label" value=""></div>
                    <button class="remove-item-btn" onclick="this.closest('.editor-item').remove()"><i class="fas fa-trash"></i></button>
                </div>
            `);
        });
    }

    collectPricing() {
        return Array.from(document.querySelectorAll('#pricingEditor .editor-item')).map(el => ({
            value: el.querySelector('.price-value')?.value || '',
            label: el.querySelector('.price-label')?.value || ''
        }));
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast('Image too large! Max 5MB.', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target.result;
            // Store as base64 directly in localStorage (no file access needed)
            profile.data.profileImage = base64;
            profile.save();
            profile.applyAll();
            this.editCount++;
            localStorage.setItem('profileEdits', this.editCount);
            if (this.maxEdits !== -1 && this.editCount >= this.maxEdits) {
                this.locked = true;
                localStorage.setItem('profileLocked', 'true');
                this.showLocked();
                showToast('Profile locked! All edits used.');
            } else {
                showToast('Image saved!');
            }
            sound.playSuccess();
        };
        reader.readAsDataURL(file);
    }

    exportProfile() {
        const d = profile.data;
        const exportData = {
            name: d.name, tagline: d.tagline, bio: d.bio, logo: d.logo,
            phone: d.phone, email: d.email, whatsapp: d.whatsapp,
            social: d.social, profileImage: d.profileImage
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'dilliraja-profile.json';
        a.click();
        sound.playSuccess();
        showToast('Profile exported!');
    }

    importProfile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                profile.data = { ...defaultProfile, ...data };
                // Restore files if present
                if (data.files) localStorage.setItem('filesData', JSON.stringify(data.files));
                // Restore service images if present
                if (data.serviceImages) localStorage.setItem('serviceImages', JSON.stringify(data.serviceImages));
                // Restore service files
                if (data.serviceFiles) localStorage.setItem('serviceFiles', JSON.stringify(data.serviceFiles));
                // Restore links
                if (data.links) profile.data.links = data.links;
                profile.save();
                profile.applyAll();
                this.loadFormValues();
                sound.playSuccess();
                showToast('Full profile imported!');
            } catch (err) {
                showToast('Invalid file!', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    exportAdminConfig() {
        const config = {
            profile: profile.data,
            admin: adminConfig?.admin || { username: 'dilli', password: 'illid', maxEdits: -1 },
            settings: {
                theme: localStorage.getItem('theme') || 'dark',
                accentColor: localStorage.getItem('accentColor') || '#6c5ce7',
                soundEnabled: localStorage.getItem('soundMuted') !== 'true'
            },
            services: profile.data.services || adminConfig?.services || [],
            pricing: profile.data.pricing || adminConfig?.pricing || [],
            links: profile.data.links || [],
            files: JSON.parse(localStorage.getItem('filesData') || '{}'),
            serviceImages: JSON.parse(localStorage.getItem('serviceImages') || '{}'),
            serviceFiles: JSON.parse(localStorage.getItem('serviceFiles') || '{}')
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'admin.json';
        a.click();
        sound.playSuccess();
        showToast('Admin config exported!');
    }
}

// Initialize admin config then settings
(async () => {
    await loadAdminConfig();
    theme = new ThemeSystem();
    window.settings = new SettingsSystem();
})();

// Sound Toggle
document.getElementById('soundToggle')?.addEventListener('click', function () {
    const isMuted = sound.toggleMute();
    this.classList.toggle('muted', isMuted);
    this.querySelector('i').className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
});

// Init UI state (after theme loads)
setTimeout(() => {
    if (theme) {
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme.currentTheme));
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.toggle('active', opt.dataset.color === theme.currentColor));
    }
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn && sound.isMuted) { soundBtn.classList.add('muted'); soundBtn.querySelector('i').className = 'fas fa-volume-mute'; }
}, 200);

// Stat counter
function animateCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(counter => {
        const target = parseInt(counter.dataset.count);
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { counter.textContent = target + '+'; clearInterval(timer); }
            else counter.textContent = Math.floor(current) + '+';
        }, 50);
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { animateCounters(); observer.disconnect(); } });
});

const statsSection = document.querySelector('.stats-section');
if (statsSection) observer.observe(statsSection);

document.addEventListener('touchstart', () => {}, { passive: true });
console.log('Demo Portfolio Loaded!');
