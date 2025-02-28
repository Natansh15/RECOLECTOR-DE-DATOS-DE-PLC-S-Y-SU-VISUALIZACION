import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public var2: string = '';
  public tipo: string = '';

  private data: any = {};


  setVar2(value: string) {
    this.var2 = value;
  }

  getVar2() {
    return this.var2;
  }


  setTipo(value: string) {
    this.tipo = value;
    
  }

  getTipo() {
    return this.tipo;
    
  }


  setVariables(variables: { ip: string, pt: number, plc1: string, tipo: string }) {
    this.data = { ...this.data, ...variables };
  }

  getVariables() {
    return this.data;
  }
}

