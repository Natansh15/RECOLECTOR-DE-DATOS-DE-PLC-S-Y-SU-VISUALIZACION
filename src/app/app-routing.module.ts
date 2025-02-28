import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogInComponent } from './log-in/log-in.component';
import { PlcComponent } from './plcip/plcip.component';
import { AuthGuard } from './guard.guard';


const routes: Routes = [
  { path: "", component: LogInComponent }, // Ruta raíz que muestra LogInComponent
  {
    path: 'plc',
    component: PlcComponent,
    canActivate: [AuthGuard] 
  }, // Ruta para PlcComponent
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
