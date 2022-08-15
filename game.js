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

let PLAYER = { x: 0, y: 0 };

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const drawEnemies = async() => {
    let cont = 0;
    let top = 10;
    const container = document.querySelector('.battlefield');
    for(let line = 0; line < 5; line ++){
        let left = 7;
        for(let column = 0; column < 11; column ++){
            //Dibujar cada marcianito dentro de la linea creada anteriormente
            await sleep(20); //Para el efecto de que se generan en el momento de carga
            const enemy = document.createElement('img');
            enemy.classList = `enemy enemy-${line}`;
            enemy.id = cont;
            enemy.style.top = top + '%';
            enemy.style.left = left + '%';
            container.appendChild(enemy);
            //Colocar la posicion x de cada marcianito en la variable ENEMIES
            if(column === 0) ENEMIES[line].y = enemy.offsetTop;
            ENEMIES[line].x.push(enemy.offsetLeft); 
            cont ++;
            left += 8;
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
        leftCover += 110;
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
                }
                break;
            }
            case 'ArrowLeft' : {
                if(left - 10 >= 1.5){
                    left -= 10;
                    player.style.left = left + 'px';
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

const init = async() => {
    //Funciones para pintar la pantalla
    drawCover();
    console.log(COVER);
    await drawEnemies(); 
    console.log(ENEMIES);
    //Funciones para poner en marcha el juego
    //Movimiento enemigos
    addKeyboardListener();
    //Comienza el juego, terminara cuando todos los marcianos esten muertos o el player

   
}

init();

//Puedo mover la linea entera
//los destruidos visibilidad hidden