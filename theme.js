(() => {
  'use strict';
  const desktop = document.querySelector('#desktop');
  const windows = [...document.querySelectorAll('.window')];
  const mobile = matchMedia('(max-width: 760px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let topLayer = 10;
  const tasks = document.querySelector('#tasks');
  const names = {profile:'◎ Профіль',projects:'⌘ Проєкти',aquarium:'≈ Акваріум',terminal:'›_ Термінал',matrix:'▥ Matrix',cosmos:'✧ Cosmos',nyan:'🌈 Nyan',aime:'♫ Aime'};
  const state = new Map();
  const taskButtons = new Map();
  function focusWindow(win) {
    windows.forEach(item => item.classList.toggle('active', item === win));
    win.style.zIndex = ++topLayer;
  }
  function setState(win, value, focus = true) {
    state.set(win.id, value);
    win.hidden = value !== 'open';
    const task = taskButtons.get(win.id);
    task.dataset.state = value;
    task.setAttribute('aria-label', names[win.id] + ' — ' + {open:'відкрите',minimized:'згорнуте',closed:'закрите'}[value]);
    if (value === 'open') {
      focusWindow(win);
      if (focus) { win.focus({preventScroll:true}); if (mobile.matches) win.scrollIntoView({block:'nearest',behavior:'auto'}); }
    }
  }
  function open(id) { const win = document.getElementById(id); if (win && state.has(id)) setState(win,'open'); }
  function maximize(win) {
    const maximized = win.classList.toggle('maximized');
    win.querySelector('[data-action="maximize"]').setAttribute('aria-pressed',String(maximized));
    focusWindow(win);
  }
  windows.forEach(win => {
    const task = document.createElement('button');
    task.type = 'button'; task.textContent = names[win.id];
    tasks.append(task); taskButtons.set(win.id,task);
    task.addEventListener('click',() => open(win.id));
    setState(win,win.hidden ? 'closed' : 'open',false);
    win.addEventListener('pointerdown',() => focusWindow(win));
    win.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click',() => {
      const action = button.dataset.action;
      if (action === 'maximize') { maximize(win); return; }
      setState(win,action === 'close' ? 'closed' : 'minimized');
      task.focus({preventScroll:true});
    }));
    const bar = win.querySelector('.titlebar');
    bar.addEventListener('dblclick',event => { if (!event.target.closest('button') && !mobile.matches) maximize(win); });
    let drag = null;
    bar.addEventListener('pointerdown',event => {
      if (event.button !== 0 || event.target.closest('button') || mobile.matches || win.classList.contains('maximized')) return;
      const rect = win.getBoundingClientRect(), area = desktop.getBoundingClientRect();
      drag = {x:event.clientX,y:event.clientY,left:rect.left-area.left,top:rect.top-area.top};
      bar.setPointerCapture(event.pointerId); event.preventDefault();
    });
    bar.addEventListener('pointermove',event => {
      if (!drag) return;
      win.style.left = Math.max(0,Math.min(desktop.clientWidth-win.offsetWidth,drag.left+event.clientX-drag.x))+'px';
      win.style.top = Math.max(0,Math.min(desktop.clientHeight-42,drag.top+event.clientY-drag.y))+'px';
      win.style.right = 'auto';
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(name => bar.addEventListener(name,() => { drag = null; }));
  });
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click',() => open(button.dataset.open)));
  function reset() {
    windows.forEach(win => { win.style.removeProperty('left');win.style.removeProperty('right');win.style.removeProperty('top');win.classList.remove('maximized');win.querySelector('[data-action="maximize"]').setAttribute('aria-pressed','false');setState(win,'open',false); });
  }
  document.querySelector('#reset').addEventListener('click',reset);
  // A resized viewport must never leave a dragged title bar out of reach.
  window.addEventListener('resize',() => {
    if (mobile.matches) return;
    windows.forEach(win => {
      if (!win.style.left || win.classList.contains('maximized')) return;
      win.style.left = Math.max(0,Math.min(parseFloat(win.style.left),desktop.clientWidth-win.offsetWidth))+'px';
      win.style.top = Math.max(0,Math.min(parseFloat(win.style.top),desktop.clientHeight-42))+'px';
    });
  });
  function tick() { document.querySelector('#clock').textContent = new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'}); }
  tick(); setInterval(tick,1000); document.querySelector('#year').textContent = new Date().getFullYear();

  const output = document.querySelector('#terminal-output');
  document.querySelector('#command-form').addEventListener('submit',event => {
    event.preventDefault();
    const input = document.querySelector('#command'), command = input.value.trim().toLowerCase();
    input.value = ''; if (!command) return;
    if (command === 'clear') { output.replaceChildren(); return; }
    const replies = {help:'Команди: help, about, projects, fish, clear',about:'Павло Свистунов. Ідеї. Код. Експерименти.',projects:'Відкриваю каталог проєктів…',fish:'Акваріум відкрито. Торкнися води, щоб погодувати рибок.'};
    const line = document.createElement('p'), prompt = document.createElement('span');
    prompt.className = 'prompt'; prompt.textContent = 'guest@orbit:~$ ' + command;
    line.append(prompt,document.createElement('br'),document.createTextNode(replies[command] || 'Невідома команда. Введи help.'));
    output.append(line); while (output.children.length > 30) output.firstElementChild.remove();
    if (command === 'projects') open('projects');
    if (command === 'fish') open('aquarium');
    line.scrollIntoView({block:'nearest'});
  });

  const canvas = document.querySelector('#fish'), ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 460,height = 215,paused = reduced.matches,frame = null,last = 0,food = [];
  const motion = document.querySelector('#motion');
  const fish = Array.from({length:12},(_,i) => ({x:Math.random()*460,y:45+Math.random()*130,size:7+Math.random()*9,speed:12+Math.random()*18,dir:i%2?1:-1,phase:Math.random()*6.28,color:i%3===0?'#f2bb85':i%3===1?'#6de2cf':'#82b7f2'}));
  const bubbles = Array.from({length:18},() => ({x:Math.random(),y:Math.random(),r:1+Math.random()*2}));
  function resize() {
    const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return;
    const oldW=width,oldH=height;width=r.width;height=r.height;
    fish.forEach(f => {f.x=f.x/oldW*width;f.y=f.y/oldH*height;});
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    draw(0);
  }
  new ResizeObserver(resize).observe(canvas);
  function draw(dt) {
    ctx.clearRect(0,0,width,height);
    for(let i=0;i<5;i++){ctx.fillStyle='#73efdf05';ctx.beginPath();ctx.moveTo(width*(i*.24-.2),0);ctx.lineTo(width*(i*.24+.05),height);ctx.lineTo(width*(i*.24+.19),height);ctx.lineTo(width*(i*.24-.12),0);ctx.fill();}
    bubbles.forEach(b => {b.y-=dt*.035;if(b.y<0)b.y=1;ctx.strokeStyle='#78d9df35';ctx.beginPath();ctx.arc(b.x*width,b.y*height,b.r,0,Math.PI*2);ctx.stroke();});
    food=food.filter(p=>p.life>0);
    food.forEach(p=>{p.y+=dt*10;p.life-=dt;ctx.fillStyle='#f3d39e';ctx.fillRect(p.x,p.y,2,2);});
    fish.forEach(f => {
      f.phase+=dt*2;
      let target=food[0];
      if(target){const dx=target.x-f.x,dy=target.y-f.y;f.dir=dx>0?1:-1;f.x+=Math.sign(dx)*f.speed*dt;f.y+=Math.sign(dy)*Math.min(Math.abs(dy),20)*dt;if(Math.hypot(dx,dy)<15)target.life=0;}
      else {f.x+=f.speed*f.dir*dt;f.y+=Math.sin(f.phase)*dt*3;}
      if(f.x>width+25)f.x=-25;if(f.x< -25)f.x=width+25;f.y=Math.max(35,Math.min(height-28,f.y));
      ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.dir,1);ctx.shadowColor=f.color;ctx.shadowBlur=10;ctx.fillStyle=f.color;ctx.globalAlpha=.85;
      ctx.beginPath();ctx.ellipse(0,0,f.size,f.size*.36,0,0,Math.PI*2);ctx.fill();
      const wave=Math.sin(f.phase*5)*2;
      ctx.beginPath();ctx.moveTo(-f.size*.7,0);ctx.lineTo(-f.size*1.65,-f.size*.55+wave);ctx.lineTo(-f.size*1.65,f.size*.55+wave);ctx.closePath();ctx.fill();
      ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(1,-f.size*.7);ctx.lineTo(7,0);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.fillStyle='#081724';ctx.beginPath();ctx.arc(f.size*.62,-1,1.3,0,Math.PI*2);ctx.fill();ctx.restore();
    });
  }
  function animate(now) { frame=null;if(paused||document.hidden||state.get('aquarium')!=='open'){last=0;return;}draw(last?Math.min((now-last)/1000,.05):0);last=now;frame=requestAnimationFrame(animate); }
  function sync() { motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Увімкнути анімацію':'Пауза анімації';if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;if(!paused&&!document.hidden&&state.get('aquarium')==='open')frame=requestAnimationFrame(animate);else draw(0); }
  motion.addEventListener('click',()=>{paused=!paused;sync();});
  reduced.addEventListener('change',event=>{paused=event.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.querySelector('#aquarium'),{attributes:true,attributeFilter:['hidden']});
  function feed(x=width*.5,y=35){if(paused)return;food.push(...Array.from({length:8},()=>({x:x+(Math.random()-.5)*35,y:y+Math.random()*10,life:8})));food=food.slice(-40);}
  canvas.addEventListener('pointerdown',event=>{const r=canvas.getBoundingClientRect();feed(event.clientX-r.left,event.clientY-r.top);});
  document.querySelector('#feed').addEventListener('click',()=>feed());
  resize();sync();focusWindow(document.querySelector('#profile'));
})();
