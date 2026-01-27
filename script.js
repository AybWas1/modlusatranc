function drawPool(){
  poolEl.innerHTML = "<b>Taş Ekle</b>";

  for(const k in PIECES){
    if(k === "k") continue;

    const s = document.createElement("span");
    s.innerHTML = `
      <div>${PIECES[k].s}</div>
      <small>${PIECES[k].c} puan</small>
    `;

    if(PIECES[k].c > score[turn])
      s.classList.add("disabled");

    if(placing === k)
      s.classList.add("active");

    s.onclick = () => {
      placing = placing === k ? null : k;
      selected = null;
      moves = [];
      draw();
    };

    poolEl.appendChild(s);
  }
}
