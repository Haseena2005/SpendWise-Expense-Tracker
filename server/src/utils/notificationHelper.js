const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmailNotification } = require('./emailService');

/**
 * Check and create automatic notifications based on user activity
 */
async function checkAndCreateNotifications({ userId, type, amount, categoryName, budgetSpent, budgetTotal }) {
  try {
    let notifTitle = null;
    let notifMessage = null;

    if (type === 'expense' && amount >= 10000) {
      notifTitle = 'Large Expense Recorded';
      notifMessage = `You recorded a large expense of ${amount.toLocaleString()} for ${categoryName || 'General'}.`;
      await Notification.create({ userId, title: notifTitle, message: notifMessage, type: 'expense' });
    }

    if (type === 'income' && amount >= 25000) {
      notifTitle = 'Significant Income Added';
      notifMessage = `Great news! An income of ${amount.toLocaleString()} has been credited.`;
      await Notification.create({ userId, title: notifTitle, message: notifMessage, type: 'income' });
    }

    if (budgetTotal && budgetSpent !== undefined) {
      const percentage = (budgetSpent / budgetTotal) * 100;
      if (percentage >= 100) {
        notifTitle = '🚨 Budget Exceeded';
        notifMessage = `Your ${categoryName} budget of ${budgetTotal.toLocaleString()} has been exceeded by ${(budgetSpent - budgetTotal).toLocaleString()}.`;
        await Notification.create({ userId, title: notifTitle, message: notifMessage, type: 'budget' });
      } else if (percentage >= 80) {
        notifTitle = '⚠️ Budget Warning';
        notifMessage = `You have reached ${Math.round(percentage)}% of your ${categoryName} monthly budget.`;
        await Notification.create({ userId, title: notifTitle, message: notifMessage, type: 'budget' });
      }
    }

    // If an alert was generated, send an email
    if (notifTitle && notifMessage) {
      const user = await User.findById(userId).select('email');
      if (user && user.email) {
        // Send async without blocking
        sendEmailNotification(user.email, notifTitle, notifMessage);
      }
    }
  } catch (err) {
    console.error('Failed to generate automatic notification:', err.message);
  }
}

module.exports = { checkAndCreateNotifications };
