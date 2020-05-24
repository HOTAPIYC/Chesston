class Chessboard extends EventObserver {
  constructor(id,fen) {
    super();
    this.chess = new Chess(fen);
    this.board = document.getElementById(`${id}`).querySelector('.chessboard');
    this.squares = new Map();
    this.possibleMoves = new Map();
  }

  createBoard() {
    // Create shapes
    // Iterate rows
    for (let i = 8; i > 0; i--) {
      let row = document.createElement('div');
      row.classList.add('row'); 

      // Iterate columns
      // Char 97-104 are lower case a-h in ASCII
      for (let k = 97; k < 105; k++) {
        let square = document.createElement('div');
        square.id = `${String.fromCharCode(k)}${i}`;
        square.classList.add('square');

        if ((i % 2) && !(k % 2) || !(i % 2) && (k % 2)) {             
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }
        row.appendChild(square);
        this.squares.set(square.id, square);
      }
      this.board.appendChild(row);
    }

    // Forward clicks to the currently active player
    document.addEventListener('click', event => {
      if(event.target.classList.contains('square')) {
        this.emitEvent(`click ${this.getColor()}`, event);
      } else {
        this.resetHighlight();
      }
    });
  }

  drawPieces() {
    const boardState = this.chess.board();
    const squaresArray = Array.from(this.squares);
    let count = 0;
    boardState.forEach(row => {
      row.forEach(fen => {
        const square = squaresArray[count][1];
        square.className = square.className.replace(/fen-./, "");
        if(fen !== null){
          square.classList.add(`fen-${fen.type}-${fen.color}`);
        }
        squaresArray[count][1] = square;
        count++;
      });
    });
  }

  init(){
    this.chess.reset();
    this.drawPieces();
    this.emitEvent('init');
  }

  getColor() {
    return this.chess.turn();
  }

  getPossibleMoves(square) {
    if(square === undefined) {
      return this.chess.moves();
    } else {
      return this.chess.moves({ square: square});
    }
  }

  checkBoardEvents() {
    if(this.chess.in_check()){
      this.emitEvent('check');
    }
    if(this.chess.in_checkmate()){
      this.emitEvent('checkmate')
    }
  }

  removePlayer() {
    this.removeEventListener('player');
  }

  makeMove(selectedMove){
    this.chess.move(selectedMove);
    this.resetHighlight();
    this.drawPieces();
    this.emitEvent('next turn');
    this.checkBoardEvents();
  }

  setHighlight(squares) {
    this.resetHighlight();     

    squares.forEach((value, key) => {
      const square = this.squares.get(key);
      square.classList.add('highlight');
    })
  }

  resetHighlight(){
    this.squares.forEach((value) => value.classList.remove('highlight'))
  }
}