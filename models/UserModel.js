const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User Schema
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['guest', 'user', 'admin'],
      default: 'user'
    },

    // Payment History
    // payments: [
    //   {
    //     amount: { type: Number, required: true },
    //     currency: { type: String, default: 'INR' },
    //     paymentDate: { type: Date, default: Date.now },
    //     status: { type: String, enum: ['success', 'pending', 'failed'], default: 'pending' },
    //     provider: { type: String }, // e.g., 'Razorpay', 'Stripe'
    //     paymentId: { type: String }, // External payment ID (if applicable)
    //   }
    // ]
  },
  { timestamps: true }
);

// Hash password before saving
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();

//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// Compare password method for login
// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// Export model
const User = mongoose.model('User', UserSchema);
module.exports = User;
