import { config } from "./config.js";
const pause = document.getElementById('pause');
const win = document.getElementById('win');
const intro = document.getElementById('intro');
const introControls = document.getElementById('introControls');
const introScore = document.getElementById('introScore');
const introHighscore = document.getElementById('introHighscore');
const introList = document.getElementById('introList');
const introDifficulty = document.getElementById('introDifficulty');
const keys = document.getElementById('keys');
const scoreTop = document.getElementById('scoreTop');
const scoreBottom = document.getElementById('scoreBottom');
const lifes = document.getElementById('lifes');
const room = document.getElementById('room');
const level = document.getElementById('level');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const debugCanvas = document.getElementById('debugCanvas');
const debugCtx = debugCanvas.getContext('2d');
debugCtx.strokeStyle = config.debugColor;
let isIntroListCreated = false;
const displayPause = () => {
    pause.style.display = 'flex';
};
const removePause = () => {
    pause.style.display = 'none';
};
const displayWin = () => {
    win.style.display = 'flex';
};
const removeStart = () => {
    const start = document.getElementById('start');
    if (start !== null) {
        start.remove();
    }
};
const createIntroList = () => {
    isIntroListCreated = true;
    for (const e of config.intro.list) {
        const img = document.createElement('div');
        const text = document.createElement('div');
        text.classList.add('introListText');
        img.classList.add('introListImg');
        img.style.backgroundImage = `url('./assets/${e[0]}')`;
        text.innerHTML = e[1];
        introList.appendChild(img);
        introList.appendChild(text);
    }
    for (const e of config.intro.controls) {
        const text1 = document.createElement('div');
        const text2 = document.createElement('div');
        text1.classList.add('introControlsEntry');
        text2.classList.add('introControlsEntry');
        text1.innerHTML = e[0];
        text2.innerHTML = e[1];
        introControls.appendChild(text1);
        introControls.appendChild(text2);
    }
};
const renderIntro = (difficulty, score = 0, highScore = 0) => {
    introScore.innerHTML = score.toString();
    introHighscore.innerHTML = highScore.toString();
    introDifficulty.innerHTML = difficulty;
    if (!isIntroListCreated) {
        createIntroList();
    }
    intro.style.display = 'grid';
};
const removeIntro = () => {
    intro.style.display = 'none';
};
const renderUi = (data) => {
    scoreTop.innerHTML = data.highScore.toString();
    scoreBottom.innerHTML = data.score.toString();
    lifes.innerHTML = '';
    for (let i = 0; i < data.lifes - 1; i++) {
        const div = document.createElement('div');
        lifes.appendChild(div);
    }
    room.innerHTML = data.room.toString();
    level.innerHTML = data.level;
    keys.innerHTML = '';
    for (let i = 0; i < data.keys.length; i++) {
        const div = document.createElement('div');
        div.style.backgroundImage = `url('./assets/items/${config.gameKey.images[data.keys[i]]}.png')`;
        keys.appendChild(div);
    }
};
const renderUnits = (units) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < units.length; i++) {
        units[i].draw(ctx);
    }
};
const renderDebug = (objects) => {
    debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
    for (let i = 0; i < objects.length; i++) {
        objects[i].draw(debugCtx);
    }
};
export { renderUnits, renderDebug, renderUi, renderIntro, displayWin, removeIntro, removeStart, displayPause, removePause };
