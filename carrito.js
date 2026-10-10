const carrito = new Map();
const productosPorId = new Map(productos.map((producto) => [producto.id, producto]));
let contextoAudio;
let temporizadorAnimacionCarrito;

// Dibuja dos notas ascendentes con Web Audio para dar un sonido breve de confirmación.
function reproducirSonidoCheck() {
  if (!window.AudioContext) return 0;

  if (!contextoAudio) contextoAudio = new AudioContext();
  const ahora = contextoAudio.currentTime;

  function reproducirNota(frecuencia, inicio, duracion) {
    const oscilador = contextoAudio.createOscillator();
    const volumen = contextoAudio.createGain();

    oscilador.type = 'triangle';
    oscilador.frequency.setValueAtTime(frecuencia, inicio);
    volumen.gain.setValueAtTime(0.0001, inicio);
    volumen.gain.exponentialRampToValueAtTime(0.1, inicio + 0.01);
    volumen.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
    oscilador.connect(volumen);
    volumen.connect(contextoAudio.destination);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracion);
  }

  reproducirNota(740, ahora, 0.09);
  reproducirNota(990, ahora + 0.08, 0.14);
  return 240;
}

function actualizarCarrito() {
  const contenedorItems = document.getElementById('cart-items');
  const totalElemento = document.getElementById('cart-total');
  const botonAbrir = document.getElementById('cart-open');
  const contadorCarrito = document.getElementById('cart-count');
  const botonCheckout = document.getElementById('cart-checkout');
  let cantidadTotal = 0;
  let precioTotal = 0;

  contenedorItems.replaceChildren();

  carrito.forEach((cantidad, id) => {
    const producto = productosPorId.get(id);
    if (!producto) return;

    cantidadTotal += cantidad;
    precioTotal += producto.precio * cantidad;

    const linea = document.createElement('div');
    linea.className = 'cart-line';

    const informacion = document.createElement('div');
    informacion.className = 'cart-line-info';

    const nombre = document.createElement('span');
    nombre.className = 'cart-line-name';
    nombre.textContent = producto.titulo;

    const precioLinea = document.createElement('span');
    precioLinea.className = 'cart-line-price';
    precioLinea.textContent = `${cantidad} × ${mostrarPrecio(producto.precio)} = ${mostrarPrecio(producto.precio * cantidad)}`;
    informacion.append(nombre, precioLinea);

    const controles = document.createElement('div');
    controles.className = 'cart-quantity';

    const botonMenos = document.createElement('button');
    botonMenos.type = 'button';
    botonMenos.dataset.cartAction = 'decrease';
    botonMenos.dataset.productId = id;
    botonMenos.setAttribute('aria-label', `Quitar una unidad de ${producto.titulo}`);
    botonMenos.textContent = '−';

    const cantidadElemento = document.createElement('span');
    cantidadElemento.textContent = String(cantidad);
    cantidadElemento.setAttribute('aria-label', `Cantidad: ${cantidad}`);

    const botonMas = document.createElement('button');
    botonMas.type = 'button';
    botonMas.dataset.cartAction = 'increase';
    botonMas.dataset.productId = id;
    botonMas.setAttribute('aria-label', `Agregar una unidad de ${producto.titulo}`);
    botonMas.textContent = '+';

    controles.append(botonMenos, cantidadElemento, botonMas);
    linea.append(informacion, controles);
    contenedorItems.append(linea);
  });

  if (cantidadTotal === 0) {
    const mensajeVacio = document.createElement('p');
    mensajeVacio.className = 'cart-empty';
    mensajeVacio.textContent = 'Tu carrito está vacío. Agregá platos desde el menú.';
    contenedorItems.append(mensajeVacio);
  }

  totalElemento.textContent = mostrarPrecio(precioTotal);
  contadorCarrito.textContent = String(cantidadTotal);
  botonAbrir.setAttribute('aria-label', `Abrir carrito, ${cantidadTotal} productos, total ${mostrarPrecio(precioTotal)}`);
  botonCheckout.disabled = cantidadTotal === 0;
}

function animarCarrito() {
  const botonCarrito = document.getElementById('cart-open');
  botonCarrito.classList.remove('is-updated');
  void botonCarrito.offsetWidth;
  botonCarrito.classList.add('is-updated');
  window.clearTimeout(temporizadorAnimacionCarrito);
  temporizadorAnimacionCarrito = window.setTimeout(() => {
    botonCarrito.classList.remove('is-updated');
  }, 500);
}

document.addEventListener('click', (evento) => {
  const botonAgregar = evento.target.closest('button[data-product-id]:not([data-cart-action])');
  if (botonAgregar) {
    const id = botonAgregar.dataset.productId;
    carrito.set(id, (carrito.get(id) || 0) + 1);
    actualizarCarrito();
    animarCarrito();
    botonAgregar.querySelector('span:last-child').textContent = 'AGREGADO';
    window.setTimeout(() => {
      const texto = botonAgregar.querySelector('span:last-child');
      if (texto && botonAgregar.isConnected) texto.textContent = 'AGREGAR';
    }, 1200);
    return;
  }

  const botonCantidad = evento.target.closest('button[data-cart-action]');
  if (!botonCantidad) return;

  const id = botonCantidad.dataset.productId;
  const cantidad = carrito.get(id) || 0;
  if (botonCantidad.dataset.cartAction === 'increase') {
    carrito.set(id, cantidad + 1);
  } else if (cantidad <= 1) {
    carrito.delete(id);
  } else {
    carrito.set(id, cantidad - 1);
  }
  actualizarCarrito();
});

document.getElementById('cart-open').addEventListener('click', () => {
  document.getElementById('cart-dialog').showModal();
});

document.getElementById('cart-close').addEventListener('click', () => {
  document.getElementById('cart-dialog').close();
});

document.getElementById('cart-dialog').addEventListener('click', (evento) => {
  if (evento.target === evento.currentTarget) evento.currentTarget.close();
});

document.getElementById('cart-checkout').addEventListener('click', () => {
  // Prepara el detalle y el total para que el local reciba el pedido completo.
  const lineasPedido = Array.from(carrito, ([id, cantidad]) => {
    const producto = productosPorId.get(id);
    return `• ${cantidad} × ${producto.titulo}: ${mostrarPrecio(producto.precio * cantidad)}`;
  });
  const total = Array.from(carrito, ([id, cantidad]) => productosPorId.get(id).precio * cantidad)
    .reduce((acumulado, precio) => acumulado + precio, 0);
  const mensaje = `Hola, quiero hacer este pedido:\n\n${lineasPedido.join('\n')}\n\nTotal: ${mostrarPrecio(total)}`;
  const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  const duracionSonido = reproducirSonidoCheck();

  // Espera a que termine el sonido para evitar que la navegación lo corte.
  window.setTimeout(() => {
    window.location.href = enlaceWhatsApp;
  }, duracionSonido);
});

actualizarCarrito();