"use client";
import React, { useState, useEffect } from "react";
import CommonLayout from "@/layout/CommonLayout";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
  ModalBody,
  ModalFooter,
  FormGroup,
  Form,
  ModalHeader,
  Modal,
  ButtonGroup,
  UncontrolledTooltip,
} from "reactstrap";
import SpaySideBar from "@/layout/CommonLayout/FullSideBar/SpaySideBar";
import styles from "@/style/invoiceCard.module.css";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { formatDateFull } from "@/utils/formatTime";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";

interface Shop {
  id: string;
  name: string;
  username: string;
  created_at: number;
}

const ShopPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [shopData, setShopData] = useState<Shop[]>([]);
  const [reloadCount, setReloadCount] = useState(0);    
  const [name, setName] = useState("");
  const toggleModal = () => setModalOpen(!modalOpen);

  const handleReload = () => {
    setReloadCount((prev) => prev + 1);
  };

  useEffect(() => {
    fetchShopData();
  }, [reloadCount]);

  const fetchShopData = async () => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.PAYMENT.SHOP.GET_SHOP
    );
    if (response.status === 200) {
      setShopData(response.data.data);
    }
  };
  useEffect(() => {
    fetchShopData();
  }, [reloadCount]);

  const deleteShop = async (id: string) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.PAYMENT.SHOP.DELETE_SHOP,
      {
          id: id
      }
    );
    if (response.data.status === "success") {
      Swal.fire({
        title: "Thành công",
        text: "Shop đã được xóa thành công",
        icon: "success",
      });
      setReloadCount((prev) => prev + 1);
    }
  };


  const createShop = async (shop: any) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.PAYMENT.SHOP.CREATE_SHOP,
      shop
    );
    if (response.data.status === "success") {
      Swal.fire({
        title: "Thành công",
        text: "Shop đã được tạo thành công",
        icon: "success",
      });
      setReloadCount((prev) => prev + 1);
    }
  };

  const handleCreateShop = (name: string) => {
    const shop = {
      name: name,
    };
    createShop(shop);
  };

  const renderShopActions = (shop: Shop) => {
    const { id } = shop;
  
    return (
      <ButtonGroup size="sm" className="d-flex flex-wrap gap-2">
        <Button
          id={`btn-delete-${id}`}
          color="danger"
          onClick={() => {
            Swal.fire({
              title: "Bạn có chắc muốn xóa shop này?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Có, xóa",
              cancelButtonText: "Hủy",
            }).then((result) => {
              if (result.isConfirmed) deleteShop(id);
            });
          }}
        >
          <FaTrashAlt />
        </Button>
        <UncontrolledTooltip target={`btn-delete-${id}`}>
          Xóa shop
        </UncontrolledTooltip>
      </ButtonGroup>
    );
  };


  return (
    <CommonLayout mainClass="spay-page custom-padding" loaderName="payment">
      <SpaySideBar />
      <Container fluid className="section-t-space">
        <Row className="mt-4">
          <Col xl="12" xxl="12">
            <Card className={`${styles.styleCard}`}>
              <div
                className={`${styles.CardHeader} d-flex justify-content-between align-items-center`}
              >
                <h4 className={`${styles.cardTitle} mb-0`}>
                  Danh Sách Shop{" "}
                  <a
                    className="change-btn active"
                    href="#"
                    onClick={handleReload}
                    title="Tải lại dữ liệu"
                  >
                    <span className="reload-icon">
                      <i className="fas fa-sync-alt reload_bill active"></i>
                    </span>
                  </a>
                </h4>
                <Button
                  className={`${styles.cartBtn_primary} btn-rounded btn-md`}
                  onClick={toggleModal}
                >
                  Tạo Shop
                </Button>
              </div>
              <CardBody>
                <div className="table-responsive">
                  <table id="list_bill" className="display table">
                    <thead>
                      <tr>
                        <th className={`${styles.thLight} fw-normal`}>ID</th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Tên Shop
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Người dùng
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Ngày Tạo
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Hành Động
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {shopData.map((shop, index) => (
                        <tr key={shop.id}>
                          <td>{index + 1}</td>
                          <td>{shop.name}</td>
                          <td>{shop.username}</td>
                          <td>{formatDateFull(shop.created_at.toString())}</td>
                          <td>{renderShopActions(shop)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <Modal isOpen={modalOpen} toggle={toggleModal} centered size="lg">
        <ModalHeader toggle={toggleModal}>Tạo Hóa Đơn Mới</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="name">Tên Shop:</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Vui lòng nhập tên shop..."
                style={{ fontSize: "18px" }}
                onChange={(e) => setName(e.target.value)}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Đóng
          </Button>
          <Button
            color="solid"
            onClick={() => handleCreateShop(name)}
          >
            Tạo Shop
          </Button>
        </ModalFooter>
      </Modal>
    </CommonLayout>
  );
};

export default ShopPage;
