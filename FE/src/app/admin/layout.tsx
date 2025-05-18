import AdminLayout from "@/layout/AdminLayout";
import PermissionDenied from "@/app/404/user/PermissionDenied ";
import { getServerSession } from "next-auth/next";
import { authoption } from "@/app/api/auth/[...nextauth]/authOption"; 

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authoption);
  if (!session?.user.is_admin) {
    return <PermissionDenied />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
