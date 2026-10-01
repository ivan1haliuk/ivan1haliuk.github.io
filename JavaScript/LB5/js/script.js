// #1 Фаренгейт - Цельсій
let fInp = document.getElementById('f-inp');
let cInp = document.getElementById('c-inp');

// Перетворення Фаренгейтів у Цельсії
fInp.oninput = () => {
    if (fInp.value === '') return cInp.value = '';
    cInp.value = ((fInp.value - 32) * 5 / 9).toFixed(1);
};
// Перетворення Цельсіїв у Фаренгейти
cInp.oninput = () => {
    if (cInp.value === '') return fInp.value = '';
    fInp.value = ((cInp.value * 9 / 5) + 32).toFixed(1);
};
// #2 Множення з введенням відповіді
let t2Total = 0, t2Right = 0, t2AnsTrue = 0;
let t2Score = document.getElementById('t2-score');
let t2Task = document.getElementById('t2-task');
let t2Ans = document.getElementById('t2-ans');
let t2Res = document.getElementById('t2-res');
let t2BtnChk = document.getElementById('t2-chk');
let t2BtnNext = document.getElementById('t2-next');
function genT2() {
    // Генеруємо два випадкові числа
    let a = Math.floor(Math.random() * 9) + 2;
    let b = Math.floor(Math.random() * 9) + 2;
    t2AnsTrue = a * b;
    t2Task.innerText = `${a} × ${b} = `;
    t2Ans.value = '';
    t2Res.innerText = '';
    t2BtnChk.disabled = false;
}
t2BtnChk.onclick = () => {
    if (t2Ans.value === '') return;
    t2Total++;
    // Перевіряємо відповідь
    if (+t2Ans.value === t2AnsTrue) {
        t2Right++;
        t2Res.innerText = "Правильно!";
        t2Res.style.color = "green";
    } else {
        t2Res.innerText = `Помилка, правильна відповідь «${t2AnsTrue}»`;
        t2Res.style.color = "red";
    }
    // Оновлюємо загальний результат
    let p = Math.round((t2Right / t2Total) * 100);
    t2Score.innerText = `Загальний рахунок ${p}% (${t2Right} з ${t2Total})`;
    t2BtnChk.disabled = true;
};

t2BtnNext.onclick = genT2;
genT2();

// #3 Множення з радіокнопками
let t3Total = 0, t3Right = 0, t3AnsTrue = 0;
let t3Score = document.getElementById('t3-score');
let t3Task = document.getElementById('t3-task');
let t3Radios = document.getElementById('t3-radios');
let t3Res = document.getElementById('t3-res');

function genT3() {
    // Генеруємо приклад
    let a = Math.floor(Math.random() * 9) + 2;
    let b = Math.floor(Math.random() * 9) + 2;
    t3AnsTrue = a * b;
    t3Task.innerText = `${a} × ${b} = `;
    t3Res.innerText = '';
    t3Radios.innerHTML = '';
    // Формуємо варіанти відповідей
    let opts = [t3AnsTrue];
    while(opts.length < 4) {
        let rand = Math.floor(Math.random() * 81) + 4;
        if (!opts.includes(rand)) opts.push(rand);
    }
    // Перемішуємо варіанти
    opts.sort(() => Math.random() - 0.5);
    // Створюємо радіокнопки
    opts.forEach(val => {
        let lbl = document.createElement('label');
        let rad = document.createElement('input');
        rad.type = 'radio';
        rad.name = 't3-opt';
        rad.value = val;
        rad.onchange = () => checkT3(val);
        lbl.appendChild(rad);
        lbl.appendChild(document.createTextNode(` ${val} `));
        t3Radios.appendChild(lbl);
        t3Radios.appendChild(document.createElement('br'));
    });
}

function checkT3(val) {
    t3Total++;

    // Блокуємо варіанти після вибору
    let allRad = document.querySelectorAll('input[name="t3-opt"]');
    allRad.forEach(r => r.disabled = true);
    
    // Перевіряємо вибрану відповідь
    if (val === t3AnsTrue) {
        t3Right++;
        t3Res.innerText = "Правильно!";
        t3Res.style.color = "green";
    } else {
        t3Res.innerText = `Помилка, правильна відповідь «${t3AnsTrue}»`;
        t3Res.style.color = "red";
    }
    
    // Оновлюємо загальний результат
    let p = Math.round((t3Right / t3Total) * 100);
    t3Score.innerText = `Загальний рахунок ${p}% (${t3Right} з ${t3Total})`;
}

document.getElementById('t3-next').onclick = genT3;
genT3();

// #4 Ротатор фотографій
let catsArr = [
    {path: 'images/cat1.jpg', title: 'Рудий кіт', description: 'Кіт спить на дивані'},
    {path: 'images/cat2.jpg', title: 'Сірий кіт', description: 'Кіт грається з м\'ячиком'},
    {path: 'images/cat3.jpg', title: 'Чорний кіт', description: 'Кіт дивиться у вікно'}
];
function initPhotoRotator(id, arr) {
    let wrap = document.getElementById(id);
    let curr = 0;

    // Створюємо елементи галереї
    let top = document.createElement('div');
    top.className = 'gal-top';
    let mid = document.createElement('div');
    mid.className = 'gal-mid';
    let btnPrev = document.createElement('span');
    btnPrev.innerText = 'Назад';
    btnPrev.className = 'gal-btn';
    let img = document.createElement('img');
    img.className = 'gal-img';
    let btnNext = document.createElement('span');
    btnNext.innerText = 'Вперед';
    btnNext.className = 'gal-btn';
    let bot = document.createElement('div');
    let titleEl = document.createElement('b');
    let descEl = document.createElement('div');
    // Додаємо елементи до галереї
    mid.appendChild(btnPrev);
    mid.appendChild(img);
    mid.appendChild(btnNext);
    bot.appendChild(titleEl);
    bot.appendChild(document.createElement('br'));
    bot.appendChild(descEl);
    wrap.appendChild(top);
    wrap.appendChild(mid);
    wrap.appendChild(bot);
    
    function render() {
        // Виводимо поточну фотографію
        top.innerText = `Фотографія ${curr + 1} з ${arr.length}`;
        img.src = arr[curr].path;
        titleEl.innerText = arr[curr].title;
        descEl.innerText = arr[curr].description;
        // Ховаємо кнопки на першому та останньому фото
        btnPrev.className = curr === 0 ? 'gal-btn hidden' : 'gal-btn';
        btnNext.className = curr === arr.length - 1 ? 'gal-btn hidden' : 'gal-btn';
    }
    // Перехід між фотографіями
    btnPrev.onclick = () => {
        if(curr > 0) {
            curr--;
            render();
        }
    };
    btnNext.onclick = () => {
        if(curr < arr.length - 1) {
            curr++;
            render();
        }
    };
    
    render();
}
initPhotoRotator('rotator', catsArr);

// #5 Капча
function initCaptcha(digitsNum) {
    let wrap = document.getElementById('captcha-wrap');
    wrap.innerHTML = '';
    let numWrap = document.createElement('div');
    numWrap.className = 'c-box';
    let realStr = '';
    // Генеруємо випадкові цифри
    for (let i = 0; i < digitsNum; i++) {
        let n = Math.floor(Math.random() * 10);
        realStr += n;
        let span = document.createElement('span');
        span.className = 'c-span';
        span.innerText = n;
        // Додаємо випадкове оформлення цифр
        span.style.transform = `rotate(${(Math.random() - 0.5) * 40}deg)`;
        span.style.fontSize = `${Math.floor(Math.random() * 10) + 16}px`;
        span.style.color = `rgb(${Math.random()*150}, ${Math.random()*150}, 0)`;
        numWrap.appendChild(span);
    }
    
    let info = document.createElement('div');
    info.innerText = 'Введіть число:';
    let inp = document.createElement('input');
    inp.type = 'text';
    let btn = document.createElement('button');
    btn.innerText = 'Перевірити';
    let res = document.createElement('span');
    res.style.marginLeft = '10px';
    // Перевіряємо введене число
    btn.onclick = () => {
        if (inp.value === realStr) {
            res.innerText = "Правильно!";
            res.style.color = "green";
        } else {
            res.innerText = "Помилка";
            res.style.color = "red";
        }
    };
    wrap.appendChild(info);
    wrap.appendChild(numWrap);
    wrap.appendChild(inp);
    wrap.appendChild(btn);
    wrap.appendChild(res);
}
// Запускаємо капчу з 5 цифр
initCaptcha(5);