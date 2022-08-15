let ENEMIES = [
    { points: 30, y: 0, x: [] },
    { points: 20, y: 0, x: [] },
    { points: 20, y: 0, x: [] },
    { points: 10, y: 0, x: [] },
    { points: 10, y: 0, x: [] }
];

let COVER = [
    { numCover: 0, x: [], y: [] },
    { numCover: 1, x: [], y: [] },
    { numCover: 2, x: [], y: [] },
    { numCover: 3, x: [], y: [] },
];

let PLAYER = { 
    x: Number(getComputedStyle(document.querySelector('.player')).left.slice(0,-2)), 
    y: Number(getComputedStyle(document.querySelector('.player')).top.slice(0,-2))
};

let intervalMovEnemies = 0;
let speed = 1000;

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
            //if(column === 0) ENEMIES[line].y = enemy.offsetTop;
            //ENEMIES[line].x.push(enemy.offsetLeft); 
            ENEMIES[line].x.push(Number(getComputedStyle(enemy).left.slice(0,-2))); 
            cont ++;
            left += 7.5;
            //console.log(enemy.offsetParent);
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
            if(i % 4 === 0){
                leftSection = leftCover;
                topSection += 13;
            }else{
                leftSection += 13;
            }
            //console.log(sectionCover.offsetParent);
        }
        leftCover += 130;
        topSection = topCover;
    } 
}

const addKeyboardListener = () => {
    const player = document.querySelector('.player');
    let leftPx = (getComputedStyle(player).left);
    let left = Number(leftPx.slice(0, leftPx.length - 2)); 
        
    document.addEventListener('keydown', function(event){
        switch (event.key){
            //controlar el movimiento no puede superar la pantalla establecida
            case 'ArrowRight': {
                if(left + 10 <= 501.5){
                    left += 10;
                    player.style.left = left + 'px';
                    PLAYER.x =  Number(getComputedStyle(player).left.slice(0,-2));
                }
                break;
            }
            case 'ArrowLeft' : {
                if(left - 10 >= 1.5){
                    left -= 10;
                    player.style.left = left + 'px';
                    PLAYER.x =  Number(getComputedStyle(player).left.slice(0,-2));
                }
                break;
            }
            case ' ' : {
                
                break;
            }
            default: break;
        }
    });
}

const updateCoordinates = () => {
   
}

const moveXEnemies = (inc) => {
    const enemies = document.querySelectorAll('.enemy');
    for(let i = enemies.length - 1; i >= 0; i--){
        let left = Number(enemies[i].style.left.slice(0, enemies[i].style.left.length - 1))
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
        let top = Number(enemies[i].style.top.slice(0, enemies[i].style.top.length - 1))
        enemies[i].style.top = top + 1 + '%';
        const line = enemies[i].classList[1].slice(-1);
        enemies[i].classList.toggle(`moving-${line}`);
        ENEMIES[line].y = Number(getComputedStyle(enemies[i]).top.slice(0,-2));
    }
}

const movementEnemies = () => {
    const enemies = document.querySelectorAll('.enemy');
    let direction = 'rigth';
    
    intervalMovEnemies = setInterval(async() => {
        if( direction === 'rigth'){
            moveXEnemies(1);
            if(enemies[enemies.length - 1].style.left === '90%'){
                direction = 'left';
                await sleep(speed);
                moveYEnemies();
                await sleep(speed);
            }
        }else{
            moveXEnemies(-1);
            if(enemies[0].style.left === '5%'){
                direction = 'rigth';
                await sleep(speed);
                moveYEnemies();
                await sleep(speed);
            }
        }
    }, speed);
}

const init = async() => {
    //Funciones para pintar la pantalla
    drawCover();
    console.log(COVER);
    await drawEnemies(); 
    console.log(ENEMIES);
    //Funciones para poner en marcha el juego
    //Movimiento enemigos
    //movementEnemies();
    addKeyboardListener();
    //Comienza el juego, terminara cuando todos los marcianos esten muertos o el player
   
}

init();


//los destruidos visibilidad hidden