export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  sku: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  stock_minimo: number;
  imagen: string;     // Ruta relativa
  imagen_url: string; // URL completa que creamos en el Serializer
  talla: string;
  id_subcategoria: number;
  vendedor: number;
  fecha_creacion: string;
}