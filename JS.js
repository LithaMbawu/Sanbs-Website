/* ---------- Configuration ---------- */
/* For simple form handling you can use Formspree (no server): set your endpoint here.
   Example: https://formspree.io/f/{your-id}
   If empty, the script will simulate submission and show a message.
*/
const FORM_ENDPOINT = ""; // <-- replace with your Formspree endpoint if you use it

/* ---------- Data store (could be fetched from server / CMS) ---------- */
const DATA = {
  centres: [
    { id:1, name:"SANBS Centre - Johannesburg CBD", lat:-26.2041, lon:28.0473, address:"Central Ave, Johannesburg" },
    { id:2, name:"SANBS Centre - Mall of Africa", lat:-25.9891, lon:28.0862, address:"Mall of Africa, Midrand" },
    // add more centres here
  ],
  stock: [
    { type:"O+", status:"Available" },
    { type:"A+", status:"Available" },
    { type:"B+", status:"Low" },
    { type:"AB+", status:"Critical" },
    { type:"O-", status:"Available" },
    { type:"A-", status:"Low" },
    { type:"AB-", status:"Critical" }
  ],
  gallery: [
    { src:"assets/gallery/drive1.jpg", alt:"Community blood drive 1" },
    { src:"assets/gallery/drive2.jpg", alt:"Volunteers at a blood drive" },
    { src:"assets/gallery/drive3.jpg", alt:"Donor giving blood" },
    { src:"assets/gallery/drive4.jpg", alt:"SANBS mobile clinic" }
  ]
};

/* ---------- Init UI ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderStockSummary();
  renderStockTable();
  initMap();
  renderCentreList();
  renderGallery();
  populateCentreSelect();
  initSearchFilter();
  initForm();
  initLightboxControls();
});

/* ---------- Stock rendering ---------- */
function renderStockSummary(){
  const ul = document.getElementById("stock-summary");
  ul.innerHTML = "";
  DATA.stock.forEach(s => {
    const li = document.createElement("li");
    li.className = "stock-item";
    li.innerHTML = `<strong>${s.type}</strong>: <span class="pill ${statusClass(s.status)}">${s.status}</span>`;
    ul.appendChild(li);
  });
}
function renderStockTable(){
  const out = document.getElementById("stock-table");
  out.innerHTML = "";
  DATA.stock.forEach(s => {
    const div = document.createElement("div");
    div.className = "stock-card";
    div.innerHTML = `<div role="row"><strong>${s.type}</strong></div><div>${s.status === 'Available' ? '<span class="pill available">Available</span>' : s.status === 'Low' ? '<span class="pill low">Low</span>' : '<span class="pill critical">Critical</span>'}</div>`;
    out.appendChild(div);
  });
}
function statusClass(status){
  return status.toLowerCase();
}

/* ---------- Map (Leaflet) ---------- */
let map, markersLayer;
function initMap(){
  map = L.map('map', {scrollWheelZoom:false}).setView([-26.2041, 28.0473], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  markersLayer = L.markerClusterGroup();
  DATA.centres.forEach(c => {
    const m = L.marker([c.lat,c.lon]).bindPopup(`<strong>${escapeHTML(c.name)}</strong><br>${escapeHTML(c.address)}`);
    m.options.dataId = c.id;
    markersLayer.addLayer(m);
  });
  map.addLayer(markersLayer);
}

/* ---------- Centres / search list ---------- */
function renderCentreList(filter = ""){
  const list = document.getElementById("centre-list");
  list.innerHTML = "";
  const filtered = DATA.centres.filter(c => `${c.name} ${c.address}`.toLowerCase().includes(filter.toLowerCase()));
  filtered.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `<button class="link-like" data-id="${c.id}">${escapeHTML(c.name)} — ${escapeHTML(c.address)}</button>`;
    li.querySelector('button').addEventListener('click', () => {
      focusOnCentre(c.id);
    });
    list.appendChild(li);
  });
  if(filtered.length===0){
    list.innerHTML = `<li>No centres found.</li>`;
  }
}
function focusOnCentre(id){
  const c = DATA.centres.find(x=>x.id===id);
  if(c){
    map.setView([c.lat,c.lon], 14, {animate:true});
    // open corresponding popup if marker exists:
    markersLayer.eachLayer(layer => {
      if(layer.options.dataId === id){
        layer.openPopup();
      }
    });
  }
}
function initSearchFilter(){
  const input = document.getElementById("centre-search");
  input.addEventListener("input", e => {
    renderCentreList(e.target.value);
  });
}

/* ---------- Populate select for form ---------- */
function populateCentreSelect(){
  const sel = document.getElementById("centre");
  DATA.centres.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

/* ---------- Gallery + Lightbox ---------- */
function renderGallery(){
  const grid = document.getElementById("gallery-grid");
  DATA.gallery.forEach((img, i) => {
    const el = document.createElement("div");
    el.className = "gallery-item";
    el.innerHTML = `<img src="${img.src}" alt="${escapeHTML(img.alt)}" data-index="${i}" loading="lazy">`;
    el.querySelector('img').addEventListener('click', () => openLightbox(i));
    grid.appendChild(el);
  });
}

let lightboxIndex = 0;
function initLightboxControls(){
  const lb = document.getElementById("lightbox");
  const content = lb.querySelector(".lightbox-content");
  const close = lb.querySelector(".lightbox-close");
  const prev = lb.querySelector(".lightbox-prev");
  const next = lb.querySelector(".lightbox-next");

  close.addEventListener('click', closeLightbox);
  prev.addEventListener('click', () => showLightbox(lightboxIndex-1));
  next.addEventListener('click', () => showLightbox(lightboxIndex+1));
  lb.addEventListener('click', (e) => { if(e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if(lb.getAttribute('aria-hidden') === 'false'){
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowRight') showLightbox(lightboxIndex+1);
      if(e.key === 'ArrowLeft') showLightbox(lightboxIndex-1);
    }
  });
}

function openLightbox(index){
  showLightbox(index);
  const lb = document.getElementById("lightbox");
  lb.setAttribute('aria-hidden','false');
}
function closeLightbox(){
  const lb = document.getElementById("lightbox");
  lb.setAttribute('aria-hidden','true');
  lb.querySelector(".lightbox-content").innerHTML = "";
}
function showLightbox(index){
  if(index < 0) index = DATA.gallery.length -1;
  if(index >= DATA.gallery.length) index = 0;
  lightboxIndex = index;
  const content = document.querySelector(".lightbox-content");
  const img = document.createElement("img");
  img.src = DATA.gallery[index].src;
  img.alt = DATA.gallery[index].alt;
  content.innerHTML = "";
  content.appendChild(img);
}

/* ---------- Form validation & submission ---------- */
function initForm(){
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    // basic validation
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    let valid = true;
    if(name.length < 2){ setError("err-name", "Please enter your full name."); valid=false; }
    if(!validateEmail(email)){ setError("err-email", "Please enter a valid email address."); valid=false; }

    if(!valid) return;

    // prepare payload
    const payload = {
      name, email, phone: form.phone.value.trim(), centre: form.centre.value, message: form.message.value.trim()
    };

    // show immediate feedback
    status.textContent = "Sending…";

    try {
      if(FORM_ENDPOINT){
        // Send to Formspree
        const resp = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: {'Content-Type':'application/json','Accept':'application/json'},
          body: JSON.stringify(payload)
        });
        if(resp.ok){
          form.reset();
          status.textContent = "Thanks — your booking request was sent. We'll contact you shortly.";
        } else {
          const text = await resp.text();
          status.textContent = "Submission failed. Please try again or contact info@sanbs.org.za";
          console.error("Formspree error", resp.status, text);
        }
      } else {
        // No endpoint configured: simulate success and log to console for devs
        console.log("FORM PAYLOAD (simulate send):", payload);
        form.reset();
        status.textContent = "Demo: form validated locally. Configure FORM_ENDPOINT in script to send.";
      }
    } catch(err){
      console.error(err);
      status.textContent = "There was an error sending your request. Please try again later.";
    }
  });
}

function clearErrors(){
  document.querySelectorAll('.error').forEach(el=>el.textContent = '');
  document.getElementById('form-status').textContent = '';
}
function setError(id,msg){ document.getElementById(id).textContent = msg; }
function validateEmail(email){
  // basic email check (RFC-safe full regex is heavy)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- Helpers ---------- */
function escapeHTML(s){ return String(s).replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
