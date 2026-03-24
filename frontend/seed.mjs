import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { User } from './src/lib/models.js' // We'll run this via ts-node or just use basic js

const uri = 'mongodb://localhost:27017/tpms'

async function seedAdmin() {
    try {
        await mongoose.connect(uri)
        const hash = await bcrypt.hash('123', 10)

        let admin = await User.findOne({ email: 'admin@fly.com' })

        if (!admin) {
            admin = await User.create({
                name: 'Admin',
                email: 'admin@fly.com',
                password: hash,
                role: 'ADMIN'
            })
            console.log('Created Admin user via Mongoose:', admin.email)
        } else {
            console.log('Admin already exists via Mongoose:', admin.email)
        }
    } catch (error) {
        console.error('Seed error:', error)
    } finally {
        await mongoose.disconnect()
    }
}

seedAdmin()
