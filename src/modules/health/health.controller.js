const getHealth = (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'radar-backend',
    },
  });
};

module.exports = {
  getHealth,
};