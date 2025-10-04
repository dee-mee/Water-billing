
import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { api } from '../services/api';
import { Bill } from '../types';
import UsageChart from './UsageChart';

const BillStatusBadge: React.FC<{ status: Bill['status'] }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    const statusClasses = {
        Paid: "bg-green-100 text-green-800",
        Unpaid: "bg-yellow-100 text-yellow-800",
        Overdue: "bg-red-100 text-red-800"
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const PaymentModal: React.FC<{ bill: Bill; onClose: () => void; onPaymentSuccess: () => void }> = ({ bill, onClose, onPaymentSuccess }) => {
    const [phone, setPhone] = useState('');
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');
    
    const handlePay = async () => {
        if (!/^\d{10,12}$/.test(phone)) {
            setError('Please enter a valid phone number (e.g., 254712345678).');
            return;
        }
        setError('');
        setPaying(true);
        const success = await api.payBill(bill.id, phone);
        setPaying(false);
        if (success) {
            onPaymentSuccess();
        } else {
            setError('Payment failed. Please try again.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-2 text-primary">Pay Bill with M-Pesa</h3>
                <p className="text-gray-600 mb-4">You are paying <span className="font-bold">KES {bill.amountDue.toFixed(2)}</span> for {bill.period}.</p>
                <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
                    <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 254712345678" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handlePay} disabled={paying} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400">
                        {paying ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const fetchBills = React.useCallback(async () => {
    if (user) {
      setLoading(true);
      const userBills = await api.fetchBillsForCustomer(user.id);
      setBills(userBills);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const latestBill = bills.find(b => b.status === 'Unpaid' || b.status === 'Overdue');
  
  const handlePaymentSuccess = () => {
    setSelectedBill(null);
    fetchBills();
    // In a real app, a success toast notification would be shown here.
    alert('Payment successful! Your bill has been updated.');
  }

  if (loading) return <div className="text-center p-8">Loading your dashboard...</div>;

  return (
    <div className="space-y-8">
      {latestBill && (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-accent">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                  <h2 className="text-2xl font-bold text-gray-800">Current Bill: {latestBill.period}</h2>
                  <p className="text-gray-500">Due on {new Date(latestBill.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                  <p className="text-gray-600">Amount Due</p>
                  <p className="text-4xl font-bold text-primary">KES {latestBill.amountDue.toFixed(2)}</p>
                  <button onClick={() => setSelectedBill(latestBill)} className="mt-2 w-full md:w-auto bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors">
                      Pay Now
                  </button>
              </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Billing History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {bills.map(bill => (
                    <div key={bill.id} className="flex justify-between items-center p-3 rounded-md bg-gray-50 hover:bg-gray-100">
                        <div>
                            <p className="font-semibold text-gray-800">{bill.period}</p>
                            <p className="text-sm text-gray-500">Consumed: {bill.consumption} m³</p>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-gray-800">KES {bill.amountDue.toFixed(2)}</p>
                           <BillStatusBadge status={bill.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Water Usage (m³)</h3>
            <UsageChart data={bills.slice().reverse()} />
        </div>
      </div>
      
      {selectedBill && <PaymentModal bill={selectedBill} onClose={() => setSelectedBill(null)} onPaymentSuccess={handlePaymentSuccess} />}
    </div>
  );
};

export default CustomerDashboard;