import React from 'react';

declare const XLSX: any; // Using SheetJS from CDN

interface ExportButtonProps {
    data: any[];
    fileName: string;
}

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);


const ExportButton: React.FC<ExportButtonProps> = ({ data, fileName }) => {
    
    const handleExport = () => {
        if (data.length === 0) {
            alert("There is no data to export.");
            return;
        }

        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            
            // Generate CSV string
            XLSX.writeFile(workbook, fileName, { bookType: "csv" });
        } catch (error) {
            console.error("Error exporting to CSV:", error);
            alert("An error occurred while exporting the data.");
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={data.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={data.length === 0 ? "No data to export" : "Export data to CSV"}
        >
            <ExportIcon />
            Export CSV
        </button>
    );
};

export default ExportButton;