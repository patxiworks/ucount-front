// pages/admin.tsx
import AdminQRCode from "@/components/QRcode/adminQRCode";

export default function AdminDashboard() {
  return (
    <div className=" bg-gray-100">
        <div className="p-[40px_40px_0_40px] ">

        </div>
      <div className="flex flex-col items-center min-h-screen">
        <h3 className="text-2xl font-bold text-blue-600 mb-4">
          Admin Dashboard
        </h3>
        <AdminQRCode />
      </div>
    </div>
  );
}
