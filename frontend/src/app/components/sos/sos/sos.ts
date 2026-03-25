import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps'; // Ya no importamos MapInfoWindow
import { AuthService } from '../../../services/auth';
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
  private userSub!: Subscription;

  // Almacena el marcador seleccionado para la tarjeta de abajo
  selectedMarker: any = null;

  // Datos del usuario
  usuario = this.authService.usuarioActualValue;

  // Bogotá por defecto hasta que cargue GPS
  center: google.maps.LatLngLiteral = { lat: 4.6097, lng: -74.0817 };
  zoom = 15;

  // Estilos de Mapa (Dark Mode)
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
  isLoading = true;

  ngOnInit(): void {
    this.mapOptions.styles = this.getInitialStyles();
    this.getUserLocation();
    this.userSub = this.authService.usuarioActual$.subscribe(user => {
      this.usuario = user;
    });
    this.observeThemeChange();
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }

  private getInitialStyles() {
    return document.documentElement.classList.contains('dark') 
      ? this.darkStyles 
      : this.lightStyles;
  }

  private observeThemeChange() {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      this.mapInstance?.setOptions({ styles: isDark ? this.darkStyles : this.lightStyles });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

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
          console.warn('GPS desactivado. Usando Bogotá por defecto.');
          this.isLoading = false;
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      this.isLoading = false;
    }
  }

  async setFilter(type: string) {
    this.activeFilter = type;
    this.isLoading = true;
    this.selectedMarker = null; // Limpiamos la tarjeta al cambiar de filtro

    try {
      const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      const request = {
        fields: ["displayName", "location", "formattedAddress"],
        locationRestriction: { center: this.center, radius: 5000 },
        includedPrimaryTypes: [type], 
        maxResultCount: 15,
        rankPreference: SearchNearbyRankPreference.DISTANCE,
      };

      // @ts-ignore
      const { places } = await Place.searchNearby(request);

      if (places && places.length > 0) {
        this.markers = places.map(p => ({
          position: p.location, 
          title: p.displayName,
          info: p.formattedAddress,
          icon: this.getIconForType(type) 
        }));
      } else {
        this.markers = [];
      }
    } catch (error) {
      console.error("Error S.O.S:", error);
    } finally {
      this.isLoading = false;
    }
  }

  getIconForType(type: string): google.maps.Icon {
    const icons: any = {
      car_repair: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF3131" width="40px" height="40px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.3 4.3C.2 6.7.6 9.7 2.6 11.7c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.7-2.7c.4-.4.4-1.1 0-1.6z"/></svg>`,
      hospital: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF4B4B" width="40px" height="40px"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>`,
      gas_station: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23F7DF1E" width="40px" height="40px"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-1.1-.9-2-2-2zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>`
    };

    return {
      url: icons[type] || '',
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20)
    };
  }

  // Ahora openInfo solo guarda el marcador seleccionado
  openInfo(marker: any) {
    this.selectedMarker = marker;
  }

  irAGoogleMaps(position: google.maps.LatLngLiteral | undefined) {
    if (!position) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;
    window.open(url, '_blank');
  }
}