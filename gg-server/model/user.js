const db = require('../utils/database.js')
//定义schema 域
const schema = new db.Schema({
    username: {
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    roles: {
        type: Number,
        required: true
    },
    userHeadImg:{
        type:String
    }
})
const User = db.model('users',schema)
module.exports = User
