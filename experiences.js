(() => {
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const toggle=document.querySelector('#motion');
let manual=null;
const scenes=[];
function setup(id,paint){
 const win=document.getElementById(id),canvas=document.getElementById(id+'-canvas'),ctx=canvas.getContext('2d');
 if(!ctx)return;
 let w=1,h=1,raf=null,last=0,time=0;
 const paused=()=>manual===null?reduced.matches:manual;
 function render(dt){time+=dt;paint(ctx,w,h,time,dt);}
 function frame(now){raf=null;if(win.hidden||document.hidden||paused()){last=0;return;}render(last?Math.min((now-last)/1000,.05):0);last=now;raf=requestAnimationFrame(frame);}
 function sync(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;if(!win.hidden){render(0);if(!document.hidden&&!paused())raf=requestAnimationFrame(frame);}}
 new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);sync();}).observe(canvas);
 new MutationObserver(sync).observe(win,{attributes:true,attributeFilter:['hidden']});
 scenes.push(sync);sync();
}
toggle.addEventListener('click',()=>{manual=toggle.getAttribute('aria-pressed')==='true';scenes.forEach(f=>f());});
reduced.addEventListener('change',()=>{manual=null;scenes.forEach(f=>f());});
document.addEventListener('visibilitychange',()=>scenes.forEach(f=>f()));
// Low-resolution heat propagation inspired by the classic DOOM fire effect.
const fw=160,fh=100,heat=new Uint8Array(fw*fh),surface=document.createElement('canvas');
surface.width=fw;surface.height=fh;
const fc=surface.getContext('2d'),pixels=fc.createImageData(fw,fh);
let fireStep=0;
function burn(){
 for(let x=0;x<fw;x++)heat[(fh-1)*fw+x]=255;
 for(let y=0;y<fh-1;y++)for(let x=0;x<fw;x++){
  const drift=Math.floor(Math.random()*3)-1,source=(y+1)*fw+(x+drift+fw)%fw;
  heat[y*fw+x]=Math.max(0,heat[source]-Math.floor(Math.random()*10));
 }
}
for(let i=0;i<fh*2;i++)burn();
setup('fire',(c,w,h,t,dt)=>{
 fireStep+=dt;
 while(fireStep>=1/30){burn();fireStep-=1/30;}
 for(let i=0;i<heat.length;i++){
  const v=heat[i]/255,j=i*4;
  pixels.data[j]=Math.min(255,v*3*255);
  pixels.data[j+1]=Math.max(0,Math.min(255,(v*3-1)*255));
  pixels.data[j+2]=Math.max(0,(v*3-2)*255);
  pixels.data[j+3]=255;
 }
 fc.putImageData(pixels,0,0);c.imageSmoothingEnabled=false;c.drawImage(surface,0,0,w,h);
});
const glyphs='アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789';
setup('matrix',(c,w,h,t)=>{
 c.fillStyle='#010904';c.fillRect(0,0,w,h);c.font='16px monospace';
 for(let col=0;col<w/19;col++){
  const speed=35+(col*37%80),head=((t*speed+col*137)%(h+340))-100;
  for(let j=0;j<20;j++){
   const y=head-j*19;if(y<0||y>h)continue;
   c.fillStyle=j===0?'#d9ffe9':'rgba(38,240,112,'+(1-j/20)*.8+')';
   const index=Math.floor(t*8+col*17+j*13)%glyphs.length;
   c.fillText(glyphs[index],col*19,y);
  }
 }
});
setup('nyan',(c,w,h,t)=>{
 c.fillStyle='#091849';c.fillRect(0,0,w,h);
 for(let i=0;i<45;i++){const x=((i*97-t*(25+i%4*13))%w+w)%w,y=(i*61)%h;c.fillStyle='#d7ebff';c.fillRect(x,y,3,3);if(i%4===0){c.fillRect(x-3,y+1,9,1);c.fillRect(x+1,y-3,1,9);}}
 const scale=Math.max(2,Math.min(w/95,h/55)),x=w*.53,y=h*.48+Math.sin(t*9)*scale;
 const rainbow=['#ff4343','#ff982b','#fff14f','#58db54','#4cafff','#ae69e8'];
 rainbow.forEach((color,i)=>{c.fillStyle=color;for(let k=0;k<14;k++){const xx=x-k*scale*5;c.fillRect(xx-scale*5,y+(i-3)*scale*3+Math.sin(k*.9+t*9)*scale,scale*5+1,scale*3+1);}});
 c.save();c.translate(x,y);c.scale(scale,scale);
 const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 box(-1,-12,30,23,'#252337');box(1,-10,26,19,'#e9bb81');box(4,-8,21,15,'#f69ac1');
 for(let i=0;i<12;i++)box(5+i*7%19,-6+i*5%12,1,1,'#e6539c');
 box(20,-9,17,17,'#252337');box(20,-14,6,8,'#252337');box(31,-14,6,8,'#252337');box(22,-11,2,4,'#aaa9b8');box(33,-11,2,4,'#aaa9b8');box(22,-7,13,13,'#aaa9b8');
 box(24,-3,2,2,'#171525');box(31,-3,2,2,'#171525');box(28,0,1,2,'#171525');box(26,3,6,1,'#171525');box(22,0,2,2,'#ee91b0');box(33,0,2,2,'#ee91b0');
 const step=Math.sin(t*10)>0?1:-1;box(3,11,5,3+step,'#aaa9b8');box(20,11,5,3-step,'#aaa9b8');box(-8,-1,8,4,'#aaa9b8');box(-10,-4+step,4,5,'#aaa9b8');c.restore();
});
const player=document.getElementById('aime-player'),aime=document.getElementById('aime');
function startVideo(){
 if(player.querySelector('iframe'))return;
 const iframe=document.createElement('iframe');
 iframe.src='https://www.youtube-nocookie.com/embed/zvq9r6R6QAY?autoplay=1&rel=0';
 iframe.title='Caramella Girls — Caramelldansen (Swedish Original)';
 iframe.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';
 iframe.allowFullscreen=true;
 iframe.referrerPolicy='strict-origin-when-cross-origin';
 player.replaceChildren(iframe);
}
new MutationObserver(()=>{if(aime.hidden)player.replaceChildren();else startVideo();}).observe(aime,{attributes:true,attributeFilter:['hidden']});

const rocks=Array.from({length:85},(_,i)=>({x:Math.sin(i*127.1)*3,y:Math.cos(i*53.7)*2,z:(i+.5)/85,size:.025+(i%7)*.007,angle:i*2.1}));
setup('cosmos',(c,w,h,t)=>{
 c.fillStyle='#030611';c.fillRect(0,0,w,h);
 const bank=Math.sin(t*.22)*.10,drift=Math.sin(t*.31)*w*.08;
 c.save();c.translate(w/2+drift,h*.44+Math.cos(t*.26)*h*.035);c.rotate(bank);
 const nebula=c.createRadialGradient(-w*.3,-h*.3,0,0,0,w*.9);nebula.addColorStop(0,'#28325766');nebula.addColorStop(1,'#02040c00');c.fillStyle=nebula;c.fillRect(-w,-h,w*2,h*2);
 for(let i=0;i<160;i++){c.fillStyle=i%4?'#9ba9c4':'#e5f3ff';const x=Math.sin(i*321.7)*w,y=Math.cos(i*73.4)*h;c.fillRect(x,y,i%5===0?1.7:1,i%5===0?1.7:1);}
 // Perspective projection: asteroids grow and pass the cockpit as the ship advances.
 rocks.map(r=>({...r,depth:1-((r.z+t*.045)%1)})).sort((a,b)=>b.depth-a.depth).forEach(r=>{
  const z=Math.max(.035,r.depth),x=r.x*w*.22/z,y=r.y*h*.24/z,s=r.size*w/z;
  if(Math.abs(x)>w+s||Math.abs(y)>h+s)return;
  c.save();c.translate(x,y);c.rotate(r.angle+t*.08);
  c.beginPath();for(let k=0;k<9;k++){const a=k/9*Math.PI*2,rad=s*(.75+.2*Math.sin(k*17+r.angle));k?c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad):c.moveTo(Math.cos(a)*rad,Math.sin(a)*rad);}c.closePath();
  const g=c.createLinearGradient(-s,-s,s,s);g.addColorStop(0,'#a3a9b3');g.addColorStop(.4,'#575b67');g.addColorStop(1,'#151b29');c.fillStyle=g;c.fill();c.strokeStyle='#adb9cb55';c.lineWidth=1;c.stroke();
  c.strokeStyle='#11182877';for(let k=0;k<3;k++){c.beginPath();c.arc((k-1)*s*.35,Math.sin(k*4)*s*.3,s*.13,0,6.28);c.stroke();}c.restore();
 });
 c.restore();
 // Fixed cockpit framing separates the moving universe from the flight deck.
 c.fillStyle='#0b1420';c.strokeStyle='#425366';c.lineWidth=2;
 function panel(points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x*w,y*h):c.moveTo(x*w,y*h));c.closePath();c.fill();c.stroke();}
 panel([[0,0],[.1,0],[.25,.79],[.21,.86]]);
 panel([[1,0],[.9,0],[.75,.79],[.79,.86]]);
 panel([[0,.9],[.24,.74],[.76,.74],[1,.9],[1,1],[0,1]]);
 c.fillStyle='#0c2633';c.fillRect(w*.32,h*.83,w*.36,h*.15);c.strokeStyle='#4095a1';c.strokeRect(w*.32,h*.83,w*.36,h*.15);
 c.font=Math.max(8,w*.014)+'px monospace';c.fillStyle='#7bf0dc';c.fillText('NAV // AUTOPILOT',w*.35,h*.88);c.fillText('VECTOR '+(Math.sin(t*.3)*12).toFixed(2),w*.35,h*.94);
 c.strokeStyle='#68e8d77a';c.lineWidth=1;c.beginPath();c.arc(w/2,h*.43,20,0,6.28);c.moveTo(w/2-30,h*.43);c.lineTo(w/2+30,h*.43);c.moveTo(w/2,h*.43-30);c.lineTo(w/2,h*.43+30);c.stroke();
 c.fillStyle='#8caec3';c.font='9px monospace';c.fillText('BELT TRANSIT',20,h-18);c.fillText('THRUST 072%',w-100,h-18);
});
})();
