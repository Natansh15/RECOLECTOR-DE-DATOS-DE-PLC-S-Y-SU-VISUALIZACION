import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SharedService } from './shared.service'; // Importa el servicio compartido

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private sharedService: SharedService, private router: Router) {}

  canActivate(): boolean {
    const var2 = this.sharedService.getVar2(); // Obtener el valor de var2 del servicio compartido
    
    if (var2 === "true") {
      return true; // El usuario tiene acceso a la página
    } else {
      this.router.navigate(['/']); // Redirige al usuario a una página de error
      return false;
    }
  }
}
