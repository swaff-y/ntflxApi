const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        url: {
            type: String,
            required: true
        },
        file: {
            type: String,
            required: true
        },
        tag: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Conf",ConfigSchema);