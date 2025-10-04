# AquaTrack Water Management System

AquaTrack is a modern, comprehensive water management system designed to streamline billing and account management for both customers and administrators. This frontend application is built with React and TypeScript, providing a responsive, feature-rich user interface that simulates all major functionalities of a real-world water utility portal.

## Key Features

### For Customers:
- **Secure Authentication:** Secure login and signup functionality.
- **Dashboard Overview:** At-a-glance view of the current bill and recent water usage.
- **Billing History:** A dedicated page to view, sort, and filter all past and present bills.
- **Usage Analytics:** Visualize water consumption patterns with an interactive chart and key metrics.
- **Profile Management:** View and update personal account information.
- **Online Payments:** Simulate bill payments using a mock M-Pesa payment modal.
- **Invoice Export:** Download any bill as a professional-looking PDF invoice.

### For Administrators:
- **Secure Admin Login:** Separate, role-based access for administrators.
- **Statistics Dashboard:** A high-level overview of key system metrics like total customers, overdue bills, and total amounts due.
- **Full Customer Management (CRUD):** Add, view, edit, and delete customer accounts.
- **Centralized Bill Management:** A dedicated page to view, filter, and manage every bill in the system.
- **Bill Approval Workflow:** A crucial feature for admins to review and approve newly generated bills before they are sent to customers.
- **Manual Bill Adjustments:** Manually add, edit, or delete bills for any customer to handle corrections or special cases.
- **Bulk Meter Reading Upload:** Save time by uploading an Excel or CSV file to update multiple meter readings and generate bills at once.
- **Consumption Metrics:** View a detailed breakdown of water consumption per meter across all customers.
- **Data Export:** Export customer lists, bill lists, and meter metrics as CSV files for reporting and analysis.
- **Admin User Management:** Add or remove other administrator accounts.

## Tech Stack

- **Frontend:** React 19, TypeScript
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **Charting:** Recharts
- **File Handling:** SheetJS (for CSV/Excel), jsPDF (for PDF generation)
- **State Management:** React Context API for authentication.
- **Build/Setup:** This project is set up to run in a modern browser-based environment using ES modules and an import map. No local bundler (like Vite or Webpack) is required.

---

## Local Development Setup

Follow these instructions to get the project running on your local machine.

### Prerequisites
- A modern web browser that supports ES modules (e.g., Chrome, Firefox, Edge).
- A local web server to serve the files. The `live-server` VS Code extension is a great choice.

### Installation & Running the App

1.  **Place Files:** Ensure all the project files (`index.html`, `index.tsx`, `App.tsx`, etc.) are in the same root directory.

2.  **Install `live-server` (if needed):**
    - Open Visual Studio Code.
    - Go to the Extensions view (Ctrl+Shift+X).
    - Search for "Live Server" and install it.

3.  **Start the Development Server:**
    - Open the project folder in VS Code.
    - Right-click on the `index.html` file in the file explorer.
    - Select "Open with Live Server".

4.  **Access the Application:**
    - Your browser will automatically open to the correct address (usually `http://127.0.0.1:5500`).
    - The application will be running.

### Test Credentials
You can use the following mock credentials to test the application:

-   **Customer Account:**
    -   **Email:** `customer@aquatrack.com`
    -   **Password:** `password`
-   **Admin Account:**
    -   **Email:** `admin@aquatrack.com`
    -   **Password:** `password`

---

## Guide to Production Deployment

This project currently uses a mock API (`services/api.ts`) that simulates a backend and database. To deploy this to a live production environment, you will need to build a real backend server and connect it to a managed database.

### The Production Architecture

The full application will consist of three main parts hosted separately:

1.  **Frontend (This React App):** A static site hosted on a service like Netlify or Vercel.
2.  **Backend (API Server):** A server application (e.g., Node.js/Express, Python/Django) that handles business logic. Hosted on a service like Render or Heroku.
3.  **Database:** A managed database service (e.g., Supabase, Neon, AWS RDS) to store data permanently.

### Step-by-Step Deployment Guide

1.  **Set Up a Managed Database:**
    -   Choose a managed database provider (e.g., Supabase for PostgreSQL).
    -   Create a new database instance. The provider will give you a **Database Connection URL**. Keep this secure.
    -   Run the SQL schema (based on `types.ts`) to create your `users`, `customers`, and `bills` tables.

2.  **Build the Backend API:**
    -   Create a new project for your backend server (e.g., using Node.js with Express, or Python with Django).
    -   The functions in `services/api.ts` serve as a perfect blueprint for your API endpoints. For every function (e.g., `fetchAllCustomers`), create a corresponding API route (e.g., `GET /api/customers`).
    -   Implement the logic for each endpoint to query your managed database.
    -   **Crucially, never store plain-text passwords.** Use a library like `bcrypt` to hash passwords upon signup and compare hashes during login.

3.  **Deploy the Backend:**
    -   Choose a hosting service for your backend (e.g., Render).
    -   Connect your backend's Git repository to the service.
    -   In the service's dashboard, set an environment variable (e.g., `DATABASE_URL`) and paste your secure Database Connection URL from Step 1.
    -   Deploy the application. The service will give you a public URL for your API (e.g., `https://aquatrack-api.onrender.com`).

4.  **Prepare and Deploy the Frontend:**
    -   **Update the API file:** In your React project, modify the `services/api.ts` file. Replace all mock logic with `fetch()` calls to your live backend API URL.
        ```typescript
        // Before
        // export const api = {
        //   fetchAllCustomers: async (): Promise<Customer[]> => {
        //       await simulateDelay(700);
        //       return [...MOCK_CUSTOMERS];
        //   },
        // }

        // After
        const API_BASE_URL = 'https://aquatrack-api.onrender.com/api'; // Your live backend URL

        export const api = {
          fetchAllCustomers: async (): Promise<Customer[]> => {
              const response = await fetch(`${API_BASE_URL}/customers`);
              if (!response.ok) throw new Error('Failed to fetch');
              return await response.json();
          },
          // ...update all other functions
        }
        ```
    -   **Deploy:** Choose a static hosting service (e.g., Netlify, Vercel).
    -   Connect your frontend's Git repository.
    -   Since this project does not have a build step, you can configure the service to deploy the root directory directly.
    -   Your frontend will now be live and communicating with your real backend and database.
