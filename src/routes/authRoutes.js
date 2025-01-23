const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Untuk hashing password
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Endpoint registrasi
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        // Cek apakah email sudah digunakan
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah digunakan' });
        }

        // Hash password sebelum menyimpan ke database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan pengguna baru ke database
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'USER', // Default role: USER
            },
        });

        res.status(201).json({
            message: 'Registrasi berhasil',
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
    }
});



router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cari pengguna berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Buat token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat login.' });
    }
});


module.exports = router;
