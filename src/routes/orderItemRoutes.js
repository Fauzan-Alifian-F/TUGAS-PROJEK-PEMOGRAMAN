const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// 1. Menambahkan Order Item (POST)
router.post('/', async (req, res) => {
    const { orderId, productId, quantity, price } = req.body;

    try {
        // Validasi input
        if (!orderId || !productId || !quantity || !price) {
            return res.status(400).json({ error: 'Order ID, Product ID, Quantity, dan Price wajib diisi' });
        }

        // Menambahkan order item ke database
        const orderItem = await prisma.orderItem.create({
            data: {
                orderId: parseInt(orderId),
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                price: parseFloat(price)
            }
        });

        res.status(201).json(orderItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan order item' });
    }
});

// 2. Mendapatkan Semua Order Item (GET)
router.get('/', async (req, res) => {
    try {
        const orderItems = await prisma.orderItem.findMany();
        res.json(orderItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil order items' });
    }
});

// 3. Mendapatkan Order Item Berdasarkan ID (GET)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: parseInt(id) }
        });

        if (!orderItem) {
            return res.status(404).json({ error: 'Order item tidak ditemukan' });
        }

        res.json(orderItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil order item' });
    }
});

// 4. Memperbarui Order Item Berdasarkan ID (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { orderId, productId, quantity, price } = req.body;

    try {
        const orderItem = await prisma.orderItem.update({
            where: { id: parseInt(id) },
            data: {
                orderId: parseInt(orderId),
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                price: parseFloat(price)
            }
        });

        res.json(orderItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui order item' });
    }
});

// 5. Menghapus Order Item Berdasarkan ID (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const orderItem = await prisma.orderItem.delete({
            where: { id: parseInt(id) }
        });

        res.status(204).send(); // Mengembalikan status 204 jika berhasil dihapus
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus order item' });
    }
});

module.exports = router;
