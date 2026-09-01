const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')



const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required : [true,"Email is required for creating an user"],
        trim : true,
        lowercase : true,
        unique : [true , "Email already exists"],
        match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid Email Address"
]
    },
    name:{
        type : String,
        require : [true ,"Name is required for creating an Account"]
    },
    password:{
        type : String,
        required : [true , "Password is required for creating an account"],
        minlength:[6,"password should contain more than 6 character"],
        select : false
    }
},{
    timestamps : true
})

//User ko database me save karne se JUST PEHLE ye code execute karo.
//MERN authentication me iska sabse common use password ko hash karne ke liye hota hai.
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return next();
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model('user',userSchema)

module.exports = userModel