import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../shared.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-root',
  templateUrl: './plcip.component.html',
  styleUrls: ['./plcip.component.css']
})

export class PlcComponent implements OnInit {
  ip: string = '';
  pt: number = 0;
  plc1: string = '';
  horaInicio: string = '';
  n: number = 1;
  vars: string[] = [];

   constructor(private router: Router, private http: HttpClient, private sharedService: SharedService, private route:ActivatedRoute) {}

  data: any[] = [];

  incrementarContador() {
    this.n++;
  }
 // public tipo = this.sharedService.getTipo();

 public tipo =  this.sharedService.getTipo();

  ngOnInit() {
    this.obtenerDatos(); // Llama a la función para obtener datos al cargar la página
  const variables = this.sharedService.getVariables();

  // Restablece los valores iniciales
  this.ip = '';
  this.pt = 0;
  this.plc1 = '';
  this.horaInicio = '';

  // Actualiza los valores según los datos proporcionados por el servicio compartido
  this.ip = variables.ip;
  this.pt = variables.pt;
  this.plc1 = variables.plc1;

  this.actualizarHoraInicio();
  }

  actualizarHoraInicio() {
    const horaInicio = new Date(); // Obtener la hora actual como hora de inicio
    this.horaInicio = horaInicio.toLocaleTimeString();
  }


  
  obtenerDatos() {
    // Realiza la solicitud HTTP GET al servidor para obtener los datos
    
   
    this.http.get<any[]>('http://localhost:5038/api/todoapp/Getnotes').subscribe(
      (response) => {
        this.data = response;
        
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  actualizarDatos() {
    // Llama a la función para obtener datos cuando se hace clic en el botón
    this.obtenerDatos();
  }

  Volver() {
    this.router.navigate(['/']); 
    
  }

  exportData() {
    const tipoValue = this.sharedService.getTipo();
    // Obtén solo las propiedades que necesitas del JSON
    let n = 1;
    const selectedData = this.data.map(item => ({
      ["NO."]: n++,
      [tipoValue]: "",
      ID: item._id,
      Valor: item[tipoValue].value,
      Calidad: item[tipoValue].quality,
      Hora: item[tipoValue].timestamp,
    }));
  
    // Convierte los datos seleccionados a una hoja XLSX
    const ws = XLSX.utils.json_to_sheet(selectedData);
  
    // Crea un nuevo libro XLSX y agrega la hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const fileName = `data_${tipoValue}.xlsx`;
  
    // Guarda el archivo XLSX
    XLSX.writeFile(wb, fileName);
  }
  




}
