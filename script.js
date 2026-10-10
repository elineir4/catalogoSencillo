const numeroWhatsApp = '543515290303';

const productos = [
  {
    titulo: 'Pizza de Mozzarella',
    etiqueta: 'Recomendado',
    descripcion: 'Mozzarella, salsa casera, aceitunas y orégano.',
    etiquetaPrecio: 'Precio total',
    precio: 8500,
    categoria: 'pizzas',
    id: 'pizza-mozzarella',
  },
  {
    titulo: 'Empanadas Caseras de Jamón y Queso (Docena)',
    etiqueta: 'Popular',
    descripcion: 'Rellenas de jamón y queso.',
    etiquetaPrecio: 'Precio docena',
    precio: 11000,
    categoria: 'empanadas',
    id: 'empanadas-docena',
  },
  {
    titulo: 'Lomito Completo Especial',
    etiqueta: 'Especial',
    descripcion: 'Bife a la plancha con jamón, queso, huevo y vegetales.',
    etiquetaPrecio: 'Precio total',
    precio: 9200,
    categoria: 'lomitos',
    id: 'lomito-completo',
  },
  {
    titulo: 'Pollo al Spiedo con Papas Rústicas',
    etiqueta: 'Casero',
    descripcion: 'Pollo dorado a fuego lento bien sazonado, acompañado con papas rústicas al romero.',
    etiquetaPrecio: 'Precio total',
    precio: 9500,
    categoria: 'pollos',
    id: 'pollo-spiedo',
  },
  {
    titulo: 'Milanesa Napolitana con Guarnición',
    etiqueta: 'Clásico',
    descripcion: 'Milanesa crocante con salsa, jamón, queso y papas fritas.',
    etiquetaPrecio: 'Precio total',
    precio: 7800,
    categoria: 'minutas',
    id: 'milanesa-napolitana',
  },
];

const formatoPrecio = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

function mostrarPrecio(precio) {
  return `$ ${formatoPrecio.format(precio)}`;
}

// Sincroniza los datos editables con las tarjetas ya diseñadas en la página.
function actualizarCatalogo() {
  const tarjetas = document.querySelectorAll('.dish-item');

  productos.forEach((producto, indice) => {
    const tarjeta = tarjetas[indice];
    if (!tarjeta) return;

    const titulo = tarjeta.querySelector('h2');
    const descripcion = tarjeta.querySelector('p');
    const etiquetaPrecio = tarjeta.querySelector('.bg-surface-container-low .font-body-md');
    const precio = tarjeta.querySelector('.bg-surface-container-low .font-headline-xl');
    const imagen = tarjeta.querySelector('img');
    const enlaceWhatsApp = tarjeta.querySelector('a[href*="wa.me"]');

    if (titulo) titulo.textContent = producto.titulo;
    if (descripcion) descripcion.textContent = producto.descripcion;
    if (etiquetaPrecio) etiquetaPrecio.textContent = `${producto.etiquetaPrecio}:`;
    if (precio) precio.textContent = mostrarPrecio(producto.precio);
    if (imagen) imagen.alt = `Imagen de ${producto.titulo}`;

    tarjeta.dataset.category = producto.categoria;

    let franjaEtiqueta = tarjeta.querySelector(':scope > .bg-primary');
    if (!franjaEtiqueta) {
      franjaEtiqueta = document.createElement('div');
      franjaEtiqueta.className = 'bg-primary text-on-primary px-space-md py-space-xs flex items-center justify-between font-label-md text-label-md font-bold';
      const textoEtiqueta = document.createElement('span');
      textoEtiqueta.className = 'flex items-center gap-1.5';
      franjaEtiqueta.append(textoEtiqueta);
      tarjeta.prepend(franjaEtiqueta);
    }

    const textoEtiqueta = franjaEtiqueta.querySelector('span');
    if (textoEtiqueta) textoEtiqueta.textContent = producto.etiqueta;

    // El producto se agrega al carrito antes de enviar el pedido por WhatsApp.
    if (enlaceWhatsApp) {
      const botonAgregar = document.createElement('button');
      botonAgregar.type = 'button';
      botonAgregar.className = `${enlaceWhatsApp.className} cart-add-button`;
      botonAgregar.dataset.productId = producto.id;
      botonAgregar.setAttribute('aria-label', `Agregar ${producto.titulo} al carrito`);

      const icono = document.createElement('span');
      icono.className = 'material-symbols-outlined text-[30px]';
      icono.setAttribute('aria-hidden', 'true');
      icono.textContent = 'add_shopping_cart';

      const texto = document.createElement('span');
      texto.textContent = 'AGREGAR';

      botonAgregar.append(icono, texto);
      enlaceWhatsApp.replaceWith(botonAgregar);
    }
  });
}

actualizarCatalogo();
