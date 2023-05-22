const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'product_name', 'price', 'stock'],
      include: [
        {
          model: Category,
          attributes: ['category_name']
        },
        {
          model: Tag,
          attributes: ['tag_name']
        }
      ]
    });

    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET a product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id
      },
      attributes: ['id', 'product_name', 'price', 'stock'],
      include: [
        {
          model: Category,
          attributes: ['category_name']
        },
        {
          model: Tag,
          attributes: ['tag_name']
        }
      ]
    });

    if (!product) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }

    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// POST a new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id
      }));

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// PUT update a product by id
router.put('/:id', async (req, res) => {
  try {
    const [affectedRows] = await Product.update(req.body, {
      where: {
        id: req.params.id
      }
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }

    const productTags = await ProductTag.findAll({
      where: {
        product_id: req.params.id
      }
    });

    const currentTagIds = productTags.map(({ tag_id }) => tag_id);
    const newTagIds = req.body.tagIds.filter((tag_id) => !currentTagIds.includes(tag_id));
    const tagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    await Promise.all([
      ProductTag.destroy({ where: { id: tagsToRemove } }),
      ProductTag.bulkCreate(newTagIds.map((tag_id) => ({
        product_id: req.params.id,
        tag_id
      })))
    ]);

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// DELETE a product by id
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!deletedProduct) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
