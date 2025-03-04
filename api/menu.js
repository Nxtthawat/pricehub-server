import express from 'express';
import multer from 'multer';
import priceHubDB from '../db.js';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    const filename = req.file.filename;
    const filepath = path.join('/api/menu/uploads/', filename);
  
    console.log(req.body.product_name)
  
    try {
      const db = await priceHubDB;
  
      const sql = 'INSERT INTO menu(menu_topic,menu_recipe,menu_author,menu_image) VALUES(? ,? ,? ,? )';
      db.query(sql, [req.body.product_name, req.body.product_price, req.body.author , filepath], (err, result) => {
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

  router.get('/getMenu', async (req, res) => {
    try {
      const db = await priceHubDB;
  
      const sql = 'SELECT * FROM menu';
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
        
      console.log(req.body.menu_id)

      const sql = 'DELETE FROM menu WHERE menu_id = ?';
      db.query(sql, [req.body.menu_id], (err, result) => {
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

  router.get('/getFourMenu', async (req, res) => {
    try {
      const db = await priceHubDB;
  
      const sql = 'SELECT * FROM menu LIMIT 4';
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

  router.put('/edit',upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const filename = req.file.filename;
    const filepath = path.join('/api/menu/uploads/', filename);
  
    console.log(req.body.product_name)

    try {
      const db = await priceHubDB;

      const { menu_id, menu_topic, menu_recipe, menu_author} = req.body;
      console.log(req.body);

      const sql = 'UPDATE menu SET menu_topic = ?, menu_recipe = ?, menu_author = ?, menu_image = ? WHERE menu_id = ?';
      db.query(sql, [menu_topic, menu_recipe, menu_author, filepath, menu_id], (err, result) => {
        if (err) {
          console.error('Error updating product:', err);
          res.status(500).send('Error updating product.');
          return;
        }

        res.status(200).send('Product updated successfully');
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).send('Error updating product.');
    }
  });

  router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  export default router;