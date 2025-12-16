var u=Object.defineProperty;var h=(n,o,e)=>o in n?u(n,o,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[o]=e;var a=(n,o,e)=>h(n,typeof o!="symbol"?o+"":o,e);(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function e(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(r){if(r.ep)return;r.ep=!0;const s=e(r);fetch(r.href,s)}})();const m={apiUrl:"https://dev-workflows-api.wr.io",storageUrl:"https://dev-storage-api.wr.io",analyticsEnabled:!0};class f extends HTMLElement{constructor(){super();a(this,"config");a(this,"processConfig");a(this,"shadow");this.shadow=this.attachShadow({mode:"open"}),this.config=m,this.processConfig=this.parseAttributes()}parseAttributes(){return{org:this.getAttribute("org")||"",processId:this.getAttribute("process")||"",theme:this.getAttribute("theme")||"light",locale:this.getAttribute("locale")||"en"}}connectedCallback(){this.render(),this.attachEventListeners()}disconnectedCallback(){this.cleanup()}async loadProcessConfig(){const e=`${this.config.storageUrl}/${this.processConfig.org}/processes/${this.processConfig.processId}/index.jsonld`,t=await fetch(e);if(!t.ok)throw new Error(`Failed to load process config: ${t.statusText}`);return t.json()}async startProcess(e){const t=`${this.config.apiUrl}/api/v1/workflows/start`,r=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({org:this.processConfig.org,processId:this.processConfig.processId,input:e})});if(!r.ok)throw new Error(`Failed to start process: ${r.statusText}`);return r.json()}}class g extends f{constructor(){super(...arguments);a(this,"menuItems",[]);a(this,"cart",new Map)}render(){this.shadow.innerHTML=`
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .bizcom-order {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .menu-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .menu-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .menu-item h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
        }
        .menu-item .price {
          font-weight: bold;
          color: #2563eb;
        }
        .cart {
          border-top: 2px solid #e0e0e0;
          padding-top: 16px;
        }
        .cart-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .total {
          font-size: 20px;
          font-weight: bold;
          margin: 16px 0;
        }
        button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
        }
        button:hover {
          background: #1d4ed8;
        }
        button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .loading {
          text-align: center;
          padding: 40px;
        }
        .error {
          color: #dc2626;
          padding: 12px;
          background: #fee2e2;
          border-radius: 6px;
          margin-bottom: 16px;
        }
        .branding {
          text-align: center;
          margin-top: 16px;
          font-size: 12px;
          color: #6b7280;
        }
        .branding a {
          color: #2563eb;
          text-decoration: none;
        }
      </style>
      <div class="bizcom-order">
        <div class="loading">Loading menu...</div>
      </div>
    `,this.loadMenu()}attachEventListeners(){}cleanup(){this.cart.clear()}async loadMenu(){try{const e=await this.loadProcessConfig();this.menuItems=e.menu||[],this.renderMenu()}catch{this.renderError("Failed to load menu")}}renderMenu(){const e=this.shadow.querySelector(".bizcom-order");e&&(e.innerHTML=`
      <div class="menu-grid" id="menu"></div>
      <div class="cart">
        <h3>Your Order</h3>
        <div id="cart-items"></div>
        <div class="total" id="total">Total: $0.00</div>
        <button id="checkout" disabled>Checkout</button>
      </div>
      <div class="branding">
        <a href="https://wr.io" target="_blank">Powered by WR.IO</a>
      </div>
    `,this.renderMenuItems(),this.attachMenuListeners())}renderMenuItems(){const e=this.shadow.getElementById("menu");e&&(e.innerHTML=this.menuItems.map(t=>`
      <div class="menu-item" data-id="${t.id}">
        <h3>${t.name}</h3>
        <p>${t.description||""}</p>
        <div class="price">$${t.price.toFixed(2)}</div>
      </div>
    `).join(""))}attachMenuListeners(){this.shadow.querySelectorAll(".menu-item").forEach(r=>{r.addEventListener("click",()=>{const s=r.getAttribute("data-id");s&&this.addToCart(s)})});const t=this.shadow.getElementById("checkout");t==null||t.addEventListener("click",()=>this.handleCheckout())}addToCart(e){const t=this.cart.get(e)||0;this.cart.set(e,t+1),this.updateCart()}updateCart(){const e=this.shadow.getElementById("cart-items"),t=this.shadow.getElementById("total"),r=this.shadow.getElementById("checkout");if(!e||!t||!r)return;let s=0;const i=[];this.cart.forEach((c,l)=>{const d=this.menuItems.find(p=>p.id===l);d&&(s+=d.price*c,i.push(`
          <div class="cart-item">
            <span>${c}x ${d.name}</span>
            <span>$${(d.price*c).toFixed(2)}</span>
          </div>
        `))}),e.innerHTML=i.join("")||"<p>Cart is empty</p>",t.textContent=`Total: $${s.toFixed(2)}`,r.disabled=this.cart.size===0}async handleCheckout(){try{const e={items:Array.from(this.cart.entries()).map(([r,s])=>({itemId:r,count:s,item:this.menuItems.find(i=>i.id===r)})),total:this.calculateTotal()},t=await this.startProcess(e);console.log("Order started:",t.instanceId),alert(`Order placed! Instance ID: ${t.instanceId}`)}catch{this.renderError("Failed to place order")}}calculateTotal(){let e=0;return this.cart.forEach((t,r)=>{const s=this.menuItems.find(i=>i.id===r);s&&(e+=s.price*t)}),e}renderError(e){const t=this.shadow.querySelector(".bizcom-order");t&&(t.innerHTML=`<div class="error">${e}</div>`)}}typeof window<"u"&&!customElements.get("bizcom-order")&&customElements.define("bizcom-order",g);
