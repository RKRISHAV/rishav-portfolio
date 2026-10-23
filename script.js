// Lightweight enhancements; the site remains readable when 3D or third-party CDNs are unavailable.
const header = document.querySelector('.site-header');
const progress = document.getElementById('page-progress');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateScroll() {
  const top = Math.max(0, window.scrollY);
  header.classList.toggle('is-scrolled', top > 28);
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.width = `${Math.min(100, (top / max) * 100)}%`;
}
window.addEventListener('scroll', updateScroll, { passive:true });
updateScroll();
navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navLinks.classList.toggle('is-open', open);
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navToggle.setAttribute('aria-expanded','false');
  navToggle.setAttribute('aria-label','Open navigation');
  navLinks.classList.remove('is-open');
}));
document.getElementById('year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !prefersReduced) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    });
  }, {threshold:0.08,rootMargin:'0px 0px -25px 0px'});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));

// On phones and for reduced-motion preferences, CSS parallax remains the graceful fallback.
if (!prefersReduced && window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      card.style.transform = `perspective(900px) rotateX(${-y*3.5}deg) rotateY(${x*3.5}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

// Three.js visual: 3D point-cloud globe and slow orbital rings. No trackers, no analytics.
(async function init3D() {
  if (prefersReduced || !('WebGLRenderingContext' in window)) return;
  const canvas = document.getElementById('three-scene');
  if (!canvas) return;
  let THREE;
  try { THREE = await import('https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js'); }
  catch(err) { console.info('3D library unavailable: CSS fallback is active.'); return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'}); }
  catch(err) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45,1,.1,100);
  camera.position.z = 10;
  const globe = new THREE.Group(); scene.add(globe);
  const fibonacci = [];
  for(let i=0,n=1000;i<n;i++){
    const y=1-(i/(n-1))*2, radius=Math.sqrt(1-y*y), theta=Math.PI*(3-Math.sqrt(5))*i;
    fibonacci.push(Math.cos(theta)*radius*2.95,y*2.95,Math.sin(theta)*radius*2.95);
  }
  const sphereGeometry = new THREE.BufferGeometry();
  sphereGeometry.setAttribute('position',new THREE.Float32BufferAttribute(fibonacci,3));
  const dots = new THREE.Points(sphereGeometry,new THREE.PointsMaterial({color:0xb8a3ff,size:0.028,transparent:true,opacity:.64,sizeAttenuation:true}));
  globe.add(dots);
  const ringMat = new THREE.MeshBasicMaterial({color:0x87e8cf,transparent:true,opacity:.3,side:THREE.DoubleSide});
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(3.55,.011,8,180),ringMat);
  r1.rotation.set(.7,.2,.5);globe.add(r1);
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(3.92,.006,8,180),new THREE.MeshBasicMaterial({color:0xc3ff82,transparent:true,opacity:.2}));
  r2.rotation.set(1.3,-.36,.8);globe.add(r2);
  const stars=[];
  for(let i=0;i<260;i++) {
    const p=i*2.39996323, rr=3.3+Math.sqrt(i/260)*4;
    stars.push(Math.cos(p)*rr,(Math.sin(p*1.7)*3.9),-2-Math.sin(p)*rr*.3);
  }
  const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));
  const starfield=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xd7ceff,size:.019,transparent:true,opacity:.68}));scene.add(starfield);
  let targetX=0,targetY=0;
  const onPointer=e=>{
    const b=canvas.getBoundingClientRect();
    targetX=((e.clientX-b.left)/b.width-.5)*.25;
    targetY=((e.clientY-b.top)/b.height-.5)*.23;
  };
  window.addEventListener('pointermove',onPointer,{passive:true});
  let frame=0, visible=true;
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}}
  const resizeObs = new ResizeObserver(resize);resizeObs.observe(canvas);resize();
  const visObs = new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}, {threshold:0});
  visObs.observe(canvas);
  const clock = new THREE.Clock();
  function animate() {
    frame=requestAnimationFrame(animate);
    if(document.hidden || !visible) return;
    const t=clock.getElapsedTime();
    globe.rotation.y += (t*.075 + targetX-globe.rotation.y)*.018;
    globe.rotation.x += (Math.sin(t*.22)*.10+targetY-globe.rotation.x)*.02;
    r1.rotation.z+=.0008; r2.rotation.z-=.0005;
    renderer.render(scene,camera);
  }
  animate();
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',onPointer);resizeObs.disconnect();visObs.disconnect();sphereGeometry.dispose();starGeo.dispose();r1.geometry.dispose();r2.geometry.dispose();ringMat.dispose();renderer.dispose();},{once:true});
})();
