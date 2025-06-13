'use client'
import React from "react";
import { Button, Container } from "reactstrap";
import { useRouter } from "next/navigation";

const ComingSoonPage = () => {
  const router = useRouter();

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light text-center">
      <Container>
        <h1 className="display-4 fw-bold mb-3">🚧 Tính năng đang ra mắt</h1>
        <p className="lead text-muted mb-4">
          Chúng tôi đang hoàn thiện tính năng này để mang đến trải nghiệm tốt nhất cho bạn.
        </p>
        <Button className="btn-solid btn" onClick={() => router.back()}>
          Quay lại
        </Button>
      </Container>
    </div>
  );
};

export default ComingSoonPage;
