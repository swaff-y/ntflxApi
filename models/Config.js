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
        display: {
            type: Number,
            default: null
        },
        one: {
            type: String,
            default: null
        },
        two: {
            type: String,
            default: null
        },
        three: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            default: null
        },
        duration: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Conf",ConfigSchema);