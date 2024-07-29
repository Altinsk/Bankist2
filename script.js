'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2024-07-24T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2024-07-20T17:01:17.194Z',
    '2024-07-25T23:36:17.929Z',
    '2024-07-26T10:51:36.790Z',
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
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
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

/////////////////////////////////////////////////
// Functions

// formatting currencis

const formattedCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

let message = '';
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 3600 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // switch (daysPassed) {
  //   case 0:
  //     message = 'Today';
  //     break;
  //   case 1:
  //     message = 'Yesterday';
  //     break;
  //   case 2:
  //     message = '2 days ago';
  //     break;
  //   case 3:
  //     message = '3 days ago';
  //     break;
  //   case 4:
  //     message = '4 days ago';
  //     break;
  //   case 5:
  //     message = '5 days ago';
  //     break;
  //   case 6:
  //     message = '6 days ago';
  //     break;
  //   default:
  //     message = '';
  // }

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 6) return `${daysPassed} days ago`;
  if (daysPassed === 7) return `1 week ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // const displayDate = `
  //     ${day}.${month}.${year}`;

  // return displayDate;
  return new Intl.DateTimeFormat(locale).format(date);

  // const result = daysPassed > 6 ? displayDate : message;
  // return result;
};

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    const formattedMov = formattedCur(mov, account.locale, account.currency);

    // new Intl.NumberFormat(account.locale, {
    //   style: 'currency',
    //   currency: account.currency,
    // }).format(mov);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
     <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formattedBalance = formattedCur(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = formattedBalance;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = formattedCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = formattedCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formattedCur(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// globql vrqibles
let currentAccount, timeDown;

const startLogOutTimer = function () {
  // set time to 5 minutes
  let time = 120;

  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    // decrease timer every second
    labelTimer.textContent = `${min}:${sec}`;
    // when 0 second, stop timer and log out
    if (time === 0) {
      clearInterval(timeDown);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };
  // call tick function immediately because we need to execute this function immediately when logged in
  tick();
  // in each call, print the remaining time to UI
  timeDown = setInterval(tick, 1000);
  return timeDown;
};
// Event handlers

// Fake always login
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// const day = `${now.getDate()}`.padStart(2, 0);
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const year = now.getFullYear();
// const hour = `${now.getHours()}`.padStart(2, 0);
// const minute = `${now.getMinutes()}`.padStart(2, 0);
// labelDate.textContent = `
// ${day}.${month}.${year} , ${hour}:${minute}`;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Expermentin API
    // new Intl.DateTimeFormate('en-GB') => will formate the dates accoring to the country and language specified.
    const now = new Date();
    // define options to add to the DateTimeFormate objects:
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: '2-digit',
      // weekday: 'short',
    };

    // Get the location from the browser
    const locale = currentAccount.locale;
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    //logout timer
    if (timeDown) clearInterval(timeDown);
    timeDown = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Adding transfer dates
    currentAccount.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    // Update UI
    updateUI(currentAccount);

    // Reset the time when there is an activity
    clearInterval(timeDown);
    timeDown = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);

      // Reset the time when there is an activity
      clearInterval(timeDown);
      timeDown = startLogOutTimer();
    }, 5000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Dates and time

// Create a Date can be done by 4 different methods and all use
// new Date() but the parameters are different

// 1. // use new Date()
const nowDate = new Date();
console.log(nowDate);

// 2. use new Date('string') => js will parse the time
console.log(new Date('Sat Jul 26, 2024 '));

console.log(new Date(account1.movementsDates[0]));

// '2019-11-18T21:31:17.178Z' z : UTC => coordination
// universal timezone without any time zone in London and
// also day light savings

console.log(new Date(2029, 10, 30, 17, 28, 4));
console.log(new Date(2029, 10, 31, 17, 28, 4)); // js autocorrect the dates if wrong

console.log(new Date(0)); // unix date initiated
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // milliseconds counted from the unix date

console.log(3 * 24 * 60 * 60 * 100); // time stampe of the 3 days in this example : we get the time stamp by multiplying the days number by 24*3600*1000

// 3. creating a date you want
const future = new Date(2037, 10, 19, 17, 28);
console.log(future);
console.log(future.getFullYear());
console.log(future.getYear()); // => wrong Never use getYear()
console.log(future.getMonth());
console.log(future.getDate()); // Date of the month (0 based)
console.log(future.getDay()); // day of the week (0 based)
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); // Time follows international standard will come with the z at the end of the string UTC time

// get the time stamp of a certain date using getTime()
console.log(future.getTime()); // => 2142264480000 or use Date.now(2142264480000)
console.log(Date.now()); // gives the time stamp of today

// Can reverse from a time stamp to a date using new Date(timeStamp result)

console.log(new Date(2142264480000));

// 4. Setting a date
future.setFullYear(2040); // set new year
console.log(future);

future.setHours(20); // set new hours
console.log(+future);

// function to calculate the difference between 2 dates and convert it to days by dividing by (1000*3600*24): we get the numbers of days by dividing by 1000*3600*24

// Use date library like moment.js for compliacted hours and time differences
// best site for the country reference : http://www.lingoes.net/en/translator/langcode.htm
const dayspassed = function (date1, date2) {
  const date1Converted = +date1;
  const date2Converted = +date2;
  return Math.abs(date2Converted - date1Converted) / (1000 * 3600 * 24);
};

console.log(Date.now());

console.log(dayspassed(new Date(2037, 3, 14), new Date(2037, 3, 4)));

// For numbers we use Intl.NumberFormate('en-US', options).formate(numberToBeFormatted)
const options = {
  style: 'currency',
  currency: 'Eur',
  // useGrouping: true,
};

const num = 342434.56;
console.log('US', new Intl.NumberFormat('en-US', options).format(num));
console.log('UK', new Intl.NumberFormat('en-GB', options).format(num));
console.log('DE', new Intl.NumberFormat('de-DE', options).format(num));
console.log('FR', new Intl.NumberFormat('fr-CH', options).format(num));
console.log('SY', new Intl.NumberFormat('ar-SY', options).format(num));

// Settimeout() function, call a function and the setTimeout function will then call back the first argument after the time defined, when a setTimeout function is called it registers the first argument and waits till the time is elapsed then results are given

const ingredients = ['olives', 'spanish'];
const orderPizza = setTimeout(
  (ing1, ing2) =>
    console.log(`here is your pizza with ${ing1} and alot of ${ing2}`),
  4000,
  ...ingredients
);

// Can put aruments into the setTimeout function like shown in the following function
const orderPizza2 = setTimeout(
  function (ing1, ing2) {
    console.log(`here is the second order with ${ing1} and ${ing2}`);
  },
  10000,
  'olives',
  'mouzza'
);

// clearing the setTimeout timer
if (ingredients.includes('spanish')) clearTimeout(orderPizza);

console.log(orderPizza, orderPizza2);

// Repeat timers using setIntervals() is will allow us to do something every x amount of time repeatedly
const timeout = 1000;
setInterval(() => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = `${now.getMinutes()}`.padStart(2, 0);
  const Seconds = `${now.getSeconds()}`.padStart(2, 0);
  console.log(`${minutes}:${Seconds}`);
}, timeout);
