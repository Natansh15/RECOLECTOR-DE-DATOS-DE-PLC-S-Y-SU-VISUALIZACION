import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Método para verificar si el usuario ha iniciado sesión
  isAuthenticated(): boolean {
    return true; // O cualquier lógica de autenticación que desees implementar
  }
}
