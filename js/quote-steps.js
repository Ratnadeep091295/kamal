(() => {
 const form=document.querySelector('.quote-study-f .kt-quote-form');
 if(!form)return;
 const sections=[...form.querySelectorAll('.ed-fieldset')],progress=[...form.querySelectorAll('.quote-steps li')];
 const controls=form.querySelector('.quote-step-controls'),back=form.querySelector('.quote-step-back'),next=form.querySelector('.quote-step-next'),end=form.querySelector('.quote-form-end');
 function show(step,focus){
  sections.forEach((section,i)=>section.hidden=i!==step);
  progress.forEach((item,i)=>i===step?item.setAttribute('aria-current','step'):item.removeAttribute('aria-current'));
  back.hidden=step===0;next.hidden=step===1;end.hidden=step===0;
  if(focus){const field=sections[step].querySelector('input,select,textarea');field.focus({preventScroll:true});form.scrollIntoView({block:'start',behavior:'instant'});}
 }
 next.addEventListener('click',()=>{for(const field of sections[0].querySelectorAll('input,select,textarea')){if(!field.reportValidity())return;}show(1,true);});
 back.addEventListener('click',()=>show(0,true));
 form.addEventListener('keydown',event=>{if(event.key==='Enter'&&!sections[0].hidden&&event.target.tagName==='INPUT'){event.preventDefault();next.click();}});
 document.body.classList.add('quote-steps-enabled');controls.hidden=false;form.style.scrollMarginTop='110px';show(0,false);
})();
