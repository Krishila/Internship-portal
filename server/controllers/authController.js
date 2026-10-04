const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');


// ==========================================
// REGISTER
// ==========================================
exports.register = async (req, res) => {

    console.log('\n==========================================');
    console.log('📝 REGISTER API CALLED');
    console.log('==========================================');

    try {

        const name =
            req.body.name ||
            req.body.full_name;

        const {
            email,
            password,
            role
        } = req.body;

        console.log('📧 Register Email:', email);
        console.log('👤 Register Name:', name);
        console.log('🎭 Register Role:', role || 'student');

        // Check required fields
        if (!name || !email || !password) {

            console.log('❌ Missing required registration fields');

            return res.status(400).json({
                message: 'Please provide all required fields.'
            });
        }

        // Default role = student
        const userRole =
            role
                ? role.toLowerCase()
                : 'student';

        console.log('🎭 Final User Role:', userRole);

        // Allowed roles
        const allowedRoles = [
            'student',
            'employer',
            'admin'
        ];

        if (!allowedRoles.includes(userRole)) {

            console.log('❌ Invalid user role:', userRole);

            return res.status(400).json({
                message: 'Invalid user role.'
            });
        }

        // Check existing email
        const checkQuery =
            'SELECT id FROM users WHERE email = ?';

        console.log('🔍 Checking existing email...');

        db.query(
            checkQuery,
            [email],
            async (checkErr, results) => {

                console.log('📡 Register DB callback reached');

                if (checkErr) {

                    console.error(
                        'Registration Check Error:',
                        checkErr
                    );

                    return res.status(500).json({
                        message:
                            'Database error: ' +
                            checkErr.message
                    });
                }

                console.log(
                    '👤 Existing users found:',
                    results.length
                );

                if (results.length > 0) {

                    console.log(
                        '❌ Email already registered:',
                        email
                    );

                    return res.status(409).json({
                        message:
                            'Email already registered.'
                    });
                }

                // Hash password
                console.log('🔐 Hashing registration password...');

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );

                console.log('✅ Password hashed successfully');

                // Insert user
                const query = `
                    INSERT INTO users 
                    (
                        name, 
                        email, 
                        password_hash, 
                        role, 
                        status 
                    )
                    VALUES (?, ?, ?, ?, ?)
                `;

                console.log('💾 Inserting new user...');

                db.query(
                    query,
                    [
                        name,
                        email,
                        hashedPassword,
                        userRole,
                        'ACTIVE'
                    ],
                    (err, result) => {

                        if (err) {

                            console.error(
                                'Registration DB Error:',
                                err
                            );

                            return res.status(500).json({
                                message:
                                    'Database error: ' +
                                    err.message
                            });
                        }

                        console.log(
                            '✅ User registered successfully'
                        );

                        console.log(
                            '🆔 New User ID:',
                            result.insertId
                        );

                        return res.status(201).json({

                            message:
                                'User registered successfully!',

                            user: {
                                id: result.insertId,
                                name,
                                email,
                                role: userRole
                            }

                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            'Registration Catch Error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error: ' +
                error.message
        });
    }
};


// ==========================================
// LOGIN
// ==========================================
exports.login = async (req, res) => {

    console.log('\n==========================================');
    console.log('🔐 LOGIN API CALLED');
    console.log('==========================================');

    try {

        const {
            email,
            password
        } = req.body;

        console.log('📧 Login Email:', email);
        console.log(
            '🔑 Password Received:',
            !!password
        );

        // Check fields
        if (!email || !password) {

            console.log(
                '❌ Email or password missing'
            );

            return res.status(400).json({
                message:
                    'Please provide both email and password.'
            });
        }

        // Find user
        const query = `
            SELECT 
                id, 
                name, 
                email, 
                password_hash, 
                role, 
                status 
            FROM users 
            WHERE email = ? 
        `;

        console.log('🔍 Searching user in database...');

        db.query(
            query,
            [email],
            async (err, results) => {

                console.log(
                    '📡 Login DB callback reached'
                );

                if (err) {

                    console.error(
                        'Login DB Error:',
                        err
                    );

                    return res.status(500).json({
                        error: err.message
                    });
                }

                console.log(
                    '👤 Users found:',
                    results ? results.length : 0
                );

                // User not found
                if (
                    !results ||
                    results.length === 0
                ) {

                    console.log(
                        '❌ User not found:',
                        email
                    );

                    return res.status(401).json({
                        message:
                            'Invalid email or password.'
                    });
                }

                const user = results[0];

                console.log('✅ User found:', {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                });

                // Check active status
                if (
                    user.status &&
                    user.status.toUpperCase() !== 'ACTIVE'
                ) {

                    console.log(
                        '❌ User account is not active:',
                        user.status
                    );

                    return res.status(403).json({
                        message:
                            'Your account is not active.'
                    });
                }

                // Compare password
                console.log(
                    '🔐 Comparing password with hash...'
                );

                const isMatch =
                    await bcrypt.compare(
                        password,
                        user.password_hash
                    );

                console.log(
                    '🔐 Password Match:',
                    isMatch
                );

                if (!isMatch) {

                    console.log(
                        '❌ Password does not match'
                    );

                    return res.status(401).json({
                        message:
                            'Invalid email or password.'
                    });
                }

                // ==========================================
                // CREATE JWT TOKEN
                // ==========================================

                console.log(
                    '🎫 Password correct. Creating JWT...'
                );

                const secret =
                    process.env.JWT_SECRET ||
                    'YOUR_SECRET_KEY';

                console.log(
                    '🔑 JWT Secret Available:',
                    !!process.env.JWT_SECRET
                );

                const token =
                    jwt.sign(
                        {
                            id: user.id,
                            role: user.role
                        },
                        secret,
                        {
                            expiresIn: '1d'
                        }
                    );

                console.log(
                    '✅ JWT created successfully'
                );

                // ==========================================
                // RESPONSE
                // ==========================================

                console.log(
                    '📤 Sending login response...'
                );

                console.log(
                    '✅ LOGIN SUCCESS:',
                    {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    }
                );

                return res.json({

                    message: 'Login successful',

                    token,

                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }

                });

            }
        );

    } catch (error) {

        console.error(
            'Login Catch Error:',
            error
        );

        return res.status(500).json({
            error: error.message
        });
    }
};