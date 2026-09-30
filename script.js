
(function(){
"use strict";

/* ============================================================
   PRODUCT DATA
============================================================ */
const WHATSAPP_NUMBER = "923021930006";
const DELIVERY_CHARGE = 0;
const PRODUCTS = [
  {
    id:"floria",
    name:"FLORIA",
    price:2800,
    desc:"A soft floral signature for everyday elegance.",
    img:"floria.png",
    anim:"fade-up"
  },
  {
    id:"signature",
    name:"SIGNATURE",
    price:2800,
    desc:"The house's defining scent — bold and refined.",
    img:"sign.png",
    anim:"scale-blur"
  },
  {
    id:"the-royal",
    name:"THE ROYAL",
    price:2800,
    desc:"A rich, regal composition built to command a room.",
    img:"royal.png",
    anim:"side-slide"
  },
  {
    id:"aqua-chill",
    name:"AQUA CHILL",
    price:2800,
    desc:"A cool, crisp fragrance for a clean signature.",
    img:"aqua.png",
    anim:"rotate-parallax"
  }
];
const NOTES_TEXT = "Top: Mint + 3 &middot; Heart: Cinnamon + 2 &middot; Base: Patchouli + 2";

function fmt(n){ return "PKR " + n.toLocaleString("en-PK"); }

/* ============================================================
   BUILD PRODUCT GRID
============================================================ */
const productGrid = document.getElementById("productGrid");
PRODUCTS.forEach(p=>{
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.anim = p.anim;
  card.innerHTML = `
    <div class="product-media">
      <img src="${p.img}" alt="${p.name} perfume bottle" loading="lazy">
    </div>
    <h3 class="product-name">${p.name}</h3>
    <p class="product-desc">${p.desc}</p>
    <div class="product-price">${fmt(p.price)}</div>
    <button class="notes-toggle" type="button" aria-expanded="false">
      <i class="fa-solid fa-chevron-down"></i> Fragrance Notes
    </button>
    <div class="notes-panel">${NOTES_TEXT}</div>
    <div class="card-actions">
      <button class="btn btn-outline" data-add="${p.id}">Add To Cart</button>
      <button class="btn btn-gold" data-buy="${p.id}">Buy Now</button>
    </div>
  `;
  productGrid.appendChild(card);
});

/* toggle notes panels */
productGrid.addEventListener("click", e=>{
  const t = e.target.closest(".notes-toggle");
  if(!t) return;
  const panel = t.nextElementSibling;
  const open = panel.classList.toggle("open");
  t.setAttribute("aria-expanded", open ? "true":"false");
});

/* build order-section compact grid */
const orderGrid = document.getElementById("orderGrid");
let selectedOrderProduct = PRODUCTS[0].id;
PRODUCTS.forEach((p,i)=>{
  const item = document.createElement("div");
  item.className = "order-item" + (i===0 ? " selected":"");
  item.dataset.id = p.id;
  item.innerHTML = `
    <img src="${p.img}" alt="${p.name}" loading="lazy">
    <h4>${p.name}</h4>
    <span>${fmt(p.price)}</span>
  `;
  orderGrid.appendChild(item);
});
orderGrid.addEventListener("click", e=>{
  const item = e.target.closest(".order-item");
  if(!item) return;
  orderGrid.querySelectorAll(".order-item").forEach(el=>el.classList.remove("selected"));
  item.classList.add("selected");
  selectedOrderProduct = item.dataset.id;
});

let orderQty = 1;
const orderQtyVal = document.getElementById("orderQtyVal");
document.getElementById("orderQtyPlus").addEventListener("click", ()=>{
  orderQty = Math.min(orderQty+1, 20);
  orderQtyVal.textContent = orderQty;
});
document.getElementById("orderQtyMinus").addEventListener("click", ()=>{
  orderQty = Math.max(orderQty-1, 1);
  orderQtyVal.textContent = orderQty;
});
document.getElementById("orderWhatsappBtn").addEventListener("click", ()=>{
  const p = PRODUCTS.find(x=>x.id===selectedOrderProduct);
  const productTotal = p.price * orderQty;
  const total = productTotal + DELIVERY_CHARGE;
  const msg = `Hello NAQSA FRAGRANCE,\nI want to place an order.\n\nProduct: ${p.name}\nQuantity: ${orderQty}\nPrice: ${fmt(p.price)}\nDelivery: ${fmt(DELIVERY_CHARGE)}\nTotal: ${fmt(total)}`;
  openWhatsapp(msg);
});

/* ============================================================
   TOAST
============================================================ */
let toastTimer;
function showToast(text){
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove("show"), 2600);
}

function openWhatsapp(message){
  const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  window.open(url, "_blank", "noopener");
}

/* ============================================================
   CART (localStorage)
============================================================ */
const CART_KEY = "naqsa_cart_v1";
function loadCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveCart(cart){
  try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(e){}
}
let cart = loadCart();

function addToCart(id, qty){
  qty = qty || 1;
  const existing = cart.find(c=>c.id===id);
  if(existing){ existing.qty += qty; }
  else { cart.push({id, qty}); }
  saveCart(cart);
  renderCart();
  const p = PRODUCTS.find(x=>x.id===id);
  showToast(p.name + " added to bag");
}
function updateQty(id, delta){
  const item = cart.find(c=>c.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){ cart = cart.filter(c=>c.id!==id); }
  saveCart(cart);
  renderCart();
}
function removeFromCart(id){
  cart = cart.filter(c=>c.id!==id);
  saveCart(cart);
  renderCart();
}

const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartSummaryEl = document.getElementById("cartSummary");

function renderCart(){
  const totalCount = cart.reduce((s,c)=>s+c.qty,0);
  cartCountEl.textContent = totalCount;

  if(cart.length === 0){
    cartItemsEl.innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
    cartSummaryEl.style.display = "none";
    return;
  }
  cartSummaryEl.style.display = "block";
  cartItemsEl.innerHTML = "";
  let subtotal = 0;
  cart.forEach(c=>{
    const p = PRODUCTS.find(x=>x.id===c.id);
    if(!p) return;
    const lineTotal = p.price * c.qty;
    subtotal += lineTotal;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="cart-item-info">
        <h4>${p.name}</h4>
        <div class="price">${fmt(lineTotal)}</div>
        <div class="cart-item-qty">
          <button data-dec="${p.id}" aria-label="Decrease">−</button>
          <span>${c.qty}</span>
          <button data-inc="${p.id}" aria-label="Increase">+</button>
        </div>
      </div>
      <button class="cart-remove" data-remove="${p.id}" aria-label="Remove"><i class="fa-solid fa-trash"></i></button>
    `;
    cartItemsEl.appendChild(row);
  });
  const total = subtotal + DELIVERY_CHARGE;
  document.getElementById("sumSubtotal").textContent = fmt(subtotal);
  document.getElementById("sumTotal").textContent = fmt(total);
}
cartItemsEl.addEventListener("click", e=>{
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  const rem = e.target.closest("[data-remove]");
  if(inc) updateQty(inc.dataset.inc, 1);
  if(dec) updateQty(dec.dataset.dec, -1);
  if(rem) removeFromCart(rem.dataset.remove);
});
renderCart();

/* add-to-cart / buy-now buttons (delegated, covers product grid) */
document.addEventListener("click", e=>{
  const addBtn = e.target.closest("[data-add]");
  if(addBtn){ addToCart(addBtn.dataset.add, 1); }
});

/* cart drawer open/close */
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
function openCart(){ cartDrawer.classList.add("open"); cartOverlay.classList.add("open"); }
function closeCart(){ cartDrawer.classList.remove("open"); cartOverlay.classList.remove("open"); }
document.getElementById("cartOpenBtn").addEventListener("click", openCart);
document.getElementById("cartCloseBtn").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.getElementById("cartCheckoutBtn").addEventListener("click", ()=>{
  if(cart.length === 0) return;
  let lines = ["Hello NAQSA FRAGRANCE,","I want to place an order.",""];
  let subtotal = 0;
  cart.forEach(c=>{
    const p = PRODUCTS.find(x=>x.id===c.id);
    if(!p) return;
    const lineTotal = p.price * c.qty;
    subtotal += lineTotal;
    lines.push(`${p.name} x${c.qty} — ${fmt(lineTotal)}`);
  });
  const total = subtotal + DELIVERY_CHARGE;
  lines.push("");
  lines.push(`Subtotal: ${fmt(subtotal)}`);
  lines.push(`Delivery: ${fmt(DELIVERY_CHARGE)}`);
  lines.push(`Total: ${fmt(total)}`);
  lines.push("");
  lines.push("Name: ______");
  lines.push("Phone: ______");
  lines.push("Address: ______");
  lines.push("City: ______");
  openWhatsapp(lines.join("\n"));
});

/* ============================================================
   BUY NOW MODAL
============================================================ */
const buyModalOverlay = document.getElementById("buyModalOverlay");
const buyModalTitle = document.getElementById("buyModalTitle");
const buyForm = document.getElementById("buyForm");
const buyQtyVal = document.getElementById("buyQtyVal");
const modalSummary = document.getElementById("modalSummary");
let buyQty = 1;
let currentBuyProduct = null;

function openBuyModal(id){
  currentBuyProduct = PRODUCTS.find(p=>p.id===id);
  if(!currentBuyProduct) return;
  buyQty = 1;
  buyQtyVal.textContent = buyQty;
  buyModalTitle.textContent = "Order " + currentBuyProduct.name;
  updateModalSummary();
  buyModalOverlay.classList.add("open");
  document.getElementById("buyName").focus();
}
function closeBuyModal(){
  buyModalOverlay.classList.remove("open");
  buyForm.reset();
}
function updateModalSummary(){
  if(!currentBuyProduct) return;
  const productTotal = currentBuyProduct.price * buyQty;
  const total = productTotal + DELIVERY_CHARGE;
  modalSummary.innerHTML = `
    <div><span>Product Total</span><span>${fmt(productTotal)}</span></div>
    <div><span>Delivery</span><span>${fmt(DELIVERY_CHARGE)}</span></div>
    <div class="total"><span>Grand Total</span><span>${fmt(total)}</span></div>
  `;
}
document.getElementById("buyQtyPlus").addEventListener("click", ()=>{
  buyQty = Math.min(buyQty+1,20); buyQtyVal.textContent = buyQty; updateModalSummary();
});
document.getElementById("buyQtyMinus").addEventListener("click", ()=>{
  buyQty = Math.max(buyQty-1,1); buyQtyVal.textContent = buyQty; updateModalSummary();
});
document.addEventListener("click", e=>{
  const buyBtn = e.target.closest("[data-buy]");
  if(buyBtn) openBuyModal(buyBtn.dataset.buy);
});
document.getElementById("buyModalClose").addEventListener("click", closeBuyModal);
buyModalOverlay.addEventListener("click", e=>{ if(e.target === buyModalOverlay) closeBuyModal(); });

buyForm.addEventListener("submit", e=>{
  e.preventDefault();
  if(!currentBuyProduct) return;
  const name = document.getElementById("buyName").value.trim();
  const phone = document.getElementById("buyPhone").value.trim();
  const address = document.getElementById("buyAddress").value.trim();
  const city = document.getElementById("buyCity").value.trim();
  const productTotal = currentBuyProduct.price * buyQty;
  const total = productTotal + DELIVERY_CHARGE;
  const msg = `Hello NAQSA FRAGRANCE,\nI want to place an order.\n\nProduct: ${currentBuyProduct.name}\nQuantity: ${buyQty}\nPrice: ${fmt(currentBuyProduct.price)}\nDelivery: ${fmt(DELIVERY_CHARGE)}\nTotal: ${fmt(total)}\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nCity: ${city}`;
  openWhatsapp(msg);
  closeBuyModal();
});

/* contact form -> whatsapp */
document.getElementById("contactForm").addEventListener("submit", e=>{
  e.preventDefault();
  const name = document.getElementById("cfName").value.trim();
  const phone = document.getElementById("cfPhone").value.trim();
  const message = document.getElementById("cfMsg").value.trim();
  const msg = `Hello NAQSA FRAGRANCE,\n\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;
  openWhatsapp(msg);
  e.target.reset();
});

/* ============================================================
   NAVBAR SCROLL STATE
============================================================ */
const navbar = document.getElementById("navbar");
function onScrollNav(){
  if(window.scrollY > 40) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
}
window.addEventListener("scroll", onScrollNav, {passive:true});
onScrollNav();

/* ============================================================
   MOBILE MENU
   Single control: the hamburger button doubles as the close (X)
   button once the drawer is open (its three lines rotate into an
   X via CSS). The navbar cart icon is hidden while the drawer is
   open so nothing overlaps it.
============================================================ */
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");
const navActions = document.getElementById("navActions");
let menuOpen = false;
function setMenu(open){
  menuOpen = open;
  hamburgerBtn.classList.toggle("open", open);
  hamburgerBtn.setAttribute("aria-expanded", open ? "true":"false");
  hamburgerBtn.setAttribute("aria-label", open ? "Close menu":"Open menu");
  mobileMenu.classList.toggle("open", open);
  menuOverlay.classList.toggle("open", open);
  navActions.classList.toggle("menu-is-open", open);
}
hamburgerBtn.addEventListener("click", ()=> setMenu(!menuOpen));
menuOverlay.addEventListener("click", ()=> setMenu(false));
mobileMenu.querySelectorAll("a").forEach(a=>{
  a.addEventListener("click", ()=> setMenu(false));
});
document.addEventListener("keydown", e=>{
  if(e.key === "Escape" && menuOpen) setMenu(false);
});

/* ============================================================
   SMOOTH SCROLL LINKS (data-scroll / nav links / footer links)
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click", e=>{
    const id = a.getAttribute("href");
    if(id.length < 2) return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    if(window.lenis){ window.lenis.scrollTo(target, {offset:-90}); }
    else { target.scrollIntoView({behavior:"smooth"}); }
  });
});

/* ============================================================
   PRELOADER — build letters (pure DOM, no library dependency)
============================================================ */
function buildPreLine(container, text){
  text.split("").forEach(ch=>{
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch === " " ? "\u00A0" : ch;
    container.appendChild(span);
  });
}
buildPreLine(document.getElementById("preLine1"), "NAQSA");
buildPreLine(document.getElementById("preLine2"), "FRAGRANCE");

function hidePreloaderInstant(){
  const pre = document.getElementById("preloader");
  if(pre && pre.style.display !== "none"){ pre.style.display = "none"; }
}
/* fallback: never trap user on preloader, no matter what */
setTimeout(hidePreloaderInstant, 4500);

/* ============================================================
   GSAP + SCROLLTRIGGER + LENIS
   Everything in this block is optional visual enhancement.
   If any CDN library fails to load or throws, the try/catch
   below guarantees: preloader still hides, hero content is
   still visible (CSS default, not JS-gated) and every button,
   the cart, and WhatsApp ordering keep working normally.
============================================================ */
const gsapReady = (typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined");

if(!gsapReady){
  /* Libraries didn't load — reveal everything immediately, no animation. */
  hidePreloaderInstant();
} else {
  try{
    gsap.registerPlugin(ScrollTrigger);

    /* ---------- Lenis smooth scroll (independent try/catch) ---------- */
    let lenis;
    try{
      lenis = new Lenis({ duration: 1.1, smoothWheel: true, smoothTouch: false });
      window.lenis = lenis;
      lenis.on("scroll", ()=>{ ScrollTrigger.update(); });
      gsap.ticker.add((time)=>{ lenis.raf(time*1000); });
      gsap.ticker.lagSmoothing(0);
    }catch(err){ /* Lenis failed; native scroll still works fine */ }

    /* ---------- Preloader animation ---------- */
    window.addEventListener("load", ()=>{
      try{
        const tl = gsap.timeline({
          onComplete: ()=>{
            const pre = document.getElementById("preloader");
            pre.classList.add("done");
            pre.style.display = "none";
            runHeroTimeline();
            ScrollTrigger.refresh();
          }
        });
        tl.to(".pre-logo .char", {
            opacity:1, y:0, filter:"blur(0px)",
            duration:.8, ease:"power3.out", stagger:.045
          })
          .to("#preSweep", { xPercent:220, duration:1, ease:"power2.inOut" }, "-=.3")
          .to("#preloader", { autoAlpha:0, duration:.7, ease:"power2.inOut", delay:.3 })
          .set("#preloader",{display:"none"});
      }catch(err){ hidePreloaderInstant(); runHeroTimeline(); }
    });

    /* ---------- Hero timeline ---------- */
    let heroPlayed = false;
    window.runHeroTimeline = function runHeroTimeline(){
      if(heroPlayed) return;
      heroPlayed = true;
      const tl = gsap.timeline({ defaults:{ ease:"power3.out" } });
      tl.to(".hero-bg", { autoAlpha:1, duration:1 })
        .fromTo(".hero-orb", { autoAlpha:0 }, { autoAlpha:.55, duration:1.4 }, "<")
        .to("#bottleWrap", { autoAlpha:1, scale:1, duration:1.1, ease:"back.out(1.4)" }, "-=1")
        .to(".hero-title .reveal-line span", {
            y:0, duration:1, stagger:.15, ease:"power4.out"
          }, "-=.9")
        .to(".hero-tagline", { autoAlpha:1, y:0, duration:.8 }, "-=.5")
        .to(".hero-desc", { autoAlpha:1, y:0, duration:.8 }, "-=.6")
        .to(".hero-cta", { autoAlpha:1, y:0, duration:.8 }, "-=.55")
        .to(".hero-rule", { width:120, autoAlpha:1, duration:.9 }, "-=.5");
    };
    const runHeroTimeline = window.runHeroTimeline;
    gsap.set(".hero-title .reveal-line span", { y:"110%" });
    gsap.set(".hero-tagline,.hero-desc,.hero-cta", { autoAlpha:0, y:18 });
    gsap.set("#bottleWrap", { autoAlpha:0, scale:.85 });
    gsap.set(".hero-bg", { autoAlpha:0 });
    gsap.set(".hero-rule", { width:0, autoAlpha:0 });
    /* absolute fallback: if load/preloader flow never fires, still reveal hero */
    setTimeout(()=>{ if(!heroPlayed){ hidePreloaderInstant(); runHeroTimeline(); } }, 5000);

    /* ---------- Delivery banner marquee ---------- */
    const bannerTrack = document.getElementById("bannerTrack");
    const bannerWidth = bannerTrack.scrollWidth / 2;
    gsap.to(bannerTrack, { x: -bannerWidth, duration: 22, ease:"none", repeat:-1 });

    /* ---------- Brand intro — line reveal + parallax ---------- */
    gsap.set(".intro-heading .reveal-line span", { y:"100%", autoAlpha:0 });
    ScrollTrigger.batch(".intro-heading .reveal-line span", {
      start:"top 85%",
      onEnter: els => gsap.to(els, { y:0, autoAlpha:1, duration:.9, stagger:.15, ease:"power4.out" })
    });
    gsap.set(".intro-text", { autoAlpha:0, x:-40 });
    gsap.to(".intro-text", { autoAlpha:1, x:0, duration:1, ease:"power3.out",
      scrollTrigger:{ trigger:"#brand-intro", start:"top 70%" } });
    gsap.fromTo(".intro-rule", { width:0 }, { width:120, duration:1,
        scrollTrigger:{ trigger:"#brand-intro", start:"top 65%" } });
    gsap.to("#introFrame", {
      yPercent:-8, ease:"none",
      scrollTrigger:{ trigger:"#brand-intro", start:"top bottom", end:"bottom top", scrub:1 }
    });

    /* ---------- Product cards — different reveal per card ---------- */
    const cardStart = {
      "fade-up": { autoAlpha:0, y:60 },
      "scale-blur": { autoAlpha:0, scale:.85, filter:"blur(8px)" },
      "side-slide": { autoAlpha:0, x:70 },
      "rotate-parallax": { autoAlpha:0, rotate:6, y:40 }
    };
    document.querySelectorAll(".product-card").forEach(card=>{
      const anim = card.dataset.anim;
      const from = cardStart[anim] || cardStart["fade-up"];
      gsap.set(card, from);
      gsap.to(card, {
        autoAlpha:1, y:0, x:0, scale:1, rotate:0, filter:"blur(0px)",
        duration:1, ease:"power3.out",
        scrollTrigger:{ trigger:card, start:"top 88%" }
      });
    });

    /* ---------- Fragrance pyramid — assembly animation ---------- */
    gsap.set("#layerTop", { y:-60, autoAlpha:0 });
    gsap.set("#layerHeart", { scale:.7, autoAlpha:0 });
    gsap.set("#layerBase", { y:60, autoAlpha:0 });
    gsap.set(".pyr-connector", { scaleY:0, transformOrigin:"top" });
    ScrollTrigger.create({
      trigger:"#notes", start:"top 65%",
      onEnter: ()=>{
        const connectors = document.querySelectorAll(".pyr-connector");
        const tl = gsap.timeline();
        tl.to("#layerTop", { y:0, autoAlpha:1, duration:.8, ease:"bounce.out" })
          .to(connectors[0], { scaleY:1, duration:.4 }, "-=.2")
          .to("#layerHeart", { scale:1, autoAlpha:1, duration:.8, ease:"power3.out" })
          .to(connectors[1], { scaleY:1, duration:.4 }, "-=.2")
          .to("#layerBase", { y:0, autoAlpha:1, duration:.8, ease:"power3.out" });
      }
    });

    /* ---------- Brand story — slow zoom / parallax text ---------- */
    gsap.fromTo("#storyTitle", { scale:.9, autoAlpha:0 },
      { scale:1, autoAlpha:1, duration:1.2, ease:"power2.out",
        scrollTrigger:{ trigger:"#story", start:"top 70%" } });
    gsap.to(".story-bg", {
      scale:1.15, ease:"none",
      scrollTrigger:{ trigger:"#story", start:"top bottom", end:"bottom top", scrub:1 }
    });
    gsap.fromTo(".story-text", { autoAlpha:0, y:24 },
      { autoAlpha:1, y:0, duration:1, delay:.2,
        scrollTrigger:{ trigger:"#story", start:"top 65%" } });

    /* ---------- Why Naqsa — staggered icon reveal ---------- */
    gsap.from(".benefit-card", {
      autoAlpha:0, y:40, duration:.8, stagger:.15, ease:"power3.out",
      scrollTrigger:{ trigger:"#why", start:"top 80%" }
    });
    gsap.from(".benefit-icon", {
      scale:0, rotate:-90, duration:.7, stagger:.15, ease:"back.out(2)",
      scrollTrigger:{ trigger:"#why", start:"top 78%" }
    });

    /* ---------- Order — scale reveal ---------- */
    gsap.fromTo(".order-panel", { autoAlpha:0, scale:.94 },
      { autoAlpha:1, scale:1, duration:1, ease:"power3.out",
        scrollTrigger:{ trigger:"#order", start:"top 78%" } });

    /* ---------- Contact — fade + line draw ---------- */
    gsap.from(".contact-row", {
      autoAlpha:0, x:-24, duration:.7, stagger:.12,
      scrollTrigger:{ trigger:"#contact", start:"top 75%" }
    });
    gsap.from(".contact-form .field, .contact-form button", {
      autoAlpha:0, y:20, duration:.6, stagger:.1,
      scrollTrigger:{ trigger:"#contact", start:"top 70%" }
    });

    /* ---------- Footer — upward reveal ---------- */
    gsap.from("footer .footer-top > *", {
      autoAlpha:0, y:30, duration:.8, stagger:.12,
      scrollTrigger:{ trigger:"footer", start:"top 90%" }
    });

    /* ---------- Hero cursor parallax ---------- */
    const heroSection = document.getElementById("hero");
    heroSection.addEventListener("mousemove", e=>{
      const rect = heroSection.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - .5;
      const mouseY = (e.clientY - rect.top) / rect.height - .5;
      gsap.to("#orb1", { x: mouseX*40, y: mouseY*30, duration:1, ease:"power2.out" });
      gsap.to("#orb2", { x: mouseX*-30, y: mouseY*-20, duration:1.2, ease:"power2.out" });
      gsap.to("#bottleGlow", { x: mouseX*24, y: mouseY*18, duration:.8, ease:"power2.out" });
      gsap.to("#bottleWrap", { x: mouseX*14, y: mouseY*10, duration:.9, ease:"power2.out" });
    });
    heroSection.addEventListener("mouseleave", ()=>{
      gsap.to(["#orb1","#orb2","#bottleGlow","#bottleWrap"], { x:0, y:0, duration:1 });
    });
    gsap.to("#bottleWrap", {
      y:"+=14", duration:2.6, ease:"sine.inOut", yoyo:true, repeat:-1, delay:1.6
    });

  }catch(err){
    /* Any unexpected animation error: never let it break the rest of the site. */
    hidePreloaderInstant();
    document.querySelectorAll(".product-card, .hero-tagline, .hero-desc, .hero-cta").forEach(el=>{
      el.style.opacity = "1"; el.style.transform = "none";
    });
    console.warn("NAQSA: animation layer disabled after an error, site remains fully functional.", err);
  }
}

/* ============================================================
   CUSTOM CURSOR
============================================================ */
const isFinePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
if(isFinePointer){
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  let dx=0,dy=0,rx=0,ry=0;
  window.addEventListener("mousemove", e=>{ dx=e.clientX; dy=e.clientY; });
  function loopCursor(){
    rx += (dx-rx)*.16; ry += (dy-ry)*.16;
    dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loopCursor);
  }
  loopCursor();
  document.querySelectorAll("a,button,.product-card,input,textarea").forEach(el=>{
    el.addEventListener("mouseenter", ()=> ring.classList.add("is-active"));
    el.addEventListener("mouseleave", ()=> ring.classList.remove("is-active"));
  });
}

/* ============================================================
   GLOBAL GOLD PARTICLE SYSTEM (single canvas, section-aware)
============================================================ */
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let cw, ch, dpr;
function resizeCanvas(){
  dpr = Math.min(window.devicePixelRatio||1, 2);
  cw = window.innerWidth; ch = window.innerHeight;
  canvas.width = cw*dpr; canvas.height = ch*dpr;
  canvas.style.width = cw+"px"; canvas.style.height = ch+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const sectionBehavior = [
  { id:"hero", mode:"cursor" },
  { id:"products", mode:"slow" },
  { id:"notes", mode:"vertical" },
  { id:"brand-intro", mode:"drift" },
  { id:"contact", mode:"subtle" }
];
function currentMode(){
  const y = window.scrollY + window.innerHeight*.5;
  for(const s of sectionBehavior){
    const el = document.getElementById(s.id);
    if(!el) continue;
    const top = el.offsetTop, bottom = top + el.offsetHeight;
    if(y >= top && y <= bottom) return s.mode;
  }
  return "drift";
}

const PARTICLE_COUNT = window.innerWidth < 640 ? 42 : 78;
const particles = [];
function makeParticle(){
  return {
    x: Math.random()*cw,
    y: Math.random()*ch,
    r: Math.random()*1.8 + .4,
    o: Math.random()*.5 + .15,
    vx: (Math.random()-.5)*.15,
    vy: (Math.random()-.5)*.15 - .05,
    baseVy: (Math.random()-.5)*.15 - .05
  };
}
for(let i=0;i<PARTICLE_COUNT;i++){ particles.push(makeParticle()); }

let cursorX = cw/2, cursorY = ch/2;
window.addEventListener("mousemove", e=>{ cursorX = e.clientX; cursorY = e.clientY; });

function drawParticles(){
  ctx.clearRect(0,0,cw,ch);
  const mode = currentMode();
  particles.forEach(p=>{
    if(mode === "cursor"){
      const dx = (cursorX - p.x)*0.0009;
      const dy = (cursorY - p.y)*0.0009;
      p.vx += dx*0.02; p.vy += dy*0.02;
      p.vx *= .96; p.vy *= .96;
    } else if(mode === "vertical"){
      p.vx *= .98; p.vy = p.baseVy - .08;
    } else if(mode === "slow"){
      p.vx *= .99; p.vy = p.baseVy*.6;
    } else if(mode === "subtle"){
      p.vx *= .99; p.vy = p.baseVy*.3;
    } else {
      p.vy = p.baseVy;
    }
    p.x += p.vx; p.y += p.vy;
    if(p.x < -10) p.x = cw+10; if(p.x > cw+10) p.x = -10;
    if(p.y < -10) p.y = ch+10; if(p.y > ch+10) p.y = -10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(212,175,106,${p.o})`;
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
requestAnimationFrame(drawParticles);

})();
