const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // e.g. TICKET-001
    title: { type: String, required: true },
    description: { type: String },
    product: { type: String, required: true }, // e.g. 'orbit', 'joki'
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['new', 'pending', 'in_progress', 'resolved', 'closed', 'cancelled', 'critical'], default: 'new' },
    customerName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    platform: { type: String }, // e.g. Whatsapp, Email
    assignedTo: { type: String }, // Admin email or ID

    // Tracking times
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    prioritySetAt: { type: Date },

    // Tracking conversation/activity logic could go here later
    messages: [{
        sender: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true, collection: 'tickets' });

module.exports = mongoose.model('Ticket', TicketSchema);
