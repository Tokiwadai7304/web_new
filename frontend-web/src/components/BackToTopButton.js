import React, { useState, useEffect } from 'react';
import './BackToTopButton.css'; // Chúng ta sẽ tạo file CSS này ngay sau đây

function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Hiển thị nút khi người dùng cuộn xuống một khoảng nhất định
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) { // Bạn có thể điều chỉnh giá trị 300px này
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Cuộn lên đầu trang một cách mượt mà
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    // Cleanup function để xóa event listener khi component unmount
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="back-to-top-container">
      {isVisible && (
        <button onClick={scrollToTop} className="back-to-top-button" title="Go to top">
          &uarr; {/* Hoặc bạn có thể dùng một icon SVG hoặc FontAwesome */}
        </button>
      )}
    </div>
  );
}

export default BackToTopButton;