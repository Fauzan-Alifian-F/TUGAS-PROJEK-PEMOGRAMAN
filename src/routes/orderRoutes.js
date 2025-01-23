const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// 1. Menambahkan Order (POST)
router.post('/', async (req, res) => {
    const { userId, status, total } = req.body;

    try {
        // Validasi input
        if (!userId || !status || !total) {
            return res.status(400).json({ error: 'User ID, status, dan total wajib diisi' });
        }

        // Menambahkan order ke database
        const order = await prisma.order.create({
            data: {
                userId: parseInt(userId),
                status,
                total: parseFloat(total),
            }
        });

        // Mengembalikan order yang baru ditambahkan
        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan order' });
    }
});

// 2. Mendapatkan Semua Order (GET)
router.get('/', async (req, res) => {
    try {
        const orders = await prisma.order.findMany();
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil order' });
    }
});

// 3. Mendapatkan Order Berdasarkan ID (GET)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order tidak ditemukan' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil order' });
    }
});

// 4. Memperbarui Order Berdasarkan ID (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status, total } = req.body;

    try {
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                status,
                total: parseFloat(total)
            }
        });

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui order' });
    }
});

// 5. Menghapus Order Berdasarkan ID (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const order = await prisma.order.delete({
            where: { id: parseInt(id) }
        });

        res.status(204).send(); // Mengembalikan status 204 jika order berhasil dihapus
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus order' });
    }
});

module.exports = router;
