export interface ProductoImagen {
  id: number;
  imagen: string; // Esta será la URL completa que envía Django
  es_principal: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  sku: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  stock_minimo: number;
  talla: string;
  id_subcategoria: number;
  vendedor: number;
  fecha_creacion: string;
  
  // Relación de galería (Sincronizado con el Serializer)
  imagenes: ProductoImagen[]; 

  // Sistema de promociones
  en_oferta: boolean;
  precio_oferta?: number;
  porcentaje_descuento: number;
  fecha_fin_oferta?: string;
}