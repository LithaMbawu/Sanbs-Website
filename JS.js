/* ============================================================
   SANBS CLEAN & OPTIMIZED JAVASCRIPT
   ============================================================ */

/* ---------- Global Data ---------- */
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

/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

  renderStockSummary();
  renderStockTable();
  renderGallery();
  initLightbox();
  populateCentreSelect();
  initSearchFilter();
  initDonationForm();
  initContactForm();
  initEmailJS();
  initAccordion();
  initTabs();

  // MAP — Province-based only (clean version)
  initProvinceMap();
});

/* ============================================================
   STOCK DISPLAY
   ============================================================ */

function renderStockSummary(){
  const ul = document.getElementById("stock-summary");
  if(!ul) return;
  ul.innerHTML = "";

  DATA.stock.forEach(s => {
    ul.innerHTML += `
      <li>
        <strong>${s.type}</strong> —
        <span class="pill ${s.status.toLowerCase()}">${s.status}</span>
      </li>`;
  });
}

function renderStockTable(){
  const out = document.getElementById("stock-table");
  if(!out) return;
  out.innerHTML = "";

  DATA.stock.forEach(s => {
    out.innerHTML += `
      <div class="stock-card">
        <div><strong>${s.type}</strong></div>
        <div><span class="pill ${s.status.toLowerCase()}">${s.status}</span></div>
      </div>`;
  });
}

/* ============================================================
   MAP — Province Based (Final Version)
   ============================================================ */

function initProvinceMap(){
  const mapContainer = document.getElementById("map");
  const dropdown = document.getElementById("location");
  if(!mapContainer || !dropdown) return;

  // Initialise map centered on South Africa
  const map = L.map("map").setView([-28.5, 24], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  let markers = [];

  const centreData = {
    "Johannesburg": [
      { name:"SANBS Johannesburg Centre", coords:[-26.2041,28.0473] },
      { name:"Sandton City Donor Centre", coords:[-26.1076,28.0567] },
      { name:"Eastgate Donor Centre", coords:[-26.1793,28.1243] },
      { name:"Mall of Africa Donor Centre", coords:[-25.9881,28.1087] }
    ],
    "Pretoria": [
      { name:"SANBS Pretoria (Hatfield)", coords:[-25.7460,28.2400] },
      { name:"Menlyn Park Donor Centre", coords:[-25.7832,28.2751] },
      { name:"Brooklyn Mall Donor Centre", coords:[-25.7692,28.2361] },
      { name:"Wonderpark Donor Centre", coords:[-25.6781,28.1351] }
    ],
    "Durban": [
      { name:"SANBS Durban Centre", coords:[-29.8194,30.8865] },
      { name:"Gateway Donor Centre", coords:[-29.7265,31.0675] },
      { name:"Chatsworth Donor Centre", coords:[-29.9267,30.8784] },
      { name:"KwaMashu Donor Centre", coords:[-29.7448,30.9933] }
    ]
  };

  dropdown.addEventListener("change", () => {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const region = dropdown.value;
    if(!region || !centreData[region]) return;

    centreData[region].forEach(c => {
      const marker = L.marker(c.coords).addTo(map).bindPopup(`<b>${c.name}</b>`);
      markers.push(marker);
    });

    if(markers.length > 0){
      map.fitBounds(L.featureGroup(markers).getBounds(), { padding:[30,30] });
    }
  });
}

/* ============================================================
   DONATION FORM VALIDATION
   ============================================================ */

function initDonationForm(){
  const form = document.getElementById("donationForm");
  if(!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const type = document.getElementById("donation-type").value;
    const last = document.getElementById("last-donation").value;
    const success = document.getElementById("successBox");

    if(!last){
      alert("Please enter your last donation date.");
      return;
    }

    const lastDate = new Date(last);
    const today = new Date();

    const requiredDays =
      type === "whole" ? 56 :
      type === "plasma" ? 14 :
      30;

    const diff = (today - lastDate) / (1000 * 60 * 60 * 24);

    if(diff < requiredDays){
      alert(`You must wait ${Math.ceil(requiredDays - diff)} more day(s).`);
      return;
    }

    if(success){
      success.style.display = "block";
      setTimeout(() => success.style.display = "none", 4000);
    }

    form.reset();
  });
}

/* ============================================================
   SEARCH + CENTRE LIST
   ============================================================ */

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

function initSearchFilter(){
  const input = document.getElementById("centre-search");
  const list = document.getElementById("centre-list");
  if(!input || !list) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    list.innerHTML = "";

    const results = DATA.centres.filter(c =>
      (c.name + c.address).toLowerCase().includes(q)
    );

    if(results.length === 0){
      list.innerHTML = "<li>No centres found.</li>";
      return;
    }

    results.forEach(c => {
      list.innerHTML += `<li>${c.name} — ${c.address}</li>`;
    });
  });
}

/* ============================================================
   GALLERY + LIGHTBOX
   ============================================================ */

function renderGallery(){
  const grid = document.getElementById("gallery-grid");
  if(!grid) return;

  DATA.gallery.forEach((img, i) => {
    grid.innerHTML += `
      <div class="gallery-item">
        <img src="${img.src}" alt="${img.alt}" data-index="${i}">
      </div>`;
  });
}

function initLightbox(){
  const lb = document.getElementById("lightbox");
  if(!lb) return;

  const content = lb.querySelector(".lightbox-content");
  let index = 0;

  document.querySelectorAll("#gallery-grid img").forEach(img => {
    img.addEventListener("click", () => {
      index = parseInt(img.dataset.index);
      show(index);
      lb.setAttribute("aria-hidden", "false");
    });
  });

  lb.querySelector(".lightbox-close").onclick = () =>
    lb.setAttribute("aria-hidden", "true");

  lb.querySelector(".lightbox-prev").onclick = () => show(index - 1);
  lb.querySelector(".lightbox-next").onclick = () => show(index + 1);

  function show(i){
    if(i < 0) i = DATA.gallery.length - 1;
    if(i >= DATA.gallery.length) i = 0;
    index = i;
    content.innerHTML = `<img src="${DATA.gallery[i].src}" alt="${DATA.gallery[i].alt}">`;
  }
}

/* ============================================================
   CONTACT FORM
   ============================================================ */

function initContactForm(){
  const form = document.getElementById("contactForm");
  const success = document.getElementById("successBox");
  if(!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    if(success){
      success.style.display = "block";
      setTimeout(() => success.style.display = "none", 4000);
    }
    form.reset();
  });
}

/* ============================================================
   EMAILJS
   ============================================================ */

function initEmailJS(){
  if(!window.emailjs) return;

  emailjs.init("yamob9uqCpd8ILA5w");

  const enquiryForm = document.getElementById("enquiryForm");
  const msg = document.getElementById("formMessage");

  if(!enquiryForm) return;

  enquiryForm.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      name: enquiryForm.name.value,
      email: enquiryForm.email.value,
      phone: enquiryForm.phone.value,
      enquiryType: enquiryForm.enquiryType.value,
      details: enquiryForm.details.value
    };

    emailjs.send("service_2ba8otn", "template_i9angzj", data)
      .then(() => {
        msg.textContent = "Enquiry submitted successfully!";
        msg.style.color = "green";
        enquiryForm.reset();
      })
      .catch(() => {
        msg.textContent = "Error. Try again.";
        msg.style.color = "red";
      });
  });
}

/* ============================================================
   ACCORDION + TABS
   ============================================================ */

function initAccordion(){
  document.querySelectorAll(".accordion").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const panel = btn.nextElementSibling;
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    });
  });
}

function initTabs(){
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}



    function loadPage(page) {
      document.getElementById("content").src = 'html/'+page;
    }
