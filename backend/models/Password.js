const mongoose = require('mongoose');

// Schema untuk menyimpan riwayat / audit log perubahan password
const PasswordUpdateSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    oldPassword: {
        type: String
    },
    newPassword: {
        type: String,
        required: true
    },
    productName: {
        type: String
    }, // Nama produk admin (misal: Joki) yang mengganti
    updatedBy: {
        type: String
    }, // Nama admin yang melakukan perubahan
    productId: {
        type: String
    }
}, {
    timestamps: true,
    collection: 'password_logs'
});

module.exports = mongoose.model('Password', PasswordUpdateSchema);
