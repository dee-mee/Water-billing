import React, { useState } from 'react';
import { api } from '../services/api';
import { BulkUploadResult } from '../types';

declare const XLSX: any; // Using SheetJS from CDN

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<BulkUploadResult | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setError('');
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        setError('');
        setProcessing(true);
        setResult(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0 || !json[0].hasOwnProperty('accountNumber') || !json[0].hasOwnProperty('newReading')) {
                    setError('Invalid file format. Please ensure the file has "accountNumber" and "newReading" columns.');
                    setProcessing(false);
                    return;
                }
                
                const readings = json.map(row => ({
                    accountNumber: String(row.accountNumber),
                    newReading: Number(row.newReading)
                }));
                
                const uploadResult = await api.submitBulkReadings(readings);
                setResult(uploadResult);
                if (uploadResult.successCount > 0) {
                    onSuccess();
                }

            } catch (err) {
                console.error(err);
                setError('An error occurred while parsing the file. Please check the file format.');
            } finally {
                setProcessing(false);
            }
        };
        reader.readAsBinaryString(file);
    };
    
    const handleClose = () => {
        setFile(null);
        setError('');
        setResult(null);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
                <h3 className="text-xl font-bold mb-4 text-primary">Bulk Meter Reading Upload</h3>
                
                {!result ? (
                    <>
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                            <h4 className="font-bold">Instructions</h4>
                            <p className="text-sm text-gray-700">
                                Upload an Excel (.xlsx) or CSV file with two columns: <strong>accountNumber</strong> and <strong>newReading</strong>.
                                The first row must be the header.
                            </p>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Select File</label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
                            <button onClick={handleUpload} disabled={processing || !file} className="btn-primary disabled:bg-gray-400">
                                {processing ? 'Processing...' : 'Upload and Process'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <h4 className="font-bold text-lg mb-2">Upload Complete</h4>
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1 bg-green-100 p-3 rounded-md text-center">
                                <p className="text-2xl font-bold text-green-800">{result.successCount}</p>
                                <p className="text-sm text-green-700">Successful Readings</p>
                            </div>
                            <div className="flex-1 bg-red-100 p-3 rounded-md text-center">
                                <p className="text-2xl font-bold text-red-800">{result.errorCount}</p>
                                <p className="text-sm text-red-700">Failed Readings</p>
                            </div>
                        </div>
                        {result.errors.length > 0 && (
                            <div>
                                <h5 className="font-semibold mb-2">Error Details:</h5>
                                <div className="max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50 text-sm">
                                    <ul>
                                        {result.errors.map((err, index) => (
                                            <li key={index} className="py-1 border-b">
                                                <strong>Account {err.accountNumber}:</strong> {err.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                         <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={handleClose} className="btn-primary">Close</button>
                        </div>
                    </div>
                )}
            </div>
             <style>{`.btn-primary { padding: 0.5rem 1rem; background-color: #0077b6; color: white; border-radius: 0.5rem; font-weight: 600; } .btn-secondary { padding: 0.5rem 1rem; background-color: #e9ecef; color: #023e8a; border-radius: 0.5rem; font-weight: 600; }`}</style>
        </div>
    );
};

export default BulkUploadModal;
