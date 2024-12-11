'use strict';

const express = require('express');

const { v4: uuidv4 } = require('uuid');

function createServer() {
  const expenses = [];
  const users = [];
  const app = express();

  app.use(express.json());

  app.get('/expenses', (req, res) => {
    const { userId, category, from, to, categories } = req.query;
    let filteredExpenses = expenses;

    if (userId) {
      filteredExpenses = filteredExpenses.filter(
        (exp) => exp.userId === userId
      );
    }

    if (category) {
      filteredExpenses = filteredExpenses.filter(
        (exp) => exp.category === category
      );
    }

    if (categories) {
      const categoryArray = Array.isArray(categories)
        ? categories
        : categories.split(',').map((cat) => cat.trim());

      filteredExpenses = filteredExpenses.filter((exp) =>
        categoryArray.includes(exp.category)
      );
    }

    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      filteredExpenses = filteredExpenses.filter((exp) => {
        const expData = new Date(exp.spentAt);

        return expData >= start && expData <= end;
      });
    }
    res.json(filteredExpenses);
  });

  app.get('/expenses/:id', (req, res) => {
    const id = req.params.id;
    const expense = expenses.find((exp) => exp.id === id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  });

  app.post('/expenses', (req, res) => {
    const { title, amount, userId, category, note, spentAt } = req.body;

    if (!title || !amount || !userId) {
      return res
        .status(400)
        .json({ message: 'Title, amount and userId are required' });
    }

    const userExists = users.some((user) => user.id === userId);

    if (!userExists) {
      return res.status(400).json({ message: 'User not found' });
    }

    const newExpense = {
      id: uuidv4(),
      userId,
      category: category || '',
      note: note || '',
      title,
      amount,
      spentAt: spentAt || new Date().toISOString()
    };

    expenses.push(newExpense);

    return res.status(201).json(newExpense);
  });

  app.patch('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const { title, amount, category, note, spentAt } = req.body;
    const expense = expenses.find((exp) => exp.id === id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (title !== undefined) {
      expense.title = title;
    }

    if (amount !== undefined) {
      expense.amount = amount;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (note !== undefined) {
      expense.note = note;
    }

    if (spentAt !== undefined) {
      expense.spentAt = spentAt;
    }

    return res.status(200).json(expense);
  });

  app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const expenseIndex = expenses.findIndex((exp) => exp.id === id);

    if (expenseIndex === -1) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    expenses.splice(expenseIndex, 1);

    return res.sendStatus(204);
  });

  app.get('/users', (req, res) => {
    res.json(users);
  });

  app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find((us) => us.id === id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  });

  app.post('/users', (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newUser = {
      id: uuidv4(),
      name
    };

    users.push(newUser);

    return res.status(201).json(newUser);
  });

  app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const user = users.find((us) => us.id === id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    user.name = name;

    return res.status(200).json(user);
  });

  app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex((us) => us.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users.splice(userIndex, 1);

    return res.sendStatus(204);
  });

  return app;
}

module.exports = {
  createServer
};
