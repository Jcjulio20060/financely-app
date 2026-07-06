const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/finance';

function connectWithRetry() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch((err) => {
      console.error('MongoDB connection error, retrying in 5 seconds...', err.message);
      setTimeout(connectWithRetry, 5000);
    });
}

connectWithRetry();

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Finance Tracker API is running' });
});

// API Routes

// 1. Transactions - GET all with optional filters
app.get('/api/transactions', async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let query = {};

    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Transactions - POST create
app.post('/api/transactions', async (req, res) => {
  try {
    const { description, amount, type, category, date, notes } = req.body;
    
    if (!description || !amount || !type || !category) {
      return res.status(400).json({ error: 'Please provide description, amount, type and category' });
    }

    const newTransaction = new Transaction({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: date ? new Date(date) : undefined,
      notes
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Transactions - PUT update
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { description, amount, type, category, date, notes } = req.body;
    const updatedData = {};
    
    if (description !== undefined) updatedData.description = description;
    if (amount !== undefined) updatedData.amount = parseFloat(amount);
    if (type !== undefined) updatedData.type = type;
    if (category !== undefined) updatedData.category = category;
    if (date !== undefined) updatedData.date = new Date(date);
    if (notes !== undefined) updatedData.notes = notes;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Transactions - DELETE
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Budgets - GET all
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await Budget.find({});
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Budgets - POST create or update (upsert)
app.post('/api/budgets', async (req, res) => {
  try {
    const { category, limit, period } = req.body;
    
    if (!category || limit === undefined) {
      return res.status(400).json({ error: 'Please provide category and limit' });
    }

    const budget = await Budget.findOneAndUpdate(
      { category: category.trim() },
      { limit: parseFloat(limit), period: period || 'monthly' },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 7. Budgets - DELETE
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const deletedBudget = await Budget.findByIdAndDelete(req.params.id);
    if (!deletedBudget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Summary Dashboard Data
app.get('/api/summary', async (req, res) => {
  try {
    // Total income vs expenses
    const transactions = await Transaction.find({});
    
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};
    
    // Group transactions by date for a timeline chart (last 30 days)
    const timelineData = {};
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 30); // 30 days ago

    transactions.forEach(t => {
      const amount = t.amount;
      if (t.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
        
        // Accumulate expenses by category
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += amount;
      }

      // Timeline aggregation (grouping by YYYY-MM-DD for the last 30 days)
      if (t.date >= dateLimit) {
        const dateStr = t.date.toISOString().split('T')[0];
        if (!timelineData[dateStr]) {
          timelineData[dateStr] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          timelineData[dateStr].income += amount;
        } else {
          timelineData[dateStr].expense += amount;
        }
      }
    });

    const balance = totalIncome - totalExpenses;

    // Fetch budgets to calculate progress
    const budgets = await Budget.find({});
    const budgetProgress = budgets.map(b => {
      const spent = categoryTotals[b.category] || 0;
      return {
        id: b._id,
        category: b.category,
        limit: b.limit,
        spent: spent,
        remaining: Math.max(0, b.limit - spent),
        percentage: Math.min(100, Math.round((spent / b.limit) * 100))
      };
    });

    // Format timeline for chart sorting chronologically
    const sortedTimeline = Object.keys(timelineData)
      .sort()
      .map(date => ({
        date,
        income: timelineData[date].income,
        expense: timelineData[date].expense
      }));

    res.json({
      balance,
      totalIncome,
      totalExpenses,
      categoryExpenses: Object.keys(categoryTotals).map(cat => ({
        category: cat,
        amount: categoryTotals[cat]
      })),
      budgetProgress,
      timeline: sortedTimeline
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
