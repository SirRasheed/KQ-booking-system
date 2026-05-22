'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Plus, Pencil, Trash2, UserCheck, Shield, Download } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  assignedTask: string;
  status: string;
}

const TASK_OPTIONS = [
  'Process daily ticket bookings',
  'Handle customer inquiries',
  'Supervise daily operations',
  'Assist with check-in process',
  'Manage boarding procedures',
  'Handle baggage claims',
  'Coordinate flight schedules',
  'Process refunds and cancellations',
];

export function AdminEmployees() {
  const { user, setNotification, setCurrentPage } = useAppStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'TICKETING_OFFICER',
    department: '',
    assignedTask: '',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setNotification({ message: 'Admin access required', type: 'error' });
      setCurrentPage('login');
      return;
    }
    fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data.employees || data || []);
    } catch {
      setNotification({ message: 'Failed to load employees', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setNotification({
          message: editingEmployee ? 'Employee updated' : 'Employee added',
          type: 'success',
        });
        setDialogOpen(false);
        resetForm();
        fetchEmployees();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification({ message: 'Employee deleted', type: 'success' });
        fetchEmployees();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      role: emp.role,
      department: emp.department || '',
      assignedTask: emp.assignedTask || '',
      status: emp.status,
    });
    setDialogOpen(true);
  };

  const handleAssignTask = async (empId: string, task: string) => {
    try {
      const res = await fetch(`/api/employees/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTask: task, status: 'ASSIGNED' }),
      });
      if (res.ok) {
        setNotification({ message: 'Task assigned successfully', type: 'success' });
        fetchEmployees();
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', role: 'TICKETING_OFFICER', department: '', assignedTask: '', status: 'AVAILABLE' });
    setEditingEmployee(null);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TICKETING_OFFICER': return 'Ticketing Officer';
      case 'CUSTOMER_SERVICE': return 'Customer Service';
      case 'GROUND_STAFF': return 'Ground Staff';
      case 'SUPERVISOR': return 'Supervisor';
      default: return role;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 mt-1">Manage employees and assign tasks</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TICKETING_OFFICER">Ticketing Officer</SelectItem>
                      <SelectItem value="CUSTOMER_SERVICE">Customer Service</SelectItem>
                      <SelectItem value="GROUND_STAFF">Ground Staff</SelectItem>
                      <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assigned Task</Label>
                <Input value={form.assignedTask} onChange={(e) => setForm({ ...form, assignedTask: e.target.value })} placeholder="Enter task description" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSave}>
                  {editingEmployee ? 'Update' : 'Add Employee'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employee Matching Section */}
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-red-600" />
            Match Employee to Opening
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Openings that need to be filled */}
            {[
              { task: 'Process daily ticket bookings', preferredRole: 'TICKETING_OFFICER', department: 'Ticketing' },
              { task: 'Handle customer inquiries', preferredRole: 'CUSTOMER_SERVICE', department: 'Customer Relations' },
              { task: 'Supervise daily operations', preferredRole: 'SUPERVISOR', department: 'Operations' },
              { task: 'Assist with check-in process', preferredRole: 'GROUND_STAFF', department: 'Ground Operations' },
              { task: 'Manage boarding procedures', preferredRole: 'GROUND_STAFF', department: 'Ground Operations' },
              { task: 'Handle baggage claims', preferredRole: 'CUSTOMER_SERVICE', department: 'Customer Relations' },
              { task: 'Coordinate flight schedules', preferredRole: 'SUPERVISOR', department: 'Operations' },
              { task: 'Process refunds and cancellations', preferredRole: 'TICKETING_OFFICER', department: 'Ticketing' },
            ].map((opening, idx) => {
              // Check if someone is already assigned to this task
              const alreadyAssigned = employees.find(e => e.assignedTask === opening.task && e.status === 'ASSIGNED');
              // Find best match: available employees with matching role, then any available
              const roleMatch = employees.filter(e => e.status === 'AVAILABLE' && e.role === opening.preferredRole);
              const anyAvailable = employees.filter(e => e.status === 'AVAILABLE');
              const bestMatch = roleMatch[0] || anyAvailable[0];
              const matchScore = bestMatch ? (bestMatch.role === opening.preferredRole ? 'Excellent' : 'Good') : null;

              return (
                <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border ${
                  alreadyAssigned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{opening.task}</p>
                      {alreadyAssigned ? (
                        <Badge className="bg-green-100 text-green-700 text-[10px]">Filled</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 text-[10px]">Open</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Preferred: {getRoleLabel(opening.preferredRole)} • {opening.department}
                    </p>
                    {alreadyAssigned && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Assigned to: {alreadyAssigned.name}
                      </p>
                    )}
                  </div>
                  {!alreadyAssigned && (
                    <div className="flex items-center gap-2">
                      {bestMatch ? (
                        <>
                          <div className="text-right">
                            <p className="text-sm font-medium">{bestMatch.name}</p>
                            <p className="text-xs text-gray-500">
                              {getRoleLabel(bestMatch.role)} • Match: <span className={matchScore === 'Excellent' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{matchScore}</span>
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleAssignTask(bestMatch.id, opening.task)}
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                            Assign
                          </Button>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400">No available employees</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-sm">{emp.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRoleLabel(emp.role)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{emp.department || '-'}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{emp.assignedTask || '-'}</TableCell>
                    <TableCell>
                      <Badge className={
                        emp.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                        emp.status === 'ASSIGNED' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Print Matches Report */}
      <Card className="mt-6 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Successful Matches Report</p>
              <p className="text-xs text-gray-500">Print a report of all employee-task assignments</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const assigned = employees.filter(e => e.status === 'ASSIGNED' && e.assignedTask);
                const printContent = `
                  <html><head><title>Successful Matches Report</title>
                  <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#b91c1c}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#fee2e2;color:#991b1b}</style></head>
                  <body><h1>Kenya Airways - Successful Matches Report</h1>
                  <p>Generated: ${new Date().toLocaleString()}</p>
                  <p>Total Matches: ${assigned.length}</p>
                  <table><tr><th>Employee</th><th>Role</th><th>Department</th><th>Assigned Task</th></tr>
                  ${assigned.map(e => `<tr><td>${e.name}</td><td>${getRoleLabel(e.role)}</td><td>${e.department || '-'}</td><td>${e.assignedTask}</td></tr>`).join('')}
                  </table></body></html>`;
                const win = window.open('', '_blank');
                if (win) { win.document.write(printContent); win.document.close(); win.print(); }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Print Matches Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
