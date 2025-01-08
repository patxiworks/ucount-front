"use client"

import { SessionProvider } from 'next-auth/react';
//import ProtectedRoute from "@/components/ProtectedRoute";
import Summary from "@/components/Summary/Summary";
import '@/styles/pages.css';



const Dashboard = () => {

  return (
    <div className="form-container">
      <Summary />
    </div>
  );
};

export default function Home() {
  return (
    <SessionProvider>
        <Dashboard />
    </SessionProvider>
  );
}