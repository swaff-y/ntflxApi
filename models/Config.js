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
        fullName: {
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
        },
        viewCount: {
            type: Number,
            default: 0
        },
        likeCount: {
            type: Number,
            default: 0
        },
        newVideo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)
ConfigSchema.index({fullName:"text"});
module.exports = mongoose.model("Conf",ConfigSchema);