'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2022-06-28T09:15:04.904Z',
    '2022-07-01T10:17:24.185Z',
    '2022-08-08T14:11:59.604Z',
    '2022-09-27T17:01:17.194Z',
    '2022-10-11T23:36:17.929Z',
    '2022-10-14T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2022-05-25T14:18:46.235Z',
    '2022-06-05T16:33:06.386Z',
    '2022-07-10T14:43:26.374Z',
    '2022-08-25T18:49:59.371Z',
    '2022-09-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// create login account for username
const createUserName = function (acc) {
  acc.forEach(acc => {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(value => value[0])
      .join('');
  });
};

createUserName(accounts);

// show balance
const calcBalance = function (account) {
  account.balance = account.movements.reduce(
    (acc, value, i, arr) => acc + value,
    0
  );

  labelBalance.textContent = formatMov(account, account.balance);
};

// date setting

const today = new Date().toISOString();

const displayDate = function (movdate, locale) {
  const calcDayPass = date =>
    Math.round(Math.abs((Date.now() - date) / (1000 * 60 * 60 * 24)));
  const date = new Date(movdate);
  const countDays = calcDayPass(date);

  if (countDays === 0) return `Today`;
  if (countDays === 1) return 'Yesterday';
  if (countDays <= 7 && countDays > 1) return `${countDays} days ago`;
  return Intl.DateTimeFormat(locale).format(date);
};

// login UI

let activeAccount;
btnLogin.addEventListener('click', e => {
  e.preventDefault();
  activeAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );
  if (activeAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back! ${
      activeAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
  }

  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();

  // Internationalization API (Intl)
  const option = {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  labelDate.textContent = Intl.DateTimeFormat(
    activeAccount.locale,
    option
  ).format(Date.now());

  updateUI(activeAccount);
});

// format movements' number
const formatMov = function (account, mov) {
  return Intl.NumberFormat(account.locale, {
    style: 'currency',
    currency: account.currency,
  }).format(mov);
};

// show movement in left side
const displayMovements = function (account, sort = false) {
  // make date connect to movement (for sorting)
  const moveAndDate = account.movements.map((mov, i) => [
    mov,
    account.movementsDates[i],
  ]);
  const moves = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  containerMovements.innerHTML = ''; // clean board
  moves.forEach((move, i) => {
    const type = move < 0 ? 'withdrawal' : 'deposit';
    // use find() to find which one to connect
    const date = moveAndDate.find(mov => mov[0] === move)[1];
    // display date with movement
    const movDate = displayDate(date, account.locale);
    const currency = formatMov(account, move);

    // create new html to index.html
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${movDate}</div>
      <div class="movements__value">${currency}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// footer display
const displaySummary = function (account) {
  const income = account.movements
    .filter(move => move > 0)
    .reduce((acc, move) => acc + move, 0);
  labelSumIn.textContent = formatMov(account, income);

  const outcome = Math.abs(
    account.movements
      .filter(move => move < 0)
      .reduce((acc, move) => acc + move, 0)
  );
  labelSumOut.textContent = formatMov(account, outcome);

  const interest = account.movements
    .filter(move => move > 0)
    .map(move => (move * account.interestRate) / 100)
    .filter(move => move > 1)
    .reduce((acc, move) => acc + move, 0);
  labelSumInterest.textContent = formatMov(account, interest);
};

// update UI
const updateUI = function (acc) {
  calcBalance(acc);
  displayMovements(acc);
  displaySummary(acc);
  // login time
};

// transfer UI
btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const recevier = accounts.find(acc => acc.userName === inputTransferTo.value);
  console.log(recevier);
  const amount = Number(inputTransferAmount.value);
  if (
    amount > 0 &&
    recevier &&
    amount <= activeAccount.balance &&
    recevier.userName !== activeAccount.userName
  ) {
    // active user changing
    activeAccount.movements.push(-amount);
    activeAccount.movementsDates.push(today);

    // recevier changing
    recevier.movements.push(amount);
    recevier.movementsDates.push(today);

    updateUI(activeAccount);
  } else {
    alert('Invalid.');
  }
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
});

// Loan UI
btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (
    activeAccount.movements.some(mov => mov >= amount * 0.1) &&
    amount > 0 &&
    !activeAccount.loan
  ) {
    // active user changing
    activeAccount.movements.push(amount);
    activeAccount.movementsDates.push(today);

    updateUI(activeAccount);

    // loan condition
    activeAccount.loan = true;

    inputLoanAmount.value = '';
    inputLoanAmount.blur();
    alert('Loan is saving to your account.');
  } else {
    alert("You can't loan that much!");
  }
});

// close Account UI
btnClose.addEventListener('click', e => {
  e.preventDefault();
  if (
    inputCloseUsername.value === activeAccount.userName &&
    Number(inputClosePin.value) === activeAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === activeAccount.userName
    );

    // delete from array
    accounts.splice(index, 1);
    alert('Account Closed.');

    // close UI
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = '';
    inputClosePin.blur();
    labelWelcome.textContent = `Log in to get started`;
  }
});

// sort UI
let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(activeAccount, !sorted);
  sorted = !sorted;
});
