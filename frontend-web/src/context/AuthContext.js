import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Thư viện để giải mã JWT

// Cài đặt thư viện này: npm install jwt-decode

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin người dùng
  const [token, setToken] = useState(localStorage.getItem('token')); // Lấy token từ localStorage
  const [loading, setLoading] = useState(true); // Trạng thái tải (khi kiểm tra token ban đầu)

  useEffect(() => {
    const loadUser = () => {
      if (token) {
        try {
          const decoded = jwtDecode(token); // Giải mã token để lấy thông tin người dùng
          // Kiểm tra xem token đã hết hạn chưa
          if (decoded.exp * 1000 < Date.now()) { // exp tính bằng giây, Date.now() tính bằng mili giây
            logout(); // Nếu hết hạn thì đăng xuất
          } else {
            // Đặt thông tin người dùng vào state
            setUser({
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
            });
          }
        } catch (err) {
          console.error("Invalid token:", err);
          logout(); // Token không hợp lệ thì đăng xuất
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]); // Chạy lại khi token thay đổi

  // Hàm đăng nhập
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/signin', { email, password });
      const newToken = response.data.token;
      localStorage.setItem('token', newToken); // Lưu token
      setToken(newToken); // Cập nhật state token
      const decoded = jwtDecode(newToken);
      setUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      });
      return response.data; // Trả về phản hồi từ backend
    } catch (error) {
      throw error; // Ném lỗi để component gọi có thể xử lý
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      // Gọi API đăng xuất của backend để xóa cookie (nếu backend có API này)
      // Dựa trên authRouter.js, bạn có authRouter.post('/signout', authController.signout);
      await axios.post('http://localhost:8000/api/auth/signout');
    } catch (error) {
      console.error("Error during backend logout:", error);
    } finally {
      localStorage.removeItem('token'); // Xóa token khỏi localStorage
      setToken(null); // Đặt lại state token
      setUser(null); // Đặt lại state user
    }
  };

  // Giá trị sẽ được cung cấp cho các component con
  const authContextValue = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user, // Kiểm tra xem người dùng đã đăng nhập chưa
    isAdmin: user && user.role === 'admin', // Kiểm tra xem người dùng có phải admin không
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Tạo hook tùy chỉnh để dễ dàng sử dụng Context
export const useAuth = () => {
  return useContext(AuthContext);
};