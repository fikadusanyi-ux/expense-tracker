# MoneyTrack — Expense Tracker

A responsive personal finance dashboard built with React and Vite. Track income and expenses, review your balance, search transactions, view spending by category, and export your data to CSV.

## Features

- Add income and expense transactions
- Choose a category, amount, description, and date
- Automatically calculate balance, income, and expenses
- Search and filter transactions
- Spending breakdown by category
- Delete transactions
- Export transactions as CSV
- Persistent browser storage with `localStorage`
- Responsive desktop and mobile layout

## Tech stack

- React
- Vite
- CSS
- Browser `localStorage`

## Run locally

1. Install [Node.js](https://nodejs.org/).
2. Open this project folder in your terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in your terminal.

## Build for production

```bash
npm run build
npm run preview
```

## Data and privacy

This starter version stores transactions in the browser using `localStorage`. Data stays in the current browser profile and is not synced between devices. Clearing browser storage will remove saved transactions. The example starts with a few sample transactions; delete them and add your own.

## Suggested future improvements

- Add authentication and cloud database sync
- Add monthly budgets and budget progress
- Add date-range reports and charts
- Support multiple currencies
- Add recurring transactions
- Add unit tests and end-to-end tests

## GitHub upload

Create a new GitHub repository named `moneytrack-expense-tracker`, then upload the project files or push the folder using Git.
