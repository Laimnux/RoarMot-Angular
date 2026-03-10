export interface Moto {
  id_datosmoto?: number;
  marca_moto: string;
  modelo_moto: string;
  color_moto: string;
  placa_moto: string;
  kilometraje: number;
  soat_moto: string; // Las fechas vienen como string YYYY-MM-DD
  tecnomecanica: string;
  imagen_moto?: string | File;
  usuario?: number; // ID del usuario
}