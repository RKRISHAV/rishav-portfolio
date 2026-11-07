/* Premium progressive enhancement, static hosting friendly.
   Dependencies are OPTIONAL and pinned via index.html. No tracking / no build. */
(() => {
  'use strict';
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine) and (hover:hover)').matches;
  const small = matchMedia('(max-width: 1024px)').matches;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const canMotion = !reduce && !!gsap && !!ST;
  const nav = $('.site-header');
  const progress = $('#page-progress');
  const toggle = $('.nav-toggle');
  const menu = $('#nav-links');
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Core navigation works if every CDN fails. */
  if (toggle && menu) {
    const setMenu = open => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menu.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  const updateProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / max))})`;
  };
  let lastScroll = scrollY;
  let scrollPending = false;
  const onScroll = () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      const current = scrollY;
      const delta = current - lastScroll;
      nav?.classList.toggle('is-scrolled', current > 28);
      if (Math.abs(delta) > 6 && current > 170 && !menu?.classList.contains('is-open')) {
        nav?.classList.toggle('is-hidden', delta > 0);
      } else if (current < 170) nav?.classList.remove('is-hidden');
      lastScroll = current;
      updateProgress();
      scrollPending = false;
    });
  };
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', updateProgress, {passive:true});
  onScroll();

  /* Original .reveal content is never hidden when animations fail. */
  $$('.reveal').forEach(el => el.classList.add('in-view'));

  /* Netlify still owns the form submission. No fetch/JS interception. */
  const form = $('#contact-form');
  form?.addEventListener('submit', () => {
    const button = $('.form-submit', form);
    if (button && form.checkValidity()) button.textContent = 'Sending message ↗';
  });

  /* Autoinjected editorial kicker (retains all original page content). */
  const heroCopy = $('.hero-copy');
  if (heroCopy && !$('.reel-rule', heroCopy)) {
    const band = document.createElement('div');
    band.className = 'reel-rule';
    band.innerHTML = '<span>01 / PERSONAL PORTFOLIO</span><b>ENGINEERING × IMPACT</b><span>2026 ↗</span>';
    heroCopy.prepend(band);
  }

  const skillWords = ['AI & AUTOMATION','FULL STACK','BUSINESS GROWTH','PYTHON','FASTAPI','GENERATIVE AI','CREATIVE ENGINEERING','RAG','REAL-WORLD IMPACT'];
  const impact = $('.impact-strip');
  if (impact && !$('.skills-marquee')) {
    const marquee = document.createElement('div');
    marquee.className = 'skills-marquee';
    marquee.setAttribute('aria-label', skillWords.join(', '));
    marquee.innerHTML = '<div class="skills-marquee__track" aria-hidden="true">' +
      Array.from({length:2}, () => '<div class="skills-marquee__group">' + skillWords.map((w,i) =>
        `<span>${w}</span><span aria-hidden="true">${i%2 ? '✳' : '✦'}</span>`).join('') + '</div>').join('') + '</div>';
    impact.after(marquee);
  }

  if (!canMotion) {
    document.body.classList.remove('is-loading');
    return;
  }
  gsap.registerPlugin(ST);
  gsap.defaults({ease:'power3.out'});
  const ctx = gsap.context(() => {
    /* Preloader is only enabled if the library is already present. */
    const loader = $('.premium-loader');
    if (loader && !sessionStorage.getItem('rishav-motion-seen') && !location.hash) {
      document.body.classList.add('is-loading');
      const counter = {value:0};
      gsap.timeline({defaults:{ease:'power2.inOut'},onComplete:() => {
        document.body.classList.remove('is-loading');
        sessionStorage.setItem('rishav-motion-seen','1');
        ST.refresh();
      }})
        .to(counter,{value:100,duration:1.25,onUpdate:() => {
          const el = $('.premium-loader__number');
          if (el) el.textContent = String(Math.round(counter.value)).padStart(3,'0');
          gsap.set('.premium-loader__bar',{scaleX:counter.value/100});
        }})
        .to('.premium-loader__curtain',{yPercent:-100,duration:.7,ease:'power4.inOut'},'>-.08')
        .to(loader,{yPercent:-101,duration:.75,ease:'power4.inOut'},'<+.08');
    }

    /* Lenis and ScrollTrigger share ONE RAF, disabled on touch / reduced-motion. */
    let lenis;
    if (fine && !small && typeof window.Lenis === 'function') {
      lenis = new window.Lenis({duration:1.15,smoothWheel:true,gestureOrientation:'vertical',wheelMultiplier:0.92});
      lenis.on('scroll',ST.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(link => link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target,{offset:-74,duration:1.15});
        history.replaceState(null,'',id);
      }));
      addEventListener('pagehide',()=>lenis.destroy(),{once:true});
    }

    /* Semantic word-level split: aria-label preserves the full headline for assistive tech. */
    const title = $('#hero-title');
    if (title) {
      const parts = [];
      const originalText = title.textContent.trim();
      title.setAttribute('aria-label',originalText);
      function splitTextNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) {fragment.appendChild(document.createTextNode(part));return;}
            const span = document.createElement('span');
            span.className = 'motion-word';
            span.setAttribute('aria-hidden','true');
            span.textContent = part;
            fragment.appendChild(span);parts.push(span);
          });
          node.replaceWith(fragment);
        } else if (node.nodeType === Node.ELEMENT_NODE) [...node.childNodes].forEach(splitTextNode);
      }
      [...title.childNodes].forEach(splitTextNode);
      gsap.from(parts,{yPercent:120,opacity:0,rotate:2,stagger:.055,duration:1.05,ease:'power4.out',delay:.23,clearProps:'all'});
    }
    gsap.from('.hero-kicker,.hero-lede,.hero-actions,.hero-social',{y:25,opacity:0,stagger:.12,duration:.9,delay:.42,clearProps:'all'});
    gsap.from('.portrait',{scale:.89,opacity:0,duration:1.5,delay:.2,clearProps:'scale,opacity'});
    gsap.to('.hero',{ '--outline-progress':1,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});

    /* Marquee time-scale responds to scroll velocity; eases back to idle speed. */
    const marqueeTrack = $('.skills-marquee__track');
    if (marqueeTrack) {
      gsap.set(marqueeTrack, {animation:'none'});
      const marqueeMotion = gsap.to(marqueeTrack,{xPercent:-50,duration:30,ease:'none',repeat:-1});
      let previousY = scrollY;
      let slowDown;
      addEventListener('scroll',()=>{
        const speed = Math.min(3.5,1+Math.abs(scrollY-previousY)/45);
        previousY=scrollY;
        gsap.to(marqueeMotion,{timeScale:speed,duration:.2,overwrite:true});
        slowDown?.kill();
        slowDown=gsap.delayedCall(.25,()=>gsap.to(marqueeMotion,{timeScale:1,duration:1.1,overwrite:true}));
      },{passive:true});
    }

    /* Scroll reveal — only transform/opacity to protect frame budget. */
    $$('.section-heading,.about-grid>*,.expertise-card,.recognition-card,.timeline-body').forEach(el => {
      gsap.from(el,{y:44,opacity:0,duration:.9,clearProps:'all',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });
    $$('.impact-item strong').forEach(el => {
      const raw = el.innerHTML;
      const text = el.textContent.trim();
      const match = text.match(/^(\d+)/);
      if (!match) return;
      const target = Number(match[1]);
      const initial = raw.replace(match[1],'0');
      const counter = {n:0};
      ST.create({trigger:el,start:'top 92%',once:true,onEnter:() => {
        el.innerHTML = initial;
        gsap.to(counter,{n:target,duration:1.7,ease:'power2.out',onUpdate:() => {
          el.innerHTML=raw.replace(match[1],String(Math.round(counter.n)));
        },onComplete:() => {el.innerHTML=raw;}});
      }});
    });

    /* Native sticky stacked-cards; GSAP only enhances scale, no horizontal overflow. */
    const cards = $$('.project-card');
    if (!small) cards.forEach((card,i) => {
      const art = $('.project-art',card);
      if (art) gsap.from(art,{clipPath:'inset(0 0 100% 0)',duration:1.15,ease:'power4.out',scrollTrigger:{trigger:card,start:'top 90%',once:true},clearProps:'clipPath'});
      if (i < cards.length-1) gsap.to(card,{scale:.94-i*.007,opacity:.68,ease:'none',scrollTrigger:{trigger:cards[i+1],start:'top 85%',end:'top 30%',scrub:true}});
    });
    else cards.forEach(card=>gsap.from(card,{y:34,opacity:0,duration:.8,scrollTrigger:{trigger:card,start:'top 92%',once:true},clearProps:'all'}));

    /* Timeline draws while scrolling; CSS custom property drives a transform. */
    const timeline = $('.journey-section .timeline');
    if (timeline) {
      const state = {progress:0};
      gsap.to(state,{progress:1,ease:'none',scrollTrigger:{trigger:timeline,start:'top 70%',end:'bottom 80%',scrub:true},onUpdate:()=>timeline.style.setProperty('--timeline-progress',state.progress)});
    }

    /* Soft background travel, GPU transform only. */
    $$('.ambient').forEach((node,i)=>gsap.to(node,{y:i%2? -105:110,ease:'none',scrollTrigger:{trigger:node,start:'top bottom',end:'bottom top',scrub:2}}));
    const heading = $('.contact-copy h2');
    if (heading) gsap.from(heading,{y:55,opacity:0,duration:1.25,scrollTrigger:{trigger:heading,start:'top 87%',once:true},clearProps:'all'});

    const navAnchors = $$('.nav-links a[href^="#"]');
    navAnchors.forEach(link => {
      const section = $(link.getAttribute('href'));
      if (!section) return;
      ST.create({trigger:section,start:'top 45%',end:'bottom 45%',onToggle:self=>link.classList.toggle('is-active',self.isActive)});
    });

    /* Throttle three.js to visibility, page focus and pointer capability. */
    if (fine && !small) initPointerVisual();

    addEventListener('load',()=>ST.refresh(),{once:true});
    addEventListener('pagehide',()=>ctx.revert(),{once:true});
  });

  function initPointerVisual() {
    const dot = $('.motion-cursor');
    const ring = $('.motion-cursor-ring');
    if (!dot || !ring) return;
    document.body.classList.add('has-custom-cursor');
    const dotX=gsap.quickTo(dot,'x',{duration:.12,ease:'power3.out'});
    const dotY=gsap.quickTo(dot,'y',{duration:.12,ease:'power3.out'});
    const ringX=gsap.quickTo(ring,'x',{duration:.43,ease:'power3.out'});
    const ringY=gsap.quickTo(ring,'y',{duration:.43,ease:'power3.out'});
    addEventListener('pointermove',event=>{
      dotX(event.clientX); dotY(event.clientY);ringX(event.clientX);ringY(event.clientY);
    },{passive:true});
    $$('a,button,input,textarea,select').forEach(el=>{
      el.addEventListener('pointerenter',()=>dot.classList.add('is-link'));
      el.addEventListener('pointerleave',()=>dot.classList.remove('is-link'));
    });
    $$('.project-card').forEach(card=>{
      card.addEventListener('pointerenter',()=>{dot.classList.add('is-view');dot.textContent='VIEW';});
      card.addEventListener('pointerleave',()=>{dot.classList.remove('is-view');dot.textContent='';});
    });
    /* Magnetic CTAs and restrained 3D card tilt. */
    $$('.btn-primary,.nav-contact').forEach(el=>{
      el.addEventListener('pointermove',event=>{
        const r=el.getBoundingClientRect();
        gsap.to(el,{x:(event.clientX-r.left-r.width/2)*.12,y:(event.clientY-r.top-r.height/2)*.12,duration:.35,overwrite:true});
      });
      el.addEventListener('pointerleave',()=>gsap.to(el,{x:0,y:0,duration:.55,overwrite:true}));
    });
    $$('.project-card').forEach(card=>{
      card.addEventListener('pointermove',event=>{
        const r=card.getBoundingClientRect();
        const nx=(event.clientX-r.left)/r.width-.5;
        const ny=(event.clientY-r.top)/r.height-.5;
        gsap.to($('.project-art',card),{rotationY:nx*3,rotationX:-ny*2,transformPerspective:950,duration:.35,overwrite:true});
      });
      card.addEventListener('pointerleave',()=>gsap.to($('.project-art',card),{rotationX:0,rotationY:0,duration:.6,overwrite:true}));
    });
    const portrait = $('.portrait');
    const heroVisual = $('.hero-visual');
    heroVisual?.addEventListener('pointermove',e=>{
      const r=heroVisual.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      if (portrait) gsap.to(portrait,{rotationY:x*9,rotationX:-y*7,transformPerspective:950,duration:.65,overwrite:true});
    });
    heroVisual?.addEventListener('pointerleave',()=>portrait&&gsap.to(portrait,{rotationY:0,rotationX:0,duration:.8}));

    /* Original Three.js layer is now loaded only once the canvas enters the viewport. */
    const canvas = $('#three-scene');
    if (canvas && 'WebGLRenderingContext' in window && 'IntersectionObserver' in window) {
      let started=false;
      const io=new IntersectionObserver(entries=>{
        if (entries[0].isIntersecting && !started) {
          started=true;io.disconnect();startWebGL(canvas);
        }
      },{rootMargin:'150px'});
      io.observe(canvas);
    }
  }

  async function startWebGL(canvas) {
    let THREE;
    try {THREE=await import('https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js');}
    catch {return;}
    let renderer;
    try {renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});}
    catch {return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(48,1,.1,100);
    camera.position.z=10;
    const group=new THREE.Group();scene.add(group);
    const coords=[];
    for(let i=0;i<850;i++) {
      const y=1-(i/849)*2;
      const radius=Math.sqrt(1-y*y);
      const a=Math.PI*(3-Math.sqrt(5))*i;
      coords.push(Math.cos(a)*radius*3,y*3,Math.sin(a)*radius*3);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
    const material=new THREE.PointsMaterial({color:0xf13c46,size:.031,transparent:true,opacity:.7});
    group.add(new THREE.Points(geometry,material));
    const ringGeometry=new THREE.TorusGeometry(3.7,.012,5,126);
    const ringMaterial=new THREE.MeshBasicMaterial({color:0xf13c46,transparent:true,opacity:.42});
    const ring=new THREE.Mesh(ringGeometry,ringMaterial);ring.rotation.x=1.03;group.add(ring);
    let visible=true,raf=0,disposed=false;
    const obs=new IntersectionObserver(e=>{visible=e[0].isIntersecting;},{threshold:0});
    obs.observe(canvas);
    const resize=()=>{
      const w=canvas.clientWidth,h=canvas.clientHeight;
      if(!w||!h)return;
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    };
    const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
    let targetX=0,targetY=0;
    const move=e=>{
      const b=canvas.getBoundingClientRect();
      targetX=((e.clientX-b.left)/Math.max(1,b.width)-.5)*.35;
      targetY=((e.clientY-b.top)/Math.max(1,b.height)-.5)*.24;
    };
    addEventListener('pointermove',move,{passive:true});
    let last=0;
    function frame(t) {
      if(disposed)return;
      raf=requestAnimationFrame(frame);
      if(document.hidden||!visible||t-last<28)return;
      last=t;
      group.rotation.y+=(targetX+Math.sin(t*.0002)*.2-group.rotation.y)*.02;
      group.rotation.x+=(targetY-group.rotation.x)*.025;
      ring.rotation.z+=.002;
      renderer.render(scene,camera);
    }
    raf=requestAnimationFrame(frame);
    addEventListener('pagehide',()=>{
      disposed=true;cancelAnimationFrame(raf);obs.disconnect();ro.disconnect();
      removeEventListener('pointermove',move);
      geometry.dispose();material.dispose();ringGeometry.dispose();ringMaterial.dispose();renderer.dispose();
    },{once:true});
  }
})();
