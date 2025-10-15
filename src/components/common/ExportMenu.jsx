import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileJson, Table, Printer, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const ExportMenu = ({
  data,
  filename = 'export',
  onExport,
  type = 'tasks', // 'tasks', 'users', 'performance', 'analytics'
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      toast.error('No data to export');
      return;
    }

    try {
      onExport(format);
      toast.success(`Exported as ${format.toUpperCase()} successfully!`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handlePrint = () => {
    try {
      window.print();
      toast.success('Opening print dialog...');
      setIsOpen(false);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to open print dialog');
    }
  };

  const exportOptions = [
    {
      label: 'Export as CSV',
      icon: Table,
      format: 'csv',
      description: 'Spreadsheet format'
    },
    {
      label: 'Export as JSON',
      icon: FileJson,
      format: 'json',
      description: 'JSON data format'
    },
    {
      label: 'Export as Text',
      icon: FileText,
      format: 'txt',
      description: 'Plain text table'
    },
    {
      label: 'Print / PDF',
      icon: Printer,
      format: 'print',
      description: 'Print or save as PDF'
    }
  ];

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        <Download className="w-5 h-5" />
        Export
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fadeIn">
          <div className="p-2">
            <div className="px-3 py-2 border-b border-gray-200 mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Export Options</p>
            </div>
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => option.format === 'print' ? handlePrint() : handleExport(option.format)}
                className="w-full flex items-start gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-green-100 group-hover:to-emerald-100 transition-all">
                  <option.icon className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
