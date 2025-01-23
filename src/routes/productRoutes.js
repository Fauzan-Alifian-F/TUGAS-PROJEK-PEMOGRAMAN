const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// 1. Menambahkan produk (POST)
router.post('/', async (req, res) => {
    const { name, description, price, stock, brand, size, color, material } = req.body;

    try {
        // Validasi input
        if (!name || !price || !stock) {
            return res.status(400).json({ error: 'Nama, harga, dan stok wajib diisi' });
        }

        // Menambahkan produk ke database
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                brand,
                size,
                color,
                material
            }
        });

        // Mengembalikan produk yang baru ditambahkan
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan produk' });
    }
});

// 2. Mendapatkan semua produk (GET)
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil produk' });
    }
});

// 3. Mendapatkan produk berdasarkan ID (GET)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil produk' });
    }
});

// 4. Memperbarui produk berdasarkan ID (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, brand, size, color, material } = req.body;

    try {
        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                brand,
                size,
                color,
                material
            }
        });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui produk' });
    }
});

// 5. Menghapus produk berdasarkan ID (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        res.status(204).send(); // Mengembalikan status 204 jika produk berhasil dihapus
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus produk' });
    }
});

module.exports = router;
