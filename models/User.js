const mongoose = require('mongoose')

// User Schema
const UserSchema = new mongoose.Schema({
    // Name
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },

    // Telephone Number
    telephoneNumber: {
        type: String,
        required: [true, 'Please add a telephone number'],
    },

    // Email
    email: {
        type: String,
        require: [true, 'Please add an email'],
        unique: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please add a valid email'
        ],
        lowercase: true,
    },

    // Role
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // Password (hashed)
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },

    // Reset password token
    resetPasswordToken: String,

    // Reset password expire timestamp
    resetPasswordExpire: Date,

    // Creating timestamp
    createdAt: {
        type: Date,
        default: Date.now
    },
})

// Encryot password using bcrypt
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

// Match user entered password to hash password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);