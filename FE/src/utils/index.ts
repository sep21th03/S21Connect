import Swal from "sweetalert2"; 

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  export { formatTime };
  
  export const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  

  export const copyLink = (
    id_hoadon: string | number,
    sotien: number,
    type: string = "payment"
  ) => {
    const link = `${window.location.origin}/${type}/${id_hoadon}`;
  
    navigator.clipboard
      .writeText(link)
      .then(() => {
        Swal.fire({
          title: "Đã hiển thị popup chia sẻ và link đã được sao chép!",
          icon: "success",
        });
  
        const title = `Chia Sẻ Hóa Đơn ${id_hoadon}`;
        const text = `Thanh toán ngay hóa đơn ${id_hoadon} với số tiền ${formatCurrency(
          sotien
        )} ngay tại đây: ${link}`;
        share(title, text);
      })
      .catch(() => {
        Swal.fire({
          title: "Không thể sao chép link!",
          icon: "error",
        });
      });
  };

  const share = (title: string, text: string) => {
    if (navigator.share) {
      navigator.share({
        title,
        text,
      });
    } else {
      console.log("Browser không hỗ trợ Web Share API");
    }
  };
  

  export const truncateText = (text: string, length = 60) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };
