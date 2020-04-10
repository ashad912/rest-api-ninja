import mongoose from 'mongoose'

const QuestSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, //id in mongo - ninja id
        required: true,
        ref: 'ninja' //name of model!!
    }
})


export const Quest = new mongoose.model('quest', QuestSchema)