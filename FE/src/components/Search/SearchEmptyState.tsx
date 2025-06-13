'use client';

import { Container } from 'reactstrap';
import DynamicFeatherIcon from '@/Common/DynamicFeatherIcon';

const SearchEmptyState = () => {
  return (
    <Container className="mt-4">
      <div className="text-center">
        <DynamicFeatherIcon iconName="Search" className="mb-3" />
        <h4>Nhập từ khóa để tìm kiếm</h4>
        <p className="text-muted">Tìm kiếm bạn bè, bài viết, trang và nhiều hơn nữa</p>
      </div>
    </Container>
  );
};

export default SearchEmptyState;