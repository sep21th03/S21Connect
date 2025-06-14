import {
  Address,
  BackupEmail,
  City,
  Country,
  DateOfBirth,
  Email,
  FirstName,
  Gender,
  GeneralSettings,
  LastName,
  PhoneNumber,
  SaveChanges,
  State,
} from "../../utils/constant";
import { FormEvent, useEffect, useState } from "react";
import { Button, Col, Input, Label, Row } from "reactstrap";
import { Href } from "../../utils/constant/index";
import { UserRedux } from "@/utils/interfaces/user";
import { settingService } from "@/service/settingService";
import { toast } from "react-toastify";

const GeneralSetting: React.FC<{ user: UserRedux }> = ({ user }) => {
  const [formData, setFormData] = useState<any>({});
  useEffect(() => {
    const getProfile = async () => {
      const response = await settingService.getProfile();
      setFormData(response.data);
    };
    getProfile();
  }, [user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await settingService.updateProfile(formData);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <div className="setting-wrapper">
      <div className="setting-title">
        <h3>{GeneralSettings}</h3>
      </div>
      <div className="form-sec">
        <div>
          <form
            className="theme-form form-sm"
            onSubmit={handleSubmit}
          >
            <Row>
              <Col md="6" className="form-group">
                <Label>{FirstName}</Label>
                <Input
                  type="text"
                  defaultValue={formData.first_name}
                  placeholder="S21"
                />
              </Col>
              <Col md="6" className="form-group">
                <Label>{LastName}</Label>
                <Input
                  type="text"
                  defaultValue={formData.last_name}
                  placeholder="Connect"
                />
              </Col>
              <Col md="6" className="form-group">
                <Label>{Email}</Label>
                <Input type="email" defaultValue={formData.email} disabled/>
              </Col>
              <Col md="6" className="form-group">
                <Label>{BackupEmail}</Label>
                <Input type="email" defaultValue={formData.email} disabled />
              </Col>
              {/* <Col xs="12" className="form-group">
                <Label>{Address}</Label>
                <Input type="text" placeholder="1234 Main St"/>
              </Col>
              <Col md="4" className="form-group">
                <Label>{City}</Label>
                <Input defaultValue="london" type="text"/>
              </Col>
              <Col md="4" className="form-group">
                <Label >{State}</Label>
                <Input type="select" >
                  <option value="">Choose...</option>
                  <option>...</option>
                </Input>
              </Col>
              <Col md="4" className="form-group">
                <Label >{Country}</Label>
                <Input type="select" >
                  <option value="">Choose...</option>
                  <option>...</option>
                </Input>
              </Col> */}
              <Col md="4" className="form-group">
                <Label>{DateOfBirth}</Label>
                <div className="gj-datepicker gj-datepicker-bootstrap gj-unselectable input-group">
                  <Input
                    placeholder="Depart Date"
                    defaultValue={formData.birthday}
                  />
                  <span className="input-group-append">
                    <Button className="btn-outline-secondary border-left-0">
                      <i className="gj-icon">event</i>
                    </Button>
                  </span>
                </div>
              </Col>
              <Col md="4" className="form-group">
                <Label>{PhoneNumber}</Label>
                <Input
                  type="number"
                  className="form-control"
                  id="inputCity"
                  defaultValue={formData.phone_number}
                />
              </Col>
              <Col md="4" className="form-group col-md-4">
                <Label>{Gender}</Label>
                <Input
                  type="select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Chọn giới tính...</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </Input>
              </Col>
            </Row>
            <div className="text-right">
              <Button type="submit" className="btn btn-solid">
                {SaveChanges}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeneralSetting;
