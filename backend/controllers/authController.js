const User = require('../models/User');

// Predefined Default Users (Bootstrap)
const DEFAULT_USERS = [
    {
        email: 'admin@superadmin.co.id',
        password: 'password123',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        productId: null,
        avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff'
    },
    {
        email: 'jokiinformatika@gmail.com',
        password: 'joki123',
        name: 'Joki Informatika Admin',
        role: 'PRODUCT_ADMIN',
        productId: 'joki',
        avatar: 'https://ui-avatars.com/api/?name=Joki+Informatika&background=8b5cf6&color=fff'
    },
    {
        email: 'orbitbilliard.id@gmail.com',
        password: 'orbit123',
        name: 'Orbit Billiard Admin',
        role: 'PRODUCT_ADMIN',
        productId: 'orbit',
        avatar: 'https://ui-avatars.com/api/?name=Orbit+Billiard&background=ec4899&color=fff'
    },
    {
        email: 'hi@catatmak.com',
        password: 'catatmak123',
        name: 'Catatmak Admin',
        role: 'PRODUCT_ADMIN',
        productId: 'catatmak',
        avatar: 'https://ui-avatars.com/api/?name=Catatmak&background=f59e0b&color=fff'
    }
];

// Login endpoint
const fs = require('fs');
const path = require('path');

// Login endpoint
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan password wajib diisi"
            });
        }

        // Cari user berdasarkan email (Case-Insensitive)
        const normalizedEmail = String(email).trim().toLowerCase();

        // Coba cari direct match dulu (best performance)
        let user = await User.findOne({ email: normalizedEmail });

        // Jika tidak ketemu, coba cari case-insensitive via regex (escaped)
        if (!user) {
            const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            user = await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });
        }

        // Jika user tidak ada di DB, cek apakah ini user default yang perlu di-auto-save
        if (!user) {
            const defaultUser = DEFAULT_USERS.find(u => u.email.toLowerCase() === normalizedEmail);

            if (defaultUser && defaultUser.password === password) {
                // Buat user baru di DB dari data default
                try {
                    user = new User(defaultUser);
                    await user.save();
                    console.log(`✨ Auto-created default user in DB: ${normalizedEmail}`);
                } catch (saveErr) {
                    console.error('Auto-save user error:', saveErr.message);
                    user = await User.findOne({ email: normalizedEmail });
                    if (!user) throw saveErr;
                }
            } else {
                // Log failed attempt (user not found)
                const logMsg = `[${new Date().toISOString()}] FAILED - User not found or default password mismatch. Email: '${email}', Password: '${password}'\n`;
                fs.appendFileSync(path.join(__dirname, '../login_debug.log'), logMsg);

                return res.status(401).json({
                    success: false,
                    message: "Email tidak terdaftar"
                });
            }
        } else {
            // Cek password (plain text comparison - in production use bcrypt)
            if (user.password !== password) {
                // Log failed attempt (password mismatch)
                const logMsg = `[${new Date().toISOString()}] FAILED - Password mismatch. Email: '${user.email}', DB Password: '${user.password}', Input Password: '${password}'\n`;
                fs.appendFileSync(path.join(__dirname, '../login_debug.log'), logMsg);

                return res.status(401).json({
                    success: false,
                    message: "Password salah (Cek caps lock atau spasi)"
                });
            }
        }

        // Login berhasil
        // Clear log on successful login to indicate success? Or just leave it.
        const logMsg = `[${new Date().toISOString()}] SUCCESS - Login successful for ${user.email}\n`;
        fs.appendFileSync(path.join(__dirname, '../login_debug.log'), logMsg);

        res.json({
            success: true,
            message: "Login berhasil",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                productId: user.productId,
                avatar: user.avatar
            }
        });

    } catch (err) {
        console.error('Login error details:', err);
        res.status(500).json({
            success: false,
            message: `Terjadi kesalahan server: ${err.message}`
        });
    }
};

// Get current user info (optional - untuk cek session)
exports.getCurrentUser = async (req, res) => {
    try {
        // Nanti bisa ditambahkan JWT verification di sini
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                productId: user.productId,
                avatar: user.avatar
            }
        });

    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server"
        });
    }
};
