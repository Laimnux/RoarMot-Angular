import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../services/vendedor/producto';
import { Chart, registerables } from 'chart.js';
import { VentaProveedor } from '../../../models/venta.model';
import { VentaService } from '../../../services/vendedor/venta.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('donutCanvas') donutCanvas!: ElementRef;
  
  productos: any[] = [];
  chart: any;
  loading: boolean = true;

  valorTotalInventario: number = 0;
  productosEnAlerta: number = 0;
  totalUnidadesFisicas: number = 0;
  categoriaMasValiosa: string = 'N/A';

  productosEnOferta: number = 0; 
  listaOfertas: any[] = [];

  // Diccionario para traducir los IDs de tu base de datos a nombres legibles
  diccionarioCategorias: { [key: number]: string } = {
    1: 'CASCOS',
    2: 'GUANTES',
    3: 'CHAQUETAS',
    4: 'ACCESORIOS',
    5: 'REPUESTOS'
  };

  // 1. Agregamos la lista de ventas y el total de ventas
  listaVentas: VentaProveedor[] = [];
  totalVentasRealizadas: number = 0;

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService
  ) {}

  ngOnInit(): void {
    this.cargarDatosYCalcular();
    this.cargarLogistica();
  }

  cargarDatosYCalcular(): void {
    this.loading = true;
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.ejecutarCalculos();
        this.initDonutChart();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar métricas:', err);
        this.loading = false;
      }
    });
  }

  ejecutarCalculos(): void {

    this.valorTotalInventario = this.productos.reduce((acc, p) => 
      acc + (Number(p.precio || 0) * Number(p.cantidad || 0)), 0);

    this.productosEnAlerta = this.productos.filter(p => 
      Number(p.cantidad) < Number(p.stock_minimo)).length;

    this.totalUnidadesFisicas = this.productos.reduce((acc, p) => 
      acc + Number(p.cantidad || 0), 0);

    // --- NUEVOS CÁLCULOS ---
    this.listaOfertas = this.productos.filter(p => p.en_oferta);
    this.productosEnOferta = this.listaOfertas.length;

    this.calcularCategoriaTop();
  }

  // Función auxiliar para obtener la imagen principal (igual que en inventario)
  getImagenPrincipal(prod: any): string {
    return (prod.imagenes && prod.imagenes.length > 0) 
      ? prod.imagenes[0].imagen 
      : 'assets/img/no-product.png';
  }

  calcularCategoriaTop(): void {
    if (this.productos.length === 0) return;

    const valoresPorCategoria: { [key: string]: number } = {};
    
    this.productos.forEach(p => {
      // Usamos id_subcategoria de tu modelo de Django
      const idCat = p.id_subcategoria || 1; 
      const catNombre = this.diccionarioCategorias[idCat] || 'OTROS';
      
      const valor = Number(p.precio || 0) * Number(p.cantidad || 0);
      valoresPorCategoria[catNombre] = (valoresPorCategoria[catNombre] || 0) + valor;
    });

    this.categoriaMasValiosa = Object.keys(valoresPorCategoria).reduce((a, b) => 
      valoresPorCategoria[a] > valoresPorCategoria[b] ? a : b, 'N/A');
  }

  initDonutChart(): void {
    if (!this.donutCanvas) return;

    const categoriasObj: { [key: string]: number } = {};
    
    this.productos.forEach(p => {
      // Traducimos el ID a nombre para que las etiquetas del gráfico se vean bien
      const idCat = p.id_subcategoria || 1;
      const catNombre = this.diccionarioCategorias[idCat] || 'OTROS';
      
      categoriasObj[catNombre] = (categoriasObj[catNombre] || 0) + Number(p.cantidad || 0);
    });

    const labels = Object.keys(categoriasObj);
    const dataValues = Object.values(categoriasObj);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: ['#e11d48', '#fb7185', '#4c0519', '#1e293b', '#9f1239'],
          borderWidth: 0,
          hoverOffset: 20
        }]
      },
      options: {
        cutout: '75%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { 
              color: '#94a3b8', 
              font: { family: 'Bebas Neue', size: 12 },
              padding: 20
            }
          }
        }
      }
    });
  }

  cargarLogistica(): void {
    this.ventaService.obtenerDespachosPendientes().subscribe({
      next: (data) => {
        this.listaVentas = data;
        // Calculamos el total de ventas realizadas para las métricas del dashboard
        this.totalVentasRealizadas = this.listaVentas.length;
      },
      error: (err) => {
        console.error('Error al cargar la logística de ventas:', err);
      }
    });
  }
}