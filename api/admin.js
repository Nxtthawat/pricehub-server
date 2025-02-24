import express from 'express';
import multer from 'multer';
import priceHubDB from '../db.js';
import path from 'path';

const router = express.Router();

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize upload
const upload = multer({ storage });

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Endpoint to handle image upload
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filename = req.file.filename;
  const filepath = path.join('/api/admin/uploads/', filename);

  console.log(req.body.product_name)

  try {
    const db = await priceHubDB;

    const sql = 'INSERT INTO products(product_name,product_price,product_unit,product_image,price_from) VALUES(? ,? ,? ,?,?)';
    db.query(sql, [req.body.product_name, req.body.product_price, req.body.product_unit, filepath, req.body.price_from], (err, result) => {
        if (err) {
            console.error('Error saving file information to database:', err);
            res.status(500).send('Error saving file information to database.');
            return;
        }else{
            res.status(200).send('New product added successfully');
        }
    });
  } catch (error) {
    console.error('Error saving file information to database:', error);
    res.status(500).send('Error saving file information to database.');
  }
});

router.get('/getProducts', async (req, res) => {
  try {
    const db = await priceHubDB;

    const sql = 'SELECT * FROM products';
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error getting products:', err);
        res.status(500).send('Error getting products.');
        return;
      }
      res.status(200).send(result);
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).send('Error getting products.');
  }
});

router.delete('/delete', async (req, res) => {
  try {
    const db = await priceHubDB;

    const sql = 'DELETE FROM products WHERE product_id = ?';
    db.query(sql, [req.body.product_id], (err, result) => {
      if (err) {
        console.error('Error deleting product:', err);
        res.status(500).send('Error deleting product.');
        return;
      }
      res.status(200).send('Product deleted successfully');
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Error deleting product.');
  }
});

router.get('/getProduct', async (req, res) => {
  try {
    const db = await priceHubDB;

    const sql = 'SELECT * FROM products WHERE product_id = ?';
    db.query(sql, [req.body.product_id], (err, result) => {
      if (err) {
        console.error('Error getting product:', err);
        res.status(500).send('Error getting product.');
        return;
      }
      res.status(200).send(result);
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).send('Error getting product.');
  }
});

router.get('/getFourProducts', async (req, res) => {
  try {
    const db = await priceHubDB;

    const sql = 'SELECT * FROM products ORDER BY product_price DESC LIMIT ?';
    db.query(sql, 4, (err, result) => {
      if (err) {
        console.error('Error getting top products:', err);
        res.status(500).send('Error getting top products.');
        return;
      }
      res.status(200).send(result);
    });
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).send('Error getting top products.');
  }
});


// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

export default router;