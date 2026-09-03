const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true,
		unique: true
	},
	expiresAt: {
		type: Date,
		required: true,
		expires: 0
	}
});

const tokenBlacklistModel = mongoose.model('tokenBlacklist', tokenBlacklistSchema);

module.exports = tokenBlacklistModel;