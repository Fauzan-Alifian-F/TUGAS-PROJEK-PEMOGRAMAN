const productController = {
    async getAllProducts(req, res) {
      try {
        const products = await prisma.product.findMany();
        res.json(products);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    async getProduct(req, res) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: parseInt(req.params.id) }
        });
        
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  
    async createProduct(req, res) {
      try {
        const { name, brand, size, color, price, stock, description } = req.body;
        
        const product = await prisma.product.create({
          data: {
            name,
            brand,
            size,
            color,
            price: parseFloat(price),
            stock: parseInt(stock),
            description
          }
        });
        
        res.status(201).json(product);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },
  
    // Update product
    async updateProduct(req, res) {
      try {
        const { name, brand, size, color, price, stock, description } = req.body;
        
        const product = await prisma.product.update({
          where: { id: parseInt(req.params.id) },
          data: {
            name,
            brand,
            size,
            color,
            price: parseFloat(price),
            stock: parseInt(stock),
            description
          }
        });
        
        res.json(product);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },
  
    // Delete product
    async deleteProduct(req, res) {
      try {
        await prisma.product.delete({
          where: { id: parseInt(req.params.id) }
        });
        
        res.json({ message: 'Product deleted successfully' });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },
  
    // Search products
    async searchProducts(req, res) {
      try {
        const { q } = req.query;
        
        const products = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: q } },
              { brand: { contains: q } },
              { description: { contains: q } }
            ]
          }
        });
        
        res.json(products);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  };