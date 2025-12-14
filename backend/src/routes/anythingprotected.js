router.get("/profile", protect, async (req, res) => {
  res.json({
    message: "Success",
    userId: req.user.id
  });
});
