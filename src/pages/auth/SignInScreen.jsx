import { useState, useEffect } from 'react';
import { auth, provider, signInWithPopup } from '../../config/firebase.config';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import {
  Button,
  Card,
  Input,
  message,
} from 'antd';
import {
  GoogleOutlined,
  PhoneOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/context/slice/auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:8000/api/auth/sync-user';

const SignInScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const { t } = useTranslation();

  const [step, setStep] = useState('method'); // method | phone | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clean up recaptcha when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
  
      // 👉 gửi kèm avatar (photoURL) về backend nếu cần
      await syncUserWithBackend(idToken, {
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
      });
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      message.error(t('auth.login_failed'));
    }
  };
  
  const setupRecaptcha = () => {
    // Clear existing recaptcha if it exists
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.error("Error clearing reCAPTCHA:", error);
      }
      window.recaptchaVerifier = null;
    }
    
    try {
      // Create a new recaptcha verifier with minimal options
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
      
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (error) {
      console.error("RecaptchaVerifier creation error:", error);
      message.error("Could not set up verification. Please try again.");
      throw error;
    }
  };

  const handleSendOtp = async () => {
    if (!phone) return message.error(t('auth.enter_phone_required'));
    
    try {
      setLoading(true);
      
      // Format phone number correctly if it doesn't start with +
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      console.log("Setting up reCAPTCHA...");
      const appVerifier = setupRecaptcha();
      
      console.log("Sending OTP to:", formattedPhone);
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      console.log("OTP sent successfully");
      setConfirmationResult(result);
      setStep('otp');
      message.success(t('auth.otp_sent'));
    } catch (error) {
      console.error('OTP Error:', error);
      // More detailed error message to help with debugging
      const errorMsg = error.code 
        ? `${t('auth.otp_failed')}: ${error.code}` 
        : `${t('auth.otp_failed')}: ${error.message}`;
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return message.error(t('auth.enter_otp_required'));
    try {
      setLoading(true);
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      await syncUserWithBackend(idToken);
    } catch (error) {
      console.error(error);
      message.error(t('auth.otp_verify_failed'));
    } finally {
      setLoading(false);
    }
  };

  const syncUserWithBackend = async (idToken, extraData = {}) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(extraData),
      });
  
      const data = await response.json();
      if (response.ok) {
        dispatch(loginSuccess(data.user));
        message.success(t('auth.login_success'));
  
        // ✅ Chuyển hướng theo vai trò
        if (data.user.role === 'owner' || data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
        
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Đồng bộ thất bại:', error);
      message.error(t('auth.sync_failed'));
    }
  };
  
  // 👉 UI render theo step
  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <>
            <h2 className='text-lg font-semibold mb-4'>{t('auth.enter_phone')}</h2>

            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='+84xxxxxxxxx'
              className='mb-4'
            />

            <div id="recaptcha-container"></div>

            <Button type='primary' loading={loading} className='w-full' onClick={handleSendOtp}>
              {t('auth.send_otp')}
            </Button>

            <Button type='link' className='mt-2' onClick={() => setStep('method')}>
              {t('auth.back')}
            </Button>
          </>
        );
      case 'otp':
        return (
          <>
            <h2 className='text-lg font-semibold mb-4'>{t('auth.enter_otp')}</h2>

            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={t('auth.enter_otp')}
              prefix={<LockOutlined />}
              className='mb-4'
            />

            <Button type='primary' loading={loading} className='w-full' onClick={handleVerifyOtp}>
              {t('auth.verify_otp')}
            </Button>
          </>
        );
      default:
        return (
          <>
            <h2 className='text-lg font-semibold mb-4'>{t('auth.choose_method')}</h2>

            <Button type='primary' icon={<GoogleOutlined />} className='w-full mb-3' onClick={handleGoogleLogin}>
              {t('auth.google_login')}
            </Button>

            <Button icon={<PhoneOutlined />} className='w-full' onClick={() => setStep('phone')}>
              {t('auth.phone_login')}
            </Button>
          </>
        );
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <Card className='shadow-lg p-6 rounded-lg w-full max-w-md text-center'>
        {renderStep()}
      </Card>
    </div>
  );
};

export default SignInScreen;