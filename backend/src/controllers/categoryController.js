const prisma = require('../config/db');
const { store, nextId } = require('../store/memoryStore');

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    let categories = [];

    if (prisma) {
      try {
        categories = await prisma.category.findMany({
          include: {
            _count: {
              select: { quizzes: true }
            }
          },
          orderBy: { name: 'asc' }
        });
        return res.json(
          categories.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.createdAt,
            quizCount: c._count.quizzes
          }))
        );
      } catch (e) {
        // Fallback to memory store
      }
    }

    // Memory Store Fallback
    categories = store.categories.map((c) => {
      const quizCount = store.quizzes.filter((q) => q.categoryId === c.id).length;
      return {
        ...c,
        quizCount
      };
    });

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
    let category = null;

    if (prisma) {
      try {
        category = await prisma.category.create({
          data: { name: trimmedName, description: description || '' }
        });
        return res.status(201).json({ message: 'Category created successfully!', category });
      } catch (e) {
        // Fallback
      }
    }

    // Memory store
    const exists = store.categories.find((c) => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Category already exists.' });
    }

    category = {
      id: nextId.categories++,
      name: trimmedName,
      description: description || '',
      createdAt: new Date().toISOString()
    };
    store.categories.push(category);

    res.status(201).json({ message: 'Category created successfully!', category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
};

// UPDATE CATEGORY (Admin Only)
const updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description } = req.body;

    let updatedCategory = null;

    if (prisma) {
      try {
        updatedCategory = await prisma.category.update({
          where: { id },
          data: { name, description }
        });
        return res.json({ message: 'Category updated successfully!', category: updatedCategory });
      } catch (e) {
        // Fallback
      }
    }

    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    if (name) store.categories[index].name = name.trim();
    if (description !== undefined) store.categories[index].description = description;

    res.json({ message: 'Category updated successfully!', category: store.categories[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
};

// DELETE CATEGORY (Admin Only)
const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (prisma) {
      try {
        await prisma.category.delete({ where: { id } });
        return res.json({ message: 'Category deleted successfully!' });
      } catch (e) {
        // Fallback
      }
    }

    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    store.categories.splice(index, 1);
    // Also remove quizzes under category
    store.quizzes = store.quizzes.filter((q) => q.categoryId !== id);

    res.json({ message: 'Category deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
