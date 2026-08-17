const prisma = require('../config/db');

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const rawCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { quizzes: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const categories = rawCategories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      createdAt: c.createdAt,
      quizCount: c._count.quizzes
    }));

    res.json(categories);
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

// CREATE CATEGORY (Admin Only)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const trimmedName = name.trim();

    const category = await prisma.category.create({
      data: { name: trimmedName, description: description || '' }
    });

    res.status(201).json({ message: 'Category created successfully!', category });
  } catch (error) {
    console.error('Create Category Error:', error);
    res.status(500).json({ error: 'Failed to create category.' });
  }
};

// UPDATE CATEGORY (Admin Only)
const updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description } = req.body;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, description }
    });

    res.json({ message: 'Category updated successfully!', category: updatedCategory });
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({ error: 'Failed to update category.' });
  }
};

// DELETE CATEGORY (Admin Only)
const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully!' });
  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
