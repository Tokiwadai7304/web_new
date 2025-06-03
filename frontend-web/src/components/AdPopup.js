import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdPopup.css';

function AdPopup() {
  const { user } = useAuth();
  const userRole = user?.role;
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Kiểm tra cookie
    const adDismissed = document.cookie.split('; ').some(row => row.startsWith('adDismissed=true'));
    if (adDismissed) {
      console.log('Ad already dismissed, not showing popup.');
      return;
    }

    // Không hiển thị popup cho admin
    if (userRole === 'admin') {
      console.log('User is admin, not showing popup.');
      return;
    }

    // Hiển thị popup sau 10 giây
    const timer = setTimeout(() => {
      console.log('10 seconds passed, showing popup...');
      setShowPopup(true);
    }, 10000); // 10000 ms = 10 giây

    return () => clearTimeout(timer); // Xóa hẹn giờ khi component unmount
  }, [userRole]);

  const handleClosePopup = () => {
    setShowPopup(false);
    // Đặt cookie để ghi nhớ rằng quảng cáo đã được đóng
    document.cookie = "adDismissed=true; path=/; max-age=" + 60 * 60 * 24 * 365; // Hết hạn sau 1 năm
    console.log('Ad dismissed, cookie set.');
  };

  if (!showPopup) {
    return null; // Không render gì nếu popup không hoạt động
  }

  return (
    <div className="ad-popup-overlay">
      <div className="ad-popup-content">
        <button className="ad-popup-close-button" onClick={handleClosePopup}>
          X
        </button>
        <h3>Ưu đãi đặc biệt!</h3>
        <p>Kiểm tra các tính năng mới tuyệt vời của chúng tôi! Nhấp vào đây để tìm hiểu thêm.</p>
        {/* Thay đổi link ở đây */}
        <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">
          Tìm hiểu thêm
        </a>
      </div>
    </div>
  );
}

export default AdPopup;