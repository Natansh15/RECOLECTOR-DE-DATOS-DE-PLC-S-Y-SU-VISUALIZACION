import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private APIUrl = 'http://localhost:5038/api/todoapp/'; // Define la URL base aquí

  constructor(private http: HttpClient) {}

  getData() {
    const url = this.APIUrl + 'GetNotes'; // Construye la URL completa
    return this.http.get(url);
  }
}
