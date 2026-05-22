'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import { BarChart3, Plus, Eye, Trash2, Download, FileText } from 'lucide-react';

interface Report {
  id: string;
  type: string;
  title: string;
  data: string;
  createdAt: string;
  user?: { name: string };
}

export function AdminReports() {
  const { user, setNotification, setCurrentPage } = useAppStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('TICKETS_SOLD');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setNotification({ message: 'Admin access required', type: 'error' });
      setCurrentPage('login');
      return;
    }
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data.reports || data || []);
    } catch {
      setNotification({ message: 'Failed to load reports', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType, generatedBy: user?.id }),
      });

      if (res.ok) {
        setNotification({ message: 'Report generated successfully', type: 'success' });
        fetchReports();
      } else {
        const data = await res.json();
        setNotification({ message: data.error || 'Failed to generate report', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleView = async (report: Report) => {
    try {
      const res = await fetch(`/api/reports/${report.id}`);
      const data = await res.json();
      setSelectedReport(data.report || data);
      setViewDialogOpen(true);
    } catch {
      setNotification({ message: 'Failed to load report', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification({ message: 'Report deleted', type: 'success' });
        fetchReports();
      }
    } catch {
      setNotification({ message: 'Network error', type: 'error' });
    }
  };

  const handleDownload = (report: Report) => {
    let data = report.data;
    try {
      const parsed = JSON.parse(report.data);
      data = JSON.stringify(parsed, null, 2);
    } catch {}

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotification({ message: 'Report downloaded', type: 'success' });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TICKETS_SOLD': return 'Tickets Sold';
      case 'DAILY_BOOKINGS': return 'Daily Bookings';
      case 'CANCELLED_BOOKINGS': return 'Cancelled Bookings';
      case 'PASSENGER_LIST': return 'Passenger List';
      case 'EMPLOYEE_ASSIGNMENTS': return 'Employee Assignments';
      default: return type;
    }
  };

  const renderReportData = (report: Report) => {
    try {
      const data = JSON.parse(report.data);
      if (Array.isArray(data)) {
        if (data.length === 0) return <p className="text-gray-500">No data in this report</p>;
        const keys = Object.keys(data[0]);
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {keys.map((key) => (
                    <TableHead key={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row: Record<string, unknown>, i: number) => (
                  <TableRow key={i}>
                    {keys.map((key) => (
                      <TableCell key={key} className="text-sm">
                        {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      } else {
        return (
          <div className="space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 border-b">
                <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        );
      }
    } catch {
      return <p className="text-gray-500 text-sm">{report.data}</p>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Generate and view system reports</p>
      </div>

      {/* Generate Report */}
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-red-600" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TICKETS_SOLD">Tickets Sold</SelectItem>
                <SelectItem value="DAILY_BOOKINGS">Daily Bookings</SelectItem>
                <SelectItem value="CANCELLED_BOOKINGS">Cancelled Bookings</SelectItem>
                <SelectItem value="PASSENGER_LIST">Passenger List</SelectItem>
                <SelectItem value="EMPLOYEE_ASSIGNMENTS">Employee Assignments</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleGenerate}
              disabled={generating}
            >
              <Plus className="h-4 w-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Generated By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(report.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{report.user?.name || 'System'}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleView(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(report)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(report.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      No reports yet. Generate your first report above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedReport && renderReportData(selectedReport)}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
