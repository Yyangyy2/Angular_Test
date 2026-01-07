import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EmployeeService, Employee } from '../employee.service';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employeeAdd.component.html',
  styleUrls: ['./employeeAdd.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class EmployeeAddComponent {
  isModalOpen = false;
  isLoading = false;
  errorMessage = '';

  // Form fields
  empId: string = '';
  wwid: string = '';
  name: string = '';
  shiftType: string = '4';
  employmentStatus: string = '1';
  effectiveDate: string = '';

  constructor(private employeeService: EmployeeService) {}

  openModal() {
    this.isModalOpen = true;
    this.resetForm();
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.empId = '';
    this.wwid = '';
    this.name = '';
    this.shiftType = 'Shift 4';
    this.employmentStatus = '1';
    this.effectiveDate = '';
    this.errorMessage = '';
  }

  onSubmit() {
  // Validate required fields
  if (!this.empId || !this.wwid || !this.name) {
    this.errorMessage = 'Please fill in all required fields (Emp ID, WWID, Name)';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  // Map shift type to shift_id
  const shift_id = this.shiftType === 'Shift 4' ? 1 : 2;

  const employeeData: Employee = {
    employee_id: this.empId,
    wwid: parseInt(this.wwid),
    name: this.name,
    shift_id: parseInt(this.shiftType),
    state: parseInt(this.employmentStatus),
    project_id: undefined,  // Changed from null to undefined
    created_by: 1,
    modified_by: 1



  };

  this.employeeService.addEmployee(employeeData).subscribe({
    next: (response: any) => {
      console.log('✅ Employee added successfully:', response);
      alert('Employee added successfully!');
      this.isLoading = false;
      this.closeModal();
    },
    error: (error: any) => {
      console.error('❌ Error adding employee:', error);
      this.errorMessage = error.error?.message || 'Error adding employee. Please try again.';
      this.isLoading = false;
    }
  });
}

  onCancel() {
    this.closeModal();
  }
}
