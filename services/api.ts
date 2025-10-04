import { User, UserRole, Bill, Customer, DashboardStats, BulkUploadResult, BillWithCustomerInfo, MeterMetric, CustomerProfile } from '../types';

// MOCK DATABASE
let MOCK_USERS: User[] = [
  { id: '1', name: 'John Doe', email: 'customer@aquatrack.com', role: UserRole.CUSTOMER, accountNumber: 'AT-001' },
  { id: '2', name: 'Admin User', email: 'admin@aquatrack.com', role: UserRole.ADMIN },
  { id: 'admin-2', name: 'Alice Admin', email: 'alice@aquatrack.com', role: UserRole.ADMIN },
];

let MOCK_CUSTOMERS: Customer[] = [
    { id: '1', name: 'John Doe', accountNumber: 'AT-001', meterNumber: 'MT-123', phone: '254712345678', lastReading: 1200, lastReadingDate: '2024-07-01' },
    { id: '3', name: 'Jane Smith', accountNumber: 'AT-002', meterNumber: 'MT-456', phone: '254787654321', lastReading: 850, lastReadingDate: '2024-07-01' },
];

let MOCK_BILLS: Bill[] = [
  { id: 'b1', customerId: '1', period: 'July 2024', previousReading: 1150, currentReading: 1200, consumption: 50, rate: 1.5, amountDue: 75, dueDate: '2024-08-15', status: 'Paid', approved: true },
  { id: 'b2', customerId: '1', period: 'August 2024', previousReading: 1200, currentReading: 1265, consumption: 65, rate: 1.5, amountDue: 97.5, dueDate: '2024-09-15', status: 'Unpaid', approved: true },
  { id: 'b3', customerId: '3', period: 'August 2024', previousReading: 850, currentReading: 890, consumption: 40, rate: 1.5, amountDue: 60, dueDate: '2024-09-15', status: 'Pending Approval', approved: false },
  { id: 'b4', customerId: '1', period: 'June 2024', previousReading: 1100, currentReading: 1150, consumption: 50, rate: 1.5, amountDue: 75, dueDate: '2024-07-15', status: 'Paid', approved: true },
];

// MOCK API FUNCTIONS
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  login: async (email: string, pass: string): Promise<User | null> => {
    await simulateDelay(500);
    // In a real app, passwords would be hashed.
    if (pass === 'password') {
        const user = MOCK_USERS.find(u => u.email === email);
        return user || null;
    }
    return null;
  },

  signup: async (userData: { name: string, email: string, phone: string, pass: string }): Promise<User> => {
    await simulateDelay(800);
    const { name, email, phone } = userData;
    
    if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('An account with this email already exists.');
    }
    
    const customerId = `c${Date.now()}`;
    const newAccountNumber = `AT-${String(MOCK_CUSTOMERS.length + 1).padStart(3, '0')}`;
    const newMeterNumber = `MT-${Math.floor(Math.random() * 900) + 100}`;
    
    const newCustomer: Customer = {
        id: customerId,
        name,
        accountNumber: newAccountNumber,
        meterNumber: newMeterNumber,
        phone,
        lastReading: 0, // Initial reading
        lastReadingDate: new Date().toISOString().split('T')[0],
    };
    MOCK_CUSTOMERS.push(newCustomer);
    
    const newUser: User = {
        id: customerId, // Use same ID for simplicity
        name,
        email,
        role: UserRole.CUSTOMER,
        accountNumber: newAccountNumber,
    };
    MOCK_USERS.push(newUser);
    
    return newUser;
  },
  
  fetchBillsForCustomer: async (customerId: string): Promise<Bill[]> => {
    await simulateDelay(800);
    return MOCK_BILLS.filter(bill => bill.customerId === customerId).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  },

  fetchAllBills: async (): Promise<BillWithCustomerInfo[]> => {
    await simulateDelay(1000);
    return MOCK_BILLS.map(bill => {
        const customer = MOCK_CUSTOMERS.find(c => c.id === bill.customerId);
        return {
            ...bill,
            customerName: customer?.name || 'Unknown',
            customerAccountNumber: customer?.accountNumber || 'N/A',
        };
    }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  },
  
  fetchAllCustomers: async (): Promise<Customer[]> => {
      await simulateDelay(700);
      return [...MOCK_CUSTOMERS];
  },
  
  getCustomerById: async (customerId: string): Promise<Customer | null> => {
    await simulateDelay(400);
    return MOCK_CUSTOMERS.find(c => c.id === customerId) || null;
  },

  fetchCustomerProfile: async (userId: string): Promise<CustomerProfile | null> => {
      await simulateDelay(500);
      const user = MOCK_USERS.find(u => u.id === userId);
      const customer = MOCK_CUSTOMERS.find(c => c.id === userId);

      if (user && customer) {
          return {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: customer.phone,
              accountNumber: customer.accountNumber,
              meterNumber: customer.meterNumber,
          };
      }
      return null;
  },

  updateCustomerProfile: async (userId: string, data: { name: string, phone: string }): Promise<CustomerProfile | null> => {
      await simulateDelay(700);
      let updatedProfile: CustomerProfile | null = null;
      
      MOCK_USERS = MOCK_USERS.map(user => {
          if (user.id === userId) {
              return { ...user, name: data.name };
          }
          return user;
      });

      MOCK_CUSTOMERS = MOCK_CUSTOMERS.map(customer => {
          if (customer.id === userId) {
              const updatedCustomer = { ...customer, name: data.name, phone: data.phone };
              
              const user = MOCK_USERS.find(u => u.id === userId);
              if (user) {
                  updatedProfile = {
                      id: user.id,
                      name: updatedCustomer.name,
                      email: user.email,
                      phone: updatedCustomer.phone,
                      accountNumber: updatedCustomer.accountNumber,
                      meterNumber: updatedCustomer.meterNumber,
                  };
              }
              return updatedCustomer;
          }
          return customer;
      });

      if (!updatedProfile) throw new Error("User not found");
      return updatedProfile;
  },

  submitMeterReading: async (customerId: string, newReading: number): Promise<Bill> => {
    await simulateDelay(1000);
    const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');
    if (newReading <= customer.lastReading) throw new Error('New reading must be higher than the last reading.');

    const newBill: Bill = {
        id: `b${MOCK_BILLS.length + 1}`,
        customerId,
        period: 'September 2024', // Simplified for demo
        previousReading: customer.lastReading,
        currentReading: newReading,
        consumption: newReading - customer.lastReading,
        rate: 1.5,
        amountDue: (newReading - customer.lastReading) * 1.5,
        dueDate: '2024-10-15',
        status: 'Pending Approval',
        approved: false,
    };

    MOCK_BILLS.push(newBill);
    customer.lastReading = newReading;
    customer.lastReadingDate = new Date().toISOString().split('T')[0];

    return newBill;
  },

  payBill: async (billId: string, phone: string): Promise<boolean> => {
    await simulateDelay(2000);
    console.log(`Simulating Mpesa payment for bill ${billId} from phone ${phone}`);
    const bill = MOCK_BILLS.find(b => b.id === billId);
    if (bill && bill.approved && bill.status !== 'Paid') {
        bill.status = 'Paid';
        return true;
    }
    return false;
  },

  markBillAsPaid: async (billId: string): Promise<boolean> => {
    await simulateDelay(500);
    const bill = MOCK_BILLS.find(b => b.id === billId);
    // Only allow marking as paid if the bill exists and has been approved
    if (bill && bill.approved) {
        bill.status = 'Paid';
        return true;
    }
    // If bill exists but is not approved, or does not exist, return false
    return false;
  },
  
  approveBill: async (billId: string): Promise<boolean> => {
    await simulateDelay(500);
    let billFound = false;
    MOCK_BILLS = MOCK_BILLS.map(bill => {
      if (bill.id === billId) {
        billFound = true;
        return {
          ...bill,
          approved: true,
          status: bill.status === 'Pending Approval' ? 'Unpaid' : bill.status,
        };
      }
      return bill;
    });
    return billFound;
  },

  addBill: async (billData: Omit<Bill, 'id'>): Promise<Bill> => {
      await simulateDelay(600);
      const newBill: Bill = {
          ...billData,
          id: `b${Date.now()}`,
          approved: billData.approved ?? false,
      };
      MOCK_BILLS.push(newBill);
      return newBill;
  },

  updateBill: async (billData: Bill): Promise<Bill> => {
      await simulateDelay(600);
      let billFound = false;
      MOCK_BILLS = MOCK_BILLS.map(b => {
          if (b.id === billData.id) {
              billFound = true;
              return billData;
          }
          return b;
      });
      if (!billFound) throw new Error("Bill not found");
      return billData;
  },

  deleteBill: async (billId: string): Promise<boolean> => {
      await simulateDelay(600);
      const initialLength = MOCK_BILLS.length;
      MOCK_BILLS = MOCK_BILLS.filter(b => b.id !== billId);
      return MOCK_BILLS.length < initialLength;
  },
  
  addCustomer: async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
      await simulateDelay(600);
      const newCustomer: Customer = {
          ...customerData,
          id: `c${Date.now()}`,
      };
      MOCK_CUSTOMERS.push(newCustomer);
      return newCustomer;
  },
  
  updateCustomer: async (customerData: Customer): Promise<Customer> => {
      await simulateDelay(600);
      let customerFound = false;
      MOCK_CUSTOMERS = MOCK_CUSTOMERS.map(c => {
        if (c.id === customerData.id) {
          customerFound = true;
          return customerData;
        }
        return c;
      });
      if (!customerFound) throw new Error("Customer not found");
      return customerData;
  },

  removeCustomer: async (customerId: string): Promise<boolean> => {
      await simulateDelay(600);
      const initialLength = MOCK_CUSTOMERS.length;
      MOCK_CUSTOMERS = MOCK_CUSTOMERS.filter(c => c.id !== customerId);
      
      if (MOCK_CUSTOMERS.length < initialLength) {
          // Also remove associated bills
          MOCK_BILLS = MOCK_BILLS.filter(b => b.customerId !== customerId);
          return true;
      }
      return false;
  },

  fetchAllAdmins: async (): Promise<User[]> => {
    await simulateDelay(500);
    return MOCK_USERS.filter(u => u.role === UserRole.ADMIN);
  },

  addAdmin: async (name: string, email: string): Promise<User> => {
    await simulateDelay(600);
    if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('An admin with this email already exists.');
    }
    const newAdmin: User = {
        id: `admin-${Date.now()}`,
        name,
        email,
        role: UserRole.ADMIN,
    };
    MOCK_USERS.push(newAdmin);
    return newAdmin;
  },

  removeAdmin: async (adminId: string): Promise<boolean> => {
    await simulateDelay(600);
    const initialLength = MOCK_USERS.length;
    MOCK_USERS = MOCK_USERS.filter(u => u.id !== adminId);
    return MOCK_USERS.length < initialLength;
  },

  sendSms: async function(phone: string, message: string): Promise<void> {
    await simulateDelay(200); // Simulate network delay for sending one SMS
    console.log(
      `--- SIMULATING SMS ---\n` +
      `TO: ${phone}\n` +
      `MESSAGE: ${message}\n` +
      `----------------------`
    );
  },

  sendAllPaymentReminders: async function(): Promise<number> {
    await simulateDelay(1000); // Simulate overall operation time
    const overdueBills = MOCK_BILLS.filter(b => b.approved && (b.status === 'Unpaid' || b.status === 'Overdue'));
    let remindersSent = 0;
    
    for (const bill of overdueBills) {
        const customer = MOCK_CUSTOMERS.find(c => c.id === bill.customerId);
        if (customer) {
            const message = `Hello ${customer.name}, this is a reminder that your AquaTrack bill for ${bill.period} of KES ${bill.amountDue.toFixed(2)} is due on ${new Date(bill.dueDate).toLocaleDateString()}. Thank you.`;
            await this.sendSms(customer.phone, message);
            remindersSent++;
        }
    }
    return remindersSent;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
      await simulateDelay(300);
      const billsAwaitingPayment = MOCK_BILLS.filter(b => b.approved && (b.status === 'Unpaid' || b.status === 'Overdue')).length;
      const totalOverdueAmount = MOCK_BILLS.reduce((sum, bill) => {
          // FIX: Corrected typo 'b' to 'bill'. The 'reduce' callback parameter is 'bill'.
          if (bill.approved && (bill.status === 'Unpaid' || bill.status === 'Overdue')) {
              return sum + bill.amountDue;
          }
          return sum;
      }, 0);
      return {
          totalCustomers: MOCK_CUSTOMERS.length,
          billsAwaitingPayment,
          totalOverdueAmount
      };
  },
  
  submitBulkReadings: async (readings: {accountNumber: string, newReading: number}[]): Promise<BulkUploadResult> => {
      await simulateDelay(1500);
      const result: BulkUploadResult = { successCount: 0, errorCount: 0, errors: [] };
      for (const { accountNumber, newReading } of readings) {
          const customer = MOCK_CUSTOMERS.find(c => c.accountNumber === accountNumber);
          if (!customer) {
              result.errorCount++;
              result.errors.push({ accountNumber, reason: "Account number not found." });
              continue;
          }
          if (newReading <= customer.lastReading) {
               result.errorCount++;
               result.errors.push({ accountNumber, reason: `New reading (${newReading}) is not greater than the last reading (${customer.lastReading}).` });
               continue;
          }
          // If valid, create a new bill (simplified from submitMeterReading)
          const newBill: Bill = {
              id: `b${MOCK_BILLS.length + 1}`,
              customerId: customer.id,
              period: 'Bulk Upload ' + new Date().toLocaleDateString(),
              previousReading: customer.lastReading,
              currentReading: newReading,
              consumption: newReading - customer.lastReading,
              rate: 1.5,
              amountDue: (newReading - customer.lastReading) * 1.5,
              dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'Pending Approval',
              approved: false,
          };
          MOCK_BILLS.push(newBill);
          customer.lastReading = newReading;
          customer.lastReadingDate = new Date().toISOString().split('T')[0];
          result.successCount++;
      }
      return result;
  },

  fetchAllMeterMetrics: async (): Promise<MeterMetric[]> => {
    await simulateDelay(900);
    const metrics: MeterMetric[] = MOCK_CUSTOMERS.map(customer => {
        const customerBills = MOCK_BILLS.filter(bill => bill.customerId === customer.id);
        const totalConsumption = customerBills.reduce((total, bill) => total + bill.consumption, 0);
        return {
            meterNumber: customer.meterNumber,
            customerName: customer.name,
            customerAccountNumber: customer.accountNumber,
            totalConsumption: totalConsumption,
        };
    });
    return metrics.sort((a, b) => b.totalConsumption - a.totalConsumption);
  },
};