import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeComponent } from './employee/employee.component';

@NgModule({
  imports: [CommonModule,EmployeeComponent]  // Import standalone component directly
})
export class AppModule { }
