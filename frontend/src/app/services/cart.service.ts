// cart.service.ts actualizado
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: any[] = [];
  private _cart = new BehaviorSubject<any[]>([]);
  cart$ = this._cart.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('roar_cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this._cart.next(this.cartItems);
    }
  }

  // Método para el botón (+) y (-)
  actualizarCantidad(productoId: number, cambio: number) {
    const producto = this.cartItems.find(p => p.id === productoId);
    if (producto) {
      producto.cantidad += cambio;
      // Si la cantidad llega a 0, lo eliminamos
      if (producto.cantidad <= 0) {
        this.cartItems = this.cartItems.filter(p => p.id !== productoId);
      }
      this.guardarYNotificar();
    }
  }

  eliminarProducto(productoId: number) {
    this.cartItems = this.cartItems.filter(p => p.id !== productoId);
    this.guardarYNotificar();
  }

  limpiarCarrito() {
    this.cartItems = [];
    this.guardarYNotificar();
  }

  private guardarYNotificar() {
    localStorage.setItem('roar_cart', JSON.stringify(this.cartItems));
    this._cart.next([...this.cartItems]); // Enviamos una copia para disparar el cambio
  }

  // Getter para el total de artículos (el numerito en el icono del carro)
  get cantidadTotal() {
    return this.cartItems.reduce((acc, p) => acc + p.cantidad, 0);
  }

  // Calculamos el total considerando ofertas
  get total() {
    return this.cartItems.reduce((acc, p) => {
      const precio = p.precio_oferta ? parseFloat(p.precio_oferta) : parseFloat(p.precio);
      return acc + (precio * p.cantidad);
    }, 0);
  }

  // --- AÑADE ESTO ---
  agregarProducto(producto: any) {
    // Buscamos si el producto ya está en el carro
    const existe = this.cartItems.find(p => p.id === producto.id);

    if (existe) {
      // Si ya existe, solo subimos la cantidad
      existe.cantidad += 1;
    } else {
      // Si es nuevo, lo añadimos al array (asegurándonos que cantidad sea 1)
      this.cartItems.push({ ...producto, cantidad: 1 });
    }

    // Guardamos en LocalStorage y notificamos a los componentes
    this.guardarYNotificar();
  }

}