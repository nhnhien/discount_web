// Login.js
import { useState, useEffect } from "react";
import {
  auth,
  provider,
  signInWithPopup,
  signOut,
} from "../../config/firebase.config";
import { Button, Card, Avatar } from "antd";
import { GoogleOutlined, LogoutOutlined } from "@ant-design/icons";

const SignInScreen = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    console.log(user);
    localStorage.removeItem("user");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="shadow-lg p-6 rounded-lg w-96 text-center">
        {user ? (
          <>
            <Avatar size={64} src={user.photoURL} />
            <h2 className="mt-2 text-lg font-semibold">{user.displayName}</h2>
            <p className="text-gray-500">{user.email}</p>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              className="mt-4 w-full"
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">Đăng nhập</h2>
            <Button
              type="primary"
              icon={<GoogleOutlined />}
              className="w-full"
              onClick={handleLogin}
            >
              Đăng nhập với Google
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default SignInScreen;