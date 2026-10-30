(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  const $ = s => document.querySelector(s);
  // Reuse the existing enquiry fields; retain their IDs and submission handlers.
  const enquiryCard = $('#enquireBody').closest('.form-card');
  const enquiryPosition = document.createComment('Desktop enquiry position');
  enquiryCard.before(enquiryPosition);
  const mobileHero = matchMedia('(max-width: 700px)');
  function positionEnquiry() {
    if (mobileHero.matches) {
      $('.hero-grid').appendChild(enquiryCard);
      enquiryCard.classList.add('hero-enquiry');
    } else {
      enquiryPosition.after(enquiryCard);
      enquiryCard.classList.remove('hero-enquiry');
    }
  }
  mobileHero.addEventListener('change', positionEnquiry);
  positionEnquiry();
  const sidebar = $('#sidebar'), toggle = $('#menuToggle'), shade = $('.menu-shade');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let previousFocus, activeDialog, dialogScrollY = 0;
  const menu = open => {
    sidebar.classList.toggle('is-open',open); shade.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    document.body.classList.toggle('no-scroll',open);
    sidebar.inert = !open && innerWidth < 1024;
    if(open) sidebar.querySelector('nav a').focus();
  };
  toggle.addEventListener('click',()=>menu(!sidebar.classList.contains('is-open')));
  shade.addEventListener('click',()=>{menu(false);toggle.focus()});
  addEventListener('resize',()=>{if(innerWidth>=1024)menu(false);sidebar.inert=innerWidth<1024&&!sidebar.classList.contains('is-open')});
  sidebar.inert=innerWidth<1024;
  const navLinks=[...sidebar.querySelectorAll('nav a')];
  let replaySection = () => {};
  const mark = id => navLinks.forEach(a=>{if(a.hash===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
  const animate = section => {
    if(reduced.matches)return;
    section.classList.add('section-arrive');
    replaySection(section);
  };
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');
    if(!a||a.id==='openPrivacy')return;
    const target=document.getElementById(a.hash.slice(1));
    if(!target)return;
    e.preventDefault(); menu(false);
    if(a.hash==='#main'){target.tabIndex=-1;target.focus();return;}
    target.scrollIntoView({behavior:'instant',block:'start'});
    animate(target); mark(a.hash);
    history.pushState(null,'',a.hash);
    if(a.closest('nav')){target.tabIndex=-1;target.focus({preventScroll:true});}
  });
  const sections=[...document.querySelectorAll('main>section[id]')];
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)mark('#'+entry.target.id)})},{rootMargin:'-15% 0px -70% 0px'});
    sections.forEach(s=>observer.observe(s));
  }
  mark(location.hash||'#home');
  /* Animate individual elements without replacing their designed rotation/layout. */
  const motionRules = [
    ['.hero-content', 'left'], ['.hero-art', 'zoom-out'],
    ['.section-head', 'up'], ['.quote-card', 'right'],
    ['.overview-grid .render', 'left'], ['.overview-copy', 'right'],
    ['.signature-residence', 'zoom-in'], ['.residence-option', 'up'],
    ['.residence-intro', 'right'], ['.highlights-media', 'zoom-out'],
    ['.highlight-list li', 'right'], ['.amenity', 'zoom-in'],
    ['.plan-card', 'alternate'], ['.tour-media', 'zoom-out'],
    ['.tour-copy', 'right'], ['.map-card', 'left'],
    ['.loc-list', 'right'], ['.gallery-grid li', 'zoom-in'],
    ['.dev-card', 'up'], ['.faq', 'alternate'],
    ['.contact-media', 'left'], ['.form-card', 'right']
  ];
  const motionItems = [], running = new Map();
  motionRules.forEach(([selector,effect]) => {
    document.querySelectorAll(selector).forEach((element,index) => {
      element.dataset.motion = effect === 'alternate' ? (index%2?'right':'left') : effect;
      element.dataset.motionDelay = String((index%4)*65);
      motionItems.push(element);
    });
  });
  function visible(element) {
    const r=element.getBoundingClientRect();
    return r.bottom>0 && r.top<innerHeight-20;
  }
  function play(element,delay=Number(element.dataset.motionDelay)) {
    if(reduced.matches || !element.animate)return;
    running.get(element)?.cancel();
    const distance=innerWidth<700?22:46;
    const effect=element.dataset.motion;
    const start={opacity:.12,translate:'0 32px',scale:'1'};
    if(effect==='left')start.translate=`-${distance}px 0`;
    if(effect==='right')start.translate=`${distance}px 0`;
    if(effect==='zoom-in'){start.translate='0 15px';start.scale='.94';}
    if(effect==='zoom-out'){start.translate='0 0';start.scale='1.045';}
    const animation=element.animate([start,{opacity:1,translate:'0 0',scale:'1'}],{
      duration:effect.startsWith('zoom')?850:700,delay,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'
    });
    running.set(element,animation);
    animation.onfinish=()=>{if(running.get(element)===animation)running.delete(element)};
  }
  const inView=new Set();
  if('IntersectionObserver' in window){
    const reveals=new IntersectionObserver(entries=>{
      entries.forEach(({target,isIntersecting})=>{
        if(isIntersecting){if(!inView.has(target))play(target);inView.add(target);}
        else{inView.delete(target);running.get(target)?.cancel();running.delete(target);}
      });
    },{threshold:0,rootMargin:'0px 0px -35px 0px'});
    motionItems.forEach(element=>reveals.observe(element));
  }
  replaySection=section=>motionItems.filter(el=>section.contains(el)&&visible(el)).forEach(el=>play(el,0));
  reduced.addEventListener('change',()=>{if(reduced.matches){running.forEach(a=>a.cancel());running.clear();}});
  document.addEventListener('focusin',event=>{
    running.forEach((animation,element)=>{if(element.contains(event.target)){animation.cancel();running.delete(element);}});
  });

  /* A measured gutter rail connects headings without crossing text or imagery. */
  const main=$('main'), chapters=[...document.querySelectorAll('main>.section')];
  const journey=document.createElement('div');
  journey.className='journey';journey.setAttribute('aria-hidden','true');
  const rail=document.createElement('div');rail.className='journey-rail';
  const fill=document.createElement('div');fill.className='journey-fill';rail.append(fill);journey.append(rail);
  const stops=chapters.map(section=>{
    const link=document.createElement('span');link.className='journey-link';
    const node=document.createElement('span');node.className='journey-node';
    journey.append(link,node);
    return {section,anchor:section.querySelector('.section-label'),link,node,y:0};
  });
  main.prepend(journey);
  let railTop=0,railLength=1,progressPending=false;
  function updateJourney(){
    const cursor=scrollY+innerHeight*.42-(main.getBoundingClientRect().top+scrollY);
    fill.style.transform=`scaleY(${Math.max(0,Math.min(1,(cursor-railTop)/railLength))})`;
    stops.forEach(stop=>stop.node.classList.toggle('is-passed',cursor>=stop.y));
    progressPending=false;
  }
  function measureJourney(){
    const origin=main.getBoundingClientRect();
    const x=innerWidth<700?12:Math.max(17,origin.width*.025);
    stops.forEach(stop=>{
      const anchor=stop.anchor;
      // offsetTop avoids measuring transient entrance translations.
      let y=0,left=0,node=anchor;
      while(node && node!==main){y+=node.offsetTop;left+=node.offsetLeft;node=node.offsetParent;}
      stop.y=y+anchor.offsetHeight/2;
      stop.node.style.cssText=`left:${x-3}px;top:${stop.y-3}px`;
      stop.link.style.cssText=`left:${x}px;top:${stop.y-15}px;width:${Math.max(7,left+26-x)}px`;
    });
    railTop=stops[0].y;railLength=stops.at(-1).y-railTop;
    rail.style.cssText=`left:${x}px;top:${railTop}px;height:${railLength}px`;
    updateJourney();
  }
  addEventListener('scroll',()=>{if(!progressPending){progressPending=true;requestAnimationFrame(updateJourney)}},{passive:true});
  addEventListener('resize',measureJourney);
  addEventListener('load',measureJourney);
  document.fonts?.ready.then(measureJourney);
  if('ResizeObserver' in window)new ResizeObserver(measureJourney).observe(main);
  measureJourney();
  function open(dialog){
    if(sidebar.classList.contains('is-open'))menu(false);
    previousFocus=document.activeElement; activeDialog=dialog;
    dialogScrollY=window.scrollY;
    document.documentElement.style.setProperty('--dialog-scroll-top',`-${dialogScrollY}px`);
    document.documentElement.classList.add('dialog-open');
    dialog.hidden=false;document.body.classList.add('no-scroll');
    document.querySelector('main').inert=true;sidebar.inert=true;
    $('.site-footer').inert=true;$('.mobile-header').inert=true;
    dialog.querySelector('button,input,a').focus();
  }
  function close(){
    if(!activeDialog)return;
    activeDialog.hidden=true;activeDialog=null;document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('dialog-open');
    document.documentElement.style.removeProperty('--dialog-scroll-top');
    window.scrollTo({top:dialogScrollY,behavior:'instant'});
    document.querySelector('main').inert=false;sidebar.inert=innerWidth<1024;
    $('.site-footer').inert=false;$('.mobile-header').inert=false;
    previousFocus?.focus({preventScroll:true});
  }
  document.addEventListener('click',e=>{
    const trigger=e.target.closest('[data-popup]');
    if(trigger){$('#popupTitle').textContent=trigger.dataset.popup;open($('#enquiryModal'));return;}
    if(e.target.closest('[data-close]'))close();
  });
  $('#openPrivacy').addEventListener('click',e=>{e.preventDefault();open($('#privacyModal'))});
  const gallery=[...document.querySelectorAll('.gallery-item')];let index=0;
  function show(i){index=(i+gallery.length)%gallery.length;$('#lbImg').src=gallery[index].href;$('#lbImg').alt=gallery[index].querySelector('img').alt;$('#lbCaption').textContent=gallery[index].dataset.caption}
  gallery.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();show(i);open($('#lightbox'))}));
  $('#lightbox').addEventListener('click',e=>{const action=e.target.closest('[data-lb]')?.dataset.lb;if(action==='close'||e.target===$('#lightbox'))close();if(action==='prev')show(index-1);if(action==='next')show(index+1)});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(activeDialog)close();else if(sidebar.classList.contains('is-open')){menu(false);toggle.focus()}}
    if(!activeDialog)return;
    if(activeDialog.id==='lightbox'){if(e.key==='ArrowLeft')show(index-1);if(e.key==='ArrowRight')show(index+1)}
    if(e.key==='Tab'){
      const focusable=[...activeDialog.querySelectorAll('button,input:not([type="hidden"]),a[href],select')].filter(el=>el.getClientRects().length&&!el.disabled);
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  $('#mapFacade').addEventListener('click',function(){const frame=document.createElement('iframe');frame.src='https://www.google.com/maps?q=Neopolis+Kokapet+Hyderabad&output=embed';frame.title='Neopolis, Kokapet Hyderabad location map';frame.loading='lazy';frame.referrerPolicy='no-referrer-when-downgrade';frame.allowFullscreen=true;this.replaceWith(frame)});
})();
