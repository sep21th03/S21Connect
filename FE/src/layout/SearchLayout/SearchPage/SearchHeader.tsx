import { Container } from "reactstrap";
import RightHeader from "@/layout/CommonLayout/CommonLayoutHeader/RightHeader";
import LeftHeader from "@/layout/CommonLayout/CommonLayoutHeader/LeftHeader";

const SearchHeader = () => {
  return (
    <header className="search-header d-none d-sm-block">
      <div className="mobile-fix-menu" />
      <Container fluid={true} className="custom-padding">
        <div className="header-section">
          <LeftHeader differentLogo={""} />
          <RightHeader total_posts={null} total_friends={null} />
        </div>
      </Container>
    </header>
  );
};

export default SearchHeader;
