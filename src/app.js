const express = require('express');
const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
// Route utama untuk endpoint root
app.get('/', (req, res) => {
    res.send('Welcome to the Velg Motor API!');
});

// Tambahkan routes lain
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
app.use('/order-items', orderItemRoutes);
app.use('/auth', authRoutes); 
app.use('/products', productRoutes);
module.exports = app;
