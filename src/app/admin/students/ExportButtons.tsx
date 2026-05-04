'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ExportData {
    id: string;
    progress: any;
    completion_percentage?: number;
    enrolled_at: string;
    course_id: string;
    user_id: string;
    user: any;
    course: any;
}

export function ExportButtons({ data, crmStatuses }: { data: ExportData[], crmStatuses: Record<string, string> }) {

    // Function to calculate completed modules 
    const calculateProgress = (progressObj: any) => {
        if (!progressObj || typeof progressObj !== 'object') return 0;
        const moduleKeys = Object.keys(progressObj).filter(k => k !== 'last_module');
        return moduleKeys.filter(k => progressObj[k] === true).length;
    };

    const processData = () => {
        return data.map(enr => {
            const user = Array.isArray(enr.user) ? enr.user[0] : enr.user;
            const course = Array.isArray(enr.course) ? enr.course[0] : enr.course;

            return {
                'Họ và tên': user?.full_name || 'Khách',
                'Email': user?.email || '',
                'Khóa học': course?.title || '',
                'Ngày đăng ký': formatDate(enr.enrolled_at),
                'Số bài đã học': calculateProgress(enr.progress),
                'Trạng thái CRM': crmStatuses[enr.id] || 'Mới',
                'Giá trị VNĐ': course?.price_vnd || 0
            };
        });
    };

    const downloadCSV = () => {
        const rows = processData();
        if (rows.length === 0) return;

        const headers = Object.keys(rows[0]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => headers.map(header => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Add BOM for UTF-8 to support Vietnamese characters in Excel
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `crm-hoc-vien-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    const downloadExcel = () => {
        const rows = processData();
        if (rows.length === 0) return;

        let table = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
        table += '<head><meta charset="UTF-8"></head><body><table border="1">';

        // Headers
        const headers = Object.keys(rows[0]);
        table += '<tr>' + headers.map(h => `<th style="background-color: #f3f4f6;">${h}</th>`).join('') + '</tr>';

        // Rows
        rows.forEach(row => {
            table += '<tr>' + headers.map(h => `<td>${row[h as keyof typeof row]}</td>`).join('') + '</tr>';
        });

        table += '</table></body></html>';

        const blob = new Blob([table], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `crm-hoc-vien-${new Date().toISOString().slice(0, 10)}.xls`;
        link.click();
    };

    return (
        <div className="flex gap-2">
            <Button onClick={downloadCSV} variant="outline" size="sm" className="hidden sm:flex">
                <Download size={15} className="mr-1.5" /> Xuất CSV
            </Button>
            <Button onClick={downloadExcel} variant="outline" size="sm" className="hidden sm:flex text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20">
                <FileSpreadsheet size={15} className="mr-1.5" /> Xuất Excel
            </Button>
        </div>
    );
}
