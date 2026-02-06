const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // e.g. TICKET-001
    title: { type: String, required: true },
    description: { type: String, required: true },
    product: { type: String, required: true }, // 'orbit-billiard', 'catatmak', 'joki-informatika'
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical', 'Low', 'Medium', 'High', 'Critical'], default: 'medium' },
    status: { type: String, enum: ['new', 'pending', 'in_progress', 'resolved', 'closed', 'cancelled', 'critical', 'New', 'Pending', 'In Progress', 'Done'], default: 'new' },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String },
    platform: { type: String }, // e.g. Whatsapp, Email, IG
    source: { type: String }, // Alias for platform

    // Schedule fields
    startDate: { type: String }, // dd/mm/yyyy
    startTime: { type: String }, // --:--
    endDate: { type: String },   // dd/mm/yyyy
    endTime: { type: String },   // --:--

    assignedTo: { type: String }, // Admin email or ID

    // Tracking times
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
}, { timestamps: true, collection: 'tickets' });

module.exports = mongoose.model('Ticket', TicketSchema);
