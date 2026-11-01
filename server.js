import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { demoService } from './demo-backend.js';
const root = new URL('./public/', import.meta.url);
const assets=['index.html','style.css','app.js','engine.js','control.html','control.js','workflows.html','workflows.js','education.css'];
const allowed=new Map(assets.map(name=>['/'+name,name])); allowed.set('/','index.html');
const types={html:'text/html',css:'text/css',js:'text/javascript'};
async function jsonBody(req) {
  if (!String(req.headers['content-type']||'').startsWith('application/json')) throw Object.assign(new Error('JSON body required.'),{status:415});
  let body='';
  for await (const chunk of req) {body+=chunk; if(Buffer.byteLength(body)>4096) throw Object.assign(new Error('Body too large.'),{status:413});}
  try {return JSON.parse(body);} catch {throw Object.assign(new Error('Invalid JSON.'),{status:400});}
}
export const server=createServer(async (req,res)=>{
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  const reply=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/api/demo/')) {
    try {
      // No CORS, cookies, user identities or global outcome switch.
      const origin=req.headers.origin;
      if(origin) {let host;try{host=new URL(origin).host;}catch{host='';}if(host!==req.headers.host)return reply(403,{error:'Cross-origin requests are not allowed.'});}
      const token=String(req.headers.authorization||'').replace(/^Bearer /,'');
      if(pathname==='/api/demo/session' && req.method==='POST') {await jsonBody(req); return reply(201,demoService.create());}
      if(pathname==='/api/demo/session' && req.method==='GET')return reply(200,demoService.read(token));
      if(pathname==='/api/demo/session' && req.method==='DELETE')return reply(200,demoService.remove(token));
      if(pathname==='/api/demo/plan' && req.method==='PUT')return reply(200,demoService.configure(token,await jsonBody(req)));
      if(pathname==='/api/demo/round' && req.method==='POST')return reply(200,demoService.play(token,await jsonBody(req)));
      return reply(404,{error:'Unknown demo endpoint or method.'});
    }catch(e){return reply(e.status||500,{error:e.status?e.message:'Unable to process demo request.'});}
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end('Method not allowed');}
  const name=allowed.get(pathname);if(!name){res.writeHead(404);return res.end('Not found');}
  try{const content=await readFile(new URL(name,root));res.writeHead(200,{'Content-Type':`${types[name.split('.').pop()]}; charset=utf-8`});res.end(req.method==='HEAD'?undefined:content);}catch{res.writeHead(500);res.end('Unable to load page');}
});
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const flag=process.argv.indexOf('--port');
  const port=Number(process.env.PORT || (flag>=0?process.argv[flag+1]:3000));
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid port');
  server.listen(port,'0.0.0.0',()=>console.log('Odds Lab ready'));
}
