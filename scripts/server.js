import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const root=process.cwd(),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const path=normalize(join(root,pathname==='/'?'index.html':pathname));if(!path.startsWith(root)){res.writeHead(403).end();return}const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(404).end('Not found')}}).listen(4173,'127.0.0.1',()=>console.log('UNDERROOT running at http://127.0.0.1:4173'));
