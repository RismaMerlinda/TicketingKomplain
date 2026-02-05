const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ['SUPER_ADMIN', 'PRODUCT_ADMIN', 'super_admin', 'product_admin', 'agent'] },
    productId: { type: String, default: null }, // ID produk yang di-assign (jika product_admin)
    avatar: { type: String }, // Optional URL profile picture
}, { timestamps: true, collection: 'users' });

module.exports = mongoose.model('User', UserSchema);
