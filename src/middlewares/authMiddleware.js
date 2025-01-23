const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = {
  // Verifikasi token JWT
  async verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Akses ditolak. Token tidak tersedia.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        return res.status(401).json({
          error: 'Token tidak valid. Pengguna tidak ditemukan.'
        });
      }

      req.user = user; // Tambahkan user ke objek request
      next();
    } catch (error) {
      return res.status(401).json({
        error: 'Token tidak valid atau telah kedaluwarsa.'
      });
    }
  },

  // Pengecekan apakah user adalah admin
  isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Akses ditolak. Hak admin diperlukan.'
      });
    }
    next();
  },

  // Pengecekan kepemilikan resource atau hak admin
  async isOwnerOrAdmin(req, res, next) {
    const resourceId = parseInt(req.params.id);

    if (isNaN(resourceId)) {
      return res.status(400).json({
        error: 'ID resource tidak valid.'
      });
    }

    const resourceType = req.baseUrl.split('/')[2]; // Contoh: /api/orders -> orders

    try {
      let resource;

      switch (resourceType) {
        case 'orders':
          resource = await prisma.order.findUnique({
            where: { id: resourceId }
          });
          break;
        default:
          return res.status(400).json({
            error: 'Tipe resource tidak didukung.'
          });
      }

      if (!resource) {
        return res.status(404).json({
          error: 'Resource tidak ditemukan.'
        });
      }

      if (resource.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Akses ditolak. Anda tidak memiliki izin.'
        });
      }

      next();
    } catch (error) {
      console.error('Kesalahan validasi resource:', error);
      return res.status(500).json({
        error: 'Terjadi kesalahan internal server.'
      });
    }
  }
};

module.exports = authMiddleware;
