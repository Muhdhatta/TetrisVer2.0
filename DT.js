const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");


const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 30;
const VACANT = "WHITE";

var buttonSound = new Audio('./button.wav');
var movementSound = new Audio('./movement.wav')
var completeSound = new Audio('./complete.wav')
var impactSound = new Audio('./impact.wav')
var gameOverSound = new Audio('./mariogameover.mp3')
var bgSound = new Audio('./song.mp3')

function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);
    ctx.strokeStyle = "white";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

let board = [];
for( r = 0; r <ROW; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

function drawBoard(){
    for( r = 0; r <ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

const PIECES = [
    [Z,"green"],
    [S,"black"],
    [t,"brown"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"],
    [T,"gray"],
    [U,"red"]
];


function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length)
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();
bgSound.currentTime = 0;
bgSound.play();

function Piece(matrix,color){
    this.matrix = matrix;
    this.color = color;
    this.matrixN = 0;
    this.activeMatrix = this.matrix[this.matrixN];
    this.x = 3;
    this.y = -2;
}

Piece.prototype.fill = function(color){
    for( r = 0; r < this.activeMatrix.length; r++){
        for(c = 0; c < this.activeMatrix.length; c++){
            // we draw only occupied squares
            if( this.activeMatrix[r][c]){
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}

Piece.prototype.draw = function(){
    this.fill(this.color);
}

Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeMatrix)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{

        this.lock();
        p = randomPiece();
    }

}

Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeMatrix)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeMatrix)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

Piece.prototype.rotate = function(){
    let nextPattern = this.matrix[(this.matrixN + 1)%this.matrix.length];

    let kick = 0;
    buttonSound.currentTime = 0;
    buttonSound.play();
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){kick = -1;
        }else{kick = 1;
        }
    }

    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.matrixN = (this.matrixN + 1)%this.matrix.length;
        this.activeMatrix = this.matrix[this.matrixN];
        this.draw();
    }

}
let score = 0;

Piece.prototype.lock = function(){
    impactSound.currentTime = 0;
    impactSound.play();
    for( r = 0; r < this.activeMatrix.length; r++){
        for(c = 0; c < this.activeMatrix.length; c++){

            if( !this.activeMatrix[r][c]){
                continue;
            }

            if(this.y + r < 0){
               // alert("Game Over");

                gameOver = true;
                bgSound.pause();
                gameOverSound.currentTime = 0;
                gameOverSound.play();
                break;
            }

            board[this.y+r][this.x+c] = this.color;
        }
    }

    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if(isRowFull){

            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }

            for( c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }

            score += 100;
            completeSound.currentTime = 0;
            completeSound.play();
        }
    }

    drawBoard();

    scoreElement.innerHTML = score;
}

Piece.prototype.collision = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){

            if(!piece[r][c]){
                continue;
            }

            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }

            if(newY < 0){
                continue;
            }

            if( board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        movementSound.currentTime = 0;
        movementSound.play();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        movementSound.currentTime = 0;
        movementSound.play();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
        movementSound.currentTime = 0;
        movementSound.play();
    }
}

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 500){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();