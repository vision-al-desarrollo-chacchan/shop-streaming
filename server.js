import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
export const products = [
 {id:'cine',name:'Cine & series',category:'Películas y series',price:29.9,color:'#e85056',icon:'▶',description:'Historias para desconectar. Un plan mensual para tu próximo maratón.'},
 {id:'music',name:'Música sin pausa',category:'Música',price:19.9,color:'#99e5b2',icon:'♫',description:'Tu banda sonora, todos los días. Descubre tu próxima canción favorita.'},
 {id:'family',name:'Plan familiar',category:'Películas y series',price:49.9,color:'#b4a2ff',icon:'✦',description:'Más momentos juntos. Entretenimiento para compartir en familia.'},
 {id:'sport',name:'Deportes en vivo',category:'Deportes',price:39.9,color:'#f4bd70',icon:'↗',description:'Siente cada jugada. Un mes de emoción para los aficionados.'}
];
export function quote(items){
 if(!Array.isArray(items)||!items.length||items.length>20) throw Error('El carrito debe contener entre 1 y 20 productos.');
 const lines=items.map(({id,quantity})=>{const p=products.find(p=>p.id===id);if(!p||!Number.isInteger(quantity)||quantity<1||quantity>10)throw Error('Producto o cantidad inválidos.');return {...p,quantity};});
 return {items:lines,currency:'PEN',total:lines.reduce((s,p)=>s+Math.round(p.price*100)*p.quantity,0)/100};
}
export async function createPayment(order){
 const base=process.env.PUBLIC_BASE_URL;
 if(!base||!base.startsWith('https://'))throw Error('Configura PUBLIC_BASE_URL con la URL pública HTTPS.');
 const response=await fetch('https://api.mercadopago.com/checkout/preferences',{method:'POST',headers:{Authorization:'Bearer '+process.env.MERCADOPAGO_ACCESS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({items:order.items.map(p=>({id:p.id,title:p.name,quantity:p.quantity,currency_id:'PEN',unit_price:p.price})),back_urls:{success:base+'/?payment=success',failure:base+'/?payment=failure',pending:base+'/?payment=pending'},auto_return:'approved'})});
 if(!response.ok)throw Error('Mercado Pago no pudo iniciar el pago.');
 const preference=await response.json();
 const redirect=process.env.PAYMENTS_LIVE==='true'?preference.init_point:preference.sandbox_init_point;
 if(!redirect||new URL(redirect).protocol!=='https:')throw Error('Respuesta de pago inválida.');
 return {mode:'mercadopago',redirect};
}
export const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method==='GET'&&url.pathname==='/api/products'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(products));}
 if(req.method==='POST'&&url.pathname==='/api/checkout'){
  try {let body='';for await(const chunk of req){body+=chunk;if(body.length>10000){res.writeHead(413);return res.end();}}
   const order=quote(JSON.parse(body).items);
   if(process.env.MERCADOPAGO_ACCESS_TOKEN){try{const payment=await createPayment(order);res.setHeader('Content-Type','application/json');res.end(JSON.stringify(payment));}catch{res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'El pago no está disponible. Revisa la configuración de Mercado Pago.'}));}return;}
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify({...order,mode:'demo',message:'Resumen de demostración. No se ha procesado ningún cobro ni reservado una suscripción.'}));
  }catch {res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Revisa los productos y cantidades del carrito.'}));}return;
 }
 const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
 if(req.method!=='GET'||!files[url.pathname]){res.writeHead(404);return res.end('No encontrado');}
 try{const file=files[url.pathname];res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8');res.end(await readFile(new URL('./public/'+file,import.meta.url)));}catch{res.writeHead(500);res.end('Error del servidor');}
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Shop Streaming iniciado en puerto '+(process.env.PORT||3000)));
