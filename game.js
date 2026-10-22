
(()=>{
const canvas=document.getElementById('c'),ctx=canvas.getContext('2d'),game=document.getElementById('game');
const ASSETS={"crate":"assets/img/crate.png","city":"assets/img/city.jpg","sets":{"autoR":{"w":93,"h":120,"frames":["assets/img/autoR_0.png","assets/img/autoR_1.png","assets/img/autoR_2.png","assets/img/autoR_3.png","assets/img/autoR_4.png","assets/img/autoR_5.png","assets/img/autoR_6.png"]},"autoL":{"w":90,"h":121,"frames":["assets/img/autoL_0.png","assets/img/autoL_1.png","assets/img/autoL_2.png","assets/img/autoL_3.png","assets/img/autoL_4.png","assets/img/autoL_5.png","assets/img/autoL_6.png"]},"rotRL":{"w":74,"h":114,"frames":["assets/img/rotRL_0.png","assets/img/rotRL_1.png","assets/img/rotRL_2.png","assets/img/rotRL_3.png","assets/img/rotRL_4.png","assets/img/rotRL_5.png","assets/img/rotRL_6.png","assets/img/rotRL_7.png"]},"rotLR":{"w":69,"h":114,"frames":["assets/img/rotLR_0.png","assets/img/rotLR_1.png","assets/img/rotLR_2.png","assets/img/rotLR_3.png","assets/img/rotLR_4.png","assets/img/rotLR_5.png","assets/img/rotLR_6.png","assets/img/rotLR_7.png"]},"vert":{"w":100,"h":132,"frames":["assets/img/vert_0.png","assets/img/vert_1.png","assets/img/vert_2.png","assets/img/vert_3.png","assets/img/vert_4.png","assets/img/vert_5.png","assets/img/vert_6.png","assets/img/vert_7.png","assets/img/vert_8.png","assets/img/vert_9.png"]}}};
const load=src=>{const i=new Image();i.src=src;return i};
const SPD={"d_idle2": "assets/img/d_idle2.webp", "d_fly1": "assets/img/d_fly1.webp", "d_prep": "assets/img/d_prep.webp", "d_shoot": "assets/img/d_shoot.webp", "d_dmg1": "assets/img/d_dmg1.webp", "d_dmg2": "assets/img/d_dmg2.webp", "d_des1": "assets/img/d_des1.webp", "d_des2": "assets/img/d_des2.webp", "d_deb": "assets/img/d_deb.webp", "m_fly": "assets/img/m_fly.webp", "i_chk": "assets/img/i_chk.webp", "i_jet": "assets/img/i_jet.webp", "i_mis": "assets/img/i_mis.webp"};
const SP={};for(const k in SPD)SP[k]=load(SPD[k]);
document.querySelectorAll('[data-i]').forEach(e=>e.src=SPD[e.dataset.i]);
let drones=[],missiles=[],invT=0,jetCD=0,peak=0,nextDrone=400,lastShop={wy:0},hk='';
const JCD=8,$=id=>document.getElementById(id);
function refreshHUD(){const k=[TOT.jet,TOT.mis,revive].join();$('bJet').style.setProperty('--p',(jetCD>0?jetCD/JCD*100:0)+'%');if(k===hk)return;hk=k;$('bJet').style.display=TOT.jet?'block':'none';$('bMis').style.display=(TOT.mis||0)>0?'block':'none';$('mc').textContent=TOT.mis||0;$('cpi').style.display=revive?'block':'none'}
function useJet(){if(!TOT.jet||jetCD>0||!started||paused)return;boostT=Math.max(boostT,.55);jetCD=JCD;sfx('spring');burst(player.x+19,player.y+player.h,'#ff9d2e',10)}
function nearest(x,y){let b=null,bd=1e9;for(const d of drones){if(d.st==='dying'||d.y<-10||d.y>H)continue;const q=Math.hypot(d.x-x,d.y-y);if(q<bd){bd=q;b=d}}return b}
function fireMissile(){if(!started||paused||(TOT.mis||0)<=0)return;const t=nearest(player.x+19,player.y);if(!t){showToast('SEM ALVO');return}TOT.mis--;saveG();missiles.push({x:player.x+19,y:player.y,vx:0,vy:-300,t,life:3});sfx('spring')}
for(const [id,fn] of [['bJet',useJet],['bMis',fireMissile]])$(id).addEventListener('pointerdown',e=>{e.preventDefault();fn()});
addEventListener('keydown',e=>{if(e.key==='j'||e.key==='J')useJet();if(e.key==='m'||e.key==='M'||e.key===' ')fireMissile()});
// drone: 1 a cada ~1000 andares (primeiro em 400)
function maybeDrone(p){if(score<nextDrone||p.type!=='normal'||evt)return;nextDrone=score+1000;const cx=p.x+p.w/2,bx=Math.max(45,Math.min(W-45,cx<W/2?cx+105:cx-105));drones.push({x:bx,bx,y:p.y-70,rg:Math.max(10,Math.min(40,bx-20,W-bx-20)),ph:Math.random()*6,st:'fly',t:0,cd:2+Math.random()*2,dir:1})}
function killDrone(d){d.st='dying';d.t=0;TOT.coins=(TOT.coins||0)+10;updCoins();saveG();burst(d.x,d.y,'#ff9d2e',18);sfx('boom');showToast('DRONE! +10 🪙')}
function hurt(){if(invT>0)return;invT=1.3;if(shield){shield=false;sfx('shield');showToast('ESCUDO USADO');burst(player.x+19,player.y+27,'#78dcff',14)}else{player.vy=Math.max(player.vy,420);sfx('break');showToast('DANO!');burst(player.x+19,player.y+27,'#ff4a4a',12)}}
function reviveAt(){revive=false;cam=Math.max(0,H*.6-lastShop.wy);const py=lastShop.wy+cam;platforms=[makePlatform(W/2-48,py,96)];drones=[];missiles=[];items=[];lastP=null;combo=0;genCount=14;score=Math.floor(cam/10)+bonus;nextKiosk=score+500;lavaY=H+160;player.x=W/2-19;player.y=py-player.h-4;player.vy=-708;player.rot=null;invT=1.5;boostT=0;sfx('shield');showToast('CHECKPOINT!');burst(W/2,py,'#78dcff',20)}
function updateExtras(dt){const px=player.x+player.w/2,py=player.y+player.h/2,ob=player.y+player.h-player.vy*dt;
 for(const d of drones){d.t+=dt;if(d.st==='dying'){if(d.t>.9)d.dead=true;continue}
  d.ph+=dt;d.x=d.bx+Math.sin(d.ph*1.2)*d.rg;if(d.y>0&&d.y<H*.8)d.cd-=dt;
  if(d.st==='fly'&&d.cd<=0){d.st='prep';d.t=0;d.dir=px<d.x?-1:1}
  else if(d.st==='prep'&&d.t>.6){d.st='shoot';d.t=0;sfx('laser')}
  else if(d.st==='shoot'){if(Math.abs(py-d.y)<24&&(px-d.x)*d.dir>0&&Math.abs(px-d.x)<150)hurt();if(d.t>.3){d.st='fly';d.cd=3+Math.random()*2}}
  if(Math.abs(px-d.x)<30&&Math.abs(py-d.y)<36){if(player.vy>0&&ob<=d.y-6){killDrone(d);player.vy=-640;player.rot=null}else hurt()}}
 for(const m of missiles){m.life-=dt;if(!m.t||m.t.st==='dying'||m.t.dead)m.t=nearest(m.x,m.y);
  if(m.t){const dx=m.t.x-m.x,dy=m.t.y-m.y,l=Math.hypot(dx,dy)||1,k=Math.min(1,7*dt);m.vx+=(dx/l*520-m.vx)*k;m.vy+=(dy/l*520-m.vy)*k;if(l<26){killDrone(m.t);m.life=0;burst(m.x,m.y,'#ffb347',14)}}
  m.x+=m.vx*dt;m.y+=m.vy*dt;if(Math.random()<.7)burst(m.x,m.y,'#ffcf6a',1)}
 missiles=missiles.filter(m=>m.life>0&&m.y>-60);drones=drones.filter(d=>!d.dead&&d.y<H+70);refreshHUD()}
function drawExtras(){for(const d of drones){const s=d.st;let f,z=58;
  if(s==='dying'){f=d.t<.12?'d_dmg1':d.t<.24?'d_dmg2':d.t<.42?'d_des1':d.t<.62?'d_des2':'d_deb';z=(f==='d_des1'||f==='d_des2')?80:62}
  else f=s==='prep'?'d_prep':s==='shoot'?'d_shoot':Math.floor(anim*5)%2?'d_idle2':'d_fly1';
  if(s==='shoot'){const bx=d.dir>0?d.x:d.x-150;ctx.fillStyle='rgba(255,40,40,.85)';ctx.fillRect(bx,d.y-3,150,6);ctx.fillStyle='#ffe6e6';ctx.fillRect(bx,d.y-1,150,2)}
  const im=SP[f];if(im&&im.complete)ctx.drawImage(im,d.x-z/2,d.y-z/2+(s==='dying'?0:Math.sin(anim*4+d.ph)*3),z,z*1.05)}
 for(const m of missiles){const im=SP.m_fly;if(im&&im.complete){ctx.save();ctx.translate(m.x,m.y);ctx.rotate(Math.atan2(m.vy,m.vx)+.75);ctx.drawImage(im,-24,-22,48,44);ctx.restore()}}}
const BGD={"bg0": "assets/bg/bg0.webp", "bg1": "assets/bg/bg1.webp", "bg2": "assets/bg/bg2.webp", "bg3": "assets/bg/bg3.webp", "bg4": "assets/bg/bg4.webp", "bg5": "assets/bg/bg5.webp", "bg6": "assets/bg/bg6.webp"};const BG=[0,1,2,3,4,5,6].map(i=>load(BGD["bg"+i]));
const crateImg=load(ASSETS.crate),cityImg=load(ASSETS.city);
// parallax em camadas: fundo distante (.14) · props do meio (.55) · colunas do primeiro plano (1.15)
const FGL=load('assets/img/fg_l.webp'),FGR=load('assets/img/fg_r.webp');let midOff=0,fgOff=0,curSec=-1,storyOpen=false,openStory=()=>{};
const BEATS=[
 {id:'drone',at:()=>score>=430,slides:[{i:'assets/img/d_drone.jpg',t:'De repente, <b>drones de patrulha</b> surgem entre os andares. Parecem proteger certas áreas e impedir que entregadores cheguem mais alto. Pule em cima deles ou use mísseis.'}]},
 {id:'memory',at:()=>(TOT.stars||0)>=10,slides:[{i:'assets/img/d_vision.jpg',t:'Ao juntar as estrelas, o cordão reage. Por um instante, Caio vê a silhueta de um entregador com uma mochila igual à dele. <b>Alguém já esteve aqui antes.</b> Deve ser o R. do bilhete.'}]},
 {id:'cloud',at:()=>score>=1000,slides:[{i:'assets/img/d_cloud.jpg',t:'Acima das nuvens, a fumaça some e o céu aparece. A cidade lá embaixo parece pequena. Se existe um céu limpo, a lenda do sol pode ser verdade.'}]},
 {id:'top',at:()=>score>=2500,slides:[
  {i:'assets/img/t_sun.jpg',t:'Depois de enfrentar andares, drones e obstáculos, Caio chega à <b>cobertura sem número</b>. Pela primeira vez na vida, ele vê o sol. Ele existe.'},
  {i:'assets/img/t_ai.jpg',t:'Uma inteligência artificial do Projeto Ascensão surge e o cumprimenta: <b>Caio é a Unidade 07</b>, o primeiro a chegar até ali.'},
  {i:'assets/img/t_rec.jpg',t:'As Unidades 01 a 06 falharam. O Projeto Ascensão era um teste: as estrelas guardam as memórias da antiga Cidade de Baixo, e a encomenda trazia o último fragmento. Alguém apagou a história da cidade.'},
  {i:'assets/img/t_portal.jpg',choice:true,t:'Um portal se abre e mostra outras cidades além das nuvens. Caio tem uma escolha: levar os registros à Central e encerrar a missão, ou explorar as outras cidades e descobrir quem apagou o passado.'}]}];
function storyCheck(){if(storyOpen)return;const st=TOT.ST||{};for(const b of BEATS)if(!st[b.id]&&b.at()){openStory(b);break}}
const PR=(()=>{const r=[];let s=7;const q=()=>(s=s*16807%2147483647)/2147483647;
 for(let i=0;i<16;i++)r.push({k:'l',x:q(),y:q(),ph:q()*6,sp:1.5+q()*2.5,c:q()<.6?'255,74,74':'255,179,71'});
 for(let i=0;i<3;i++)r.push({k:'v',x:q(),y:q(),sp:(14+q()*18)*(q()<.5?-1:1)});return r})();
function drawFar(){const P=Math.max(900,H+120);
 for(const p of PR){const y=(p.y*P+midOff)%P;if(y>H+30)continue;
  if(p.k==='l'){const a=.25+.6*(.5+.5*Math.sin(anim*p.sp+p.ph)),x=p.x*W;ctx.fillStyle='rgba('+p.c+','+a*.22+')';ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill();ctx.fillStyle='rgba('+p.c+','+a+')';ctx.beginPath();ctx.arc(x,y,2.2,0,7);ctx.fill()}
  else{const L=W+80,x=((p.x*L+anim*p.sp)%L+L)%L-40,d=Math.sign(p.sp);ctx.fillStyle='rgba(8,14,30,.75)';ctx.fillRect(x-9,y-2.5,18,5);ctx.fillStyle='rgba(255,200,110,.9)';ctx.fillRect(x+d*8-1,y-1,2,2);ctx.fillStyle='rgba(255,200,110,.18)';ctx.fillRect(x-d*26,y-.5,d*28<0?28:28,1)}}}
function drawFG(){const fw=46;for(const [im,x] of [[FGL,-12],[FGR,W-fw+12]]){if(!(im.complete&&im.naturalWidth))continue;const sc=(fw+12)/im.naturalWidth,Ht=im.naturalHeight*sc;ctx.globalAlpha=.92;for(let y=Math.floor(fgOff%Ht)-Ht;y<H;y+=Ht)ctx.drawImage(im,x,y,fw+12,Ht);ctx.globalAlpha=1}}
function sectorToast(){if(!started)return;const sec=score>=1000?2:score>=450?1:0;if(sec!==curSec){curSec=sec;if(!paused)showToast(['BASE ESQUECIDA','EIXO DE MANUTENÇÃO','FRONTEIRA DAS NUVENS'][sec])}}
const SETS={};for(const k in ASSETS.sets){const s=ASSETS.sets[k];SETS[k]={w:s.w,h:s.h,f:s.frames.map(load)}}
const SPR_SCALE=.56;               // escala de desenho (os frames são guardados a 0.8x do original)
const ROT_DUR=.28;let combo=0,parts=[],items=[],shield=false,boostT=0,bonus=0,genCount=14,lastLanes=[],toast='',toastT=0;                 // duração da rotação no ar (s)
let lastP=null,W=360,H=640,dpr=1,player,platforms=[],cam=0,started=false,dead=false,last=0,elapsed=0,bgOffset=0,score=0,best=+(localStorage.getItem('sa_climb_best_v2')||0),keys={left:false,right:false},anim=0,lastTouchX=null;
const heightEl=document.getElementById('height'),bestEl=document.getElementById('best'),overlay=document.getElementById('overlay');
bestEl.textContent=best*4;
let AC=null,muted=localStorage.getItem('sa_mute')==='1',evt=null,nextEvt=1200,evtN=0;
let paused=false,lavaY=9999,R={stars:0,combo:0,shield:0,boost:0,evt:0},TOT={},GOT={},MS=null,tq=[],tbusy=false,revive=false,shopOpen=false,nextKiosk=500,saveT=0;
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
function saveG(){try{localStorage.setItem('sa_g',JSON.stringify({GOT,TOT,MS}))}catch(e){}}
const TR=[['h100','Primeiros passos','Chegue a 400 metros',()=>score>=100],['h500','Alpinista','Chegue a 2.000 metros',()=>score>=500],['h1000','Acima das nuvens','Chegue a 4.000 metros',()=>score>=1000],['h2500','Unidade 07','Chegue à cobertura, a 10.000 metros',()=>score>=2500],
['p10k','Dez mil pontos','Some 10.000 pontos em todas as partidas',()=>(TOT.points||0)+score>=1e4],['s15','Caçador de memórias','Junte 15 ⭐ numa partida',()=>R.stars>=15],['s100','A cidade lembra','Junte 100 ⭐ de memória no total',()=>(TOT.stars||0)>=100],
['c5','Pés no centro','Faça 5 pousos perfeitos seguidos',()=>R.combo>=5],['c10','Mira de mestre','Faça 10 pousos perfeitos seguidos',()=>R.combo>=10],['sh','Anjo da guarda','Salve-se de uma queda com o escudo',()=>R.shield>0],
['ev','Fora da rotina','Complete uma zona especial',()=>R.evt>0],['t120','Sem pressa... quase','Sobreviva 2 minutos numa partida',()=>elapsed>=120],['ms10','Dedicado','Complete 10 missões',()=>(TOT.missions||0)>=10]];
const MP=[['Junte 6 ⭐ numa partida',()=>R.stars>=6],['Alcance 1.600 metros',()=>score>=400],['Alcance 3.200 metros',()=>score>=800],['Faça 4 pousos perfeitos seguidos',()=>R.combo>=4],['Use o escudo uma vez',()=>R.shield>0],['Pegue 2 impulsos 🚀',()=>R.boost>=2],['Sobreviva 60 segundos',()=>elapsed>=60],['Complete uma zona especial',()=>R.evt>0]];
function loadG(){const g=LS('sa_g',{});GOT=g.GOT||{};TOT=g.TOT||{};MS=g.MS;const day=Math.floor(Date.now()/864e5);if(!MS||MS.day!==day)MS={day,ids:[day%8,(day+3)%8,(day+6)%8],done:[0,0,0]};saveG()}
function popT(){if(tbusy||!tq.length)return;tbusy=true;const b=document.getElementById('tbanner');b.textContent=tq.shift();b.className='show';sfx('item');setTimeout(()=>{b.className='';setTimeout(()=>{tbusy=false;popT()},300)},2300)}
function checkGoals(){for(const t of TR)if(!GOT[t[0]]&&t[3]()){GOT[t[0]]=1;tq.push('🏆 '+t[1]);saveG()}
 MS.ids.forEach((id,i)=>{if(!MS.done[i]&&MP[id][1]()){MS.done[i]=1;TOT.missions=(TOT.missions||0)+1;tq.push('✅ Missão: '+MP[id][0]);saveG()}});popT()}
function renderMissions(){document.getElementById('missions').innerHTML='<b>Missões de hoje</b><br>'+MS.ids.map((id,i)=>(MS.done[i]?'✅ ':'⬜ ')+MP[id][0]).join('<br>')}
function renderTro(){const n=TR.filter(t=>GOT[t[0]]).length;document.getElementById('tlist').innerHTML='<div class="th">'+n+' / '+TR.length+' troféus</div>'+TR.map(t=>'<div class="ti'+(GOT[t[0]]?' ok':'')+'"><span>'+(GOT[t[0]]?'🏆':'🔒')+'</span><div><b>'+t[1]+'</b><small>'+t[2]+'</small></div></div>').join('')}
function lavaStep(dt){lavaY-=(16+Math.min(40,score/60))*dt;if(!R.warn&&lavaY<H-4){R.warn=1;showToast('A NOITE ESTÁ SUBINDO!')}}
function drawLava(){if(lavaY>H){const k=Math.max(0,1-(lavaY-H)/120);if(k>0){ctx.fillStyle='rgba(255,90,40,'+(.35*k)+')';ctx.fillRect(0,H-10,W,10)}return}
 ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W;x+=12)ctx.lineTo(x,lavaY+Math.sin(x*.05+anim*3)*5);ctx.lineTo(W,H);ctx.closePath();
 const g=ctx.createLinearGradient(0,lavaY-10,0,H);g.addColorStop(0,'rgba(255,90,40,.85)');g.addColorStop(.12,'rgba(70,10,50,.92)');g.addColorStop(1,'rgba(8,4,20,.97)');ctx.fillStyle=g;ctx.fill()}
function updCoins(){const e=document.getElementById('coins');if(e)e.textContent=TOT.coins||0;const m=document.getElementById('mcoins');if(m)m.textContent=TOT.coins||0}
function refreshCont(){let h=false;try{h=!!localStorage.getItem('sa_save')}catch(e){}document.getElementById('cont').style.display=h?'':'none'}
function saveRun(){if(!started||dead)return;try{localStorage.setItem('sa_save',JSON.stringify({W,H,player,platforms,items,cam,bgOffset,score,bonus,combo,shield,boostT,genCount,lastLanes,lavaY,R,evt,nextEvt,evtN,elapsed,revive,nextKiosk,lastShop,nextDrone,peak}));saveG()}catch(e){}}
function loadRun(){const d=LS('sa_save',null);if(!d)return false;const fx=W/d.W,fy=H/d.H;
 player=d.player;player.x*=fx;player.y*=fy;player.rot=null;platforms=d.platforms.map(q=>({...q,x:q.x*fx,y:q.y*fy,w:q.w*fx}));items=d.items.map(q=>({...q,x:q.x*fx,y:q.y*fy}));
 cam=d.cam;bgOffset=d.bgOffset;score=d.score;bonus=d.bonus;combo=d.combo;shield=d.shield;boostT=d.boostT;genCount=d.genCount;lastLanes=d.lastLanes;lavaY=d.lavaY*fy;R=d.R;evt=d.evt;nextEvt=d.nextEvt;evtN=d.evtN;elapsed=d.elapsed;revive=d.revive;nextKiosk=d.nextKiosk;lastShop={wy:d.lastShop?d.lastShop.wy*fy:H-105};nextDrone=d.nextDrone||score+1000;peak=d.peak||d.score;drones=[];missiles=[];invT=0;jetCD=0;
 parts=[];lastP=null;toastT=0;curSec=-1;started=true;dead=false;paused=true;shopOpen=false;keys.left=keys.right=false;overlay.style.display='none';document.getElementById('pause').textContent='▶';heightEl.textContent=score*4;return true}
function maybeKiosk(p){if(score>=nextKiosk&&p.type==='normal'&&!evt){const c=p.x+p.w/2;p.type='shop';p.w=84;p.x=Math.max(8,Math.min(W-92,c-42));nextKiosk=score+500}}
function drawKiosk(p){const x=p.x+p.w/2,y=p.y-4;ctx.fillStyle='#5a3a1e';ctx.fillRect(x-30,y-38,4,38);ctx.fillRect(x+26,y-38,4,38);
 for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#fff':'#e8452c';ctx.fillRect(x-33+i*11,y-50,11,14)}
 ctx.fillStyle=p.used?'#777':'#ffd45a';ctx.fillRect(x-22,y-30,44,12);ctx.fillStyle='#2a1600';ctx.font='900 9px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('CARGA',x,y-24)}
const SH=[['🛡️','Escudo','Salva de uma queda',20,()=>{if(shield)return 0;shield=true;return 1}],['🚀','Impulso','Dispara um impulso agora',25,()=>{boostT=1.6;return 1}],['🌙','Afastar a noite','Empurra a noite para baixo',30,()=>{lavaY+=260;return 1}],['🚩','Checkpoint','Se cair, renasce na loja mais próxima. Uso único.',40,()=>{if(revive)return 0;revive=true;return 1}],['i_jet','Jato','Botão de impulso quando quiser. Compra única.',80,()=>{if(TOT.jet)return 0;TOT.jet=1;return 1}],['i_mis','Míssil x3','Teleguiado: persegue o drone mais próximo.',50,()=>{TOT.mis=(TOT.mis||0)+3;return 1}]];
function renderShop(msg){document.getElementById('scoins').textContent=TOT.coins||0;document.getElementById('slist').innerHTML=SH.map((t,i)=>'<div class="shi"><span style="font-size:24px">'+(t[0].slice(0,2)==='i_'?'<img src="'+SPD[t[0]]+'" style="width:30px;height:30px;border-radius:50%">':t[0])+'</span><div><b>'+t[1]+'</b><small>'+t[2]+'</small></div><button data-i="'+i+'"'+((TOT.coins||0)<t[3]?' disabled':'')+'>🪙 '+t[3]+'</button></div>').join('')+(msg?'<div class="th" style="margin-top:6px">'+msg+'</div>':'')}
function openShop(){shopOpen=true;paused=true;renderShop();document.getElementById('shop').style.display='flex';saveRun()}
function tone(f0,f1,d,ty='square',v=.06,dl=0){const t=AC.currentTime+dl,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02)}
function sfx(k){if(muted)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
 if(k==='jump')tone(330,560,.09,'square',.04);else if(k==='spring')tone(260,900,.22,'square',.06);else if(k==='item'){tone(780,1170,.08,'triangle',.08);tone(1170,1560,.1,'triangle',.08,.07)}else if(k==='break')tone(180,50,.18,'sawtooth',.07);else if(k==='shield')tone(500,200,.25,'triangle',.09);else if(k==='combo')tone(900,1400,.12,'triangle',.07);else if(k==='fall')tone(400,60,.6,'sawtooth',.08);else if(k==='boom'){tone(140,30,.4,'sawtooth',.12);tone(500,80,.25,'square',.05)}else if(k==='laser')tone(900,300,.2,'sawtooth',.04)}catch(e){}}
const muteEl=document.getElementById('mute');muteEl.textContent=muted?'🔇':'🔊';
muteEl.onclick=()=>{muted=!muted;localStorage.setItem('sa_mute',muted?'1':'0');muteEl.textContent=muted?'🔇':'🔊';{const ms=document.getElementById('msound');if(ms)ms.style.opacity=muted?.45:1}sfx('item')};
function wrapX(){if(player.x<-player.w)player.x=W;else if(player.x>W)player.x=-player.w}
function applyEvt(p){if(!evt&&score>=nextEvt){evt={k:evtN++%2?'stars':'narrow',n:7};showToast(evt.k==='stars'?'⭐ CHUVA DE ESTRELAS!':'ZONA ESTREITA!')}
 if(!evt)return;if(evt.k==='narrow'){if(p.type==='fragile'||p.type==='moving')p.type='normal';const nw=44;p.x+=(p.w-nw)/2;p.w=nw}else items.push({x:p.x+p.w/2+(Math.random()-.5)*20,y:p.y-34,k:'star',ph:Math.random()*6});
 if(--evt.n<=0){evt=null;R.evt++;nextEvt=score+1300}}
// fundo sem espelhamento: tile contínuo com costura em fade (a base se mistura com o topo)
let _bt=null,_btK='';
const _bts={};
function bgTile(i){const img=BG[i];if(!(img.complete&&img.naturalWidth))return null;const key=W+'x'+H,c0=_bts[i];if(c0&&c0.k===key)return c0.t;
 const nw=img.naturalWidth,nh=img.naturalHeight,sc=Math.max(W/nw,H*1.2/nh),iw=Math.ceil(nw*sc),ih=Math.ceil(nh*sc),o=Math.round(ih*.3),P=ih-o;
 const t=document.createElement('canvas');t.width=iw;t.height=P;const c=t.getContext('2d');
 c.drawImage(img,0,0,iw,ih);
 c.drawImage(img,0,P/sc,nw,o/sc,0,0,iw,o);
 const m=document.createElement('canvas');m.width=iw;m.height=o;const mc=m.getContext('2d');
 mc.drawImage(img,0,0,nw,o/sc,0,0,iw,o);
 mc.globalCompositeOperation='destination-in';const g=mc.createLinearGradient(0,0,0,o);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');mc.fillStyle=g;mc.fillRect(0,0,iw,o);
 c.drawImage(m,0,0);_bts[i]={k:key,t};return t}
// cenário muda com a altura (em andares): viela > transição > industrial > transição > obras > transição > telhados
const BGT=[0,200,450,700,1000,1300,1600];
function drawBG(){let i=0;while(i<6&&score>=BGT[i+1])i++;const F=60,lay=[[i,1]];if(i<6&&score>BGT[i+1]-F)lay.push([i+1,(score-(BGT[i+1]-F))/F]);let ret=null;
 for(const [k,al] of lay){const tl=bgTile(k);if(!tl)continue;ret=tl;const P=tl.height,ix=Math.round((W-tl.width)/2);ctx.globalAlpha=al;for(let y=Math.floor(bgOffset%P)-P;y<H;y+=P)ctx.drawImage(tl,ix,y)}
 ctx.globalAlpha=1;return ret}
function resize(){const r=game.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingQuality='high';if(player)player.x=Math.max(0,Math.min(W-player.w,player.x))}
new ResizeObserver(resize).observe(game);resize();
function makePlatform(x,y,w=78,type='normal',dir=1){
  return{x,y,w,h:23,type,dir,phase:Math.random()*Math.PI*2,broken:false};
}
function burst(x,y,c,n){for(let i=0;i<n&&parts.length<90;i++)parts.push({x,y,vx:(Math.random()-.5)*200,vy:-Math.random()*220,l:.5+Math.random()*.4,c})}
function landed(p){if(p.type==='shop'&&!p.used){p.used=true;lastShop={wy:p.y-cam};openShop()}sfx(p.type==='spring'?'spring':p.type==='fragile'?'break':'jump');player.carry=p.type==='moving'?p.dir*(34+Math.min(55,score/20)):0;if(p===lastP){burst(player.x+player.w/2,p.y,'#e8d9a8',4);return}lastP=p;const off=Math.abs(player.x+player.w/2-(p.x+p.w/2));
 if(p.type!=='fragile'&&off<p.w*.22){combo++;R.combo=Math.max(R.combo,combo);if(combo>=3){const b=Math.min(combo,10)*5;bonus+=b;score+=b;showToast('PERFEITO x'+combo+' +'+b*4+' m');sfx('combo')}}else combo=0;
 burst(player.x+player.w/2,p.y,'#e8d9a8',4)}
function gapY(){const d=Math.min(1,score/2500);return 60+Math.random()*(26+d*22)+d*30}
function showToast(t){toast=t;toastT=1.1}
function spawnItem(p){if(p.type==='moving'||genCount<18)return;const r=Math.random();if(r>.16)return;const k=r<.09?'star':r<.13?(shield?'star':'shield'):'boost';items.push({x:p.x+p.w/2,y:p.y-34,k,ph:Math.random()*6})}
function nextPlatform(prev,y,index){
  const d=Math.min(1,score/2500);
  const minW=Math.max(44,62-d*18),maxW=Math.max(58,84-d*26);
  const w=minW+Math.random()*(maxW-minW);
  const pc=prev?prev.x+prev.w/2:W/2;
  // Três faixas (esquerda, centro, direita) com pesos que favorecem a menos usada nas últimas plataformas.
  const cnt=[0,0,0];for(const l of lastLanes)cnt[l]++;
  const wt=cnt.map(c=>1/(1+2*c));let r=Math.random()*(wt[0]+wt[1]+wt[2]),lane=0;
  while(lane<2&&r>wt[lane]){r-=wt[lane];lane++}
  const target=W*(.17+.33*lane)+(Math.random()-.5)*W*.14;
  const reach=Math.min(150,118+d*24); // alcance lateral seguro (o salto alcança ~240px)
  const c=Math.max(pc-reach,Math.min(pc+reach,target));
  const x=Math.max(8,Math.min(W-w-8,c-w/2));
  const mid=x+w/2,al=mid<W/3?0:mid<2*W/3?1:2;lastLanes.push(al);if(lastLanes.length>5)lastLanes.shift();
  const sp=.09,fr=.10+.20*d,mv=.10+.20*d,q=Math.random();let type='normal';
  if(index>3&&q<sp)type='spring';
  else if(index>5&&q<sp+fr)type='fragile';
  else if(index>8&&q<sp+fr+mv)type='moving';
  if(prev&&prev.type!=='normal'&&prev.type!=='spring'&&(type==='fragile'||type==='moving'))type='normal';
  return makePlatform(x,y,w,type,Math.random()<.5?-1:1);
}
function reset(){drones=[];missiles=[];invT=0;jetCD=0;peak=0;nextDrone=400;lastShop={wy:H-105};combo=0;lastP=null;evt=null;nextEvt=1200;evtN=0;paused=false;revive=false;shopOpen=false;nextKiosk=500;lavaY=H+130;R={stars:0,combo:0,shield:0,boost:0,evt:0};{const pb=document.getElementById('pause');if(pb)pb.textContent='⏸'}parts=[];items=[];shield=false;boostT=0;bonus=0;genCount=14;lastLanes=[];toast='';toastT=0;player={x:W/2-19,y:H-180,vx:0,vy:-80,w:38,h:54,face:1,land:0,moveT:0,rot:null};cam=0;elapsed=0;score=0;bgOffset=0;midOff=0;fgOff=0;curSec=-1;platforms=[makePlatform(W/2-48,H-105,96)];let y=H-175,prev=platforms[0];for(let i=0;i<13;i++){y-=gapY();let p=nextPlatform(prev,y,i);platforms.push(p);prev=p}started=true;dead=false;keys.left=keys.right=false;overlay.style.display='none'}
function end(){score=Math.max(score,peak);sfx('fall');TOT.points=(TOT.points||0)+score;TOT.coins=(TOT.coins||0)+Math.floor(score/100);updCoins();try{localStorage.removeItem('sa_save')}catch(e){}checkGoals();saveG();renderMissions();refreshCont();dead=true;started=false;const nw=score>best&&score>0;best=Math.max(best,score);localStorage.setItem('sa_climb_best_v2',best);bestEl.textContent=best*4;overlay.style.display='flex';document.getElementById('subtitle').textContent=nw?'🏆 NOVO RECORDE!':'FIM DA SUBIDA';document.getElementById('message').innerHTML='<div style="font-size:12px;color:#b6cadb">METROS</div><div style="font-size:46px;font-weight:900;color:#ffe14a;line-height:1;text-shadow:0 3px #000">'+score*4+' m</div><div style="margin-top:8px;font-size:13px">Recorde: <b style="color:#ffbd42">'+best*4+' m</b></div>';document.getElementById('res').style.display='block'}
// muda o lado do personagem; se estiver no ar, dispara a animação de rotação
function setFace(f){if(f===player.face)return;if(player.land<=0&&Math.abs(player.vy)<560&&!nearGround())player.rot={t:0,to:f};else player.rot=null;player.face=f}
function nearGround(){const b=player.y+player.h;for(const p of platforms){if(player.x+player.w>p.x&&player.x<p.x+p.w&&p.y-b>=-4&&p.y-b<22)return true}return false}
for(const [id,k] of [['left','left'],['right','right']]){const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;el.setPointerCapture?.(e.pointerId)});for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,e=>{keys[k]=false})}
document.getElementById('start').onclick=()=>{sfx('jump');document.getElementById('subtitle').textContent='MODO SUBIDA';reset()};
game.addEventListener('pointerdown',e=>{if(!started||e.target.closest('button')||e.target.closest('#overlay'))return;lastTouchX=e.clientX});
game.addEventListener('pointermove',e=>{if(!started||paused||lastTouchX===null||e.pointerType==='mouse')return;const dx=e.clientX-lastTouchX;player.x+=dx*1.15;wrapX();if(Math.abs(dx)>1){setFace(dx>0?1:-1);player.moveT=.2}lastTouchX=e.clientX});
game.addEventListener('pointerup',()=>lastTouchX=null);game.addEventListener('pointercancel',()=>lastTouchX=null);
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.left=true;if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.right=true});
addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=false;if(['ArrowRight','d','D'].includes(e.key))keys.right=false});

// Escolhe o frame certo conforme a fase do pulo (baseado na velocidade vertical, não no relógio)
function pickFrame(){
  const moving=player.moveT>0, vy=player.vy;
  const asc=Math.min(1,Math.max(0,-vy/590));               // 1 = recém-impulsionado, 0 = pico
  if(player.rot){                                           // rotação no ar
    const set=SETS[player.rot.to<0?'rotRL':'rotLR'];
    return [set,Math.min(6,Math.floor(player.rot.t/ROT_DUR*7))];
  }
  if(moving){                                               // pulo automático (7 frames)
    const set=SETS[player.face>0?'autoR':'autoL'];
    if(player.land>0)return [set,player.land>.05?6:0];     // aterrissagem -> preparo
    if(vy<0)return [set,asc>.82?1:asc>.35?2:3];            // impulso, subindo, (pico)
    if(Math.abs(vy)<130)return [set,3];                     // pico
    if(nearGround())return [set,6];
    return [set,vy>380?5:4];                                // descendo
  }
  const set=SETS.vert, flip=player.face<0;                  // pulo vertical (10 frames)
  let i;
  if(player.land>0)i=player.land>.05?9:0;                   // aterrissagem -> início
  else if(vy<-130)i=asc>.8?1:asc>.55?2:3;                   // subindo
  else if(Math.abs(vy)<=130)i=4;                            // pico
  else if(nearGround())i=8;                                 // quase no chão
  else i=vy>420?7:vy>230?6:5;                               // descendo
  return [set,i,flip];
}
function drawPlayer(){if(invT>0&&Math.floor(anim*16)%2)return;
  const [set,i,flip]=pickFrame(),im=set.f[i];if(!im||!im.complete||!im.naturalWidth)return;
  const dw=set.w*SPR_SCALE,dh=set.h*SPR_SCALE;                   // proporção original preservada
  const cx=player.x+player.w/2,by=player.y+player.h+2*SPR_SCALE;  // pés alinhados à base da hitbox
  ctx.save();ctx.translate(cx,by);if(flip)ctx.scale(-1,1);ctx.drawImage(im,-dw/2,-dh,dw,dh);ctx.restore();
}
function drawCrate(p){
  const th=p.h+6,tw=th*crateImg.naturalWidth/crateImg.naturalHeight,n=Math.max(1,Math.round(p.w/tw)),cw=p.w/n; // caixas lado a lado, sem esticar
  for(let k=0;k<n;k++)ctx.drawImage(crateImg,p.x+k*cw,p.y-3,cw,th);
}
function frame(t){let dt=Math.min((t-last)/1000||0,.032);last=t;anim+=dt;ctx.clearRect(0,0,W,H);
// Fundo urbano vertical: imagem preenchendo a tela, sem mosaico horizontal.
ctx.fillStyle='#071426';ctx.fillRect(0,0,W,H);
const tl=drawBG();
if(tl){
 // leve sombra nas bordas para manter personagem e plataformas legíveis
 const shade=ctx.createLinearGradient(0,0,W,0);
 shade.addColorStop(0,'rgba(1,8,20,.28)');shade.addColorStop(.5,'rgba(1,8,20,.04)');shade.addColorStop(1,'rgba(1,8,20,.28)');
 ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(2,8,20,.18)';ctx.fillRect(0,0,W,H);
}
drawFar();drawFG();sectorToast();
if(started&&!paused){elapsed+=dt;if(invT>0)invT-=dt;if(jetCD>0)jetCD-=dt;
let direction=(keys.left?-1:0)+(keys.right?1:0);if(direction){player.x+=direction*230*dt;setFace(direction>0?1:-1);player.moveT=.2}else if(player.moveT>0)player.moveT-=dt;
if(player.carry){player.x+=player.carry*dt;player.carry*=Math.max(0,1-1.2*dt);if(Math.abs(player.carry)<2)player.carry=0}wrapX();
if(player.land>0)player.land-=dt;
if(player.rot){player.rot.t+=dt;if(player.rot.t>=ROT_DUR)player.rot=null}
if(boostT>0){boostT-=dt;player.vy=-760}else player.vy+=1350*dt;let oldBottom=player.y+player.h;player.y+=player.vy*dt;
if(player.vy>0){for(const p of platforms){if(!p.broken&&player.x+player.w>p.x&&player.x<p.x+p.w&&oldBottom<=p.y+8&&player.y+player.h>=p.y){player.y=p.y-player.h;player.vy=p.type==='spring'?-948:-708;player.land=.1;player.rot=null;landed(p);if(p.type==='fragile'){p.broken=true;burst(p.x+p.w/2,p.y,'#c98a3d',12)}break}}}
if(player.y<H*.42){let shift=H*.42-player.y;player.y+=shift;cam+=shift;for(const p of platforms)p.y+=shift;bgOffset+=shift*.14;midOff+=shift*.55;fgOff+=shift*1.15;lavaY+=shift;for(const d of drones)d.y+=shift;for(const m of missiles)m.y+=shift;for(const it of items)it.y+=shift;for(const q of parts)q.y+=shift;score=Math.floor(cam/10)+bonus}
for(const p of platforms){if(p.type==='moving'&&!p.broken){p.x+=p.dir*(34+Math.min(55,score/20))*dt;if(p.x<7||p.x+p.w>W-7)p.dir*=-1;p.x=Math.max(7,Math.min(W-p.w-7,p.x));}}
let top=Math.min(...platforms.map(p=>p.y));while(top>-50){let prev=platforms.reduce((a,b)=>a.y<b.y?a:b);let y=top-gapY();let p=nextPlatform(prev,y,++genCount);applyEvt(p);maybeKiosk(p);maybeDrone(p);platforms.push(p);spawnItem(p);top=p.y}
platforms=platforms.filter(p=>p.y<H+45&&!p.broken);
for(const it of items){if(!it.got&&Math.abs(it.x-(player.x+player.w/2))<28&&Math.abs(it.y-(player.y+player.h/2))<32){it.got=true;sfx('item');burst(it.x,it.y,'#ffe14a',10);if(it.k==='star'){R.stars++;TOT.stars=(TOT.stars||0)+1;TOT.coins=(TOT.coins||0)+5;updCoins();bonus+=50;score+=50;showToast('+200 m')}else if(it.k==='shield'){shield=true;showToast('ESCUDO!')}else{R.boost++;boostT=1.3;showToast('IMPULSO!')}}}
items=items.filter(i=>!i.got&&i.y<H+50);if(toastT>0)toastT-=dt;
lavaStep(dt);checkGoals();storyCheck();if((saveT-=dt)<=0){saveT=3;saveRun()}if(player.y>H+80||player.y+player.h>lavaY+4){if(shield){shield=false;R.shield=1;lavaY=H+150;sfx('shield');player.y=H+10;player.vy=-1000;player.rot=null;burst(player.x+player.w/2,H-10,'#78dcff',16);showToast('ESCUDO USADO')}else if(revive)reviveAt();else end()}updateExtras(dt);peak=Math.max(peak,score);heightEl.textContent=score*4;
}
if(crateImg.complete&&crateImg.naturalWidth)for(const p of platforms){
 if(p.type==='spring'){ctx.fillStyle='#42e87a';ctx.fillRect(p.x,p.y-7,p.w,p.h+7);ctx.fillStyle='#d8ffe3';ctx.fillRect(p.x+5,p.y-10,p.w-10,4);}
 else if(p.type==='fragile'){ctx.globalAlpha=.78;drawCrate(p);ctx.globalAlpha=1;ctx.strokeStyle='#ffcc66';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x+p.w*.35,p.y);ctx.lineTo(p.x+p.w*.52,p.y+9);ctx.lineTo(p.x+p.w*.43,p.y+17);ctx.stroke();}
 else if(p.type==='moving'){ctx.fillStyle='#53c9ff';ctx.fillRect(p.x,p.y-5,p.w,4);drawCrate(p);}
 else drawCrate(p);
 ctx.fillStyle=p.type==='spring'?'#d8ffe3':p.type==='moving'?'#8de5ff':'#f4c447';ctx.fillRect(p.x,p.y-4,p.w,5);if(p.type==='shop')drawKiosk(p);
}
for(const it of items){const by=Math.sin(anim*3+it.ph)*3;ctx.fillStyle='rgba(255,230,120,.22)';ctx.beginPath();ctx.arc(it.x,it.y+by,17,0,7);ctx.fill();ctx.font='22px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(it.k==='star'?'⭐':it.k==='shield'?'🛡️':'🚀',it.x,it.y+by)}
drawExtras();drawLava();if(started)drawPlayer();
for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.l-=dt;if(q.l<=0){parts.splice(i,1);continue}q.vy+=600*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;ctx.globalAlpha=Math.min(1,q.l*2.5);ctx.fillStyle=q.c;ctx.fillRect(q.x-2,q.y-2,4,4)}ctx.globalAlpha=1;
if(started){const px=player.x+player.w/2,py=player.y+player.h/2;
 if(shield){ctx.strokeStyle='rgba(120,220,255,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(px,py,34,0,7);ctx.stroke()}
 if(boostT>0){ctx.fillStyle='#ff9d2e';ctx.beginPath();ctx.moveTo(px-9,player.y+player.h);ctx.lineTo(px+9,player.y+player.h);ctx.lineTo(px,player.y+player.h+22+Math.random()*10);ctx.fill()}
 ctx.textAlign='left';ctx.textBaseline='top';ctx.font='900 13px system-ui,sans-serif';ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=3;
 let ty=52;if(shield){ctx.strokeText('🛡️ Escudo ativo',14,ty);ctx.fillText('🛡️ Escudo ativo',14,ty);ty+=18}
 if(boostT>0){const t='🚀 Impulso '+boostT.toFixed(1)+'s';ctx.strokeText(t,14,ty);ctx.fillText(t,14,ty);ty+=18}
 if(combo>=2){const t='🔥 Combo x'+combo;ctx.strokeText(t,14,ty);ctx.fillText(t,14,ty)}
 if(toastT>0){ctx.globalAlpha=Math.min(1,toastT*2);ctx.textAlign='center';ctx.font='900 22px system-ui,sans-serif';ctx.lineWidth=4;ctx.strokeText(toast,W/2,H*.3);ctx.fillText(toast,W/2,H*.3);ctx.globalAlpha=1}
}
if(paused){ctx.fillStyle='rgba(6,18,30,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='900 30px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('PAUSADO',W/2,H/2);if(!shopOpen){ctx.font='700 14px system-ui,sans-serif';ctx.fillText('toque em ▶ para continuar',W/2,H/2+30)}}
document.getElementById('hint').style.display=(started&&elapsed>4)?'none':'';

requestAnimationFrame(frame)}
const INTRO=[
{i:'assets/img/s_a.jpg',t:'Na <b>Cidade de Cima</b>, os prédios nunca param de crescer. Todo dia, um novo andar surge sobre o anterior.'},
{i:'assets/img/s_e.jpg',t:'Lá embaixo, as ruas são um labirinto de sombras. Os elevadores não levam mais ninguém ao topo, e as pessoas aprenderam a olhar só para cima.'},
{i:'assets/img/s_face.jpg',t:'Você é <b>Caio</b>, 16 anos, entregador dos andares inferiores. Ele já viu de tudo... menos o céu.'},
{i:'assets/img/s_box.jpg',t:'Numa noite, uma caixa despenca dos andares superiores e atinge o chão bem perto dele.'},
{i:'assets/img/s_boots.jpg',t:'Dentro, um par de <b>botas tecnológicas</b> que absorvem o impacto, armazenam energia e amplificam os saltos. E um cordão com um símbolo desconhecido.'},
{i:'assets/img/s_letter.jpg',t:'Um bilhete assinado só com <b>“R.”</b>: não confie nos mapas, as botas ainda funcionam, leve o cordão com você. A entrega precisa chegar à <b>cobertura, andar sem número</b>.'},
{i:'assets/img/intro_06.jpg',t:'<b>A subida.</b> As botas pulam sozinhas. Você só decide para onde Caio vai: as caixas empilhadas são o único caminho.'},
{i:'assets/img/intro_07.jpg',t:'Algumas caixas são firmes, outras rangem e quebram no primeiro pouso.'},
{i:'assets/img/intro_08.jpg',t:'As azuis deslizam sozinhas. Ninguém constrói isso por acaso: alguém planejou cada andar.'},
{i:'assets/img/intro_09.jpg',t:'As molas verdes lançam Caio para o alto, mas não dizem onde ele vai cair.'},
{i:'assets/img/intro_10.jpg',t:'No caminho brilham ⭐ fragmentos de memória da antiga Cidade de Baixo. As botas guardam cada um deles.'},
{i:'assets/img/intro_11.jpg',t:'De vez em quando aparece um 🛡️ escudo: o módulo de absorção das botas, que ampara uma queda.'},
{i:'assets/img/intro_12.jpg',t:'E um 🚀 impulso: a energia armazenada nas botas, liberada de uma vez. Nos <b>pontos de recarga</b> espalhados pela cidade, as moedas viram melhorias.'},
{i:'assets/img/intro_13.jpg',t:'Mais acima, as caixas ficam mais estreitas, como se a cidade quisesse testar até onde ele aguenta.'},
{i:'assets/img/intro_14.jpg',t:'<b>O segredo do topo.</b> Cada queda termina na escuridão lá embaixo. Mas quem cai pode tentar de novo, e a cada subida Caio chega mais perto da verdade do Projeto Ascensão.'},
{i:'assets/img/intro_15.jpg',t:'Ninguém sabe o que existe no andar sem número. Só quem chegar lá vai descobrir.'}];
{const $e=id=>document.getElementById(id),el=$e('intro'),pic=$e('ipic'),cap=$e('icap'),dots=$e('dots'),nx=$e('inext'),ch=$e('choice'),sk=$e('skip'),pe=$e('pause');let cur=INTRO,n=0,beat=null;
 function show(){const s=cur[n],last=n===cur.length-1;pic.src=s.i;cap.innerHTML=s.t;dots.innerHTML=cur.map((_,k)=>'<i class="'+(k===n?'on':'')+'"></i>').join('');ch.style.display=s.choice?'flex':'none';nx.style.display=s.choice?'none':'';nx.textContent=last?(beat==='end'?'ENCERRAR MISSÃO':beat?'CONTINUAR A SUBIDA':'IR PARA A SUBIDA'):'PRÓXIMO';sk.style.display=cur===INTRO?'':'none'}
 function open(){cur=INTRO;beat=null;n=0;show();el.style.display='flex'}
 function close(){el.style.display='none';if(cur===INTRO){try{localStorage.setItem('sa_intro','1')}catch(e){}}else{storyOpen=false;paused=false;pe.textContent='⏸';lastTouchX=null;const b=beat;beat=null;if(b==='end')end()}}
 openStory=b=>{storyOpen=true;TOT.ST=TOT.ST||{};TOT.ST[b.id]=1;saveG();paused=true;pe.textContent='▶';cur=b.slides;beat=b.id;n=0;show();el.style.display='flex'};
 nx.onclick=()=>{if(n<cur.length-1){n++;show()}else close()};
 $e('cCont').onclick=()=>{TOT.end='continuar';saveG();close();showToast('NOVAS CIDADES ALÉM DAS NUVENS')};
 $e('cVolta').onclick=()=>{TOT.end='voltar';saveG();cur=[{i:'assets/img/t_ai.jpg',t:'Caio leva os registros à Central e encerra a missão. A verdade sobre a Cidade de Baixo volta a existir... mas ele nunca esquece o que viu além das nuvens.'}];beat='end';n=0;show()};
 sk.onclick=close;$e('story').onclick=open;
 let seen='0';try{seen=localStorage.getItem('sa_intro')||'0'}catch(e){}if(seen!=='1')open()}
loadG();renderMissions();renderTro();updCoins();refreshCont();
{const pe=document.getElementById('pause'),tro=document.getElementById('tro');
 pe.onclick=()=>{if(started&&!shopOpen){paused=!paused;pe.textContent=paused?'▶':'⏸';if(paused)saveRun()}};addEventListener('pagehide',saveRun);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&started){paused=true;pe.textContent='▶';saveRun()}});
 document.getElementById('tbtn').onclick=()=>{renderTro();tro.style.display='flex'};document.getElementById('tclose').onclick=()=>{tro.style.display='none'}}
{const sh=document.getElementById('shop'),pe=document.getElementById('pause');
 document.getElementById('slist').onclick=e=>{const b=e.target.closest('button');if(!b)return;const t=SH[+b.dataset.i];if((TOT.coins||0)<t[3])return;if(t[4]()){TOT.coins-=t[3];updCoins();saveG();sfx('item');renderShop('Comprado: '+t[1])}else renderShop('Você já tem isso ativo')};
 document.getElementById('sclose').onclick=()=>{sh.style.display='none';shopOpen=false;paused=false;pe.textContent='⏸';lastTouchX=null};
 document.getElementById('cont').onclick=()=>{loadRun()}}
{const q=id=>document.getElementById(id),st=q('settings'),sb=q('setSound'),lab=()=>{sb.textContent=muted?'🔇 SOM: DESLIGADO':'🔊 SOM: LIGADO'};lab();
 q('msound').style.opacity=muted?.45:1;q('msound').onclick=()=>{muteEl.onclick()};
 q('tcfg').onclick=()=>{lab();st.style.display='flex'};q('setClose').onclick=()=>{st.style.display='none'};sb.onclick=()=>{muteEl.onclick();lab()};
 q('setReset').onclick=()=>{if(confirm('Apagar moedas, troféus e história salvos neste aparelho?')){['sa_g','sa_save','sa_intro','sa_climb_best_v2'].forEach(k=>localStorage.removeItem(k));location.reload()}};
 q('helpBtn').onclick=()=>{const r=q('res');r.style.display=r.style.display==='block'?'none':'block'}}
reset();started=false;refreshHUD();updCoins();overlay.style.display='flex';requestAnimationFrame(frame);
})();
