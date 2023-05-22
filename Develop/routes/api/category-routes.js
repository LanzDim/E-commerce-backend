const router = require('express').Router();
const { Category, Product } = require('../../models');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: {
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
      }
    });

    if (categories.length === 0) {
      res.status(404).json({ message: 'No categories found' });
      return;
    }

    res.json(categories);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET a category by id
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id
      },
      include: {
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
      }
    });

    if (!category) {
      res.status(404).json({ message: 'No category found' });
      return;
    }

    res.json(category);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// POST a new category
router.post('/', async (req, res) => {
  try {
    const newCategory = await Category.create({
      category_name: req.body.category_name
    });

    res.json(newCategory);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// PUT update a category by id
router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.update(req.body, {
      where: {
        id: req.params.id
      }
    });

    if (updatedCategory[0] === 0) {
      res.status(404).json({ message: 'No category found with this id' });
      return;
    }

    res.json(updatedCategory);
  } catch (err) {
    console.log(err);
    res.status(500).json
