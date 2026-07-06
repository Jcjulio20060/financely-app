const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  period: {
    type: String,
    default: 'monthly',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Budget', BudgetSchema);
