const PIECES={
  p:{s:"♙",c:1},
  n:{s:"♘",c:3},
  b:{s:"♗",c:3},
  r:{s:"♖",c:5},
  q:{s:"♕",c:9},
  k:{s:"♔",c:0}
};

let board=[...Array(8)].map(()=>Array(8).fill(null));
board[0][0]={t:"k",c:"w"};
board[7][7]={t:"k",c:"b"};

let turn="w";
let score={w:0,b:0};
let selected=null;
let moves=[];
let lastMove=null;
let placing=null;

const boardEl=document.getElementById("board");
const poolEl=document.getElementById("pool");
const turnEl=document.getElementById("turn");
const scoreEl=document.getElementById("score");

function draw(){
  boardEl.innerHTML="";
  for(let y=7;y>=0;y--){
    for(let x=0;x<8;x++){
      const sq=document.createElement("div");
      sq.className="square "+((x+y)%2?"dark":"light");

      if(lastMove && lastMove.some(p=>p[0]==x&&p[1]==y))
        sq.classList.add("last");

      const p=board[x][y];
      if(p){
        const sp=document.createElement("span");
        sp.textContent=PIECES[p.t].s;
        sp.className="piece"+(selected&&selected.x==x&&selected.y==y?" selected":"");
        sp.style.color=p.c==="w"?"white":"black";
        sq.appendChild(sp);
      }

      if(moves.some(m=>m.x===x&&m.y===y)){
        const d=document.createElement("div");
        d.className="dot";
        sq.appendChild(d);
      }

      sq.onclick=()=>click(x,y);
      boardEl.appendChild(sq);
    }
  }

  turnEl.textContent="Sıra: "+(turn==="w"?"Beyaz":"Siyah");
  scoreEl.textContent=`Puan: ${score.w} / ${score.b}`;
  drawPool();
}

function drawPool(){
  poolEl.innerHTML="Taş Ekle<br>";
  for(const k in PIECES){
    if(k==="k")continue;
    const s=document.createElement("span");
    s.textContent=PIECES[k].s;
    if(PIECES[k].c>score[turn]) s.classList.add("disabled");
    s.onclick=()=>placing=k;
    poolEl.appendChild(s);
  }
}

function click(x,y){
  if(placing){
    if(!board[x][y] && score[turn]>=PIECES[placing].c){
      board[x][y]={t:placing,c:turn};
      score[turn]-=PIECES[placing].c;
      placing=null;
      endTurn();
    }
    return;
  }

  const p=board[x][y];
  if(p && p.c===turn){
    selected={x,y};
    moves=getMoves(x,y);
  }else if(selected && moves.some(m=>m.x===x&&m.y===y)){
    board[x][y]=board[selected.x][selected.y];
    board[selected.x][selected.y]=null;
    lastMove=[[selected.x,selected.y],[x,y]];
    score[turn]=Math.min(10,score[turn]+1);
    endTurn();
  }
  draw();
}

function endTurn(){
  selected=null;
  moves=[];
  turn=turn==="w"?"b":"w";
}

function getMoves(x,y){
  const res=[];
  const p=board[x][y];
  if(!p)return res;

  const add=(nx,ny)=>{
    if(nx<0||ny<0||nx>7||ny>7)return;
    if(!board[nx][ny]||board[nx][ny].c!==p.c)
      res.push({x:nx,y:ny});
  };

  if(p.t==="k"){
    for(let dx=-1;dx<=1;dx++)
      for(let dy=-1;dy<=1;dy++)
        if(dx||dy)add(x+dx,y+dy);
  }

  if(p.t==="p"){
    const dir=p.c==="w"?1:-1;
    add(x,y+dir);
  }

  return res;
}

draw();
