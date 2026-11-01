// Deliberately simplified teaching models, not replicas of commercial products.
export const STAKE = 10;
export const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
export function random() { return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; }
export function integer(n, rng=random) {
  // Rejection sampling avoids modulo bias for the production random source.
  if (rng !== random) return Math.min(n-1, Math.floor(rng()*n));
  const limit = Math.floor(4294967296/n)*n;
  let x; do {x=globalThis.crypto.getRandomValues(new Uint32Array(1))[0];} while(x>=limit);
  return x % n;
}
export function survival(mines, picks) {
  if (!Number.isInteger(mines) || mines<1 || mines>24 || !Number.isInteger(picks) || picks<0 || picks>25-mines) throw new RangeError('Invalid Mines configuration');
  let p=1; for(let i=0;i<picks;i++) p*=(25-mines-i)/(25-i); return p;
}
export function board(mines, rng=random) {
  survival(mines,0);
  const cells=Array.from({length:25},(_,i)=>i);
  for(let i=24;i>0;i--) {const j=integer(i+1,rng); [cells[i],cells[j]]=[cells[j],cells[i]];}
  return new Set(cells.slice(0,mines));
}
export function model(game, {mines=3,picks=3,target=2}={}) {
  switch(game) {
    case 'mines': {const p=survival(mines,picks); return {p, payout:.97/p, edge:.03};}
    case 'dice': return {p:.49,payout:2,edge:.02};
    case 'roulette': return {p:18/37,payout:2,edge:1/37};
    case 'crash': if(!Number.isFinite(target)||target<1.1||target>10) throw new RangeError('Invalid target'); return {p:.97/target,payout:target,edge:.03};
    case 'slots': return {p:1/36,payout:34.2,edge:.05};
    default: throw new RangeError('Unknown game');
  }
}
export function trial(game, options={}, rng=random) {
  const m=model(game,options); let won, label;
  if(game==='dice') {const n=integer(100,rng);won=n<49;label=`Rolled ${n} / 99`;}
  else if(game==='roulette') {const n=integer(37,rng);won=RED.has(n);label=`${n} · ${n===0?'green':won?'red':'black'}`;}
  else if(game==='slots') {const reels=Array.from({length:3},()=>integer(6,rng));won=reels.every(n=>n===reels[0]);label=reels.map(n=>['○','△','□','◇','☆','＋'][n]).join('  ');}
  else if(game==='crash') {const peak=Math.max(1,.97/(1-rng()));won=peak >= (options.target??2);label=`Stopped at ${peak.toFixed(2)}×`;}
  else {won=rng()<m.p;label=won?'All selected tiles safe':'Mine encountered';}
  return {won,label,returned:won?STAKE*m.payout:0,net:won?STAKE*(m.payout-1):-STAKE};
}
export function experiment(game, options={}, count=1000, rng=random) {
  if(!Number.isInteger(count)||count<1||count>10000) throw new RangeError('Invalid sample size');
  let net=0,wins=0; const points=[0];
  for(let i=0;i<count;i++){const r=trial(game,options,rng);net+=r.net;wins+=Number(r.won);points.push(net);}
  return {net,wins,points,expected:-count*STAKE*model(game,options).edge,count};
}
