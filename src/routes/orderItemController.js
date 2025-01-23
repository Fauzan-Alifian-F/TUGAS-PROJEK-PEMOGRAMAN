const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Get all order items
router.get('/', async (req, res) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: true, // Jika ada relasi dengan product
        order: true,   // Jika ada relasi dengan order
      },
    });
    res.json(orderItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching order items' });
  }
});

// Get a single order item
router.get('/:id', async (req, res) => {
  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        product: true, // Jika ada relasi dengan product
        order: true,   // Jika ada relasi dengan order
      },
    });
    if (!orderItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    res.json(orderItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching order item' });
  }
});

// Create a new order item
router.post('/', async (req, res) => {
  const { orderId, productId, quantity, price } = req.body;
  try {
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: parseInt(orderId),
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        price: parseFloat(price),
      },
    });
    res.status(201).json(orderItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error creating order item' });
  }
});

// Update an order item
router.put('/:id', async (req, res) => {
  const { quantity, price } = req.body;
  try {
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: {
        quantity: parseInt(quantity),
        price: parseFloat(price),
      },
    });
    res.json(orderItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error updating order item' });
  }
});

// Delete an order item
router.delete('/:id', async (req, res) => {
  try {
    await prisma.orderItem.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error deleting order item' });
  }
});

module.exports = router;
