import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../employee/employee.service';
import { EmployeeAddComponent } from './employeeAdd/employeeAdd.component';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule,EmployeeAddComponent],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  employeeData: Employee[] = [];
  filteredEmployeeData: Employee[] = [];

  searchTerm = '';
  selectedShifts: string[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployeeData();
  }

  loadEmployeeData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employeeData = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load employee data: ' + error.message;
        this.isLoading = false;
        console.error('Error loading data:', error);
      }
    });
  }

  getUniqueShifts(): (string | number)[] {
  return [...new Set(
    this.employeeData.map(d => d.shift_id).filter((shift): shift is string | number => shift !== undefined && shift !== null)
  )];
}

  get filteredData(): Employee[] {
    return this.filteredEmployeeData;
  }

  applyFilters(): void {
      this.filteredEmployeeData  = this.employeeData.filter(row => {
    const shiftMatch = this.selectedShifts.length === 0 ||
      (row.shift_id !== undefined && row.shift_id !== null &&
      this.selectedShifts.includes(String(row.shift_id)));

    const nameMatch = this.searchTerm === '' ||
      row.name.toLowerCase().includes(this.searchTerm.toLowerCase());

    return shiftMatch && nameMatch;
  });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onShiftChange(event: any): void {
    this.selectedShifts = Array.from(event.target.selectedOptions, (o: any) => o.value);
    this.applyFilters();
  }

  exportCSV(): void {
    const header = ['ID', 'Emp ID', 'WWID', 'Name', 'Shift', 'State'].join(',');
    const rows = this.filteredData.map(r =>
      [r.id, r.employee_id, r.wwid, r.name, r.shift_id, r.state].join(',')
    );
    const csv = [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }


  @ViewChild(EmployeeAddComponent) employeeAddModal!: EmployeeAddComponent;

  addNewEmployee() {
    this.employeeAddModal.openModal();
  }


}
