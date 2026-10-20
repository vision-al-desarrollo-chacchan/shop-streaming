import {test} from 'node:test';
import assert from 'node:assert/strict';
import {server,quote} from '../server.js';
test('el total usa los precios del servidor e ignora precios enviados',()=>{assert.equal(quote([{id:'cine',quantity:2,price:0}]).total,59.8);});
test('rechaza carritos inválidos',()=>{for(const input of [[],[{id:'fake',quantity:1}],[{id:'cine',quantity:-1}],[{id:'cine',quantity:1.5}]])assert.throws(()=>quote(input));});
test('catálogo, página y checkout de demostración funcionan por HTTP',async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));try{const base='http://127.0.0.1:'+server.address().port;const home=await fetch(base);assert.equal(home.status,200);assert.match(await home.text(),/Tu próximo/);const products=await(await fetch(base+'/api/products')).json();assert.equal(products.length,4);const checkout=await fetch(base+'/api/checkout',{method:'POST',body:JSON.stringify({items:[{id:'music',quantity:1}]})});const result=await checkout.json();assert.equal(result.total,19.9);assert.equal(result.mode,'demo');const invalid=await fetch(base+'/api/checkout',{method:'POST',body:'{}'});assert.equal(invalid.status,400);}finally{await new Promise(r=>server.close(r));}});
test('Mercado Pago envía precios calculados y selecciona sandbox',async()=>{
 const {createPayment}=await import('../server.js');const originalFetch=globalThis.fetch;const previous={base:process.env.PUBLIC_BASE_URL,token:process.env.MERCADOPAGO_ACCESS_TOKEN,live:process.env.PAYMENTS_LIVE};
 process.env.PUBLIC_BASE_URL='https://example.com';process.env.MERCADOPAGO_ACCESS_TOKEN='test-placeholder';delete process.env.PAYMENTS_LIVE;
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.mercadopago.com/checkout/preferences');const body=JSON.parse(options.body);assert.equal(body.items[0].currency_id,'PEN');assert.equal(body.items[0].unit_price,29.9);return {ok:true,json:async()=>({sandbox_init_point:'https://sandbox.mercadopago.com.pe/checkout/test'})};};
 try{assert.equal((await createPayment(quote([{id:'cine',quantity:1}]))).redirect,'https://sandbox.mercadopago.com.pe/checkout/test');}finally{globalThis.fetch=originalFetch;for(const [key,value] of Object.entries({PUBLIC_BASE_URL:previous.base,MERCADOPAGO_ACCESS_TOKEN:previous.token,PAYMENTS_LIVE:previous.live}))if(value===undefined)delete process.env[key];else process.env[key]=value;}
});
