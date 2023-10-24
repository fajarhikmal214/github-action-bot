import mongoose, { Document, Schema } from 'mongoose'

export interface IScenario extends Document {
    code: string
    name: string
    description: string
    value: string
}

const schema: Schema<IScenario> = new Schema({
    code: {
        type: String,
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    value: {
        type: String,
    },
})

export default mongoose.model('scenarios', schema, 'scenarios')
