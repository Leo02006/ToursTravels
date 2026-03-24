const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const uri = 'mongodb://localhost:27017/tpms'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'COMPANY', 'ADMIN'], default: 'CUSTOMER' },
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

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
