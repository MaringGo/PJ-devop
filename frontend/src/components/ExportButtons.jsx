import axios from 'axios';

export const downloadFile = async (url, filename) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(url, {
    responseType: 'blob',
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

const ExportButtons = ({ pdfUrl, excelUrl }) => (
  <div className="flex space-x-3 mb-4">
    <button
      onClick={() => downloadFile(pdfUrl, 'report.pdf')}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
    >
      Export PDF
    </button>
    <button
      onClick={() => downloadFile(excelUrl, 'report.xlsx')}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Export Excel
    </button>
  </div>
);

export default ExportButtons;
