const PIECES = {
  p: { s: "♙", c: 1 },
  n: { s: "♘", c: 3 },
  b: { s: "♗", c: 3 },
  r: { s: "♖", c: 5 },
  q: { s: "♕", c: 9 },
  k: { s: "♔", c: 0 }
};

let board = [...Array(8)].map(() => Array(8).fill(null));

// Başlangıç Konumları: Beyaz A1 (0,0), Siyah H8 (7,7)
board[0][0] = { t: "k", c: "w" };
board[7][7] = { t: "k", c: "b" };

let turn = "w";
let score = { w: 0, b: 0 }; // 0 Puanla başlıyor
let selected = null;
let moves = [];
let lastMove = null;
let placing = null;

const boardEl = document.getElementById("board");
const poolEl = document.getElementById("pool");
const turnEl = document.getElementById("turn");
const scoreEl = document.getElementById("score");

function draw() {
  boardEl.innerHTML = "";
  // Satranç koordinat sistemi için y eksenini ters döngüyle kuruyoruz
  for (let y = 7; y >= 0; y--) {
    for (let x = 0; x < 8; x++) {
      const sq = document.createElement("div");
      sq.className = `square ${(x + y) % 2 ? "dark" : "light"}`;
      
      if (lastMove && lastMove.some(p => p[0] === x && p[1] === y)) sq.classList.add("last");

      const p = board[x][y];
      if (p) {
        const sp = document.createElement("div");
        sp.className = `piece ${selected && selected.x === x && selected.y === y ? "selected" : ""}`;
        sp.textContent = PIECES[p.t].s;
        sp.style.color = p.c === "w" ? "white" : "black";
        sq.appendChild(sp);
      }

      // Hareket noktaları veya taş ekleme noktaları (boş kareler)
      if (moves.some(m => m.x === x && m.y === y) || (placing && !p)) {
        const d = document.createElement("div");
        d.className = "dot";
        sq.appendChild(d);
      }

      sq.onclick = () => click(x, y);
      boardEl.appendChild(sq);
    }
  }

  turnEl.innerHTML = `Sıra: <b style="color:${turn==='w'?'#fff':'#00d2ff'}">${turn === "w" ? "BEYAZ" : "SİYAH"}</b>`;
  scoreEl.innerHTML = `Puan<br>Beyaz: ${score.w} | Siyah: ${score.b}`;
  drawPool();
}

function drawPool() {
  poolEl.innerHTML = "<b>Market</b><br>";
  for (const k in PIECES) {
    if (k === "k") continue;
    const s = document.createElement("span");
    s.textContent = PIECES[k].s;

    if (PIECES[k].c > score[turn]) s.classList.add("disabled");
    if (placing === k) s.classList.add("active");

    s.onclick = () => {
      if (PIECES[k].c <= score[turn]) {
        placing = (placing === k) ? null : k;
        selected = null;
        moves = [];
        draw();
      }
    };
    poolEl.appendChild(s);
  }
}

function getMoves(x, y) {
  const res = [];
  const p = board[x][y];
  if (!p) return res;

  const add = (nx, ny) => {
    if (nx < 0 || ny < 0 || nx > 7 || ny > 7) return "stop";
    const target = board[nx][ny];
    
    if (p.t === "k" && kingTooClose(nx, ny, p.c)) return "stop";

    if (!target) {
      res.push({ x: nx, y: ny });
      return "continue";
    } else {
      if (target.c !== p.c) res.push({ x: nx, y: ny });
      return "stop";
    }
  };

  const dirs = {
    n: [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]],
    r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
    q: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
    k: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
  };

  if (p.t === "p") {
    const dir = p.c === "w" ? 1 : -1;
    // İleri hareket (Piyon geri gidemez ve taş yiyemez)
    if (y + dir >= 0 && y + dir < 8 && !board[x][y + dir]) {
        res.push({ x: x, y: y + dir });
    }
    // Çapraz alma
    [[1, dir], [-1, dir]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] && board[nx][ny].c !== p.c) 
        res.push({ x: nx, y: ny });
    });
  } else if (["r", "b", "q"].includes(p.t)) {
    dirs[p.t].forEach(([dx, dy]) => {
      for (let i = 1; i < 8; i++) {
        let status = add(x + dx * i, y + dy * i);
        if (status === "stop") break;
      }
    });
  } else {
    dirs[p.t].forEach(([dx, dy]) => add(x + dx, y + dy));
  }
  return res;
}

function click(x, y) {
  // Taş yerleştirme modu aktifse
  if (placing) {
    if (!board[x][y] && score[turn] >= PIECES[placing].c) {
      board[x][y] = { t: placing, c: turn };
      score[turn] -= PIECES[placing].c;
      placing = null;
      endTurn();
    }
    return;
  }

  const p = board[x][y];
  // Kendi taşını seçme
  if (p && p.c === turn) {
    selected = { x, y };
    moves = getMoves(x, y);
  } 
  // Hedef kareye gitme
  else if (selected && moves.some(m => m.x === x && m.y === y)) {
    board[x][y] = board[selected.x][selected.y];
    board[selected.x][selected.y] = null;
    lastMove = [[selected.x, selected.y], [x, y]];
    
    // Hamle puanı ekle (Maksimum 10)
    score[turn] = Math.min(10, score[turn] + 1);
    
    endTurn();
  } else {
    selected = null;
    moves = [];
  }
  draw();
}

function kingTooClose(nx, ny, color) {
  for (let ix = 0; ix < 8; ix++) {
    for (let iy = 0; iy < 8; iy++) {
      const p = board[ix][iy];
      if (p && p.t === "k" && p.c !== color) {
        if (Math.abs(ix - nx) <= 1 && Math.abs(iy - ny) <= 1) return true;
      }
    }
  }
  return false;
}

function endTurn() {
  selected = null;
  moves = [];
  turn = turn === "w" ? "b" : "w";
  draw();
}

draw();
