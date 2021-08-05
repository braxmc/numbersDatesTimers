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
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2021-04-20T23:36:17.929Z',
    '2021-04-25T10:51:36.790Z',
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

const formatMovementsDate = function(date, locale) {
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if(daysPassed === 0) return 'Today';
  if(daysPassed === 1) return 'Yesterday';
  if(daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth()}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${month}/${day}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
}

const formatCur = function(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDate(date, acc.locale)

    const formattedMov = formatCur(mov, acc.locale, acc.currency)

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

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
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

const startLogOutTimer = function() {
  const tick = function() {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the ramaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds log out the user
    if(time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000)

  return timer
}

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// const now = new Date();


btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth()}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // month/day/year
    // labelDate.textContent = `${month}/${day}/${year}, ${hour}:${min}`;

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // long, 2-digit
      year: 'numeric', // 2-digit
      // weekday: 'long', // short, narrow
    };
    // const locale = navigator.language;
    // console.log(locale);
    
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if(timer) {
      clearInterval(timer);
    };
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
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

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value)

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {

    setTimeout(function() {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString())

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +(inputClosePin.value) === currentAccount.pin
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
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Lecture 1

// Converting and checking numbers

// console.log(23 === 23.0);

// console.log(0.1 + 0.2);
// console.log(0.1 + 0.2 === 0.3);

// // converting to number
// console.log(Number('23'));
// console.log(+ '23');

// // Parsing
// // JS looks for number, string must start with num
// console.log(Number.parseInt('30px', 10));
// console.log(Number.parseInt('e23', 10));

// console.log(Number.parseFloat(' 2.5rem'));
// console.log(Number.parseInt('2.5rem'));

// // checking if value is not a number
// console.log('is not a num');
// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20X'));
// console.log(Number.isNaN(23 / 0));

// // checking if value is a number
// console.log('is a num');
// console.log(Number.isFinite(20));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20'));
// console.log(Number.isFinite(23 / 0));

// console.log(Number.isInteger(20));
// console.log(Number.isInteger('20'));
// console.log(Number.isInteger(20 / 0));

/////////////////////////////////////////////////

// Lecture 2

// Math and Rounding

// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3));

// console.log(Math.max(5, 18, 23, 11, 2)); // pulls max value
// console.log(Math.max(12, 20, '40', 10, 1));
// console.log(Math.max('48px', 12, 18, 20, 30));

// console.log(Math.min(40, 45, 50, 1, 3)); // pulls min value

// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = (min, max) => Math.trunc(Math.random() * (max - min) + 1) + min;
// console.log(randomInt(1, 20));


// // Rounding Integers
// console.log(Math.trunc(23.44)); // removes decimals
// console.log(Math.round(23.54)); // rounds to nearst whole number
// console.log(Math.ceil(23.44)); // rounds up
// console.log(Math.floor(23.8)); // rounds down

// console.log(Math.trunc(-20.5));
// console.log(Math.floor(-24.5)); // on neg it takes down lower
// console.log(Math.ceil(-24.5)); // on neg it puts number higher

// // Rounding decimals
// console.log((2.7).toFixed(0)); // converts num to string
// console.log((2.7).toFixed(4)); // nums tell how many nums after .
// console.log((2.754).toFixed(2)); // will cut off decimals also
// console.log(+(2.754).toFixed(2)); // + converts it to a integer again

/////////////////////////////////////////////////

// Lecture 3

// Remainder

// console.log(5 % 2); // 2 can go into 5 twice with a remainder of 1
// console.log(5 / 2); // 5 = 2 * 2 + 1

// console.log(8 % 3); // 3 can go into 8 twice with a remainder of 2
// console.log(8 / 3);

// console.log(6 % 2); // there is no remainder so shows 0
// console.log(6 / 2); 


// const isEven = n => n % 2 === 0; // checks to see if num is even
// console.log(isEven(2));
// console.log(isEven(33));
// console.log(isEven(66));

// labelBalance.addEventListener('click', function() {
//   [...document.querySelectorAll('.movements__row').forEach(function(row, i) {
//     if(i % 2 === 0) {
//       row.style.backgroundColor = 'orangered'
//     }
//     if(i % 3 === 0) {
//       row.style.backgroundColor = 'blue'
//     }
//   })]
// });

/////////////////////////////////////////////////

// Lecture 4

// Working wtih bigInt

// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);

// console.log(2 ** 53 + 1);

// console.log(8763096512837658235692365982365926192836n);
// console.log(BigInt(876238764));

// // Operations
// console.log(10000n + 10000n);
// console.log(981264912694612946921649126n * 2132984712987918273918279312n);

// const huge = 98274972947219874927492n;
// const num = 23;
// console.log(huge + BigInt(num));

// // Exceptions
// console.log(20n > 15);
// console.log(20n === 20);
// console.log(typeof 20n);
// console.log(20n == '20');

// console.log(huge + ' is really big!');

// // Divisions
// console.log(10n / 3n);
// console.log(10 / 3);

/////////////////////////////////////////////////

// Lecture 5

// Creating dates

// Create a date
// const newDate = new Date();
// console.log(newDate);

// console.log(new Date('Aug 02 2020 18:05:41'));
// console.log(new Date('December 25, 2015'));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 18, 15, 23, 5)); // Month [2] is 0 based
// console.log(new Date(2037, 10, 34, 15, 23, 5)); // corrects to Dec 4th

// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// Working with Dates
// const future = new Date(2037, 10, 19, 15, 23)
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());

// console.log(new Date(2142282180000));

// console.log(Date.now());

// future.setFullYear(2040)
// console.log(future);

/////////////////////////////////////////////////

// Lecture 6

// Operators on Dates

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);

// const calcDaysPassed = (date1, date2) => Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)

// const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
// console.log(days1); // result is 10 days

// const days2 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
// console.log(days2); // will also be positive 10

/////////////////////////////////////////////////

// Lecture 7

// Internationalizing numbers

// const num = 3884764.23;

// const options = {
//   style: 'currency',
//   unit: 'celsius',
//   currency: 'USD', // EUR
//   // useGrouping: false,
// }

// console.log('us: ', new Intl.NumberFormat('en-US', options).format(num));
// console.log('germany: ', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('syria: ', new Intl.NumberFormat('ar-SY', options).format(num));
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language, options).format(num)
// );

/////////////////////////////////////////////////

// Lecture 8

// Timers: setTimeout and setInterval 

// setTimeout
const ingredients = ['olives', 'spinach']

const pizzaTimer = setTimeout((ing1, ing2) => 
console.log(`Here is your pizza with ${ing1} and ${ing2}`), 
3000, 
...ingredients);
console.log('Waiting.....');

// cancels timer if it includes spinach
if(ingredients.includes('spinach')) {
  clearTimeout(pizzaTimer)
};

// setInterval
setInterval(function() {
  const now = new Date();

  const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };

  console.log(new Intl.DateTimeFormat('us-en', options).format(now));
}, 1000); // every 1 seconds it will run again and print to console