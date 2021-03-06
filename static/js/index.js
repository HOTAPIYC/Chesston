const websocket = io();
const board = Chessboard();
const header = Header();

// Local status vars
let game;
let id;

// If move assembly (two consecutive clicks on the
// board) has not been finished, prevent that too many
// parallel threads are started
let lock;

document.addEventListener('click', event => {
  if(event.target.classList.contains('square') && game.turn.id === id && !lock){
    board.setHighlights(game.legal, event.target.id);
    move(event.target.id);
    // Prevent start of next async call before
    // second click has been evaluated
    lock = true;
  }
});

async function move (start) {
  try {
    // Wait for second valid click on board
    const target = await click();
    // Send selection to server
    websocket.emit('game:move', {id: id, move: { from: start, to: target }});
    board.resetHighlights();
    // Release click listener and allow
    // renewal of move call
    lock = false;
  }
  catch {
    // Abort move if no valid target
    // has been selected
    board.resetHighlights();
    // Release click listener and allow
    // renewal of move call
    lock = false;
  }
}

function click () {
  return new Promise((resolve, reject) => {
    document.addEventListener('click', event => {
      if(event.target.classList.contains('highlight')) {
        resolve(event.target.id);
      } else {
        reject();
      }
    });
  });
}

document.querySelector('#start').addEventListener('click', event => {
  websocket.emit('game:start');
});

document.querySelector('#join').addEventListener('click', async event => {
  id = await showInputDialog('Enter the code you recieved to join:');
  websocket.emit('game:join', id);
});

document.querySelector('#flip').addEventListener('click', event => {
  board.flip();
});

document.querySelector('#colors').addEventListener('click', event => {
  board.toggleColor();
});

document.addEventListener('click', event => {
  hideNotification();
})

websocket.on('game:started', async args => {
  game = args;
  id = game.whitePlayer.id;
  await showMsgDialog('Send this code to someone to join:', game.blackPlayer.id);

  initUi();

  window.history.replaceState({}, '', `/${id}`);
});

websocket.on('game:joined', async args => {
  game = args;

  initUi();

  window.history.replaceState({}, '', `/${id}`);

  if (id === game.turn.id) {
    showNotification('It\'s your turn!');
  }
});

websocket.on('game:update', args => {
  game = args;

  updateUi();

  if (id === game.turn.id) {
    showNotification('It\'s your turn!');
  }
});

function initUi () {
  board.update(game);
  header.init(game);
}

// Redraw board and header
function updateUi () {
  board.update(game);
  header.update(game);
}

// Check if a player ID has been saved to the
// url and rejoin game if that's the case
window.addEventListener('load', event => {
  const idUrl = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}/i.exec(window.location.href);

  if(idUrl != null) {
    id = idUrl[0];
    websocket.emit('game:join', id);
  }
});