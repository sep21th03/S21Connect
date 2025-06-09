import { Col } from "reactstrap";
import ArticleAccordion from "./ArticleAccordion";
import Link from "next/link";
import { Href } from '../../utils/constant/index';

const ArticlePart: React.FC = () => {
  return (
    <Col lg="9" className="order-lg-1">
      <div className="article-part">
        <div className="main-title">
          <h2>Cách tạo tài khoản S21connect</h2>
        </div>
        <div className="content">
          <p> S21connect là một trang mạng xã hội. Với tài khoản S21connect, bạn có thể làm những việc như:</p>
          <ul>
            <li>Tạo bạn bè mới</li>
            <li>Tạo sự kiện đáng nhớ</li>
            <li>Kết nối với mọi người</li>
          </ul>
        </div>
        <div className="sub-title">
          <h3>Bước 1: Tạo tài khoản S21connect</h3>
        </div>
        <div className="content">
          <p> Khi bạn tạo tài khoản S21connect, chúng tôi yêu cầu một số thông tin cá nhân. Bằng cách cung cấp thông tin chính xác, bạn có thể giúp giữ an toàn tài khoản của mình và làm cho dịch vụ của chúng tôi hữu ích hơn.</p>
          <ArticleAccordion />
          <div className="inner-title">
            <h4>Sử dụng địa chỉ email hiện có</h4>
          </div>
          <ol>
            <li> Đi đến trang <Link href="/auth/register">Đăng ký S21connect</Link></li>
            <li>Nhập tên của bạn.</li>
            <li>Nhấp vào Sử dụng địa chỉ email hiện có.</li>
            <li>Nhập địa chỉ email hiện có của bạn.</li>
            <li>Nhập địa chỉ email hiện có của bạn.</li>
            <li>Xác thực địa chỉ email của bạn với mã được gửi đến địa chỉ email hiện có của bạn.</li>
            <li>Nhấp vào Xác thực.</li>
          </ol>
        </div>
        <div className="sub-title">
          <h3>Bước 2: Bảo vệ tài khoản của bạn với thông tin khôi phục</h3> 
        </div>
        <div className="content mb-0">
          <p>Nếu bạn quên mật khẩu hoặc ai đó đang sử dụng tài khoản của bạn mà không có sự cho phép của bạn, thông tin khôi phục sẽ giúp tăng khả năng bạn có thể lấy lại tài khoản của mình.</p>
          <ul>
            <li><a href={Href}>Thêm số điện thoại khôi phục</a></li>
            <li><a href={Href}>Thêm địa chỉ email khôi phục</a></li>
          </ul>
        </div>
      </div>
    </Col>
  );
};

export default ArticlePart;
