import { useState } from "react";
import { Button, Input, Label } from "reactstrap";
import { toast } from "react-toastify";
import fanpageService from "@/service/fanpageService";

interface CreatePageReviewProps {
  pageId: string;
  onReviewCreated: (newReview: any) => void;
}

const CreatePageReview = ({ pageId, onReviewCreated }: CreatePageReviewProps) => {
  const [content, setContent] = useState("");
  const [rate, setRate] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.warning("Vui lòng nhập nội dung đánh giá");
      return;
    }

    if (rate < 1 || rate > 5) {
      toast.warning("Chọn số sao hợp lệ từ 1 đến 5");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fanpageService.storeReview(pageId, {
        content,
        rate,
      });

      if (response) {
        toast.success("Đánh giá thành công");
        setContent("");
        setRate(5);
        onReviewCreated(response);
      } else {
        toast.error("Đăng đánh giá thất bại");
      }
    } catch (error) {
      toast.error("Đăng đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-review p-3 border rounded bg-white">
      <h5 className="mb-3">Đánh giá trang</h5>

      <Label for="review-content">Nội dung</Label>
      <Input
        id="review-content"
        type="textarea"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết cảm nhận của bạn..."
      />

      <Label for="review-rate" className="mt-3">Số sao</Label>
      <Input
        id="review-rate"
        type="select"
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
      >
        {[5, 4, 3, 2, 1].map((star) => (
          <option key={star} value={star}>
            {star} sao
          </option>
        ))}
      </Input>

      <Button
        className="mt-3 btn-solid btn-primary"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </div>
  );
};

export default CreatePageReview;
