import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import { EmailAddress, ForgetPassword, Login, Password, RememberMe, SignUp } from "../../../utils/constant";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/hooks";
import { login, clearError } from "@/redux-toolkit/slice/authSlice";

const AuthenticationForm: React.FC = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading, error, isAuthenticated } = useAppSelector((state) => state.AuthSlice);

  useEffect(() => {
    dispatch(clearError());
    
    if (isAuthenticated) {
      router.push("/newsfeed/style2");
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, isAuthenticated, router]);

  const formSubmitHandle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try{
      const resultAction = await dispatch(
        login({
          email,
          password,
          callbackUrl: "/newsfeed/style2",
        })
      ).unwrap();
  
      if (resultAction.success) {
        toast.success("Đăng nhập thành công......");
        router.push("/newsfeed/style2");
      } else {
        toast.error("Thông tin đăng nhập không chính xác...");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi trong quá trình đăng nhập...");
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Form className='theme-form' onSubmit={(event) => formSubmitHandle(event)}>
      <FormGroup>
        <Label>{EmailAddress}</Label>
        <Input type='email' placeholder='Test@gmail.com' defaultValue={email}   onChange={(event) => setEmail(event.target.value)}  />
        <DynamicFeatherIcon iconName='User' className='input-icon iw-20 ih-20' />
      </FormGroup>
      <FormGroup>
        <Label>{Password}</Label>
        <Input type={show ? "text" : "password"} placeholder='*********' defaultValue={password} onChange={(event) => setPassword(event.target.value)} />
        <DynamicFeatherIcon iconName='Eye' className='input-icon iw-20 ih-20' onClick={() => setShow(!show)} />
      </FormGroup>
      <div className='bottom-sec'>
        <div className='form-check checkbox_animated'>
          <Input type='checkbox' className='form-check-input' id='exampleCheck1' />
          <label className='form-check-label' htmlFor='exampleCheck1'>
            {RememberMe}
          </label>
        </div>
        <a href='#' className='forget-password'>
          {ForgetPassword}
        </a>
      </div>
      <div className='btn-section'>
      <Button 
          type='submit' 
          className='btn btn-solid btn-lg'
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : Login}
        </Button>
        <Link href='/auth/register' className='btn btn-solid btn-lg ms-auto'>
          {SignUp}
        </Link>
      </div>
    </Form>
  );
};

export default AuthenticationForm;
