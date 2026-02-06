// ============================================================
// 1. AYARLAR & CSV LİNKLERİ
// ============================================================
const PRODUCT_SHEET_URL   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGoOZ2ZKks0gBx_fzLzsbM9w00MnxgsljIDgxfZ0HJtWjhHmNnasPPzYu5OFlyz9PZjDo1SWrnAEb_/pub?gid=0&single=true&output=csv";
const DESC_SHEET_URL      = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGoOZ2ZKks0gBx_fzLzsbM9w00MnxgsljIDgxfZ0HJtWjhHmNnasPPzYu5OFlyz9PZjDo1SWrnAEb_/pub?gid=1392721541&single=true&output=csv";
const SLIDER_SHEET_URL    = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGoOZ2ZKks0gBx_fzLzsbM9w00MnxgsljIDgxfZ0HJtWjhHmNnasPPzYu5OFlyz9PZjDo1SWrnAEb_/pub?gid=1661861719&single=true&output=csv";
const CORPORATE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGoOZ2ZKks0gBx_fzLzsbM9w00MnxgsljIDgxfZ0HJtWjhHmNnasPPzYu5OFlyz9PZjDo1SWrnAEb_/pub?gid=1053479916&single=true&output=csv";

let urunVerileri = {};
let kategoriMetinleri = {};
let sliderGorselleri = [];
let kurumsalGorseller = []; 
let teklifSepeti = []; 
let isDataLoaded = false;

// ============================================================
// 2. VERİ MOTORU (Gelişmiş Virgül Korumalı)
// ============================================================
async function verileriGetir() {
    if (isDataLoaded) return;
    try {
        const [prodRes, descRes, sliderRes, corpRes] = await Promise.all([
            fetch(PRODUCT_SHEET_URL), fetch(DESC_SHEET_URL), fetch(SLIDER_SHEET_URL), fetch(CORPORATE_SHEET_URL)
        ]);

        const prodData = await prodRes.text();
        const descData = await descRes.text();
        const sliderData = await sliderRes.text();
        const corpData = await corpRes.text();

        // --- A. Ürünleri İşle (Virgül ve Tırnak Temizliği) ---
        prodData.split('\n').slice(1).forEach(row => {
            const p = row.split(',');
            // Satırın en azından Kategori ve Başlık içerdiğinden emin ol
            if (p.length >= 3 && p[0].trim() !== "") {
                const k = p[0].trim();
                if (!urunVerileri[k]) urunVerileri[k] = [];
                
                // Resim her zaman son sütundadır
                const resimYolu = p[p.length - 1].replace(/\r/g, "").trim();
                
                // Açıklama: Başlık (Index 1) ile Resim (Son Index) arasındaki her şeydir.
                // slice ve join kullanarak aradaki virgülleri metne geri ekliyoruz.
                let aciklama = p.slice(2, p.length - 1).join(',');
                
                // Google Sheets'in eklediği tırnak işaretlerini temizle ("..." -> ...)
                aciklama = aciklama.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
                
                urunVerileri[k].push({ baslik: p[1].trim(), aciklama: aciklama, resim: resimYolu });
            }
        });

        // --- B. Metinleri ve Bannerları İşle (Kritik Virgül Düzeltmesi) ---
        descData.split('\n').slice(1).forEach(row => {
            const p = row.split(',');
            // Satırın dolu olduğundan ve kategori (A sütunu) içerdiğinden emin ol
            if (p.length >= 2 && p[0].trim() !== "") {
                const kategori = p[0].trim();
                const baslik = p[1].trim();
                
                // Banner mantığı: Eğer satırda fazladan virgül (yani uzun açıklama) varsa sütun sayısı artar.
                // Bu yüzden banner her zaman SON sütundadır.
                const bannerYolu = p[p.length - 1].replace(/\r/g, "").trim();
                
                // Açıklama: Başlık (Index 1) ile Banner (Son Index) arasıdır.
                let tamAciklama = p.slice(2, p.length - 1).join(',');
                
                // Temizlik: Tırnakları kaldır
                tamAciklama = tamAciklama.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
                
                kategoriMetinleri[kategori] = { baslik: baslik, aciklama: tamAciklama, banner: bannerYolu };
            }
        });

        // --- C. Diğer Slider ve Kurumsal Verileri ---
        sliderData.split('\n').slice(1).forEach(row => { const y = row.split(',')[0].trim(); if(y) sliderGorselleri.push(y); });
        corpData.split('\n').slice(1).forEach(row => { const y = row.split(',')[0].trim(); if(y) kurumsalGorseller.push(y); });

        isDataLoaded = true;
        console.log("✅ Veriler virgül korumalı olarak yüklendi.");
        
        // Sayfa açıksa veriyi hemen yansıt
        const aktifSayfa = document.querySelector('.page-section.active-page');
        if(aktifSayfa) showPage(aktifSayfa.id);

    } catch (e) { 
        console.error("Veri Hatası:", e); 
    }
}

        // --- B. Metinleri ve Bannerları İşle ---
        descData.split('\n').slice(1).forEach(row => {
            const p = row.split(',');
            if (p.length >= 2 && p[0].trim() !== "") {
                const kategori = p[0].trim();
                const bannerYolu = p.length >= 4 ? p[p.length - 1].replace(/\r/g, "").trim() : "";
                const tamAciklama = p.slice(2, p.length >= 4 ? p.length - 1 : p.length).join(',').replace(/^"|"$/g, '').trim();
                
                kategoriMetinleri[kategori] = { baslik: p[1].trim(), aciklama: tamAciklama, banner: bannerYolu };
            }
        });

        // --- C. Diğer Veriler ---
        sliderData.split('\n').slice(1).forEach(row => { const y = row.split(',')[0].trim(); if(y) sliderGorselleri.push(y); });
        corpData.split('\n').slice(1).forEach(row => { const y = row.split(',')[0].trim(); if(y) kurumsalGorseller.push(y); });

        isDataLoaded = true;
        console.log("✅ Veriler başarıyla yüklendi.");
        
        // Mevcut sayfayı render et (Yükleme bittiğinde görüntü bozuk kalmasın)
        const currentPath = document.querySelector('.page-section.active-page')?.id || 'home';
        showPage(currentPath);
        
    } catch (e) { 
        console.error("Veri çekme hatası:", e); 
        // Hata olsa bile ana sayfayı göstererek o karmaşık görüntüyü engelle
        document.getElementById('home').classList.add('active-page');
    }
}

// ============================================================
// 3. GÖRÜNÜM VE RENDER FONKSİYONLARI
// ============================================================

function titleGuncelle(pageId) {
    let anaBaslik = "A&C Kürk | Toptan İmalat";
    document.title = (pageId !== 'home' && kategoriMetinleri[pageId]) 
        ? `${kategoriMetinleri[pageId].baslik} - ${anaBaslik}` 
        : anaBaslik;
}

function metinleriGuncelle(kategori) {
    const sec = document.getElementById(kategori);
    if (sec && kategoriMetinleri[kategori]) {
        const header = sec.querySelector('.section-header');
        const desc = sec.querySelector('.category-desc p');
        if (header) header.innerText = kategoriMetinleri[kategori].baslik;
        if (desc) desc.innerHTML = kategoriMetinleri[kategori].aciklama;
        
        const bannerImg = sec.querySelector('.category-banner-img');
        const bannerBox = sec.querySelector('.category-banner-box');
        
        if (bannerImg && bannerBox && kategoriMetinleri[kategori].banner) {
            bannerImg.src = kategoriMetinleri[kategori].banner;
            bannerBox.style.display = "block";
        } else if (bannerBox) {
            bannerBox.style.display = "none";
        }
    }
}

function urunleriYukle(kategori) {
    const box = document.querySelector(`#${kategori} .product-grid-layout`);
    if (!box || !urunVerileri[kategori]) return;
    
    box.innerHTML = urunVerileri[kategori].map(u => {
        // Resim yoksa başlık (ayırıcı) olarak render et
        if (!u.resim || u.resim === "" || u.resim === "undefined") {
            return `
            <div class="category-separator" style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 40px 0;">
                <h2 style="font-size: 24px; color: #111; border-bottom: 2px solid #ff9f43; display: inline-block; padding-bottom: 5px;">${u.baslik}</h2>
                ${u.aciklama ? `<p style="color: #666; margin-top: 10px;">${u.aciklama}</p>` : ''}
            </div>`;
        }

        return `
        <div class="product-card">
            <div class="product-img-box">
                <img src="${u.resim}" loading="lazy" onerror="this.src='placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3>${u.baslik}</h3>
                <p>${u.aciklama}</p>
                <button onclick="sepeteEkle('${u.baslik}')" class="quote-add-btn" style="width:100%; background:none; border:1px solid #ff9f43; color:#ff9f43; padding:8px; border-radius:4px; cursor:pointer; font-weight:bold; margin-top:10px;">
                    LİSTEYE EKLE +
                </button>
            </div>
        </div>`;
    }).join('');
}

// ============================================================
// 4. NAVİGASYON VE DİNAMİK İÇERİK
// ============================================================

async function showPage(pageId) {
    // Veri yüklenmemişse önce yükle
    if (!isDataLoaded) await verileriGetir();
    
    titleGuncelle(pageId);

    // Tüm sayfaları gizle ve sadece hedef sayfayı göster (Karmaşayı önler)
    document.querySelectorAll('.page-section').forEach(p => {
        p.classList.remove('active-page');
        p.style.display = 'none';
    });

    const active = document.getElementById(pageId);
    if (active) {
        active.classList.add('active-page');
        active.style.display = 'block';
    }

    // Sayfa özel yüklemeleri
    if (pageId === 'home') {
        slideriGuncelle();
    } else if (pageId === 'kurumsal') {
        kurumsalGaleriYukle(); 
    } else if (pageId !== 'iletisim') {
        metinleriGuncelle(pageId);
        urunleriYukle(pageId);
    }

    // Aktif menü linki
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`.nav-link[onclick*="${pageId}"]`).forEach(l => l.classList.add('active'));
    
    // Mobil menü kapat ve yukarı kaydır
    const mob = document.getElementById("mobileMenu");
    if(mob) mob.classList.remove("open");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// 5. TEKLİF SEPETİ VE WHATSAPP
// ============================================================

function sepeteEkle(urunAdi) {
    if (!teklifSepeti.includes(urunAdi)) {
        teklifSepeti.push(urunAdi);
        sepetiGuncelle();
    }
}

function sepetiGuncelle() {
    const sepetButon = document.getElementById('floating-quote-btn');
    if (sepetButon) {
        if (teklifSepeti.length > 0) {
            sepetButon.style.display = 'flex';
            sepetButon.innerText = `📋 ${teklifSepeti.length} Ürün İçin Teklif İste`;
        } else {
            sepetButon.style.display = 'none';
        }
    }
}

function whatsappTeklifGonder() {
    let mesaj = "Merhaba A&C Kürk, web sitenizden seçtiğim ürünler için toptan fiyat teklifi istiyorum:%0A%0A";
    teklifSepeti.forEach((urun, index) => { mesaj += `${index + 1}. ${urun}%0A`; });
    window.open(`https://wa.me/905415789400?text=${mesaj}`, '_blank');
}

// ============================================================
// 6. EKSTRA UI FONKSİYONLARI
// ============================================================

function slideriGuncelle() {
    const track = document.querySelector('.logo-slide-track');
    if (track && sliderGorselleri.length > 0) {
        track.innerHTML = [...sliderGorselleri, ...sliderGorselleri].map(img => 
            `<div class="slide product-slide"><img src="${img}" loading="lazy"></div>`
        ).join('');
    }
}

function kurumsalGaleriYukle() {
    const galleryBox = document.getElementById('kurumsal-gallery-grid');
    if (galleryBox && kurumsalGorseller.length > 0) {
        galleryBox.innerHTML = kurumsalGorseller.map(img => `
            <div class="product-card" style="box-shadow: none; border: 1px solid #eee;">
                <div class="product-img-box"><img src="${img}" loading="lazy"></div>
            </div>`).join('');
    }
}

function toggleMobileMenu() { 
    document.getElementById("mobileMenu").classList.toggle("open"); 
}

// Sayfa ilk açıldığında verileri çekmeye başla
window.onload = verileriGetir;

