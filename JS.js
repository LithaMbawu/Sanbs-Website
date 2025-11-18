/* ---------- Configuration ---------- */
const FORM_ENDPOINT = ""; // <-- replace with your Formspree endpoint if needed

/* ---------- Data store ---------- */
const DATA = {
  centres: [
    { id:1, name:"SANBS Centre - Johannesburg CBD", lat:-26.2041, lon:28.0473, address:"Central Ave, Johannesburg" },
    { id:3, name:"SANBS Centre - Cape Town", lat:-33.9249, lon:18.4241, address:"Cape Town CBD" },
    { id:4, name:"SANBS Centre - Durban", lat:-29.8587, lon:31.0218, address:"Durban Central" }
  ],
  stock: [
    { type:"O+", status:"Available" },
    { type:"A+", status:"Available" },
    { type:"B+", status:"Low" },
    { type:"AB+", status:"Critical" },
    { type:"O-", status:"Low" },
    { type:"A-", status:"Available" },
    { type:"B-", status:"Available" },
    { type:"AB-", status:"Critical" }
  ],
  gallery: [
    { src:"assets/gallery/drive1.jpg", alt:"Community blood drive 1" },
    { src:"assets/gallery/drive2.jpg", alt:"Volunteers at a blood drive" },
    { src:"assets/gallery/drive3.jpg", alt:"Donor giving blood" },
    { src:"assets/gallery/drive4.jpg", alt:"SANBS mobile clinic" }
  ]
};

/* ---------- Initialize ---------- */
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

/* ---------- Stock ---------- */
function renderStockSummary(){
  const ul = document.getElementById("stock-summary");
  if(!ul) return;
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
  if(!out) return;
  out.innerHTML = "";
  DATA.stock.forEach(s => {
    const div = document.createElement("div");
    div.className = "stock-card";
    div.innerHTML = `<div role="row"><strong>${s.type}</strong></div>
                     <div>${s.status === 'Available' ? '<span class="pill available">Available</span>' : 
                             s.status === 'Low' ? '<span class="pill low">Low</span>' : 
                             '<span class="pill critical">Critical</span>'}</div>`;
    out.appendChild(div);
  });
}

function statusClass(status){
  return status.toLowerCase();
}

/* ---------- Map (Leaflet) ---------- */
let map, markersLayer;
function initMap(){
  if(!document.getElementById("map")) return;

  map = L.map('map', {scrollWheelZoom:false}).setView([-26.2041, 28.0473], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  DATA.centres.forEach(c => {
    const m = L.marker([c.lat, c.lon]).bindPopup(`<strong>${escapeHTML(c.name)}</strong><br>${escapeHTML(c.address)}`);
    m.options.dataId = c.id;
    markersLayer.addLayer(m);
  });
}

function renderCentreList(filter=""){
  const list = document.getElementById("centre-list");
  if(!list) return;
  list.innerHTML = "";
  const filtered = DATA.centres.filter(c => `${c.name} ${c.address}`.toLowerCase().includes(filter.toLowerCase()));
  filtered.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `<button class="link-like" data-id="${c.id}">${escapeHTML(c.name)} — ${escapeHTML(c.address)}</button>`;
    li.querySelector('button').addEventListener('click', ()=>focusOnCentre(c.id));
    list.appendChild(li);
  });
  if(filtered.length===0) list.innerHTML = "<li>No centres found.</li>";
}

function focusOnCentre(id){
  const c = DATA.centres.find(x=>x.id===id);
  if(c){
    map.setView([c.lat, c.lon], 14, {animate:true});
    markersLayer.eachLayer(layer => {
      if(layer.options.dataId === id) layer.openPopup();
    });
  }
}

function initSearchFilter(){
  const input = document.getElementById("centre-search");
  if(!input) return;
  input.addEventListener("input", e => renderCentreList(e.target.value));
}

function populateCentreSelect(){
  const sel = document.getElementById("centre");
  if(!sel) return;
  DATA.centres.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

/* ---------- Gallery / Lightbox ---------- */
function renderGallery(){
  const grid = document.getElementById("gallery-grid");
  if(!grid) return;
  DATA.gallery.forEach((img,i)=>{
    const el = document.createElement("div");
    el.className = "gallery-item";
    el.innerHTML = `<img src="${img.src}" alt="${escapeHTML(img.alt)}" data-index="${i}" loading="lazy">`;
    el.querySelector('img').addEventListener('click', ()=>openLightbox(i));
    grid.appendChild(el);
  });
}

let lightboxIndex = 0;
function initLightboxControls(){
  const lb = document.getElementById("lightbox");
  if(!lb) return;
  const close = lb.querySelector(".lightbox-close");
  const prev = lb.querySelector(".lightbox-prev");
  const next = lb.querySelector(".lightbox-next");

  close.addEventListener('click', closeLightbox);
  prev.addEventListener('click', ()=>showLightbox(lightboxIndex-1));
  next.addEventListener('click', ()=>showLightbox(lightboxIndex+1));
  lb.addEventListener('click', e => { if(e.target===lb) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if(lb.getAttribute('aria-hidden') === 'false'){
      if(e.key==='Escape') closeLightbox();
      if(e.key==='ArrowRight') showLightbox(lightboxIndex+1);
      if(e.key==='ArrowLeft') showLightbox(lightboxIndex-1);
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
  if(index<0) index=DATA.gallery.length-1;
  if(index>=DATA.gallery.length) index=0;
  lightboxIndex=index;
  const content = document.querySelector(".lightbox-content");
  const img = document.createElement("img");
  img.src = DATA.gallery[index].src;
  img.alt = DATA.gallery[index].alt;
  content.innerHTML="";
  content.appendChild(img);
}

/* ---------- Form & Donation Validation ---------- */
function initForm(){
  const form = document.getElementById("contact-form");
  if(!form) return;
  const status = document.getElementById("form-status");

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    clearErrors();

    // validate last donation
    if(!validateDonationForm()) return;

    // basic validation
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    let valid = true;
    if(name.length<2){ setError("err-name","Please enter your full name."); valid=false; }
    if(!validateEmail(email)){ setError("err-email","Enter a valid email."); valid=false; }
    if(!valid) return;

    const payload = {
      name,email,phone:form.phone.value.trim(),
      centre:form.centre.value,
      message:form.message.value.trim()
    };

    status.textContent = "Sending…";

    try {
      if(FORM_ENDPOINT){
        const resp = await fetch(FORM_ENDPOINT,{
          method:'POST',
          headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify(payload)
        });
        if(resp.ok){ form.reset(); status.textContent="Thanks — your booking request was sent!"; }
        else { status.textContent="Submission failed. Contact info@sanbs.org.za"; }
      } else {
        console.log("Demo payload:", payload);
        form.reset();
        status.textContent="Form validated locally (demo).";
      }
    } catch(err){
      console.error(err);
      status.textContent="An error occurred.";
    }
  });
}

function validateDonationForm(){
  const type = document.getElementById("donation-type")?.value;
  const lastStr = document.getElementById("last-donation")?.value;
  if(!type || !lastStr) return true;

  const lastDate = new Date(lastStr);
  const today = new Date();

  let requiredDays = type==="whole"?56:type==="plasma"?14:type==="platelets"?30:0;
  if(requiredDays===0) return true;

  const diffDays = (today-lastDate)/(1000*60*60*24);
  if(diffDays<requiredDays){
    alert(`You cannot donate ${type} yet. Wait ${Math.ceil(requiredDays-diffDays)} more day(s).`);
    return false;
  }
  return true;
}

function setError(id,msg){
  const el = document.getElementById(id);
  if(el) el.textContent = msg;
}
function clearErrors(){
  document.querySelectorAll(".form-error").forEach(e=>e.textContent="");
}
function validateEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- Utility ---------- */
function escapeHTML(str){
  return str.replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]));
}
