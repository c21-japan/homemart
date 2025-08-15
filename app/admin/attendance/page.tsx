'use client';

import { useState, useEffect } from 'react';

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        // モックデータ
        const mockRecords = [
          {
            id: 1,
            employeeName: '田中太郎',
            date: '2025-08-15',
            checkIn: '09:00',
            checkOut: '18:00',
            breakTime: '60分',
            workingHours: '8時間',
            status: '出勤'
          },
          {
            id: 2,
            employeeName: '佐藤花子',
            date: '2025-08-15',
            checkIn: '09:15',
            checkOut: '17:45',
            breakTime: '60分',
            workingHours: '7時間30分',
            status: '出勤'
          },
          {
            id: 3,
            employeeName: '山田次郎',
            date: '2025-08-15',
            checkIn: '-',
            checkOut: '-',
            breakTime: '-',
            workingHours: '-',
            status: '欠勤'
          }
        ];
        setAttendanceRecords(mockRecords);
      } catch (error) {
        console.error('勤怠データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [dateFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case '出勤':
        return 'bg-green-100 text-green-800';
      case '遅刻':
        return 'bg-yellow-100 text-yellow-800';
      case '欠勤':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">勤怠管理</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          勤怠登録
        </button>
      </div>

      <div className="mb-4 flex space-x-4">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="today">今日</option>
          <option value="week">今週</option>
          <option value="month">今月</option>
        </select>
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  従業員名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  出勤時刻
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  退勤時刻
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  労働時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.employeeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.workingHours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">編集</button>
                    <button className="text-red-600 hover:text-red-900">削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {attendanceRecords.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">勤怠記録が見つかりません</p>
        </div>
      )}
    </div>
  );
}
