const express = require('express');
const bcrypt = require('bcryptjs'); 
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware autentikasi

const prisma = new PrismaClient();
const router = express.Router();

// **1. Registrasi pengguna baru**
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Validasi input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Semua field wajib diisi.' });
        }

        // Periksa apakah email sudah digunakan
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan pengguna baru
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'USER', // Default role adalah USER
            },
        });

        res.status(201).json({ message: 'Pengguna berhasil terdaftar.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

// **2. Mendapatkan semua pengguna (Admin-only)**
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

// **3. Mendapatkan pengguna berdasarkan ID (Admin atau pengguna itu sendiri)**
router.get('/:id', authMiddleware.verifyToken, async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        // Periksa apakah pengguna meminta datanya sendiri atau admin
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

// **4. Memperbarui data pengguna**
router.put('/:id', authMiddleware.verifyToken, async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        // Periksa apakah pengguna memperbarui datanya sendiri atau admin
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak.' });
        }

        const { name, email, password, role } = req.body;

        // Hash password jika diperbarui
        let hashedPassword = undefined;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                password: hashedPassword,
                role: req.user.role === 'admin' ? role : undefined, // Hanya admin bisa ubah role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                updatedAt: true,
            },
        });

        res.json({ message: 'Data pengguna berhasil diperbarui.', updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

// **5. Menghapus pengguna (Admin-only)**
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        await prisma.user.delete({
            where: { id: userId },
        });

        res.json({ message: 'Pengguna berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

module.exports = router;
