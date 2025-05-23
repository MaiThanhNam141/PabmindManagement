import { useState, useContext } from 'react';
import Logo from "../assets/logo.png";
import { auth } from "../firebase/config"
import Swal from 'sweetalert2';
import { signInWithEmailAndPassword } from "@firebase/auth";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContextInstance";
import loadingGif from '../assets/loading.gif';
import ReCAPTCHA from "react-google-recaptcha";

import '../style/Login.css'
import { errorAlert, successAlert } from '../component/SwalAlert.tsx';

const Login = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);

    const navigate = useNavigate();

    const { dispatch } = useContext(AuthContext)

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        if (!captchaValue) {
            errorAlert("Vui lòng xác nhận bạn không phải là robot.")
            setError("Vui lòng xác nhận bạn không phải là robot.")
            return;
        }

        Swal.fire({
            title: 'Đang đăng nhập...',
            html: `<img src="${loadingGif}" alt="Loading" style="width: 350px; height: 150px;" />`,
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            didDestroy: () => {
                Swal.hideLoading();
            },
            didClose: () => {
                Swal.hideLoading();
            },
        });
        const e = email.trim();
        const p = password.trim();
        if (!e || e.length < 6) {
            errorAlert("Email quá ngắn. Vui lòng thử lại.")
            setError("Email quá ngắn. Vui lòng thử lại.")
            return null;
        }
        if (!p || p.length < 6) {
            errorAlert("Mật khẩu quá ngắn. Vui lòng thử lại.")
            setError("Mật khẩu quá ngắn. Vui lòng thử lại.")
            return null;
        }

        try {
            await signInWithEmailAndPassword(auth, e, p)
                .then((userCredential) => {
                    successAlert("Bạn đã đăng nhập thành công vào hệ thống.")
                    const user = userCredential.user;
                    dispatch({ type: "LOGIN", payload: user });
                    navigate("/")
                    setError("");
                })
                .catch((error) => {
                    errorAlert("Email hoặc mật khẩu không đúng. Vui lòng thử lại")
                    setError(error.message);
                })
        } catch (error) {
            console.error("signin function error: ", error)
        }
    };

    return (
        <>
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>
                    <img
                        alt="Logo"
                        src={Logo}
                        style={{ width: '20%', marginBottom: '20px' }}
                    />
                </div>
                <div style={{ width: '65%', height: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }} >
                    <form action="#" method="POST" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="email" style={{ color: '#87bc9d', fontWeight: 'bold' }}>
                                Email
                            </label>
                            <div >
                                <input
                                    placeholder='Email'
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px', width: '50%', marginTop: '10px', marginBottom: '10px' }}
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ marginBottom: '15px' }}>
                                <label htmlFor="password" style={{ color: '#87bc9d', fontWeight: 'bold' }}>
                                    Mật khẩu
                                </label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <input
                                    placeholder='Mật khẩu'
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px', width: '50%', marginTop: '10px', marginBottom: '10px' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleShowPassword}
                                    style={{ marginTop: '5px', background: 'transparent', border: 'none', cursor: 'pointer', width: '40px', height: '40px', position: 'absolute', right: '33%' }}
                                >
                                    {!showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"

                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.98 8.223C5.773 6.11 8.53 4.5 12 4.5c4.065 0 6.896 2.207 8.763 4.334.777.86 1.35 1.733 1.688 2.393a2.11 2.11 0 010 1.546c-.337.66-.91 1.534-1.688 2.394-1.867 2.127-4.698 4.334-8.763 4.334-3.47 0-6.227-1.61-8.02-3.723M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 3l18 18"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"

                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.458 12C3.732 7.943 7.345 4.5 12 4.5c4.655 0 8.268 3.443 9.542 7.5-1.274 4.057-4.887 7.5-9.542 7.5-4.655 0-8.268-3.443-9.542-7.5z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                                <ReCAPTCHA
                                    sitekey={import.meta.env.VITE_GOOGLE_CAPTCHA}
                                    onChange={setCaptchaValue}
                                />
                            </div>

                        </div>

                        <div>
                            <button
                                type="submit"
                                onClick={handleLogin}
                                className='btn'
                            >
                                Đăng nhập
                            </button>
                        </div>
                    </form>
                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                </div>
            </div>
        </>
    );
};

export default Login;
