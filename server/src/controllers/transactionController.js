const transactionService = require('../services/transactionService');
const { successResponse } = require('../utils/apiResponse');

class TransactionController {
  async getTransactions(req, res, next) {
    try {
      const result = await transactionService.getTransactions(req.query, req.user._id);
      return successResponse(res, 'Transactions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      const transaction = await transactionService.getTransactionById(req.params.id, req.user._id);
      return successResponse(res, 'Transaction retrieved successfully', transaction);
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req, res, next) {
    try {
      const transaction = await transactionService.createTransaction(req.body, req.user._id);
      return successResponse(res, 'Transaction created successfully', transaction, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTransaction(req, res, next) {
    try {
      const updatedTransaction = await transactionService.updateTransaction(req.params.id, req.body, req.user._id);
      return successResponse(res, 'Transaction updated successfully', updatedTransaction);
    } catch (error) {
      next(error);
    }
  }

  async deleteTransaction(req, res, next) {
    try {
      const deleted = await transactionService.deleteTransaction(req.params.id, req.user._id);
      return successResponse(res, 'Transaction deleted successfully', { id: deleted._id });
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req, res, next) {
    try {
      const csvData = await transactionService.exportTransactionsCSV(req.user._id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="spendwise-transactions.csv"');
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
