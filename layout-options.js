(() => {
 const names={a:'Tighter original',b:'Split sections',c:'Side introduction',d:'Overlapping form',e:'Open rows',f:'Two steps'};
 const heroes={
  a:{name:'Compact overlay',home:'Keep the immersive blue treatment. The shorter portrait crop puts more emphasis on the cab.',subpage:'The shortest original header: a 200px image with the title over it. Page content appears sooner.'},
  b:{name:'Photo first',home:'Show the entire truck in a landscape photograph, then introduce the headline and actions below.',subpage:'Show the entire fleet before the title. The full photograph makes this option taller than the overlay.'},
  c:{name:'Copy first',home:'Lead with the message and quote action. A wide photograph below keeps the full vehicle visible.',subpage:'Place the title first and the fleet underneath. More photographic detail, with a taller header.'},
  d:{name:'Inset photograph',home:'A full landscape photo sits between a smaller headline and the actions. Familiar navy, with more room for the truck.',subpage:'A white title card overlaps the fleet panorama. The photograph stays distinct from the title.'},
  e:{name:'Overlapping action bar',home:'A wide photograph flows into a small, light action card. The gold quote button stands out beneath the image.',subpage:'A 160px photograph with a strong left gradient. The most compact photo header in this round.'},
  f:{name:'Light editorial',home:'A white background, navy headline and natural photograph reduce the amount of blue on the first screen.',subpage:'A light title area followed by a shallow panorama. A quieter transition into the page.'}
 };
 let round='new',group='home',quote='d',device=window.innerWidth<761?'mobile':'desktop';
 const frame=document.querySelector('#quote-frame'),stage=document.querySelector('.quote-stage'),screen=stage.querySelector('.quote-screen');
 function sizePreviews(){
  document.querySelectorAll('.phone-screen').forEach(el=>{const ratio=el.clientWidth/390;el.style.height=`${780*ratio}px`;el.querySelector('iframe').style.transform=`scale(${ratio})`;});
  const width=device==='mobile'?390:1440;
  const available=stage.clientWidth-parseFloat(getComputedStyle(stage).paddingLeft)*2-(device==='mobile'?8:0);
  const scale=Math.min(available/width,1),height=device==='mobile'?780:1100;
  screen.style.width=`${width*scale}px`;screen.style.height=`${height*scale}px`;
  frame.style.width=`${width}px`;frame.style.height=`${height}px`;frame.style.transform=`scale(${scale})`;
 }
 function setDevice(value){device=value;stage.dataset.mode=value;document.querySelectorAll('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.device===value)));sizePreviews();}
 function renderHeroes(){
  const keys=round==='new'?['d','e','f']:['a','b','c'];
  document.querySelectorAll('.hero-card').forEach((card,i)=>{
   const key=keys[i],info=heroes[key];
   card.querySelector('.option-label>span').textContent=key.toUpperCase();
   card.querySelector('h3').textContent=group==='subpage'&&key==='d'?'Floating title':group==='subpage'&&key==='e'?'Slim panorama':info.name;
   card.querySelector(':scope > p').textContent=info[group];card.querySelector('.recommend')?.remove();
   const iframe=card.querySelector('iframe');iframe.dataset.mobileFrame=key;iframe.src=`study-${group}-${key}.html`;iframe.title=`${group==='home'?'Homepage':'Subpage'} mobile option ${key.toUpperCase()}: ${info.name}`;
   const link=card.querySelector('.open-option');link.dataset.mobileOpen=key;link.href=iframe.src;link.textContent=`Open option ${key.toUpperCase()} ↗`;
  });
 }
 function setQuote(value){
  quote=value;document.querySelectorAll('[data-quote]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.quote===quote)));
  frame.src=`study-quote-${quote}.html`;frame.title=`Quote option ${quote.toUpperCase()}: ${names[quote]}`;
  document.querySelector('#quote-preview-title').textContent=`${quote.toUpperCase()} / ${names[quote]}`;
  document.querySelector('#quote-open').href=frame.src;
 }
 document.querySelectorAll('[data-round]').forEach(button=>button.addEventListener('click',()=>{
  round=button.dataset.round;document.querySelectorAll('[data-round]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelector('.round-bar strong').textContent=round==='new'?'D–F':'A–C';
  document.querySelectorAll('[data-quote]').forEach(b=>b.hidden=!(round==='new'?'def':'abc').includes(b.dataset.quote));
  renderHeroes();setQuote(round==='new'?'d':'b');
 }));
 document.querySelectorAll('[data-hero]').forEach(button=>button.addEventListener('click',()=>{
  group=button.dataset.hero;document.querySelectorAll('[data-hero]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderHeroes();
 }));
 document.querySelectorAll('[data-quote]').forEach(button=>button.addEventListener('click',()=>setQuote(button.dataset.quote)));
 document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>setDevice(button.dataset.device)));
 document.querySelectorAll('.review-tabs a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('.review-tabs a').forEach(a=>a.classList.toggle('active',a===link));}));
 new ResizeObserver(sizePreviews).observe(stage);window.addEventListener('resize',sizePreviews);setDevice(device);sizePreviews();
})();
