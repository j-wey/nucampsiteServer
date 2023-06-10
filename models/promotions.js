const mongoose = requrie('mongoose')
const Schema = mongoose.Schema

const promotionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean
    },
    cost: {
        type
    }
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Partner = mongoose.model('Partner', promotionSchema)

module.exports = Partner