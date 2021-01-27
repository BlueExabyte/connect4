/* Config */
const twitchTvHandle = "BlueExabyte";
const PAUSE_DURATION = 30 * 1000; // 30 seconds
const DISPLAY_DURATION = 10 * 1000; // 10 seconds

/* DOM */
const container = document.querySelector(".alerts");
const img = new Image();
const queue = new Queue();

let opponent = null;
let currTurn = 0;
let board = []; 
let mainBoardObj = null;
createBoard();

function createBoard() {
  board = [];

  for (let i = 0; i < 7; i++) {
    let tempCol = [];
    for (let j = 0; j < 6; j++) {
      tempCol.push(0);
    }
    board.push(tempCol);
  }
}

/*
  To-Do:
  - win lose conditions
*/

// Resolve promise after duration
const wait = async duration => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

ComfyJS.Init(twitchTvHandle);
ComfyJS.onCommand = (user, command, message, flags, extra) => {
  console.log(`!${command} was typed in chat`);

  if((user === twitchTvHandle) && (command === "connect4")) {
    mainBoardObj = document.getElementById("mainboard");
    mainBoardObj.innerHTML = "<div class='connect4'><div id='names'></div><div id='board'></div></div>";
    opponent = message;
    updateBoard();
    let titleVersus = document.getElementById("names");
    titleVersus.innerHTML = "<h1>" + twitchTvHandle + " vs. " + opponent + "</h1>";
    currTurn = 0;
  }

  if ((user === twitchTvHandle) && ((command === "reset") || (command === "r"))) {
    createBoard();
    updateBoard();
  }

  if((user === twitchTvHandle) && (command === "c4") && (currTurn === 0)) {
    let location = parseInt(message);
    if(pushOnBoard(location, 1)) {
      currTurn = 1;
    }
  }

  if((user === opponent) && (command === "c4") && (currTurn === 1)) {
    let location = parseInt(message);
    if(pushOnBoard(location, 2)) {
      currTurn = 0;
    }
  }
};

ComfyJS.onChat = (user, message, flags, self, extra) => {
  console.log(user + ":", message);
};

function pushOnBoard(location, color) {
  if((location > 0) && (location < 8)) {
    let tempCol = board[location-1];
    for(let i = 0; i < tempCol.length; i++) {
      if(tempCol[i] === 0) {
        tempCol[i] = color;
        break;
      }
    }  
    let finalResult = chkWinner(convertMatrix(board));
    
    if(finalResult == 1) {
      let titleVersus = document.getElementById("names");
      titleVersus.innerHTML = "<h1>BlueExabyte Won!!</h1>";
      currTurn = -1;

      setTimeout(
        function() {
          let mainBoardObj = document.getElementById("mainboard");
          mainBoardObj.innerHTML = "";
        }, 10000);
    }
    
    if(finalResult == 2) {
      let titleVersus = document.getElementById("names");
      titleVersus.innerHTML = "<h1>" + opponent + " Won!!</h1>";
      currTurn = -1;

      setTimeout(
        function() {
          let mainBoardObj = document.getElementById("mainboard");
          mainBoardObj.innerHTML = "";
        }, 10000);
    }

    updateBoard();

    return true;
  }
  return false;
}

// i is column, j is row
function updateBoard() {
  console.log(board);
  let displayBoard = document.getElementById("board");
  displayBoard.innerHTML = "";
  for (let j = 5; j >= 0; j--) {
    for (let i = 0; i < 7; i++) {
      if(board[i][j] == 0) {
        displayBoard.innerHTML += "<div class=circle id=tempCircle></div>";
      }
      else if(board[i][j] == 1) {
        displayBoard.innerHTML += "<div class=circle id=redCircle></div>";
      }
      else if(board[i][j] == 2) {
        displayBoard.innerHTML += "<div class=circle id=yellowCircle></div>";
      }
    }
    displayBoard.innerHTML += "<br>"
  }
}

function convertMatrix(mat) {
  let tempMat = [];
  tempMat = mat[0].map((_, colIndex) => mat.map(row => row[colIndex]));
  console.log(tempMat);
  return tempMat;
}

function chkLine(a,b,c,d) {
  // Check first cell non-zero and all cells match
  return ((a != 0) && (a ==b) && (a == c) && (a == d));
}

function chkWinner(bd) {
  let r = 0;
  let c = 0;
  // Check down
  for (r = 0; r < 3; r++)
      for (c = 0; c < 7; c++)
          if (chkLine(bd[r][c], bd[r+1][c], bd[r+2][c], bd[r+3][c]))
              return bd[r][c];

  // Check right
  for (r = 0; r < 6; r++)
      for (c = 0; c < 4; c++)
          if (chkLine(bd[r][c], bd[r][c+1], bd[r][c+2], bd[r][c+3]))
              return bd[r][c];

  // Check down-right
  for (r = 0; r < 3; r++)
      for (c = 0; c < 4; c++)
          if (chkLine(bd[r][c], bd[r+1][c+1], bd[r+2][c+2], bd[r+3][c+3]))
              return bd[r][c];

  // Check down-left
  for (r = 3; r < 6; r++)
      for (c = 0; c < 4; c++)
          if (chkLine(bd[r][c], bd[r-1][c+1], bd[r-2][c+2], bd[r-3][c+3]))
              return bd[r][c];

  return 0;
}