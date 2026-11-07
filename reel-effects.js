// Reel-inspired typography strip and subtle pointer response.
(function(){
 const hero=document.querySelector('.hero-copy');
 if(hero && !hero.querySelector('.reel-rule')){
   const bar=document.createElement('div');bar.className='reel-rule';
   bar.innerHTML='<span>01 / PERSONAL PORTFOLIO</span><b>ENGINEERING × IMPACT</b><span>2026 ↗</span>';
   hero.insertBefore(bar,hero.firstChild);
 }
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer:fine)').matches)return;
 document.querySelectorAll('.btn-primary,.nav-contact').forEach(el=>{
  el.classList.add('reel-magnetic');
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.10;const y=(e.clientY-r.top-r.height/2)*.10;el.style.transform=`translate(${x}px,${y}px)`});
  el.addEventListener('pointerleave',()=>{el.style.transform=''});
 });
})();
