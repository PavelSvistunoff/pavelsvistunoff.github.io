(() => {
'use strict';
window.initializeTerminal = ({open, windows, setState, focusWindow}) => {
 const output=document.querySelector('#terminal-output'),input=document.querySelector('#command');
 const commands=new Map(),history=[];let historyIndex=0,bossState=null,destructing=false;
 function print(text,command){
  const line=document.createElement('p');line.className='terminal-line';
  if(command){const prompt=document.createElement('span');prompt.className='prompt';prompt.textContent='guest@orbit:~$ '+command;line.append(prompt,document.createElement('br'));}
  line.append(document.createTextNode(text));output.append(line);
  while(output.children.length>60)output.firstElementChild.remove();
  line.scrollIntoView({block:'nearest'});
 }
 function add(name,description,run){commands.set(name,{description,run:typeof run==='function'?run:()=>run});}
 function effect(className,duration){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;document.body.classList.remove(className);void document.body.offsetWidth;document.body.classList.add(className);setTimeout(()=>document.body.classList.remove(className),duration);}
 function toast(text){const el=document.createElement('div');el.className='terminal-toast';el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),5000);}
 const files={'README.txt':'Павло Свистунов. Ідеї. Код. Експерименти.','todo.txt':'1. Випити каву\n2. Зробити щось велике\n3. Перенести пункт 2 на завтра.','.secrets':'Пароль від Всесвіту: будь ласка.','report.csv':'Звіт,Прогрес\nПланування звіту,100%\nЗвіт про планування,100%\nРеальна робота,очікує каву'};
 add('help','список команд',()=>[...commands].map(([name,c])=>name.padEnd(28)+' — '+c.description).join('\n'));
 add('about','про власника','Павло Свистунов. Ідеї. Код. Експерименти.');
 for(const [name,id] of Object.entries({projects:'projects',fish:'aquarium',matrix:'matrix',cosmos:'cosmos',nyan:'nyan',aime:'aime'}))add(name,'відкрити '+id,()=>{open(id);return 'Відкриваю '+id+'…';});
 add('clear','очистити термінал',()=>{output.replaceChildren();return null;});
 add('ls','файли уявної файлової системи',()=>Object.keys(files).filter(n=>!n.startsWith('.')).concat(['ideas/','unfinished/','black-hole/']).join('  '));
 add('ls -la','зазирнути під килим',()=>['drwxr-xr-x  guest  ideas/','drwxr-xr-x  guest  unfinished/   [переповнено]','drwx------  void   black-hole/   [не заглядати]',...Object.keys(files).map(n=>'-rw-r--r--  guest  '+n),'----------  boss   salary.txt   [доступ лише уві сні]'].join('\n'));
 add('ls -lh','розміри життєвих проблем','4K README.txt\n8G unfinished/\n∞  overthinking.log\n0B free-time.txt');
 add('pwd','де ми взагалі','/home/pavlo/десь-між-дедлайнами');
 add('whoami','екзистенційна перевірка','guest. Але всередині ти root.');
 add('date','котра година',()=>new Date().toLocaleString('uk-UA')+'\nЧас знову витрачено успішно.');
 add('uptime','як довго тримаємось',()=>Math.floor(performance.now()/1000)+' секунд без перезавантаження. Кава не враховується.');
 add('uname -a','характеристики системи','ImaginationOS 42.0 / architecture: overengineered / kernel: popcorn');
 add('sudo','попросити владу','Павло тут головний. Але ти теж тримайся.');
 add('sudo make me a sandwich','бутерброд із правами адміністратора',()=>{toast('🥪 Бутерброд готовий');return 'Оце інша розмова.\n🥪';});
 add('rm -rf /','удаване видалення Всесвіту',()=>{toast('🗑️ Всесвіт не помістився в кошик');return 'Видалення Всесвіту…\nКошик замалий. Операцію скасовано.';});
 add('coffee','встановити залежність',()=>{toast('☕ ≋\nКава готова. Залежність встановлено.');return '☕ Залежність успішно встановлено.';});
 add('panic','контрольована паніка',()=>{effect('terminal-panic',650);return 'Паніку завершено. Нічого не вирішено.';});
 add('42','відповідь на головне питання','Відповідь знайдено. Уточніть запитання.');
 add('feed','нагодувати команду',()=>{open('aquarium');const motion=document.querySelector('#motion');if(motion.getAttribute('aria-pressed')==='true')return 'Анімація на паузі. Увімкни її, і рибки прийдуть на обід.';document.querySelector('#feed').click();return 'Рибок нагодовано. Витрати списано на утримання команди.';});
 add('ps','поточні процеси','PID  PROCESS\n001  procrastination\n002  overthinking\n003  waiting_for_friday\n042  coffee.service');
 add('kill procrastination','позбутися прокрастинації','Процес попросив ще п’ять хвилин.');
 add('git blame','знайти винного','Це все попередній розробник.');
 add('git status','стан життя','On branch: спробуємо-ще-раз\nChanges not committed: усі життєві плани.');
 add('git push','відправити на потім','Відправлено до origin/завтра. Це жарт, нічого не завантажено.');
 add('deploy','емулятор GitHub Pages','Запуск у черзі. Орієнтовне завершення: так.');
 add('weather','космічна погода','У відкритому космосі без опадів. Місцями астероїди.');
 add('boss','сховати розваги / повернути вікна',()=>{
  if(bossState){for(const [win,hidden] of bossState)setState(win,hidden?'closed':'open',false);bossState=null;document.querySelector('#boss-report')?.remove();return 'Бос пішов. Повертаємося до важливого.';}
  bossState=windows.map(win=>[win,win.hidden]);windows.filter(win=>win.id!=='terminal').forEach(win=>setState(win,'closed',false));
  const report=document.createElement('section');report.id='boss-report';report.className='boss-report';report.textContent='КВАРТАЛЬНИЙ ЗВІТ\n\nПоказник                  Виконання\nЗвіти про звіти            100%\nЗростання продуктивності   +2048%\nОбґрунтування цифр         У процесі\n\nВведи boss, щоб повернути вікна.';document.querySelector('#desktop').append(report);
  focusWindow(document.querySelector('#terminal'));return 'Режим серйозної роботи активовано.';
 });
 add('party','п’ять секунд свята',()=>{effect('terminal-party',5000);toast('🎉 ✦ 🎊 ✧ 🎉\nДедлайни теж танцюють');return 'Дискотеку оголошено відкритою.';});
 add('selfdestruct','зворотний відлік без наслідків',()=>{
  if(destructing)return 'Самознищення вже в черзі.';
  destructing=true;let n=10;toast('⚠ Самознищення розпочато');
  const timer=setInterval(()=>{if(n>1){print('Самознищення: '+n+'…');n--;}else{clearInterval(timer);destructing=false;print('1… Потрібна підписка. Всесвіт збережено.');}},1000);
  return 'Запущено демонстраційне самознищення.';
 });
 add('exit','спробувати піти','І куди це ми зібралися?');
 add('ping','перевірити зв’язок із реальністю','PONG. Реальність відповідає із затримкою в понеділок.');
 add('top','головний споживач ресурсів','CPU 99% — думка «а що, як…»\nRAM 100% — вкладки, які колись знадобляться.');
 add('free -h','вільні ресурси','Пам’ять: зайнята спогадами.\nВільний час: 0B.\nSwap: вихідні.');
 add('df -h','вільне місце','/ideas      2%\n/excuses   98%\n/coffee   100%\nПотрібно розширити чашку.');
 add('mkdir happiness','створити щастя','Каталог створено. Наповнення — за тобою.');
 add('touch grass','вийти надвір','🌱 Трава існує. Рекомендується перевірити особисто.');
 add('cd ..','на рівень вище','Вище лише очікування.');
 add('cd /','до коренів','Коріння знайдено. Не забувай поливати.');
 add('reboot','перезавантажити настрій','Настрій перезавантажено. Вкладки в голові залишилися.');
 add('fortune','передбачення','Сьогодні ти виправиш баг. Завтра дізнаєшся, що це була фіча.');
 add('cow','мудрість корови','🐄 Му. Це весь мій технічний висновок.');
 add('duck','гумова качечка','🦆 Розкажи мені про баг. Я помовчу з розумним виглядом.');
 add('man life','інструкція до життя','Документацію не знайдено. Діємо за обставинами.');
 add('history','історія команд',()=>history.map((c,i)=>(i+1)+'  '+c).join('\n'));
 add('echo','перевірка луни','Луна теж хоче вихідний. Спробуй echo привіт.');
 add('cat','перелік доступних файлів','Няв. Спробуй cat README.txt або cat todo.txt.');
 add('sleep','перерва','Спи спокійно. Таймери дедлайнів не сплять.');
 add('fire','вогонь у стилі DOOM',()=>{open('fire');return 'Відкриваю пекельний камін. IDDQD рекомендовано.';});
 add("doom","портал до пекла","Демонів знайдено. Вони теж чекають деплою.");
 add("iddqd","режим бога","Безсмертя увімкнено. Від дедлайнів не захищає.");
 add("idkfa","повний арсенал","Ключі, патрони, кава. Тепер можна на мітинг.");
 add("noclip","крізь стіни","Стіни вимкнено. Соціальні бар’єри залишились.");
 add("ripandtear","бойовий настрій","Рви й шматуй… список справ.");
 add("hello","привітатися","Привіт, мандрівнику вкладками!");
 add("world","перевірити світ","Світ працює. Документація відстає.");
 add("sudo reboot universe","перезапуск Всесвіту","Спочатку збережи чорні діри.");
 add("404","знайти загублене","Мотивацію не знайдено.");
 add("418","стан чайника","Я чайник. Каву готує сусідній процес.");
 add("500","внутрішня помилка","Внутрішній сервер пішов розбиратися із собою.");
 add("200","успіх","Усе добре. Навіть підозріло.");
 add("yes","погодитися","Так. Але без додаткового скоупу.");
 add("no","відмовитися","Ні. Це повне речення.");
 add("maybe","відкласти рішення","Створено комітет для оцінки ймовірності.");
 add("why","спитати чому","Історично так склалося.");
 add("when","оцінити термін","Після останнього маленького виправлення.");
 add("where","визначити напрямок","Десь між localhost і здоровим глуздом.");
 add("how","дізнатись метод","Спочатку зроби вигляд, що так і планував.");
 add("beep","системний сигнал","Біп. Звук уявний, зате якісний.");
 add("boop","торкнути котика","Котика бупнуто. Самооцінка +1.");
 add("meow","котячий протокол","Няв. Права адміністратора видано коту.");
 add("woof","собачий протокол","Гав! Пакет успішно принесено.");
 add("quack","відповідь качки","Кря. Спробуй вимкнути й увімкнути думку.");
 add("hamster","енергосистема","Хом’як у колесі просить оплачувану відпустку.");
 add("potato","режим картоплі","Продуктивність: пюре.");
 add("banana","перевірити масштаб","🍌 Масштаб встановлено: одна бананова одиниця.");
 add("pizza","замовити уявну піцу","🍕 Доставлено в /dev/stomach. Рахунок теж уявний.");
 add("tea","чайна пауза","🍵 Заварюємо спокій. Не кип’яти себе.");
 add("beer","віртуальний тост","🍺 За стабільні збірки й короткі мітинги!");
 add("water","водний баланс сервера","💧 Сервер полито. Тепер це хмарна інфраструктура.");
 add("nap","мікросон","Очі закрито. Статус у чаті: активно працює.");
 add("monday","початок тижня","Помилка: понеділок уже встановлений.");
 add("friday","перевірка п’ятниці","П’ятниця — це стан душі, який не проходить CI.");
 add("weekend","вихідні","Знайдено два дні. Один уже пішов на прання.");
 add("meeting","почати нараду","Цю команду можна було замінити повідомленням.");
 add("standup","ранковий статус","Учора працював. Сьогодні працюватиму. Блокери: життя.");
 add("deadline","перевірка терміну","Дедлайн наближається. Не роби різких рухів.");
 add("estimate","оцінити задачу","Дві години. Плюс невизначена кількість днів.");
 add("debug","знайти баг","Баг сховався, щойно ти відкрив інструменти розробника.");
 add("rubberduck","консультація","🦆 А ти точно зберіг файл?");
 add("worksforme","локальна перевірка","На моїй машині працює. Машина уявна.");
 add("shipit","відправити реліз","🚢 Корабель відплив. TODO лишилися на березі.");
 add("rollback","відкотити рішення","Повертаємося до моменту, коли ще була надія.");
 add("credits","титри","У ролях: Павло, браузер, котик і нескінченна черга деплою.");
 add("achievement","отримати досягнення","🏆 Досягнення: ти читаєш help замість роботи.");
 function execute(raw){
  const command=raw.trim().replace(/\s+/g,' '),key=command.toLowerCase();if(!key)return;
  history.push(command);if(history.length>100)history.shift();historyIndex=history.length;
  let text;
  if(commands.has(key))text=commands.get(key).run();
  else if(key.startsWith('echo '))text=command.slice(5);
  else if(key.startsWith('cat ')){const name=command.slice(4);text=Object.hasOwn(files,name)?files[name]:'Файл не знайдено. Навіть котик не знає, де він.';}
  else text='Невідома команда. Введи help або ls.';
  if(text!==null)print(text,command);
 }
 document.querySelector('#command-form').addEventListener('submit',event=>{event.preventDefault();const command=input.value;input.value='';execute(command);});
 input.addEventListener('keydown',event=>{
  if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;
  event.preventDefault();historyIndex=Math.max(0,Math.min(history.length,historyIndex+(event.key==='ArrowUp'?-1:1)));input.value=history[historyIndex]||'';
 });
 return {execute,commands};
};
})();
