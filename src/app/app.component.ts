import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EmployeeComponent } from './employee/employee.component';
import { EmployeeService } from './employee/employee.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EmployeeComponent, HttpClientModule],
  providers: [EmployeeService],
  template: `<app-employee></app-employee>`,
  styles: []
})
export class AppComponent {
  title = 'Employee System';
}
