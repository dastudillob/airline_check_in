const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'mdb-test.c6vunyturrl6.us-west-1.rds.amazonaws.com',
  user: 'bsale_test',
  password: 'bsale_test',
  database: 'airline'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }

  console.log('Connected to database with ID ' + connection.threadId);
});


const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.get('/passengers', (req, res) => {
  connection.query('SELECT * FROM airline.passenger JOIN boarding_pass ON passenger.passenger_id = boarding_pass.passenger_id JOIN purchase ON purchase.purchase_id = boarding_pass.purchase_id JOIN flight ON boarding_pass.flight_id = flight.flight_id', (error, results, fields) => {
    if (error) {
      console.error('Error executing query: ' + error.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.json(results);
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



app.get('/flight/:id', (req, res) => {
  const flightId = req.params.id;
  connection.query('SELECT * FROM flight JOIN airplane ON flight.airplane_id = airplane.airplane_id WHERE flight.flight_id = ?', [flightId], (error, results, fields) => {
    if (error) {
      console.error('Error executing query: ' + error.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }
    return res.json(results[0]);
  });
});

app.get('/passengers/:id', (req, res) => {
  const flightId = req.params.id;
  connection.query('SELECT * FROM airline.passenger JOIN boarding_pass ON passenger.passenger_id = boarding_pass.passenger_id JOIN purchase ON purchase.purchase_id = boarding_pass.purchase_id JOIN flight ON boarding_pass.flight_id = flight.flight_id WHERE flight.flight_id = ?', [flightId], (error, results, fields) => {
    if (error) {
      console.error('Error executing query: ' + error.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }
    const passengers = [];
    for (let i = 0; i < results.length; i++) {
      passengers.push(results[i]);
    }
    return res.json(passengers);
  });
});



function searchFlight() {
  const flightIdInput = document.getElementById('flight-id-input');
  const flightId = flightIdInput.value;
  fetch(`http://localhost:3000/flight/${flightId}`)
    .then(response => response.json())
    .then(data => displayFlight(data));
}

function searchFlightpass() {
  const flightIdInput = document.getElementById('flight-id-input');
  const flightId = flightIdInput.value;
  fetch(`http://localhost:3000/passengers/${flightId}`)
    .then(response => response.json())
    .then(data => displayFlightpass(data));
}


function displayFlight(data) {
  const flightTableBody = document.getElementById('flight-table-body');
  flightTableBody.innerHTML = '';
  const row = flightTableBody.insertRow();
  const takeoffdateCell = row.insertCell();
  const takeoffairportCell = row.insertCell();
  const landingdateCell = row.insertCell();
  const landingairportCell = row.insertCell();
  const airplaneCell = row.insertCell();
  takeoffdateCell.innerText = data.takeoff_date_time;
  takeoffairportCell.innerText = data.takeoff_airport;
  landingdateCell.innerText = data.landing_date_time;
  landingairportCell.innerText = data.landing_airport;
  airplaneCell.innerText = data.name;
}

function displayFlightpass(data) {
  const passengerTableBody = document.getElementById('passenger-table-body');
  passengerTableBody.innerHTML = '';
  for (let i = 0; i < data.length; i++) {
    const row = passengerTableBody.insertRow();
    const dniCell = row.insertCell();
    const nameCell = row.insertCell();
    const ageCell = row.insertCell();
    const countryCell = row.insertCell();
    const boardingCell = row.insertCell();
    const purchaseCell = row.insertCell();
    const seatCell = row.insertCell();
    dniCell.innerText = data[i].dni;
    nameCell.innerText = data[i].name;
    ageCell.innerText = data[i].age;
    countryCell.innerText = data[i].country;
    boardingCell.innerText = data[i].boarding_pass_id;
    purchaseCell.innerText = data[i].purchase_id;
    seatCell.innerText = data[i].seat_type_id;
  }
}





