module.exports = async (req, res) => {
  // أسماء الصور (ثابتة وبسيطة)
  const images = [
    "01.jpg","02.jpg","03.jpg","04.jpg","05.jpg","06.jpg",
    "07.jpg","08.jpg","09.jpg","10.jpg","11.jpg","12.jpg"
  ];

  res.status(200).json({ images });
};
