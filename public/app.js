const catalog=[
{id:"hoodie",name:"Vault Oversized Hoodie",price:48.99,category:"Apparel",popular:true},
{id:"mousepad",name:"Neon Grid Desk Mat",price:24.99,category:"Setup gear",popular:true},
{id:"controller",name:"Pro Wireless Controller",price:69.99,category:"Accessories",popular:true},
{id:"poster",name:"Victory Royale Art Print",price:15.99,category:"Art",popular:false},
{id:"tee",name:"Drop Zone Graphic Tee",price:22.99,category:"Apparel",popular:false},
{id:"headset",name:"Studio Gaming Headset",price:54.99,category:"Setup gear",popular:true}
];
let basket={};let category="All",quick="All";
const $=s=>document.querySelector(s), money=n=>"£"+n.toFixed(2);
async function loadProducts(){try{const r=await fetch("/api/products");if(r.ok){const fresh=await r.json();catalog.splice(0,catalog.length,...fresh);$("#productGrid").innerHTML=catalog.map(p=>`<article class="product-card" data-id="${p.id}"><div class="product-photo" style="${p.image?'background-image:url('+JSON.stringify(p.image)+')':''}"><button class="heart" aria-label="Save item">♡</button></div><div class="product-meta"><span>${p.category.toUpperCase()}</span><span>✦ FEATURED</span></div><h3>${p.name}</h3><div class="product-bottom"><strong>${money(p.price)}</strong><button class="add-btn">＋ Add to bag</button></div></article>`).join("");}}catch{}render();updateBasket()}
function render(){
 const q=$("#searchInput").value.toLowerCase(),sort=$("#sortSelect").value;
 let items=catalog.filter(p=>(category==="All"||p.category===category)&&(quick==="All"||(quick==="Under £30"&&p.price<30)||(quick==="Popular"&&p.popular))&&(p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)));
 if(sort==="low")items.sort((a,b)=>a.price-b.price);if(sort==="high")items.sort((a,b)=>b.price-a.price);
 document.querySelectorAll(".product-card").forEach(card=>{card.hidden=!items.some(p=>p.id===card.dataset.id)});
 $("#resultCount").textContent=`Showing ${items.length} ${items.length===1?"find":"finds"}`;$("#emptyState").hidden=items.length!==0;
}
function updateBasket(){
 const count=Object.values(basket).reduce((a,b)=>a+b,0);$("#basketCount").textContent=count;$("#drawerCount").textContent=`(${count})`;
 const entries=Object.entries(basket).filter(([,q])=>q>0);$("#basketItems").innerHTML=entries.length?entries.map(([id,q])=>{const p=catalog.find(x=>x.id===id);return `<div class="basket-line"><div><strong>${p.name}</strong><small>${money(p.price)} each</small><div class="qty-controls"><button data-qty="-1" data-id="${id}">−</button><span>${q}</span><button data-qty="1" data-id="${id}">+</button><button data-remove="${id}" aria-label="Remove">×</button></div></div><div class="line-price">${money(p.price*q)}</div></div>`}).join(""):'<div class="basket-empty">Your bag is waiting for its first pick.</div>';
 const total=entries.reduce((sum,[id,q])=>sum+catalog.find(p=>p.id===id).price*q,0);$("#subtotal").textContent=money(total);
}
function toast(msg){$("#toast").textContent=msg;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),1700)}
$("#productGrid").addEventListener("click",e=>{const card=e.target.closest(".product-card");if(!card)return;const id=card.dataset.id;if(e.target.closest(".add-btn")){basket[id]=(basket[id]||0)+1;updateBasket();toast("Added to your bag ✦")}if(e.target.closest(".heart")){const b=e.target.closest(".heart");b.classList.toggle("saved");b.textContent=b.classList.contains("saved")?"♥":"♡"}});
document.querySelectorAll(".category").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".category").forEach(b=>b.classList.remove("active"));btn.classList.add("active");category=btn.dataset.category;render()}));
document.querySelectorAll(".filter-chip").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".filter-chip").forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");quick=btn.dataset.filter;render()}));
$("#searchInput").addEventListener("input",render);$("#sortSelect").addEventListener("change",render);
function drawer(open){document.body.classList.toggle("drawer-open",open)}
$("#basketOpen").onclick=()=>drawer(true);$("#basketClose").onclick=()=>drawer(false);$("#backdrop").onclick=()=>drawer(false);
$("#basketItems").addEventListener("click",e=>{const id=e.target.dataset.id;if(e.target.dataset.qty){basket[id]=Math.max(0,(basket[id]||0)+Number(e.target.dataset.qty));if(!basket[id])delete basket[id];updateBasket()}if(e.target.dataset.remove){delete basket[e.target.dataset.remove];updateBasket()}});
$("#checkoutBtn").onclick=async()=>{const items=Object.entries(basket).map(([id,quantity])=>({id,quantity}));if(!items.length){toast("Your bag is empty");return}const note=$("#checkoutNote");note.textContent="Connecting to secure checkout…";try{const r=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Checkout unavailable");location.href=data.url}catch(err){note.textContent=err.message+" (Demo preview: run the server and add Stripe keys to enable payment.)"}};
$("#loginBtn").onclick=()=>toast("Customer accounts are not enabled in this starter yet.");$("#mobileMenu").onclick=()=>toast("Use the search and category filters to explore.");
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#searchInput").focus()}if(e.key==="Escape")drawer(false)});
loadProducts();