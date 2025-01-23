const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const orderController = {
    async createOrder(req, res) {
        try {
            const { items } = req.body;
            
            // Validate input
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Invalid order items' });
            }

            // Use transaction to ensure data consistency
            const order = await prisma.$transaction(async (tx) => {
                let totalAmount = 0;
                const orderItems = [];

                // Validate and prepare order items
                for (const item of items) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId }
                    });

                    if (!product) {
                        throw new Error(`Product with id ${item.productId} not found`);
                    }

                    if (product.stock < item.quantity) {
                        throw new Error(`Insufficient stock for product ${product.name}`);
                    }

                    const itemTotal = product.price * item.quantity;
                    totalAmount += itemTotal;

                    orderItems.push({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: product.price
                    });

                    // Update product stock within transaction
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: { decrement: item.quantity }
                        }
                    });
                }

                // Create order
                return tx.order.create({
                    data: {
                        userId: req.user.id,
                        totalAmount,
                        orderItems: {
                            create: orderItems
                        }
                    },
                    include: {
                        orderItems: {
                            include: { product: true }
                        }
                    }
                });
            });

            res.status(201).json(order);
        } catch (error) {
            console.error('Order creation error:', error);
            res.status(400).json({ error: error.message });
        }
    },

    // Other methods remain the same...
};

module.exports = { orderController };