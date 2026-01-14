import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EmployeeService, Employee } from '../employee/employee.service';
import { EmployeeAddComponent } from './employeeAdd/employeeAdd.component';

interface EmployeeWithSelection extends Employee {
  selected?: boolean;
}

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeAddComponent],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  employeeData: EmployeeWithSelection[] = [];
  filteredEmployeeData: EmployeeWithSelection[] = [];

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
        this.employeeData = data.map(emp => ({ ...emp, selected: false }));
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

  get filteredData(): EmployeeWithSelection[] {
    return this.filteredEmployeeData;
  }

  applyFilters(): void {
    this.filteredEmployeeData = this.employeeData.filter(row => {
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

  getSelectedEmployees(): EmployeeWithSelection[] {
    return this.employeeData.filter(emp => emp.selected);
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

  @ViewChild(EmployeeAddComponent, { static: false }) employeeAddModal?: EmployeeAddComponent;

  addNewEmployee(): void {
    this.employeeAddModal?.openModal();
  }

  deleteSelectedEmployees(): void {
    const selectedEmployees = this.getSelectedEmployees();
    if (selectedEmployees.length === 0) {
      this.errorMessage = 'Please select at least one employee to delete';
      return;
    }

    // Filter employees with valid IDs
    const validEmployees = selectedEmployees.filter(emp => emp.id !== undefined && emp.id !== null);
    if (validEmployees.length === 0) {
      this.errorMessage = 'Selected employee(s) do not have valid IDs';
      return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete ${validEmployees.length} employee(s)? This action cannot be undone.`);
    if (!confirmDelete) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const deleteRequests = validEmployees.map(emp =>
      this.employeeService.deleteEmployee(emp.id!)
    );

    forkJoin(deleteRequests).subscribe({
      next: () => {

        const deletedIds = new Set(validEmployees.map(emp => emp.id));
        this.employeeData = this.employeeData.filter(emp => !deletedIds.has(emp.id));
        this.applyFilters();
        this.isLoading = false;
        alert(`Successfully deleted ${validEmployees.length} employee(s)`);
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete employee(s): ' + error.message;
        this.isLoading = false;
        console.error('Error deleting employees:', error);
      }
    });
  }
}
