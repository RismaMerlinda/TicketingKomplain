const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected. Deleting all tickets...');
        await Ticket.deleteMany({});
        console.log('All tickets deleted.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
