import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id?: number;
  employee_id: string;
  wwid: number;
  name: string;
  shift_id?: number | string;
  created_by?: number;
  created_date?: string;
  modified_by?: number;
  modified_date?: string;
  state?: number | string;
  project_id?: string | number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  rows?: T[];
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:3000/api/employees';

  constructor(private http: HttpClient) { }

  /**
   * Get all employees
   */
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  /**
   * Get single employee by ID
   */
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new employee
   */
  addEmployee(data: Employee): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.apiUrl, data);
  }

  /**
   * Update existing employee
   */
  updateEmployee(id: number, data: Employee): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete employee
   */
  deleteEmployee(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
