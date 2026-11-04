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
 add('help','список команд',()=>[...commands.keys()].join('\n'));
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
 const linux = new Map([["cd",["змінити каталог","cd КАТАЛОГ"]],["mkdir",["створити каталог","mkdir КАТАЛОГ"]],["rmdir",["видалити порожній каталог","rmdir КАТАЛОГ"]],["touch",["створити порожній файл","touch ФАЙЛ"]],["cp",["копіювати файли","cp ДЖЕРЕЛО ПРИЗНАЧЕННЯ"]],["mv",["перемістити або перейменувати","mv ДЖЕРЕЛО ПРИЗНАЧЕННЯ"]],["rm",["видалити файл","rm ФАЙЛ"]],["ln",["створити посилання","ln -s ЦІЛЬ ПОСИЛАННЯ"]],["readlink",["прочитати ціль посилання","readlink ПОСИЛАННЯ"]],["realpath",["абсолютний шлях","realpath ФАЙЛ"]],["basename",["ім’я без каталогу","basename ШЛЯХ"]],["dirname",["каталог шляху","dirname ШЛЯХ"]],["find",["пошук файлів","find . -name \"*.txt\""]],["locate",["пошук в індексі","locate README"]],["which",["шлях до програми","which ПРОГРАМА"]],["whereis",["пошук програми й документації","whereis ПРОГРАМА"]],["file",["визначити тип файлу","file ФАЙЛ"]],["stat",["метадані файлу","stat ФАЙЛ"]],["du",["розмір файлів","du -sh КАТАЛОГ"]],["tree",["дерево каталогів","tree"]],["head",["перші рядки","head -n 5 ФАЙЛ"]],["tail",["останні рядки","tail -n 5 ФАЙЛ"]],["less",["перегляд тексту","less ФАЙЛ"]],["more",["посторінковий перегляд","more ФАЙЛ"]],["wc",["кількість рядків і слів","wc ФАЙЛ"]],["sort",["сортувати рядки","sort ФАЙЛ"]],["uniq",["прибрати сусідні повтори","uniq ФАЙЛ"]],["cut",["вибрати поля","cut -d , -f 1 ФАЙЛ"]],["paste",["об’єднати рядки","paste ФАЙЛ1 ФАЙЛ2"]],["tr",["замінити символи","tr a-z A-Z"]],["grep",["пошук за шаблоном","grep ШАБЛОН ФАЙЛ"]],["sed",["потокове редагування","sed s/старе/нове/g ФАЙЛ"]],["awk",["обробка полів","awk \"{print $1}\" ФАЙЛ"]],["diff",["порівняти файли","diff ФАЙЛ1 ФАЙЛ2"]],["cmp",["побайтове порівняння","cmp ФАЙЛ1 ФАЙЛ2"]],["tee",["вивід у файл і термінал","tee ФАЙЛ"]],["xargs",["побудувати аргументи","xargs КОМАНДА"]],["printf",["форматований вивід","printf ФОРМАТ АРГУМЕНТИ"]],["strings",["рядки з двійкового файлу","strings ФАЙЛ"]],["od",["вісімковий дамп","od ФАЙЛ"]],["tar",["архіви tar","tar -tf АРХІВ"]],["gzip",["стиснути gzip","gzip ФАЙЛ"]],["gunzip",["розпакувати gzip","gunzip ФАЙЛ.gz"]],["zip",["створити ZIP","zip АРХІВ.zip ФАЙЛ"]],["unzip",["розпакувати ZIP","unzip АРХІВ.zip"]],["bzip2",["стиснути bzip2","bzip2 ФАЙЛ"]],["xz",["стиснути xz","xz ФАЙЛ"]],["chmod",["права доступу","chmod 644 ФАЙЛ"]],["chown",["власник файлу","chown КОРИСТУВАЧ ФАЙЛ"]],["chgrp",["група файлу","chgrp ГРУПА ФАЙЛ"]],["umask",["маска прав","umask"]],["id",["ідентифікатори користувача","id"]],["groups",["групи користувача","groups"]],["users",["активні користувачі","users"]],["who",["хто увійшов","who"]],["w",["користувачі та активність","w"]],["last",["історія входів","last"]],["passwd",["змінити пароль","passwd"]],["su",["змінити користувача","su КОРИСТУВАЧ"]],["useradd",["додати користувача","useradd ІМʼЯ"]],["userdel",["видалити користувача","userdel ІМʼЯ"]],["groupadd",["створити групу","groupadd ГРУПА"]],["hostname",["ім’я комп’ютера","hostname"]],["hostnamectl",["інформація про хост","hostnamectl"]],["uname",["інформація про систему","uname -a"]],["lscpu",["інформація про CPU","lscpu"]],["lsblk",["блокові пристрої","lsblk"]],["lsusb",["USB-пристрої","lsusb"]],["lspci",["PCI-пристрої","lspci"]],["mount",["змонтувати файлову систему","mount"]],["umount",["відмонтувати файлову систему","umount ТОЧКА"]],["df",["вільний простір","df -h"]],["free",["оперативна пам’ять","free -h"]],["kill",["сигнал процесу","kill PID"]],["killall",["сигнал за назвою","killall НАЗВА"]],["pgrep",["пошук PID","pgrep НАЗВА"]],["pkill",["сигнал процесам за шаблоном","pkill НАЗВА"]],["jobs",["фонові завдання","jobs"]],["bg",["продовжити у фоні","bg %1"]],["fg",["на передній план","fg %1"]],["nice",["пріоритет запуску","nice -n 10 КОМАНДА"]],["renice",["змінити пріоритет","renice 10 -p PID"]],["nohup",["продовжити після виходу","nohup КОМАНДА"]],["timeout",["обмежити час","timeout 5 КОМАНДА"]],["watch",["повторювати команду","watch КОМАНДА"]],["systemctl",["керувати службами","systemctl status coffee"]],["journalctl",["журнал служб","journalctl -n 5"]],["dmesg",["журнал ядра","dmesg"]],["ip",["мережеві інтерфейси","ip addr"]],["ss",["мережеві сокети","ss -tuln"]],["curl",["HTTP-клієнт","curl URL"]],["wget",["завантажити файл","wget URL"]],["ssh",["віддалений термінал","ssh КОРИСТУВАЧ@ХОСТ"]],["scp",["копіювання через SSH","scp ФАЙЛ ХОСТ:ШЛЯХ"]],["rsync",["синхронізація файлів","rsync -av ДЖЕРЕЛО ЦІЛЬ"]],["dig",["DNS-запити","dig ДОМЕН"]],["nslookup",["DNS-пошук","nslookup ДОМЕН"]],["traceroute",["маршрут пакетів","traceroute ХОСТ"]],["env",["оточення процесу","env"]],["export",["змінна середовища","export НАЗВА=ЗНАЧЕННЯ"]]]);
 const linuxJokes = {"cd":"Вище лише очікування.","mkdir":"Порожня папка теж має право на існування.","rmdir":"Спочатку висели звідти прокрастинацію.","touch":"Файл прокинувся. Тепер не засне.","cp":"Оригінал образився: його замінили копією.","mv":"Програму захисту свідків активовано.","rm":"Файл пішов по хліб. Без наслідків для диска.","ln":"Зв’язки вирішують усе, навіть у файловій системі.","readlink":"Посилання зізналося, куди веде.","realpath":"Абсолютний шлях до відносного щастя.","basename":"Зняли з файлу адресу, залишили ім’я.","dirname":"Дім файлу знайдено. Іпотеку не перевіряли.","find":"Шукаю сенс життя. Поки знайшов txt.","locate":"Файл був під носом у індексу.","which":"Програма знайдена. Мотивація ще в розшуку.","whereis":"Навіть документація має адресу, а ти — плани.","file":"На вигляд файл. За характером проблема.","stat":"Досьє зібрано. Файл попросив адвоката.","du":"Чотири кілобайти, а відповідальності на терабайт.","tree":"Дерево росте. Дедлайни висять на гілках.","head":"Початок прочитано. Далі, кажуть, цікавіше.","tail":"Кінець знайдено. Спойлери входять у комплект.","less":"Менше тексту — більше загадковості.","more":"Більше тексту. Ти сам попросив.","wc":"Слова пораховано. Воду — ні.","sort":"Хаос відсортовано за алфавітом.","uniq":"Клони відправлені на обід.","cut":"Відрізаю зайве. Скоуп тримається за край.","paste":"Склеєно без канцелярського клею.","tr":"Букви перевдяглися. Ніхто не постраждав.","grep":"Шаблон знайдено. Шаблонне мислення лишилося.","sed":"Старе замінено новим у наших фантазіях.","awk":"Поля оброблено. Урожай багів дозріває.","diff":"Відмінності: один файл оптимістичніший.","cmp":"Порівнюємо побайтно, сваримося глобально.","tee":"Термінал почув. Файл зробив вигляд.","xargs":"Аргументи зібрано. Сперечатися нікому.","printf":"Формат ідеальний. Зміст працює над собою.","strings":"Навіть двійковий файл іноді хоче поговорити.","od":"Вісімкова система: для тих, кому десяти мало.","tar":"Спогади запаковано. Ностальгія не стискається.","gzip":"Стиснув дедлайн. Він тепер ще ближче.","gunzip":"Розпаковуємо проблему до оригінального розміру.","zip":"Блискавку застібнуто. Пальці цілі.","unzip":"Архів розкрито. Скелети лишилися в шафі.","bzip2":"Стиснення з характерним британським акцентом.","xz":"Стиснення таке сильне, що пропав ентузіазм.","chmod":"Права видано. Обов’язки сховалися.","chown":"Новий власник уже шкодує.","chgrp":"Файл прийняли в колектив.","umask":"Маска є. Супергерой ще не визначився.","id":"Особу встановлено. Призначення — ні.","groups":"Ти в групі ризику ще одного мітингу.","users":"Користувачі онлайн. Думками — на морі.","who":"Хто тут? Усі питають те саме.","w":"Активність підтверджено рухом мишки.","last":"Історія входів. Історію помилок не вмістили.","passwd":"Новий пароль: ні, кота звати не так.","su":"Перевтілення завершено у межах акторської гри.","useradd":"Ще одна людина для розподілу провини.","userdel":"Користувач пішов у легенду.","groupadd":"Група створена. Тепер потрібен чат.","hostname":"Хост відгукується. Іноді сарказмом.","hostnamectl":"Паспорт хоста. Фото невдале.","uname":"Ядро тримається на надії.","lscpu":"Хом’яки працюють у вісім потоків.","lsblk":"Диски крутяться. Сюжет теж.","lsusb":"Качечку під’єднано. Драйвер мудрості готовий.","lspci":"Шина є. Водій у відпустці.","mount":"Монтуємо, як режисер, тільки файлову систему.","umount":"Від’єднуємося емоційно.","df":"Місце є лише для ще одного виправдання.","free":"Пам’ять вільна від корисних думок.","kill":"Сигнал надіслано подумки. Процес не злякався.","killall":"Усі процеси вдали, що їх немає вдома.","pgrep":"PID знайдено. Краще б знайшли вихідний.","pkill":"Процес попереджено суворим поглядом.","jobs":"Роботи багато, фонів ще більше.","bg":"Нехай попрацює, поки ми дивимося котів.","fg":"Виводимо проблему на передній план.","nice":"Будь nice. Процеси теж люди. Майже.","renice":"Пріоритет підняли, зарплату — ні.","nohup":"Працюватиме навіть після твого драматичного виходу.","timeout":"П’ять секунд на щастя. Потім timeout.","watch":"Дивлюся. Нічого не змінюється. Як на деплої.","systemctl":"Служба кави запущена. Чай протестує.","journalctl":"Журнал усе пам’ятає. На відміну від команди.","dmesg":"Ядро висловило наболіле.","ip":"IP є, особистого простору немає.","ss":"Порти слухають. Поради ігнорують.","curl":"Пакет уявно вирушив. Поштовий голуб передумав.","wget":"Завантаження оптимізму: джерело недоступне.","ssh":"З’єднання з віддаленою відповідальністю.","scp":"Файл подумки переїхав за кордон.","rsync":"Синхронізуємо плани з реальністю. Конфлікт.","dig":"Копаємо DNS. Нафта не знайдена.","nslookup":"Ім’я знайдено. Прізвище засекречено.","traceroute":"Маршрут до холодильника коротший.","env":"Оточення токсичне лише в п’ятницю.","export":"Змінну підвищено до глобальних амбіцій."};
 for(const [name,[description,usage]] of linux){
  if(commands.has(name))throw new Error('Duplicate Linux command: '+name);
  add(name,description+' — '+linuxJokes[name],()=>linuxRun(name,[]));
 }
 function linuxRun(name,args){
  return linuxResult(name,args)+'\n'+linuxJokes[name];
 }
 function linuxResult(name,args){
  const [description,usage]=linux.get(name);
  const prefix='';
  if(args.includes('--help')||args.includes('-h')&&!['df','free'].includes(name))return prefix+name+' — '+description+'\nВикористання: '+usage;
  const samples={
   tree:'.\n├── README.txt\n├── todo.txt\n├── report.csv\n├── ideas/\n└── unfinished/',
   id:'uid=1000(guest) gid=1000(guest) groups=1000(guest)',
   groups:'guest coffee astronauts',users:'guest',who:'guest  orbit/0  сьогодні',w:'USER   TTY      WHAT\nguest  orbit/0  читає help',
   hostname:'orbit',hostnamectl:'Static hostname: orbit\nOperating System: ImaginationOS — ядро на каві',
   uname:'ImaginationOS orbit 99.0 browser virtual',
   lscpu:'Architecture: уявна\nCPU(s): 8 віртуальних хом’яків',
   lsblk:'NAME   SIZE MOUNTPOINT\nvoid0  42G  /\ncoffee  1L  /dev/mug',
   lsusb:'Bus 001 Device 001: Rubber Duck Debugger',
   lspci:'00:00.0 Imagination Processing Unit',
   mount:'/dev/void0 on / type imagination (rw)',
   df:'Filesystem  Size Used Avail Use% Mounted on\n/dev/void0  42G  21G   21G  50% /',
   free:'         total  used  free\nMem:       16G    8G    8G',
   umask:'0022',pgrep:'42',jobs:'[1]+ Running  coffee --brew',
   systemctl:'● coffee.service — Caffeine daemon\n   Active: active (brewing)',
   journalctl:'orbit coffee[42]: Кава готова.\norbit scheduler[1]: Дедлайн відкладено.',
   dmesg:'[0.000] Imagination kernel initialized\n[0.042] rubberduck: debugger attached',
   ip:'1: lo: <LOOPBACK,UP>\n    inet 127.0.0.1/8\n2: imagination0: <UP>',
   ss:'State  Local Address:Port\nLISTEN 127.0.0.1:4242',
   env:'USER=guest\nHOME=/home/guest\nSHELL=orbit.shell',
   last:'guest  orbit/0  сьогодні  still dreaming'
  };
  if(name==='basename')return prefix+(args[0]||'/home/guest/README.txt').split('/').filter(Boolean).pop();
  if(name==='dirname'){const p=args[0]||'/home/guest/README.txt';return prefix+(p.includes('/')?p.slice(0,p.lastIndexOf('/'))||'/':'.');}
  if(name==='realpath')return prefix+'/home/guest/'+(args[0]||'.').replace(/^\.\//,'');
  if(['head','tail','less','more','wc','grep','sort','uniq','file','stat','find','locate','du'].includes(name)){
   if(['find','locate'].includes(name))return prefix+Object.keys(files).filter(n=>n.includes((args.at(-1)||'').replace(/[*"]/g,''))||args.length<2).map(n=>'./'+n).join('\n');
   const filename=args.at(-1)||'README.txt';
   if(!Object.hasOwn(files,filename))return prefix+filename+': загубився між диваном і дедлайном. Поруч знайшли: '+Object.keys(files).join(', ');
   const text=files[filename],lines=text.split('\n');
   if(name==='wc')return prefix+lines.length+' '+text.split(/\s+/).length+' '+new TextEncoder().encode(text).length+' '+filename;
   if(name==='file')return prefix+filename+': UTF-8 text';
   if(name==='stat')return prefix+'File: '+filename+'\nSize: '+new TextEncoder().encode(text).length+' bytes\nAccess: (0644/-rw-r--r--) Uid: guest';
   if(name==='du')return prefix+'4K\t'+filename;
   if(name==='grep')return prefix+lines.filter(l=>l.includes(args[0]||'')).join('\n');
   const nIndex=args.indexOf('-n'),n=nIndex>=0?Math.max(0,Math.min(100,Number(args[nIndex+1])||0)):10;
   if(name==='head')return prefix+lines.slice(0,n).join('\n');
   if(name==='tail')return prefix+(n?lines.slice(-n).join('\n'):'');
   if(name==='sort')return prefix+lines.sort().join('\n');
   if(name==='uniq')return prefix+lines.filter((l,i)=>i===0||l!==lines[i-1]).join('\n');
   return prefix+text;
  }
  if(Object.hasOwn(samples,name))return prefix+samples[name];
  if(['curl','wget','ssh','scp','rsync','dig','nslookup','traceroute'].includes(name))return prefix+'Пакет ще взувається. Репетируємо вихід:\n'+usage;
  return prefix+name+' — '+description+'\nВикористання: '+usage+'\nОперацію виконано подумки. Система вдячна за делікатність.';
 }

 function execute(raw){
  const command=raw.trim().replace(/\s+/g,' '),key=command.toLowerCase();if(!key)return;
  history.push(command);if(history.length>100)history.shift();historyIndex=history.length;
  let text;
  if(commands.has(key))text=commands.get(key).run();
  else if(linux.has(key.split(' ')[0]))text=linuxRun(key.split(' ')[0],command.split(' ').slice(1));
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
