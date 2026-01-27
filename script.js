const COST={P:1,N:3,B:3,R:5,Q:9};

const ICON={
  wP:"♙",wN:"♘",wB:"♗",wR:"♖",wQ:"♕",wK:"♔",
  bP:"♟",bN:"♞",bB:"♝",bR:"♜",bQ:"♛",bK:"♚"
};

let board=Array.from({length:8},()=>Array(8).fill(null));
board[7][0]="wK";
board[0][7]="bK";

let turn="w";
let points={w:0,b:0};
let selected=null;
let addPiece=null;

const boardDiv=document.getElementById("board");
const info=document.getElementById("info");

function draw(){
  boardDiv.innerHTML="";
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const cell=document.createElement("div");
      cell.className="cell "+((r+c)%2?"dark":"light");

      if(selected && selected.r===r && selected.c===c)
        cell.classList.add("selected");

      if(board[r][c]){
        const span=document.createElement("span");
        span.className="piece "+(board[r][c][0]==="w"?"white-piece":"black-piece");
        span.textContent=ICON[board[r][c]];
        cell.appendChild(span);
      }

      cell.onclick=()=>clickCell(r,c);
      boardDiv.appendChild(cell);
    }
  }
  info.textContent=`Sıra: ${turn==="w"?"Beyaz":"Siyah"} | Puan: ${points[turn]}/10`;
}

function clickCell(r,c){
  const piece=board[r][c];

  if(addPiece){
    if(!piece && points[turn]>=COST[addPiece]){
      board[r][c]=turn+addPiece;
      points[turn]-=COST[addPiece];
      addPiece=null;
      turn=opp(turn);
    }
    draw(); return;
  }

  if(selected){
    if(isLegal(selected.r,selected.c,r,c)){
      board[r][c]=board[selected.r][selected.c];
      board[selected.r][selected.c]=null;
      selected=null;
      points[turn]=Math.min(10,points[turn]+1);
      if(isMate(opp(turn))) alert((turn==="w"?"Beyaz":"Siyah")+" kazandı!");
      turn=opp(turn);
    }else selected=null;
    draw(); return;
  }

  if(piece && piece[0]===turn){
    selected={r,c};
    draw();
  }
}

function opp(t){return t==="w"?"b":"w"}

function isLegal(sr,sc,tr,tc){
  const p=board[sr][sc];
  if(!p) return false;
  if(board[tr][tc] && board[tr][tc][0]===p[0]) return false;

  const t=p[1],dr=tr-sr,dc=tc-sc;
  if(t==="K") return Math.max(Math.abs(dr),Math.abs(dc))===1;
  if(t==="R") return (dr===0||dc===0)&&clear(sr,sc,tr,tc);
  if(t==="B") return Math.abs(dr)===Math.abs(dc)&&clear(sr,sc,tr,tc);
  if(t==="Q") return ((dr===0||dc===0)||Math.abs(dr)===Math.abs(dc))&&clear(sr,sc,tr,tc);
  if(t==="N") return Math.abs(dr)*Math.abs(dc)===2;
  if(t==="P"){
    const dir=p[0]==="w"?-1:1;
    if(dc===0 && dr===dir && !board[tr][tc]) return true;
    if(Math.abs(dc)===1 && dr===dir && board[tr][tc]) return true;
  }
  return false;
}

function clear(sr,sc,tr,tc){
  const dr=Math.sign(tr-sr),dc=Math.sign(tc-sc);
  let r=sr+dr,c=sc+dc;
  while(r!==tr||c!==tc){
    if(board[r][c]) return false;
    r+=dr;c+=dc;
  }
  return true;
}

function isMate(t){
  for(let r=0;r<8;r++)
    for(let c=0;c<8;c++)
      if(board[r][c]===t+"K") return false;
  return true;
}

document.querySelectorAll("button").forEach(b=>{
  b.onclick=()=>{addPiece=b.dataset.piece;selected=null};
});

draw();
