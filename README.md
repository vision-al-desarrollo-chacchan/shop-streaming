# Shop Streaming

Tienda inicial en español con catálogo ilustrativo, filtros, carrito persistente y revisión de pedidos de demostración. Node.js 22 o superior; sin dependencias externas de ejecución.

## Desarrollo

```sh
npm ci
npm test
npm run dev
```

`npm start` inicia el servidor en el puerto 3000; `PORT` permite cambiarlo.

## Estado de los pagos

**No procesa pagos reales ni activa suscripciones.** `/api/checkout` calcula el total en el servidor y devuelve un resumen de prueba. Los productos y precios en PEN son ilustrativos. Antes de vender, definir el país, proveedor de pagos, catálogo autorizado, condiciones comerciales y política de privacidad. La integración real requerirá credenciales seguras, webhooks verificados, persistencia de pedidos e idempotencia. No guardar credenciales en el repositorio.

## Comprobación

`npm test` valida precios del servidor, cantidades y productos inválidos, catálogo HTTP y checkout de prueba. La interfaz usa fuentes de Google con fuentes locales de respaldo.

## Mercado Pago Perú (preparación)

Variables: `MERCADOPAGO_ACCESS_TOKEN` (secreta, configurar en ajustes), `PUBLIC_BASE_URL` (URL pública HTTPS). Por defecto se devuelve el enlace sandbox de Checkout Pro. `PAYMENTS_LIVE=true` selecciona el enlace de producción, pero **no habilitar ventas hasta implementar pedidos persistentes, webhooks verificados y entrega de suscripciones**. Un retorno con `payment=success` no constituye prueba de pago. Esta versión no confirma pagos, no recoge tarjetas y no renueva suscripciones automáticamente. La conexión con Mercado Pago no se ha validado con credenciales reales.

## Publicar la demostración en Render

1. Publica los archivos de este proyecto en GitHub.
2. En https://dashboard.render.com selecciona **New → Blueprint**, conecta `vision-al-desarrollo-chacchan/shop-streaming` y elige la rama que contenga `render.yaml`.
3. Render leerá el servicio Node gratuito definido aquí. Revisa el plan antes de crear el recurso.
4. Cuando el despliegue esté **Live**, abre la URL HTTPS que muestra Render. Comprueba el catálogo, agrega un plan y revisa el pedido de prueba.

El despliegue inicial funciona sin credenciales y no cobra dinero. Los servicios gratuitos pueden suspenderse por inactividad. Para probar Mercado Pago, configura sus variables directamente en Render; las variables del entorno de Codex no se transfieren automáticamente. `PUBLIC_BASE_URL` debe ser la URL HTTPS asignada por Render. Mantén `PAYMENTS_LIVE=false`.
