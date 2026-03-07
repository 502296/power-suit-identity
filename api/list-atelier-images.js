module.exports = async (req, res) => {
  try {
    const images = [];

    for (let i = 1; i <= 99; i++) {
      images.push(`${String(i).padStart(2, "0")}.jpg`);
    }

    return res.status(200).json({ images });
  } catch (e) {
    return res.status(500).json({
      images: [],
      error: "images_list_failed",
      message: e?.message || String(e)
    });
  }
};
