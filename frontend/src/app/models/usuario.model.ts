export interface Usuario {
  id: number;              // Mapeado de ID_USUARIO
  nombre: string;          // Mapeado de NOMBRE_USUARIO
  apellido: string;        // Mapeado de APELLIDO_USUARIO
  email: string;           // Mapeado de CORREO_USUARIO
  tipo_documento?: string; // <--- Agregado
  numero_usuario?: string; // <--- Agregado
  telefono?: string;       // Mapeado de TEL_USUARIO
  rol_id: number;          // Mapeado de ROL_ID_ROL
  nombre_empresa?: string;
  url_imagen_perfil?: string; // Asegúrate de que este campo esté en el serializer si lo vas a usar
  
  // Campos de logística
  direccion?: string;      // Mapeado de DIRECCION_ENTREGA
  ciudad?: string;
  departamento?: string;
  codigo_postal?: string;
  notas?: string;
  
}