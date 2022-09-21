const MEASUREMENT_SECTION_COVER = 13;
const HEIGTH_PROJECTILE = 10;
const NUMBER_SECTIONS_COVER = 15;
const WIDTH_ENEMY_TYPE_B_C = 30;
const HEIGTH_ENEMY_TYPE_B_C = 28;
const WIDTH_ENEMY_TYPE_A = 23;
const HEIGTH_ENEMY_TYPE_A = 25;
const TOP_POSITION_PLAYER = 518;
const WIDTH_PLAYER = 35;
const MARGIN_SCREEN_PLAYER = 20.5;
const WIDTH_SCREEN = 600;
const WIDTH_SPECIAL_SHIP = 45;
const HEIGTH_SPECIAL_SHIP = 23;
const ADJUST_WIDTH_BEAM = 1;

let ENEMIES = [
    { points: 30, y: 0, x: [], destroyed: [] },
    { points: 20, y: 0, x: [], destroyed: [] },
    { points: 20, y: 0, x: [], destroyed: [] },
    { points: 10, y: 0, x: [], destroyed: []},
    { points: 10, y: 0, x: [], destroyed: []}
];

let COVER = [
    { x: [], y: [], impacts: [] },
    { x: [], y: [], impacts: [] },
    { x: [], y: [], impacts: [] },
    { x: [], y: [], impacts: [] },
];

let PLAYER = { 
    x: Number(getComputedStyle(document.querySelector('.player')).left.slice(0,-2)), 
    y: Number(getComputedStyle(document.querySelector('.player')).top.slice(0,-2)),
    bodyCount: 0
};

let SHIP_SPECIAL = { 
    x: -WIDTH_SPECIAL_SHIP, 
    y: Number(getComputedStyle(document.querySelector('.ship-special')).top.slice(0,-2)),
    points: 100 
};

let missiles = [];

let intervalMovEnemies = 0;
let intervalBeamMov = 0;
let intervalMissilesMov = 0;
let intervalMovSpecialShip = 0;
let beamActive = false;
let speed = 1000;
let score = 0;
let bonusPoints = 0;
let leftFirstEnemy = 0;
let leftLastEnemy = 10;
let bottomEnemy = { line: 4, position: 10 };
let direction = 'rigth';
let paceShootings = 4;
let isActiveShipSpecial = false;
let timesActivatedShipSpecial = 0;
let isEndGame = false;


const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const drawEnemies = async() => {
    let cont = 0;
    let top = 10;
    const container = document.querySelector('.battlefield');
    for(let line = 0; line < 5; line ++){
        let left = 10;
        for(let column = 0; column < 11; column ++){
            //Dibujar cada marcianito dentro de la linea creada anteriormente
            await sleep(20); //Para que los vaya mostrando poco a poco
            const enemy = document.createElement('img');
            enemy.classList = `enemy enemy-${line} position-${column}`;
            enemy.id = cont;
            enemy.style.top = top + '%';
            enemy.style.left = left + '%';
            container.appendChild(enemy);
            //Colocar la posicion x de cada marcianito en la variable ENEMIES
            if(column === 0) ENEMIES[line].y = Number(getComputedStyle(enemy).top.slice(0,-2));
            ENEMIES[line].x.push(Number(getComputedStyle(enemy).left.slice(0,-2))); 
            ENEMIES[line].destroyed.push(0);
            cont ++;
            left += 7.5;
        };
        top += 7;
    };
    return new Promise(resolve => resolve('loaded'));
}

const drawCover = () => {
    const container = document.querySelector('.battlefield');
    const topCover = 450;
    let topSection = 450;
    let leftCover = 86;

    for(let numCover = 0; numCover < 4; numCover++){
        let leftSection = leftCover;
        //Para poder controlar que seccion del cover se destruye lo formo con 4x4 divs
        for(let i = 1; i <= 16; i++){
            const sectionCover = document.createElement('div');
            sectionCover.classList = `cover-section`;
            sectionCover.id = `section-${numCover}-${i}`;
            container.appendChild(sectionCover);
            sectionCover.style.top = topSection + 'px';
            sectionCover.style.left = leftSection + 'px';
            COVER[numCover].x.push(leftSection);
            COVER[numCover].y.push(topSection);
            COVER[numCover].impacts.push(0);
            if(i % 4 === 0){
                leftSection = leftCover;
                topSection += 13;
            }else{
                leftSection += 13;
            }
            if(i === 1) sectionCover.classList.add('border-up-left');
            if(i === 4) sectionCover.classList.add('border-up-rigth');
            if(i === 14) sectionCover.classList.add('border-down-left');
            if(i === 15) sectionCover.classList.add('border-down-rigth');
        }
        leftCover += 130;
        topSection = topCover;
    } 
}

const endGame = (idMissile) => {
    isEndGame = true;
    //idMissile 0 & 1 -> destruction by missile
    //idMissile 3 -> destruction by enemy crashed into player
    //idMissile -1 -> player wins, all enemies destroyed
    if(idMissile === 0 || idMissile === 1){
        const missile = document.querySelector(`.missile-${idMissile}`);
        missile.remove();
    } 
    clearInterval(intervalBeamMov);
    clearInterval(intervalMissilesMov);
    clearInterval(intervalMovEnemies);
    clearInterval(intervalMovSpecialShip);
    document.removeEventListener('keydown', addKeyboardListener);
    const player = document.querySelector('.player');
    player.classList.toggle('explosion-player');
    const gameOverScreen = document.querySelector('.game-over');
    gameOverScreen.style.visibility = 'visible';
    const finalScore = document.querySelector('.final-score');
    idMissile >= 0 ? finalScore.textContent = `YOU LOSE, TOTAL SCORE: ${bonusPoints + score}` 
        : finalScore.textContent = `YOU WIN, TOTAL SCORE: ${bonusPoints + score}` 
}

const activateShipSpecial = () => {
    isActiveShipSpecial = true;
    timesActivatedShipSpecial += 1;
    const shipSpecial = document.querySelector('.ship-special');
    shipSpecial.style.left = `${SHIP_SPECIAL.x}px`;
    shipSpecial.style.visibility = 'visible';
    intervalMovSpecialShip = setInterval(() => {
        SHIP_SPECIAL.x += 15;
        shipSpecial.style.left = `${SHIP_SPECIAL.x}px`;   
        if(SHIP_SPECIAL.x >= WIDTH_SCREEN){
            clearInterval(intervalMovSpecialShip);
            isActiveShipSpecial = false;
            SHIP_SPECIAL.x = -WIDTH_SPECIAL_SHIP; 
            shipSpecial.style.visibility = 'hidden';
        }
    }, 120); 
}

const createMissile = (coord, order) => {
    const battlefield = document.querySelector('.battlefield');
    const missile = document.createElement('div');
    missile.classList = 'missile-enemy';
    missile.classList.add(`missile-${order}`);
    missile.style.top = `${coord.y}px`; 
    missile.style.left = `${coord.x}px`; 
    battlefield.appendChild(missile);
    return missile;
}

const shootToPlayer = async() => {
    let missile1;
    let missile2;
    let timerSecondMissile = 0;
    while(missiles?.length !== 2){
        let randomEnemy = Math.floor(Math.random() * 55);
        let line = Math.floor(randomEnemy / 11);
        let index = randomEnemy % 11;
        if(ENEMIES[line].destroyed[index] === 0)  missiles.push({ 
            active: false,
            x: ENEMIES[line].x[index] + (ENEMIES[line].points === 30 ? (WIDTH_ENEMY_TYPE_A / 2) - 1 : (WIDTH_ENEMY_TYPE_B_C / 2) - 1),
            y: ENEMIES[line].y + (ENEMIES[line].points === 30 ? WIDTH_ENEMY_TYPE_A : HEIGTH_ENEMY_TYPE_B_C), 
        }); 
    }
    missile1 = createMissile(missiles[0], 0);
    missiles[0].active = true;
    intervalMissilesMov = setInterval(() => {
        if(timerSecondMissile === 4){
            missile2 = createMissile(missiles[1], 1);
            missiles[1].active = true;
        } 
        if(missiles[0].active){
            if(missiles[0].y <= TOP_POSITION_PLAYER){
                missiles[0].y += 5;
                missile1.style.top = missiles[0].y + 'px';
                if(missiles[0].y + HEIGTH_PROJECTILE >= COVER[0].y[0]) 
                    checkCollisionProjectileToCover(missiles[0].x, missiles[0].y, 0, false, 0);
                if(checkCollisionMissileToPlayer(missiles[0].x, missiles[0].y)) endGame(0);
            }else{
                missile1.remove();
                missiles[0].active = false;
            }    
        }
        if(missiles[1].active){
            if(missiles[1].y <= TOP_POSITION_PLAYER){
                missiles[1].y += 5;
                missile2.style.top = missiles[1].y + 'px';
                if(missiles[1].y + HEIGTH_PROJECTILE >= COVER[0].y[0]) 
                    checkCollisionProjectileToCover(missiles[1].x, missiles[1].y, 0, false, 1);
                if(checkCollisionMissileToPlayer(missiles[1].x, missiles[1].y)) endGame(1);
            }else{
                missile2.remove();
                missiles[1].active = false;
            }    
        }
        if(!missiles[0].active && !missiles[1].active){
            clearInterval(intervalMissilesMov);
            missiles = [];
        } 
        timerSecondMissile++;
    },15);   
}

const destroyBeam = () => {
    const beam = document.querySelector('.beam-player');
    clearInterval(intervalBeamMov);
    beam.remove();
    beamActive = false;
}

const destroyMissile = (order) => {
    const missile = document.querySelector(`.missile-${order}`);
    missile.remove();
    missiles[order].active = false;
    if(!missiles[0].active && !missiles[1].active) clearInterval(intervalMissilesMov);
}

const animationExplosion = async(element, isEnemy, ms) => {
    let destroyClass;
    isEnemy ? destroyClass = 'explosion-enemy' : destroyClass = 'explosion-section-cover';
    element.classList.toggle(destroyClass);
    await sleep(ms);
    element.classList.toggle(destroyClass);
}

const changeSpeedEnemies = () => {
    let prevSpeed = speed;
    if(score >= 150 && speed !== 850) speed = 850;
    if(score >= 350 && speed !== 750) speed = 750;
    if(score >= 450 && speed !== 500){
        speed = 500;
        paceShootings = 6;
    }
    if(score >= 500 && speed !== 400) speed = 400;
    if(score >= 550 && speed !== 300){
        speed = 300;
        paceShootings = 7;
    } 
    if(score >= 650 && speed !== 200){
        speed = 200;
        paceShootings = 8;
    } 
    
    if(PLAYER.bodyCount === 54) speed = 5;
    
    if(prevSpeed !== speed){
        clearInterval(intervalMovEnemies);
        movementEnemies();
    }
}

const checkCollisionBeamToSpecialShip = (left) => {
    const shipSpecial = document.querySelector('.ship-special');
    if(left >= SHIP_SPECIAL.x - ADJUST_WIDTH_BEAM && left <= SHIP_SPECIAL.x + WIDTH_SPECIAL_SHIP + ADJUST_WIDTH_BEAM){
        clearInterval(intervalMovSpecialShip);
         animationExplosion(shipSpecial, true, 200);
        shipSpecial.style.visibility = 'hidden';
        isActiveShipSpecial = false;
        SHIP_SPECIAL.x = -WIDTH_SPECIAL_SHIP;
        bonusPoints += SHIP_SPECIAL.points;
        const scoreboard = document.querySelector('.points-player-one');
        scoreboard.textContent = `${score + bonusPoints}`;
    }
}

const checkCollisionProjectileToCover = async(left, top, initialPosition, isPlayerShooting, order) => {
    let notFound = true;
    let numCover;
    let index = -1;

    COVER.forEach((cover, indexCover) => {
        if(left >= cover.x[0] && left <= cover.x[cover.x.length - 1] + MEASUREMENT_SECTION_COVER) {
            numCover = indexCover;
            index = initialPosition;
        }
    });
    
    while(notFound && index !== -1 ){   
        
        if(left >= COVER[numCover].x[index] && left <= COVER[numCover].x[index] + MEASUREMENT_SECTION_COVER){
            if(top >= COVER[numCover].y[index] && top <= COVER[numCover].y[index] + MEASUREMENT_SECTION_COVER){
               const section = document.querySelector(`#section-${numCover}-${index + 1}`);
                
               switch(COVER[numCover].impacts[index]){
                case 0: {
                    notFound = false;
                    COVER[numCover].impacts[index] = 1;
                    isPlayerShooting ? destroyBeam() : destroyMissile(order);
                    animationExplosion(section, false, 200);
                    section.classList.add('damaged-section-down');
                    break;
                }
                case 1: {
                    notFound = false;
                    COVER[numCover].impacts[index] = 2;
                    isPlayerShooting ? destroyBeam() : destroyMissile(order);
                    animationExplosion(section, false, 210);
                    section.classList.add('destroyed');
                    break;
                }
                default: break;
               }
            }
        }
        isPlayerShooting ? index-- : index++;
        if(isPlayerShooting && index < 0) notFound = false;
        if(!isPlayerShooting && index > NUMBER_SECTIONS_COVER) notFound = false;
    } 
}

const checkCollisionBeamToEnemies = (left, top) => {
    let size;
    for(let line = 4; line >= 0; line--){
        if(top >= ENEMIES[line].y && top <= ENEMIES[line].y + HEIGTH_ENEMY_TYPE_A){
            line === 0 ? size = WIDTH_ENEMY_TYPE_A : size = WIDTH_ENEMY_TYPE_B_C;
            ENEMIES[line].x.forEach((enemy, index) => {
                if(left >= enemy - ADJUST_WIDTH_BEAM  && left <= enemy + size + ADJUST_WIDTH_BEAM && ENEMIES[line].destroyed[index] != 1){
                    ENEMIES[line].destroyed[index] = 1;
                    PLAYER.bodyCount += 1;
                    destroyBeam();
                    const enemy = document.querySelector(`.enemy-${line}.position-${index}`);
                    animationExplosion(enemy, true, 200);
                    enemy.classList.toggle('destroyed');
                    //Recalculate limits left & rigth of screen to movement of enemies
                    leftFirstEnemy = ENEMIES[0].destroyed.indexOf(0);
                    leftLastEnemy = ENEMIES[0].destroyed.lastIndexOf(0);
                    //Recalculate bottom enemy to control collision with player
                    if(ENEMIES[bottomEnemy.line].destroyed[bottomEnemy.position] === 1){
                        let findNotDestroyed = -1;
                        for(let line = 4; line >=0 && findNotDestroyed === -1; line--){
                            findNotDestroyed = ENEMIES[line].destroyed.lastIndexOf(0);
                            if(findNotDestroyed !== -1){
                                bottomEnemy.line = line;
                                bottomEnemy.position = findNotDestroyed;
                            }
                        }
                    }

                    score += ENEMIES[line].points;
                    if(score >= 250 && timesActivatedShipSpecial === 0) activateShipSpecial();
                    if(score >= 500 && timesActivatedShipSpecial === 1) activateShipSpecial();
                    if(score >= 750 && timesActivatedShipSpecial === 2) activateShipSpecial();
                    const spanScore = document.querySelector('.points-player-one');
                    spanScore.textContent = `${score + bonusPoints}`;
                    changeSpeedEnemies();
                    if(PLAYER.bodyCount === 55) endGame(-1);
                }
            });
        }
    }
}

const checkCollisionMissileToPlayer = (left, top) => {
    if(top >= PLAYER.y){
        if(left >= PLAYER.x && left <= PLAYER.x + WIDTH_PLAYER){
            return true;
        }
    }
    return false;
}

const shootToEnemies = (left, top) => {
    const battlefield = document.querySelector('.battlefield');
    if(!beamActive){
        beamActive = true;
        const beam = document.createElement('div');
        beam.classList = `beam-player`;
        beam.style.left = left + 'px';
        beam.style.top = top + 'px';
        battlefield.appendChild(beam);
        intervalBeamMov = setInterval(() => {
            if(top >= 0){
                top -= 5;
                beam.style.top = top + 'px';
                if(top >= COVER[0].y[0] + HEIGTH_PROJECTILE) checkCollisionProjectileToCover(left, top, NUMBER_SECTIONS_COVER, true);
                checkCollisionBeamToEnemies(left, top);
                if(isActiveShipSpecial && top <= SHIP_SPECIAL.y + HEIGTH_SPECIAL_SHIP) {
                    checkCollisionBeamToSpecialShip(left);
                }
            }else{
                animationExplosion(beam, false, 500);
                destroyBeam(); 
            }
        },8);
    }
}

const addKeyboardListener = (event) => {
    const player = document.querySelector('.player');
    const battlefield = document.querySelector('.battlefield');
    const maxWidthScreen = battlefield.offsetWidth - player.offsetWidth; 
    let leftPx = getComputedStyle(player).left;
    let left = Number(leftPx.slice(0, leftPx.length - 2)); 
    let topPx = getComputedStyle(player).top;
    let top = Number(topPx.slice(0, topPx.length - 2)); 
    switch (event.key){
        case 'ArrowRight': {
            if(left + 9 <= maxWidthScreen - MARGIN_SCREEN_PLAYER){
                left += 9;
                player.style.left = left + 'px';
                PLAYER.x =  Number(getComputedStyle(player).left.slice(0,-2));
            }
            break;
        }
        case 'ArrowLeft' : {
            if(left - 9 >= 1.5 + MARGIN_SCREEN_PLAYER){
                left -= 9;
                player.style.left = left + 'px';
                PLAYER.x =  Number(getComputedStyle(player).left.slice(0,-2));
            }
            break;
        }
        case ' ' : {
            shootToEnemies(left + 16, top - 12);
            break;
        }
        default: break;
    }
}

const moveXEnemies = (inc) => {
    const enemies = document.querySelectorAll('.enemy');
    for(let i = enemies.length - 1; i >= 0; i--){
        let left = Number(enemies[i].style.left.slice(0, -1))
        enemies[i].style.left = left + inc + '%';
        const line = enemies[i].classList[1].slice(-1);
        const pos = enemies[i].classList[2].split('-')[1];
        enemies[i].classList.toggle(`moving-${line}`);
        ENEMIES[line].x[pos] = Number(getComputedStyle(enemies[i]).left.slice(0,-2))
    }
}

const moveYEnemies = () => {
    const enemies = document.querySelectorAll('.enemy');
    for(let i = enemies.length - 1; i >= 0; i--){
        let top = Number(enemies[i].style.top.slice(0, -1))
        enemies[i].style.top = top + 2 + '%';
        const line = enemies[i].classList[1].slice(-1);
        enemies[i].classList.toggle(`moving-${line}`);
        ENEMIES[line].y = Number(getComputedStyle(enemies[i]).top.slice(0,-2));
    }

}

const checkLastEnemyCrashIntoPlayer = (width) => {
    if(ENEMIES[bottomEnemy.line].x[bottomEnemy.position] <= PLAYER.x + WIDTH_PLAYER && 
        ENEMIES[bottomEnemy.line].x[bottomEnemy.position] >= PLAYER.x - width){
                    return true;
    }
   return false;
}

const movementEnemies = () => {
    let cont = 0;
    let heigth = 0;
    let width = 0;
    let playerZone = false;

    intervalMovEnemies = setInterval(async() => {
        ENEMIES[bottomEnemy.line].points === 30 ? heigth = HEIGTH_ENEMY_TYPE_A : heigth = HEIGTH_ENEMY_TYPE_B_C;
        ENEMIES[bottomEnemy.line].points === 30 ? width = WIDTH_ENEMY_TYPE_A : width =WIDTH_ENEMY_TYPE_B_C;
        if( direction === 'rigth'){
            moveXEnemies(1);
            if(playerZone && PLAYER.bodyCount === 54 && checkLastEnemyCrashIntoPlayer(width)) endGame(3);
            const enemy = document.getElementById(leftLastEnemy);
            const rigthLimitScreen = Number(enemy.style.left.slice(0, -1));
            if(rigthLimitScreen >= 90){
                direction = 'left';
                await sleep(speed);
                moveYEnemies();
                if(ENEMIES[bottomEnemy.line].y + heigth > PLAYER.y) playerZone = true;
                if(playerZone && PLAYER.bodyCount < 54) endGame(3);
                await sleep(speed);
            }
        }else{
            moveXEnemies(-1);
            if(playerZone && PLAYER.bodyCount === 54 && checkLastEnemyCrashIntoPlayer(width)) endGame(3);
            const enemy = document.getElementById(leftFirstEnemy);
            const leftLimitScreen = Number(enemy.style.left.slice(0, -1));
            if(leftLimitScreen <= 5){
                direction = 'rigth';
                await sleep(speed);
                moveYEnemies();
                if(ENEMIES[bottomEnemy.line].y + heigth >= PLAYER.y) playerZone = true;
                if(playerZone && PLAYER.bodyCount < 54) endGame(3);
                await sleep(speed);
            }
        }
        cont ++;
        if(cont % paceShootings === 0 && PLAYER.bodyCount !== 54 && !isEndGame) shootToPlayer();
    }, speed);
}


const init = async() => {
    drawCover();
    await drawEnemies(); 
    movementEnemies();
    document.addEventListener('keydown', addKeyboardListener)
    //Comienza el juego, terminara cuando todos los marcianos esten muertos o el player
    //El player muere cuando un misil impacte o cuando una nave enemiga choque con el
    //Quedan:
    //Endgame
}

init();

