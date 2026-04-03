import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../../../services/store';
import { Producto } from '../../../models/producto.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit {
  producto?: Producto;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _storeService: StoreService
  ) {}

  ngOnInit(): void {
    // Capturamos el ID de la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(Number(id));
    }
  }

  cargarProducto(id: number) {
    this.loading = true;
    this._storeService.getProductoById(id).subscribe({
      next: (data) => {
        this.producto = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle:', err);
        this.loading = false;
        this.router.navigate(['/app/store']);
      }
    });
  }

  volver() {
    this.router.navigate(['/app/store']);
  }

  agregarAlCarrito() {
    console.log('Producto añadido:', this.producto?.nombre);
    // Aquí conectaremos luego con el CarritoService
  }
}