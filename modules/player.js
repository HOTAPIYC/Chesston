class PlayerFactory {
    constructor(board){
        this.board = board;
    }

    createPlayer(type, color){
        switch(type){
            case 'human':
                return new HumanPlayer(this.board, color);
                break;
            case 'artifical':
                return new ArtificalPlayer(this.board, color);
                break;
            default:
                return new HumanPlayer(this.board, color);
                break;
        }
    }
}

class HumanPlayer {
    constructor(board, color){    
        this.board = board;
        
        this.color = color;
        this.currentColor = '';
        this.moveStarted = false;

        this.board.addEventListener(`click ${this.color}`, event => this.onClick(event), 'player');
        this.board.addEventListener('next turn', event => this.onNextTurn(event), 'player');
    }

    onClick(event) {
        if(!this.moveStarted) {
            this.moveStarted = this.board.selectPiece(this.color, event);
        } else {
            this.moveStarted = this.board.selectTarget(this.color, event);
        }
    }

    onNextTurn(event) {
        this.currentColor = this.board.getColor();
    }
}

class ArtificalPlayer {
    constructor(board, color){
        this.board = board;

        this.color = color;
        this.currentColor = ''; 
        
        this.board.addEventListener('next turn', event => this.onNextTurn(event), 'player');
    }

    onNextTurn(event) {
        this.currentColor = this.board.getColor();

        // On this players turn make a random move
        if(this.currentColor === this.color){
            const moves = this.board.chess.moves();
            const selectedMove = moves[Math.floor(Math.random() * moves.length)];
            // Simulate thinking
            setTimeout(this.makeMove,2000,this.board,selectedMove);
        }
    }

    makeMove(board, selectedMove){
        board.makeMove(selectedMove);
    }
}