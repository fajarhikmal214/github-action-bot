import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
    username: string
    name: string
    isAdmin: boolean
}

const schema: Schema<IUser> = new Schema({
    username: {
        type: String,
    },
    name: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
})

export default mongoose.model('users', schema, 'users')
