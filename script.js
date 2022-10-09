'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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
  const balance = account.movements.reduce(
    (acc, value, i, arr) => acc + value,
    0
  );
  account.balance = balance;
  labelBalance.textContent = balance + '€';
};

// show movement in right side
const displayMovements = function (movements) {
  containerMovements.innerHTML = ''; // clean board
  movements.forEach((move, i) => {
    const type = move < 0 ? 'withdrawal' : 'deposit';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${move}€</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// footer display
const displaySummary = function (account) {
  const income = Math.trunc(
    account.movements
      .filter(move => move > 0)
      .reduce((acc, move) => acc + move, 0)
  );
  labelSumIn.textContent = `${income}€`;

  const outcome = Math.abs(
    Math.trunc(
      account.movements
        .filter(move => move < 0)
        .reduce((acc, move) => acc + move, 0)
    )
  );
  labelSumOut.textContent = `${outcome}€`;

  const interest = account.movements
    .filter(move => move > 0)
    .map(move => (move * account.interestRate) / 100)
    .filter(move => move > 1)
    .reduce((acc, move) => acc + move, 0);
  labelSumInterest.textContent = `${Math.trunc(interest)}€`;
};

// update Ui func
const updateUI = function (acc) {
  calcBalance(acc);
  displayMovements(acc.movements);
  displaySummary(acc);
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
  updateUI(activeAccount);
});

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
    activeAccount.movements.push(-amount);
    recevier.movements.push(amount);
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
  if (
    activeAccount.movements.some(mov => mov > 0) &&
    Number(inputLoanAmount.value) <= activeAccount.balance * 0.1 &&
    !activeAccount.loan
  ) {
    const loan = +inputLoanAmount.value;
    activeAccount.movements.push(loan);
    updateUI(activeAccount);
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
