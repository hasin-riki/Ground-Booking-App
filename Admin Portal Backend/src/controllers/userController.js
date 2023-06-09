const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const User=require('../models/userModel');
const { userAuthSchema }=require('../helpers/userAuthSchema');
const { validateEmail }=require('../helpers/authenticationHelpers.js');

async function addUser(req, res){
    try {
        //req.body validation through Joi
        // const result=await userAuthSchema.validateAsync(req.body);
        
        //checking if email or phone already registered
        const emailExists=await User.findOne({email: req.body.email});
        if(emailExists){
            return res.status(409).json({message: "Email already exists."});//Conflict
        }
        const phoneExists=await User.findOne({phone: req.body.phone});
        if(phoneExists){
            return res.status(409).json({message: "Phone number already exists."});//Conflict
        }
        
        //checking if email is of valid format
        const isValidEmail = await validateEmail(req.body.email);
        if (!isValidEmail) {
            return res.status(400).json({ message: "Invalid email format."});
        }

        //hashing password to store through bcrypt
        const hashedPassword=await bcrypt.hash(req.body.password, 10);

        //getting id of last User registered to create new id for new user
        var lastId=0;
        const lastUser=await User.find().sort({_id:-1}).limit(1);
        if(lastUser[0]!=null){
            const jsonString=JSON.stringify(lastUser[0]);
            const jsonObj=JSON.parse(jsonString);
            lastId=jsonObj.userId;
        }

        //creating new user
        const user=await User.create({
            userId: lastId+1,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            age: req.body.age,
            gender: req.body.gender,
            phone: req.body.phone,
            phoneStatus: req.body.phoneStatus || "Private",
            email: req.body.email,
            emailStatus: req.body.emailStatus || "Private",
            password: hashedPassword,
            role: req.body.role,
            bio: req.body.bio,
            profileImage: req.body.profileImage,
            coverImage: req.body.coverImage,
            mostPreferredPosition: req.body.mostPreferredPosition,
            secondPreferredPosition: req.body.secondPreferredPosition,
            status: req.body.status
        });

        res.status(200).send({message: "User successfully added!", user});
    } catch (error) {
        res.status(500).json({message: "Unable to add user."});
    }
}

async function adminLogin(req, res) {
    try {
        //checking if user exists
        const user = await User.findOne({ email: req.body.email });
        if(!user){
            return res.status(404).json({message: "Incorrect email or user does not exist."});//Not Found
        }

        //checking if user is admin
        if (user.role!="Admin") {
            return res.status(400).json({message: 'Invalid role.'});
        }

        //checking if passwords match
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: 'Incorrect password.'});
        }

        //generating tokens
        const accessToken=jwt.sign({userId: user.userId, role: user.role}, process.env.SECRET_ACCESS_TOKEN, {expiresIn: "30h"});
        const refreshToken=jwt.sign({userId: user.userId}, process.env.SECRET_REFRESH_TOKEN);

        res.status(200).send({message: "Successfully logged in!", user, accessToken, refreshToken});
    } catch (error) {
        res.status(500).json({message: 'Unable to login.'})
    }
}

async function getAllUsers(req, res) {
    try {
        //finding all users
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message: 'Unable to find users'})
    }
}

const getUser = async(req, res)=>{
    try {
        //parsing string req.params to int as userId is stored as int
        const userId=parseInt(req.params.userId);

        //finding and checking if user exists
        const user=await User.findOne({userId: userId}).populate("teams._id", "teamId teamName profileImage captain");
        if(!user){
            return res.status(404).json({message: "User with id " + userId + " does not exist"})
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

async function updateUser(req, res) {
    try {
        //parsing string req.params to int as userId is stored as int
        const userId=parseInt(req.params.userId);

        //checking if user exists
        let user=await User.findOne({userId: userId});
        if(!user){
            return res.status(404).json({message: "User with id " + userId + " does not exist"});//Not Found
        }

        //hashing password if password field needs to be updated
        if (req.body.hasOwnProperty('password')) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        //updating user
        user=await User.findOneAndUpdate({userId: userId}, req.body, {runValidators: true});

        const updatedUser = await User.findOne({userId: userId});
        res.status(200).json({message: "User successfully updated!", updatedUser});
    } catch (error) {
        res.status(500).json({message: error.message })
    }
}

async function deleteUser(req, res) {
    try {
        //parsing string req.params to int as userId is stored as int
        const userId=parseInt(req.params.userId);

        const user = await User.findOneAndDelete({userId: userId});

        if (!user) {
            return res.status(404).json({message: "User with id " + userId + " was not found."});
        }

        res.status(200).json({message: "User successfully deleted!", user});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

async function deleteAll(req, res) {
    try {
        //deleting all users for testing purposes
        const deletedUsers = await User.deleteMany({});
        res.status(200).json(deletedUsers)
    } catch (error) {
        res.status(500).json({message: error.message })
    }
}

module.exports={
    addUser,
    adminLogin,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    deleteAll
}