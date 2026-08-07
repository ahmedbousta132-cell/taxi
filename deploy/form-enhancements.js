// form-enhancements.js
// Adds a small i18n map, a success modal and wires form submit/wa handlers to show it and reset forms.
(function(){
  'use strict';
  const i18n={
    fr:{b_city_placeholder:'Saisir la ville',d_city_placeholder:'Saisir la ville / code postal',modal_title:'Formulaire envoyé',modal_body:"Merci — notre équipe vous contactera bientôt.",modal_ok:'OK'},
    en:{b_city_placeholder:'Enter city',d_city_placeholder:'Enter city / postcode',modal_title:'Form submitted',modal_body:'Thanks — our team will contact you back soon.',modal_ok:'OK'}
  };
  function currentLang(){
    const htmlLang=document.documentElement.lang; if(htmlLang) return htmlLang.split('-')[0];
    const btn=document.getElementById('langBtn'); if(btn){const t=btn.textContent.trim().toLowerCase();return t.startsWith('fr')?'fr':'en';}
    return 'fr';
  }
  function applyTranslations(l){
    try{
      const bcity=document.getElementById('b_city'); if(bcity) bcity.placeholder=i18n[l].b_city_placeholder;
      const dcity=document.getElementById('d_city'); if(dcity) dcity.placeholder=i18n[l].d_city_placeholder;
      const modal=document.getElementById('formSuccessModal'); if(modal){const t=modal.querySelector('.fsm-title');const b=modal.querySelector('.fsm-body');const o=modal.querySelector('.fsm-ok'); if(t) t.textContent=i18n[l].modal_title; if(b) b.textContent=i18n[l].modal_body; if(o) o.textContent=i18n[l].modal_ok}
      const devisOk=document.getElementById('devisOk'); if(devisOk){const h=devisOk.querySelector('h3'); if(h) h.textContent=(l==='fr'?"Demande prête à l'envoi":"Request ready to send"); const p=devisOk.querySelector('p'); if(p) p.textContent=(l==='fr'?"Votre WhatsApp ou votre messagerie s'est ouverte avec le récapitulatif. Réponse sous 2h.":'Your WhatsApp or email opened with the summary. We will reply within 2 hours.'); const btn=devisOk.querySelector('button'); if(btn) btn.textContent=i18n[l].modal_ok}
    }catch(e){console.warn('i18n apply error',e)}
  }
  function observeLangToggle(){
    document.querySelectorAll('[data-lang]').forEach(a=>a.addEventListener('click',function(){setTimeout(()=>applyTranslations(this.getAttribute('data-lang')||currentLang()),80)}));
    const lb=document.getElementById('langBtn'); if(lb) lb.addEventListener('click',()=>setTimeout(()=>applyTranslations(currentLang()),120));
    const obs=new MutationObserver(()=>applyTranslations(currentLang()));
    obs.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  function createModal(){
    if(document.getElementById('formSuccessModal')) return;
    const css=`#formSuccessModal{position:fixed;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.28);z-index:9999;opacity:0;pointer-events:none;transition:opacity .28s ease}#formSuccessModal.open{opacity:1;pointer-events:auto}#formSuccessModal .fsm-box{min-width:260px;max-width:92vw;background:#fff;border-radius:12px;padding:18px 20px;box-shadow:0 20px 60px rgba(0,0,0,0.45);transform:translateY(10px) scale(.98);transition:transform .28s cubic-bezier(.2,.9,.2,1)}#formSuccessModal.open .fsm-box{transform:none}#formSuccessModal .fsm-title{font-size:18px;margin:0 0 8px}#formSuccessModal .fsm-body{margin:0 0 12px;color:#444}#formSuccessModal .fsm-ok{padding:10px 16px;border-radius:8px;border:none;background:#123047;color:#fff;cursor:pointer}`;
    const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    const wrap=document.createElement('div'); wrap.id='formSuccessModal'; wrap.innerHTML=`<div class="fsm-box" role="dialog" aria-modal="true"><h3 class="fsm-title"></h3><p class="fsm-body"></p><div style="text-align:right"><button class="fsm-ok" type="button"></button></div></div>`;
    wrap.addEventListener('click',e=>{if(e.target===wrap) closeModal();});
    document.body.appendChild(wrap);
    wrap.querySelector('.fsm-ok').addEventListener('click',closeModal);
  }
  function showModal(){ createModal(); const m=document.getElementById('formSuccessModal'); if(!m) return; applyTranslations(currentLang()); m.classList.add('open'); const btn=m.querySelector('.fsm-ok'); if(btn) btn.focus(); clearTimeout(window._fsm_auto); window._fsm_auto=setTimeout(()=>closeModal(),4200); }
  function closeModal(){ const m=document.getElementById('formSuccessModal'); if(!m) return; m.classList.remove('open'); clearTimeout(window._fsm_auto); }
  function wireFormActions(){
    const bookForm=document.querySelector('#book form');
    if(bookForm){ bookForm.addEventListener('submit', e=>{ e.preventDefault(); showModal(); try{bookForm.reset()}catch(e){} }); }
    const bWa=document.getElementById('b_wa'); if(bWa) bWa.addEventListener('click',()=>setTimeout(()=>{showModal(); const f=document.querySelector('#book form'); if(f) f.reset();},220));
    const bMail=document.getElementById('b_mail'); if(bMail) bMail.addEventListener('click',()=>setTimeout(()=>{showModal(); const f=document.querySelector('#book form'); if(f) f.reset();},420));
    const dWa=document.getElementById('d_wa'); if(dWa) dWa.addEventListener('click',()=>setTimeout(()=>{showModal(); const f=document.querySelector('#devis form'); if(f) f.reset();},160));
    const dMail=document.getElementById('d_mail'); if(dMail) dMail.addEventListener('click',()=>setTimeout(()=>{showModal(); const f=document.querySelector('#devis form'); if(f) f.reset();},800));
  }
  document.addEventListener('DOMContentLoaded',()=>{ applyTranslations(currentLang()); observeLangToggle(); wireFormActions(); });
})();
