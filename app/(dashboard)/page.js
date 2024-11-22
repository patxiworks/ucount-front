"use client"

import { SessionProvider } from 'next-auth/react';
import ProtectedRoute from "@/components/ProtectedRoute";
import '@/styles/pages.css';



const Dashboard = () => {

  return (
    <div className="form-container">
      <h3>Welcome</h3>

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