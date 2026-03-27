import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { AuthService } from '../../../services/auth';
import { GoogleMapsLoaderService } from '../../../services/google-maps-loader'; // Nuevo import
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sos',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './sos.html',
  styleUrl: './sos.css',
})
export class Sos implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private mapsLoader = inject(GoogleMapsLoaderService); // Inyectamos el cargador seguro
  private userSub!: Subscription;

  // --- HERRAMIENTAS DE RUTA (Inicializadas después de cargar la API) ---
  private directionsRenderer!: google.maps.DirectionsRenderer;
  private directionsService!: google.maps.DirectionsService;

  // --- ESTADO DEL ASISTENTE ---
  selectedMarker: any = null;
  usuario = this.authService.usuarioActualValue;
  saludoContextual: string = "";
  alertaMision: string = "Protocolo S.O.S. en espera...";
  destinoConfirmado: string = "Esperando coordenadas...";

  // --- CONFIGURACIÓN MAPA ---
  center: google.maps.LatLngLiteral = { lat: 4.6097, lng: -74.0817 };
  zoom = 15;
  isLoading = true;
  apiCargada = false; // Nueva bandera para el *ngIf del mapa
  
  private darkStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#161b22" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#161b22" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8b949e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#30363d" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1f2328" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  ];

  private lightStyles: google.maps.MapTypeStyle[] = [];

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    scrollwheel: true,
    maxZoom: 20,
    minZoom: 8,
    styles: [] 
  };

  markers: any[] = [];
  userLocationMarker: google.maps.LatLngLiteral | null = null;
  activeFilter: string | null = null;
  mapInstance: google.maps.Map | null = null;

  async ngOnInit() {
    this.generarSaludo();
    
    try {
      // PASO CLAVE: Carga segura de la API antes de usar cualquier objeto 'google'
      await this.mapsLoader.load();
      this.apiCargada = true;
      
      // Inicializamos herramientas de ruta una vez cargada la API
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        polylineOptions: { strokeColor: '#E11D48', strokeWeight: 5 }
      });

      this.mapOptions.styles = this.getInitialStyles();
      this.getUserLocation();
    } catch (error) {
      console.error("Fallo crítico en Protocolo S.O.S:", error);
      this.alertaMision = "ERROR_SISTEMA: No se pudo enlazar con el satélite GPS.";
    }

    this.userSub = this.authService.usuarioActual$.subscribe(user => {
      this.usuario = user;
      this.generarSaludo();
    });
    this.observeThemeChange();
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }

  // --- MÉTODOS DE RUTA ---
  trazarRuta(event: any) {
    const destino = event.target.value;
    if (!destino || !this.apiCargada) return;

    const request: google.maps.DirectionsRequest = {
      origin: this.center,
      destination: destino,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        this.directionsRenderer.setDirections(result);
        const infoRuta = result.routes[0].legs[0];
        this.destinoConfirmado = infoRuta.end_address;
        this.alertaMision = `Ruta trazada. Tiempo: ${infoRuta.duration?.text}.`;
      }
    });
  }

  onMapInitialized(map: google.maps.Map) {
    this.mapInstance = map;
    this.directionsRenderer.setMap(map); // Conectamos el dibujante al mapa
  }

  // --- LÓGICA DE INTERFAZ ---
  generarSaludo() {
    const hora = new Date().getHours();
    const momento = hora < 12 ? 'Buen camino' : hora < 18 ? 'Buenas tardes' : 'Operación nocturna';
    const nombre = this.usuario?.nombre?.split(' ')[0] || 'Agente';
    this.saludoContextual = `${momento}, ${nombre}.`;
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          this.center = { lat: p.coords.latitude, lng: p.coords.longitude };
          this.userLocationMarker = { ...this.center };
          this.isLoading = false;
        },
        () => { this.isLoading = false; },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      this.isLoading = false;
    }
  }

  async seleccionarIntencion(tipo: string) {
    if (!this.apiCargada) return;
    this.activeFilter = tipo;
    this.isLoading = true;
    this.selectedMarker = null;

    try {
      const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      const request = {
        fields: ["displayName", "location", "formattedAddress"],
        locationRestriction: { center: this.center, radius: 5000 },
        includedPrimaryTypes: [tipo], 
        maxResultCount: 12,
        rankPreference: SearchNearbyRankPreference.DISTANCE,
      };

      // @ts-ignore
      const { places } = await Place.searchNearby(request);

      if (places) {
        this.markers = places.map(p => ({
          position: p.location, 
          title: (p as any).displayName?.text || (p as any).displayName || "Unidad de Servicio",
          info: p.formattedAddress,
          icon: this.getIconForType(tipo) 
        }));
      }
    } catch (e) {
      console.error("Fallo en escaneo:", e);
    } finally {
      setTimeout(() => { this.isLoading = false; }, 800);
    }
  }

  getIconForType(type: string): google.maps.Icon {
    const colors: any = { car_repair: '%23FF3131', hospital: '%23FF3131', gas_station: '%23F7DF1E' };
    const color = colors[type] || '%23FF3131';
    return {
      url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`,
      scaledSize: new google.maps.Size(35, 35),
      anchor: new google.maps.Point(17, 35)
    };
  }

  openInfo(marker: any) {
    this.selectedMarker = marker;
  }

  private getInitialStyles() {
    return document.documentElement.classList.contains('dark') ? this.darkStyles : this.lightStyles;
  }

  private observeThemeChange() {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      this.mapInstance?.setOptions({ styles: isDark ? this.darkStyles : this.lightStyles });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  irAGoogleMaps(position: google.maps.LatLngLiteral | undefined) {
    if (!position) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;
    window.open(url, '_blank');
  }
}