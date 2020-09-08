//Upload Endpoint
app.post('/upload', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No files uploaded' });
  }

  const files = Object.values(req.files);
  files.forEach(file => {
    file.mv(`${__dirname}/public/uploads/${file.name}`, err => {
      if (err) {
        return res.status(500).send(err);
      }
    });
  });

  res.json(
    files.map(file => {
      return { name: file.name, path: `/uploads/${file.name}` };
    })
  );
});
