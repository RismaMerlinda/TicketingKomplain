const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    displayName: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ""
    }
}, {
    timestamps: true,
    collection: 'profiles'
});

module.exports = mongoose.model('Profile', ProfileSchema);
