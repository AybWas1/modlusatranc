const boardEl = document.getElementById("board");
const poolEl = document.getElementById("pool");
const infoEl = document.getElementById("info");

const PIECES = {
  p:{s:"♙",c:1},
  r:{s:"♖",c:5},
  n:{s:"♘",c:3},
  b:{s:"♗",c:3},
  q:{s:"♕",c:9},
  k:{s:"♔",c:0}
};

let board = Array(8).fill().map(()=>Array(8).fill(null));
let turn = "white";
let selected = null;
let moves = [];
let placing = null;
let score = {white:20, black:20};
let lastMove = null;

function draw(){
  boardEl.innerHTML="";
  infoEl.innerHTML = `Sıra: ${turn} | Puan: ${score[turn]}`;

  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      const sq = document.createElement("div");
      sq.className = "square "+((x+y)%2?"dark":"light");

      if(lastMove && lastMove.x===x && lastMove.y===y)
        sq.classList.add("last");

      if(moves.some(m=>m.x===x && m.y===y))
        sq.classList.add("move");

      sq.onclick=()=>clickSquare(x,y);

      const p = board[y][x];
      if(p){
        const sp = document.createElement("span");
        sp.textContent = PIECES[p.t].s;
        sp.className = `piece ${p.c}`;
        if(selected && selected.x===x && selected.y===y)
          sp.classList.add("selected");
        sq.appendChild(sp);
      }

      boardEl.appendChild(sq);
    }
  }
  drawPool();
}

function drawPool(){
  poolEl.innerHTML="<b>Taş Ekle</b>";
  for(const k in PIECES){
    if(k==="k") continue;
    const s=document.createElement("span");
    s.innerHTML=`<div>${PIECES[k].s}</div><small>${PIECES[k].c} puan</small>`;
    if(score[turn]<PIECES[k].c) s.classList.add("disabled");
    if(placing===k) s.classList.add("active");
    s.onclick=()=>{placing=placing===k?null:k;selected=null;moves=[];draw();}
    poolEl.appendChild(s);
  }
}

function clickSquare(x,y){
  if(placing){
    if(!board[y][x]){
      board[y][x]={t:placing,c:turn};
      score[turn]-=PIECES[placing].c;
      placing=null;
      turn=turn==="white"?"black":"white";
    }
    draw(); return;
  }

  const p=board[y][x];
  if(p && p.c===turn){
    selected={x,y};
    moves=getMoves(x,y);
  }else if(selected){
    if(moves.some(m=>m.x===x&&m.y===y)){
      board[y][x]=board[selected.y][selected.x];
      board[selected.y][selected.x]=null;
      lastMove={x,y};
      selected=null;
      moves=[];
      turn=turn==="white"?"black":"white";
    }
  }
  draw();
}

function getMoves(x,y){
  const res=[];
  for(let dx=-1;dx<=1;dx++){
    for(let dy=-1;dy<=1;dy++){
      if(dx||dy){
        const nx=x+dx, ny=y+dy;
        if(nx>=0&&ny>=0&&nx<8&&ny<8){
          const t=board[ny][nx];
          if(!t || t.c!==turn)
            res.push({x:nx,y:ny});
        }
      }
    }
  }
  return res;
}

draw();
