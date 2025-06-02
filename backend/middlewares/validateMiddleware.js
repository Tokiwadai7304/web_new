const jwt = require('jsonwebtoken');
const User = require('../models/usersModels');

const signupSchema = {
    email: {
        required: true,
        minLength: 5,
        type: 'string'
    },
    password: {
        required: true,
        pattern: /^.{8,}$/, // Password must be at least 8 characters long
        type: 'string',
        // Đổi 'message' thành 'errorMessage' để khớp với cách sử dụng bên dưới
        errorMessage: 'Password must be at least 8 characters long.' 
    },
    name: {
        required: true,
        minLength: 1,
        type: 'string'
    },
    role: {
        required: false, // Role is not required from client
        type: 'string',
        default: 'user' // Default value if not provided
    }
};

const validateSignup = (req, res, next) => {
    const { email, password, name, role } = req.body; // Lấy cả 'role' từ req.body

    // Validate Email
    if (signupSchema.email.required && (!email || typeof email !== 'string' || email.trim().length < signupSchema.email.minLength)) {
        return res.status(400).json({ message: 'Email must be at least 5 characters long.' });
    }

    // Validate Password
    if (signupSchema.password.required && (!password || typeof password !== 'string' || !signupSchema.password.pattern.test(password))) {
        // Sử dụng signupSchema.password.errorMessage
        return res.status(400).json({ message: signupSchema.password.errorMessage }); 
    }

    // Validate Name
    if (signupSchema.name.required && (!name || typeof name !== 'string' || name.trim().length < signupSchema.name.minLength)) {
        return res.status(400).json({ message: 'Name cannot be empty.' });
    }

    // Trim và lowercase các trường
    req.body.email = email.trim().toLowerCase();
    req.body.password = password.trim();
    req.body.name = name.trim().toLowerCase();

    // **Xử lý trường 'role'**:
    // Nếu 'role' không được cung cấp từ frontend, gán giá trị mặc định.
    // Điều này là quan trọng vì authController mong đợi 'role'.
    if (!role) {
        req.body.role = signupSchema.role.default; 
    } else {
        req.body.role = role.trim().toLowerCase();
        // Bạn có thể thêm kiểm tra để đảm bảo role hợp lệ (ví dụ: chỉ 'user' hoặc 'admin')
        if (!['user', 'admin'].includes(req.body.role)) {
            return res.status(400).json({ message: 'Invalid role provided.' });
        }
    }

    next();
};

const signinSchema = {
    email: {
        required: true,
        minLength: 5,
        type: 'string'
    },
    password: {
        required: true,
        minLength: 8, // Thêm minLength để khớp với signup password length
        type: 'string'
    }
};

const validateSignin = (req, res, next) => {
    const { email, password } = req.body;

    if (signinSchema.email.required && (!email || typeof email !== 'string' || email.trim().length < signinSchema.email.minLength)) {
        return res.status(400).json({ message: 'Email must be at least 5 characters long.' });
    }

    if (signinSchema.password.required && (!password || typeof password !== 'string' || password.trim().length < signinSchema.password.minLength)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' }); // Sử dụng thông báo rõ ràng
    }

    req.body.email = email.trim().toLowerCase();
    req.body.password = password.trim();

    next();
};


const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided!' });
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET); 
        req.user = await User.findById(decoded.id).select('-password'); 
        if (!req.user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid Token!' });
    }
};

const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions to access this resource.' });
        }
        next();
    };
};

module.exports = {validateSignup, validateSignin, verifyToken, authorizeRoles};