// DOM
const tabsContainer = document.querySelector('#tabs');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const topLeft = document.querySelector('#top-left');
const topRight = document.querySelector('#top-right');
const bottomRight = document.querySelector('#bottom-right');
const bottomLeft = document.querySelector('#bottom-left');

const topLeftValue = document.querySelector('#top-left-value');
const topRightValue = document.querySelector('#top-right-value');
const bottomRightValue = document.querySelector('#bottom-right-value');
const bottomLeftValue = document.querySelector('#bottom-left-value');

const textColor = document.querySelector('#text-color');
const textWeight = document.querySelector('#text-weight');

const preview = document.querySelector('#preview');
const previewButton = document.querySelector('#preview-button');
const coordinates = document.querySelector('#coordinates');

const cssCode = document.querySelector('#css-code');
const copyButton = document.querySelector('#copy-button');
const copyMessage = document.querySelector('#copy-message');

const presetForm = document.querySelector('#preset-form');
const presetName = document.querySelector('#preset-name');
const presetError = document.querySelector('#preset-error');

const scrollTopButton = document.querySelector('#scroll-top');


// Вкладки
function hideTabs() {
    tabs.forEach(function (tab) {
        tab.classList.remove('active');
    });

    tabContents.forEach(function (content) {
        content.classList.remove('active');
    });
}

function showTab(tabName) {
    hideTabs();

    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.querySelector(`[data-content="${tabName}"]`);

    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeContent.classList.add('active');
    }
}

tabsContainer.addEventListener('click', function (event) {
    if (!event.target.classList.contains('tab')) {
        return;
    }

    console.log(event.type);
    console.log(event.target);
    console.log(event.currentTarget);

    const tabName = event.target.dataset.tab;
    showTab(tabName);
});


// CSS Generator
function updateCSSCode() {
    const radius = `${topLeft.value}px ${topRight.value}px ${bottomRight.value}px ${bottomLeft.value}px`;
    const colorVal = textColor.value;
    const weightVal = textWeight.value;

    preview.style.color = colorVal;
    preview.style.fontWeight = weightVal;

    cssCode.value =
        `border-radius: ${radius};\n` +
        `color: ${colorVal};\n` +
        `font-weight: ${weightVal};`;
}

function generateBorderRadius() {
    const radius = `${topLeft.value}px ${topRight.value}px ${bottomRight.value}px ${bottomLeft.value}px`;

    preview.style.borderRadius = radius;

    topLeftValue.textContent = `${topLeft.value} px`;
    topRightValue.textContent = `${topRight.value} px`;
    bottomRightValue.textContent = `${bottomRight.value} px`;
    bottomLeftValue.textContent = `${bottomLeft.value} px`;

    updateCSSCode();
}

topLeft.addEventListener('input', generateBorderRadius);
topRight.addEventListener('input', generateBorderRadius);
bottomRight.addEventListener('input', generateBorderRadius);
bottomLeft.addEventListener('input', generateBorderRadius);

textColor.addEventListener('input', updateCSSCode);
textWeight.addEventListener('change', updateCSSCode);

generateBorderRadius();


// Копіювання CSS
function copyCSS() {
    navigator.clipboard.writeText(cssCode.value).then(function () {
        copyMessage.textContent = 'CSS-код скопійовано';

        setTimeout(function () {
            copyMessage.textContent = '';
        }, 2000);
    });
}

copyButton.addEventListener('click', copyCSS);


// Форма
presetName.addEventListener('focus', function () {
    presetName.classList.add('focused');
});

presetName.addEventListener('blur', function () {
    presetName.classList.remove('focused');

    if (presetName.value.trim() === '') {
        presetName.classList.add('error');
        presetError.textContent = 'Введіть назву пресета';
    } else {
        presetName.classList.remove('error');
        presetError.textContent = '';
    }
});

function handlePresetSubmit(event) {
    event.preventDefault();

    const value = presetName.value.trim();

    if (value === '') {
        presetName.classList.add('error');
        presetError.textContent = 'Введіть назву пресета';
        return;
    }

    presetName.classList.remove('error');
    presetError.textContent = '';

    console.log(`Пресет: ${value}`);
    console.log(`CSS-код:\n${cssCode.value}`);
}

presetForm.addEventListener('submit', handlePresetSubmit);


// Клавіатура
function handleKeyDown(event) {
    if (event.key === 'Escape') {
        topLeft.value = 0;
        topRight.value = 0;
        bottomRight.value = 0;
        bottomLeft.value = 0;

        generateBorderRadius();

        console.log('Натиснуто Escape: border-radius скинуто до 0');
    }
}

document.addEventListener('keydown', handleKeyDown);


// Події Preview
preview.addEventListener('click', function () {
    console.log('Preview click');
});

previewButton.addEventListener('click', function (event) {
    event.stopPropagation();
    console.log('Button click');
});

preview.addEventListener('mouseover', function () {
    preview.classList.add('hovered');
});

preview.addEventListener('mouseout', function () {
    preview.classList.remove('hovered');
});

preview.addEventListener('mousemove', function (event) {
    coordinates.textContent = `X: ${event.clientX}; Y: ${event.clientY}`;

    console.log(event.pageX);
    console.log(event.pageY);
});


// Scroll
function handleScroll() {
    if (window.scrollY > 300) {
        scrollTopButton.classList.add('visible');
    } else {
        scrollTopButton.classList.remove('visible');
    }
}

window.addEventListener('scroll', handleScroll);

scrollTopButton.addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});