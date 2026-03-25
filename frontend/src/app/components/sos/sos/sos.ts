import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'app-sos',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './sos.html',
  styleUrl: './sos.css',
})
export class Sos implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  center: google.maps.LatLngLiteral = { lat: 4.6097, lng: -74.0817 }; // Bogotá por defecto
  zoom = 14;

  // Opciones de configuración de mapa
  mapOptions: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID',
    disableDefaultUI: true, // Interfaz limpia
    zoomControl: true,
  };

  markers: any[] = []; // Los pines de la búsqueda
  userLocationMarker: google.maps.LatLngLiteral | null = null;

  activeFilter: 'car_repair' | 'hospital' | 'gas_station' | null = null;
  mapInstance: google.maps.Map | null = null;

  isLoading = true;

  ngOnInit(): void {
    this.getUserLocation();
  }

  // Se lanza cuando el mapa original se carga en el DOM
  onMapInitialized(map: google.maps.Map) {
    this.mapInstance = map;
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.userLocationMarker = { ...this.center };
          this.isLoading = false;
        },
        () => {
          alert('No se pudo acceder a tu ubicación. Mostrando mapa por defecto.');
          this.isLoading = false;
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
      this.isLoading = false;
    }
  }

  setFilter(filterType: 'car_repair' | 'hospital' | 'gas_station') {
    this.activeFilter = filterType;
    this.searchPlaces(filterType);
  }

  searchPlaces(type: string) {
    if (!this.mapInstance || !window.google) {
      alert('Google Maps no está disponible. Revisa tu API Key.');
      return;
    }

    const service = new google.maps.places.PlacesService(this.mapInstance);

    // Objeto Google Maps LatLng para el origen
    const location = new google.maps.LatLng(this.center.lat, this.center.lng);

    // Mejorando la búsqueda combinando la categoría general y palabras clave reales
    let keyword = '';
    let category = '';

    if (type === 'car_repair') {
      keyword = 'taller de motos mecanico';
      category = 'car_repair';
    } else if (type === 'hospital') {
      keyword = 'hospital clinica centro medico urgencias';
      category = 'hospital';
    } else if (type === 'gas_station') {
      keyword = 'estacion de servicio gasolinera gasolina';
      category = 'gas_station';
    }

    const request = {
      location: location,
      radius: 10000, // 10 km
      keyword: keyword,
      type: category
    };

    service.nearbySearch(request, (results, status) => {
      this.markers = []; // Limpiamos marcadores anteriores para cumplir "solo muestre mi opción"

      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        results.forEach((place) => {
          if (place.geometry && place.geometry.location) {
            this.markers.push({
              position: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              title: place.name,
              info: place.vicinity,
              icon: this.getIconForType(type)
            });
          }
        });
      }
    });
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'car_repair': return 'https://maps.google.com/mapfiles/ms/icons/mechanic.png';
      case 'hospital': return 'https://maps.google.com/mapfiles/ms/icons/hospitals.png';
      case 'gas_station': return 'https://maps.google.com/mapfiles/ms/icons/gas.png';
      default: return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  }

  openInfo(markerData: any) {
    // Aquí puedes mostrar la info del taller
    alert(`${markerData.title}\n${markerData.info}`);
  }
}
