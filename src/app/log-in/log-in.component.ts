import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})

export class LogInComponent implements OnInit {
    tcpipForm: FormGroup;
  modbusForm: FormGroup;
  basedatosForm: FormGroup;
  public responseData: any; // Propiedad para almacenar los datos de la respuesta HTTP
  collectionNames: string[] = [];


  constructor(private httpClient: HttpClient, private router: Router, private sharedService: SharedService, private formBuilder: FormBuilder, private authService: AuthService) { 

    this.tcpipForm = this.formBuilder.group({
      ip: ['', [Validators.required, Validators.pattern(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)]],
      pt: ['', [Validators.required, Validators.pattern(/^\d{1,5}$/)]],
      plc1: ['', Validators.required],
      tipo: ['', Validators.required],
      bsd: ['', Validators.required],
    });
    
    this.modbusForm = this.formBuilder.group({
      ipmod: ['', [Validators.required, Validators.pattern(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)]],
      ptmod: ['', [Validators.required, Validators.pattern(/^\d{1,5}$/)]],
      var1: ['', [Validators.required, Validators.min(0), Validators.max(9)]],
      tipo: ['', Validators.required],
      bsd: ['', Validators.required],
    }); 
    
    this.basedatosForm = this.formBuilder.group({
      bsd: ['', Validators.required],
      tipo: ['', Validators.required]
    });
   
  }
  
  ngOnInit() {
    this.httpClient.get('http://localhost:5038/ObtenerInformacion').subscribe(
      (response: any) => {
        this.collectionNames = response.collectionNames;
      },
      (error) => {
        console.error('Error en la solicitud HTTP:', error);
      }
    );
  }

  public ip!: string;
  public pt!: number; 
  public plc1!: string;
  public ipmod!: string;
  public ptmod!: number;
  public mode!: string;
  public var1!: string;
  public var2!: string;
  public tipo!: string;
  public bsd!: string;


  TCPIP(ip: string, ptStr: string, plc1: string, mode: string,  var2: string , tipo: string, bsd: string,) {
    if (this.tcpipForm.valid) {
      console.log("La ip es:", ip);
      var2 = "true";
      tipo = tipo;
      
    const pt = parseInt(ptStr, 10);
    this.sharedService.setVar2(var2);
    this.sharedService.setTipo(tipo);

    this.sharedService.setVariables({
      ip: ip,
      pt: pt,
      plc1: plc1,
      tipo: tipo
    });
   
    const data = {
      ip: ip,
      pt: pt,
      plc1: plc1,
      tipo: tipo,
      bsd: bsd,
      mode: "tcp"
    };
  
   
    this.httpClient.post('http://localhost:5038/Iniciar', data)
      .subscribe(response => {
        
        console.log('Respuesta del servidor:', response);
  
  

        this.router.navigate(['/plc']); 
      }, error => {
        
        console.error('Error en la solicitud:', error);
      });
    }
  }

  MODBUS(ipmod: string, ptmodStr: string, var1: string, var2: string, mode: string, tipo: string, bsd: string,) {

    if (this.modbusForm.valid) {
      const formValue = this.modbusForm.value;
      console.log("La ip es:", ipmod);
      var2 = "true";
      tipo = tipo;
    const ptmod = parseInt(ptmodStr, 10);
    this.sharedService.setVar2(var2);
    this.sharedService.setTipo(tipo);

    this.sharedService.setVariables({
      ip: ipmod,
      pt: ptmod,
      plc1: var1,
      tipo: tipo
    });

    const data = {
      ip: ipmod,
      pt: ptmod,
      plc1: var1,
      tipo: tipo,
      bsd: bsd,
      mode: "modbus"
    };
  
    this.httpClient.post('http://localhost:5038/Iniciar', data)
      .subscribe(response => {
        
        console.log('Respuesta del servidor:', response);
  
  

        this.router.navigate(['/plc']); 
      }, error => {
        
        console.error('Error en la solicitud:', error);
      });
    }
  }
  

  BSD( bsd: string, tipo: string,  mode: string, var2: string ) {
    if (this.basedatosForm.valid) {
  
      var2 = "true";
      tipo = tipo;
   console.log(tipo);
    this.sharedService.setVar2(var2);
    this.sharedService.setTipo(tipo);

   
    const data = {
      tipo: tipo,
      bsd: bsd,
      mode: "bsd"
    };
  
   
    this.httpClient.post('http://localhost:5038/Iniciar', data)
      .subscribe(response => {
        
        console.log('Respuesta del servidor:', response);
  
  

        this.router.navigate(['/plc']); 
      }, error => {
        
        console.error('Error en la solicitud:', error);
      });
    }
  }

  showSpinner = false;
  showSuccessMessage = false;



  handleSubmit() {
    this.showSpinner = true;
  
    // Simula una operación asíncrona (por ejemplo, una solicitud HTTP) y luego oculta el spinner
    setTimeout(() => {
      // Simula una operación asíncrona
      // Una vez que se complete la operación, oculta el spinner
      this.showSpinner = false;
  
      // Después de 2 segundos, muestra el aviso
      setTimeout(() => {
        this.showSuccessMessage = true;
      }, 100);
    }, 10000); // Cambia 10000 a la duración de tu operación en milisegundos
  }
  
  
  
}
