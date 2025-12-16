var u=Object.defineProperty;var f=(d,i,e)=>i in d?u(d,i,{enumerable:!0,configurable:!0,writable:!0,value:e}):d[i]=e;var p=(d,i,e)=>f(d,typeof i!="symbol"?i+"":i,e);(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&t(o)}).observe(document,{childList:!0,subtree:!0});function e(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(r){if(r.ep)return;r.ep=!0;const s=e(r);fetch(r.href,s)}})();const g={apiUrl:"https://dev-workflows-api.wr.io",storageUrl:"https://dev-storage-api.wr.io",stripePublishableKey:"pk_test_51QbbqkIHOdCVkw9OvXPxfkCXMFJJzLEqKTewXljMjrHvnGe6w56kgAwDxE9J4XZhbZ0UvDfN3bUJDO7svVxs7z6g00EXxb9ICK",analyticsEnabled:!0};class y extends HTMLElement{constructor(){super();p(this,"config");p(this,"processConfig");p(this,"shadow");this.shadow=this.attachShadow({mode:"open"}),this.config=g,this.processConfig=this.parseAttributes()}parseAttributes(){return{org:this.getAttribute("org")||"",processId:this.getAttribute("process")||"",theme:this.getAttribute("theme")||"light",locale:this.getAttribute("locale")||"en"}}connectedCallback(){this.render(),this.attachEventListeners()}disconnectedCallback(){this.cleanup()}async loadProcessConfig(){const e=`${this.config.storageUrl}/${this.processConfig.org}/processes/${this.processConfig.processId}/index.jsonld`,t=await fetch(e);if(!t.ok)throw new Error(`Failed to load process config: ${t.statusText}`);return t.json()}async startProcess(e){const t=`${this.config.apiUrl}/api/v1/workflows/start`,r=crypto.randomUUID(),s=`${this.processConfig.org}-orders`,o={processId:this.processConfig.processId,instanceId:r,projectId:s,ownerIdentifier:this.processConfig.org,variables:e,type:"general"};console.log("[BizcomSDK] Starting workflow with payload:",JSON.stringify(o,null,2));const a=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(!a.ok){const c=await a.json().catch(()=>({}));throw new Error(c.error||`Failed to start process: ${a.statusText}`)}return a.json()}async loadStripe(e){return window.Stripe?window.Stripe(e):new Promise((t,r)=>{const s=document.createElement("script");s.src="https://js.stripe.com/v3/",s.onload=()=>{window.Stripe?t(window.Stripe(e)):r(new Error("Stripe.js failed to load"))},s.onerror=()=>r(new Error("Failed to load Stripe.js")),document.head.appendChild(s)})}}class b extends y{constructor(){super(...arguments);p(this,"menuItems",[]);p(this,"cart",new Map)}render(){this.shadow.innerHTML=`
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
        <a href="https://wr.io" target="_blank">Powered by wr.io</a>
      </div>
    `,this.renderMenuItems(),this.attachMenuListeners())}renderMenuItems(){const e=this.shadow.getElementById("menu");e&&(e.innerHTML=this.menuItems.map(t=>`
      <div class="menu-item" data-id="${t.id}">
        <h3>${t.name}</h3>
        <p>${t.description||""}</p>
        <div class="price">$${t.price.toFixed(2)}</div>
      </div>
    `).join(""))}attachMenuListeners(){this.shadow.querySelectorAll(".menu-item").forEach(r=>{r.addEventListener("click",()=>{const s=r.getAttribute("data-id");s&&this.addToCart(s)})});const t=this.shadow.getElementById("checkout");t==null||t.addEventListener("click",()=>this.handleCheckout())}addToCart(e){const t=this.cart.get(e)||0;this.cart.set(e,t+1),this.updateCart()}updateCart(){const e=this.shadow.getElementById("cart-items"),t=this.shadow.getElementById("total"),r=this.shadow.getElementById("checkout");if(!e||!t||!r)return;let s=0;const o=[];this.cart.forEach((a,c)=>{const n=this.menuItems.find(l=>l.id===c);n&&(s+=n.price*a,o.push(`
          <div class="cart-item">
            <span>${a}x ${n.name}</span>
            <span>$${(n.price*a).toFixed(2)}</span>
          </div>
        `))}),e.innerHTML=o.join("")||"<p>Cart is empty</p>",t.textContent=`Total: $${s.toFixed(2)}`,r.disabled=this.cart.size===0}async handleCheckout(){const e=this.shadow.getElementById("checkout");if(e)try{e.disabled=!0,e.textContent="Processing...";const t={items:Array.from(this.cart.entries()).map(([c,n])=>({itemId:c,count:n,item:this.menuItems.find(l=>l.id===c)})),total:this.calculateTotal()},r=await fetch(`${this.config.apiUrl}/api/v1/payments/create-intent`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:t.items,metadata:{org:this.processConfig.org,processId:this.processConfig.processId}})});if(!r.ok)throw new Error("Failed to create payment intent");const{clientSecret:s,paymentIntentId:o}=await r.json(),a=await this.loadStripe(this.config.stripePublishableKey);await this.showPaymentForm(a,s,o,t)}catch(t){console.error("Checkout error:",t),this.renderError(t instanceof Error?t.message:"Failed to process checkout"),e.disabled=!1,e.textContent="Checkout"}}async showPaymentForm(e,t,r,s){var l;const o=this.shadow.querySelector(".bizcom-order");if(!o)return;o.innerHTML=`
      <div class="payment-form">
        <h3>Payment Details</h3>
        <div id="payment-element"></div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <button id="pay-button" style="flex: 1;">Pay $${s.total.toFixed(2)}</button>
          <button id="cancel-button" style="flex: 1; background: #6b7280;">Cancel</button>
        </div>
        <div id="payment-message" class="error" style="display: none; margin-top: 16px;"></div>
      </div>
    `;const a=e.elements({clientSecret:t});a.create("payment").mount(this.shadow.getElementById("payment-element"));const n=this.shadow.getElementById("pay-button");n==null||n.addEventListener("click",async()=>{try{n.disabled=!0,n.textContent="Processing...";const{error:h}=await e.confirmPayment({elements:a,redirect:"if_required"});if(h)throw new Error(h.message);const m=await this.startProcess({...s,paymentIntentId:r});this.showSuccess(m.instanceId)}catch(h){const m=this.shadow.getElementById("payment-message");m&&(m.textContent=h instanceof Error?h.message:"Payment failed",m.style.display="block"),n.disabled=!1,n.textContent=`Pay $${s.total.toFixed(2)}`}}),(l=this.shadow.getElementById("cancel-button"))==null||l.addEventListener("click",()=>{this.renderMenu()})}showSuccess(e){var r;const t=this.shadow.querySelector(".bizcom-order");t&&(t.innerHTML=`
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order has been received and is being processed.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
          Instance ID: ${e}
        </p>
        <button id="new-order" style="margin-top: 24px;">Place Another Order</button>
      </div>
    `,(r=this.shadow.getElementById("new-order"))==null||r.addEventListener("click",()=>{this.cart.clear(),this.renderMenu()}))}calculateTotal(){let e=0;return this.cart.forEach((t,r)=>{const s=this.menuItems.find(o=>o.id===r);s&&(e+=s.price*t)}),e}renderError(e){const t=this.shadow.querySelector(".bizcom-order");t&&(t.innerHTML=`<div class="error">${e}</div>`)}}typeof window<"u"&&!customElements.get("bizcom-order")&&customElements.define("bizcom-order",b);
