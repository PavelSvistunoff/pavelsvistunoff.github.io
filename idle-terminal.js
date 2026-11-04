(() => {
'use strict';
window.startIdleTerminal = (execute) => {
 const win=document.querySelector('#terminal'),input=document.querySelector('#command');
 const candidates=['ls','ls -la','ls -lh','pwd','whoami','ps','git status','git blame','42','weather','fortune','date','uname -a','df -h','free -h','cat todo.txt','cat README.txt','uptime','ping','duck','deploy','meeting','standup','credits'];
 // Only text-only commands: no window changes, timers, sounds or desktop effects.
 const safe=candidates;
 let timer=null,typing=false,typed='',last='';
 const eligible=()=>!win.hidden&&!win.classList.contains('active')&&!document.hidden&&!win.contains(document.activeElement);
 function stop(){
  if(timer!==null)clearTimeout(timer);timer=null;
  if(typing&&input.value===typed)input.value='';
  typing=false;typed='';
 }
 function schedule(){
  if(timer!==null||!eligible()||input.value)return;
  timer=setTimeout(begin,9000+Math.random()*9000);
 }
 function sync(){if(!eligible())stop();else schedule();}
 function begin(){
  timer=null;if(!eligible()||input.value){sync();return;}
  const options=safe.filter(c=>c!==last),command=options[Math.floor(Math.random()*options.length)];
  typing=true;typed='';
  function letter(){
   timer=null;
   if(!eligible()||input.value!==typed){stop();return;}
   if(typed.length<command.length){
    typed=command.slice(0,typed.length+1);input.value=typed;
    timer=setTimeout(letter,75+Math.random()*100);
   }else{
    input.value='';typing=false;typed='';last=command;
    execute(command,{automatic:true});schedule();
   }
  }
  letter();
 }
 new MutationObserver(sync).observe(win,{attributes:true,attributeFilter:['hidden','class']});
 win.addEventListener('pointerdown',stop,true);
 win.addEventListener('focusin',stop);
 input.addEventListener('input',()=>{stop();schedule();});
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',stop);
 sync();
 return {stop,sync};
};
})();
