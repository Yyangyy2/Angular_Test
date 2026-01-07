import { Component } from '@angular/core';
import { EmployeeComponent } from './employee/employee.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EmployeeComponent],
  template: `
    <div style="padding: 20px;">
      <app-employee></app-employee>
    </div>
  `,
  styles: []
})
export class App {
  title = 'Attendance System';
}
