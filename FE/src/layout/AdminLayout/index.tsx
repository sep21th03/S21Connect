"use client";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { Container } from "reactstrap";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AdminHeader />
      <Container fluid className="page-body admin-layout d-flex">
        <AdminSidebar />
        <main className="flex-grow-1 p-4">
          {children}
        </main>
      </Container>
    </>
  );
};

export default AdminLayout;
