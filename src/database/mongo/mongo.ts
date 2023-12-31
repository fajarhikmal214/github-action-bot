import mongoose from 'mongoose'
import winston from 'winston'
import { Config } from '../../config/config.interface'

class Mongo {
    public static async connect(logger: winston.Logger, { db }: Config) {
        mongoose.set('strictQuery', false)

        return mongoose
            .connect(
                `mongodb+srv://${db.username}:${db.password}@${db.host}/${db.name}?retryWrites=true&w=majority`
            )
            .then(() => {
                logger.info('🚀 Connection to database established')
            })
            .catch((e) => {
                logger.error(e.message)
                process.exit(-1)
            })
    }
}

export default Mongo
