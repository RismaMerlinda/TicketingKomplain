const Profile = require('../models/Profile');

// Get Profile by Email
exports.getProfile = async (req, res) => {
    try {
        const { email } = req.params;
        const profile = await Profile.findOne({ email });
        res.json(profile || { email, displayName: "", avatar: "" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update or Create Profile
exports.updateProfile = async (req, res) => {
    try {
        const { email, displayName, avatar } = req.body;

        const profile = await Profile.findOneAndUpdate(
            { email: email.toLowerCase() },
            { displayName, avatar },
            { upsert: true, new: true }
        );

        res.json(profile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
