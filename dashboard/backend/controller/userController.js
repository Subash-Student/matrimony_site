import { userModel } from "../model/userModel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import validator from "validator";
import profilesModel from "../model/profileModel.js";
dotenv.config();



 const otpStore = {};



// OTP VERIFY CONTROLLER



export const verify = async(req,res)=>{
    
    const {name,phone,email,password} = req.body;

    const existEmail =await userModel.findOne({email});
    const existPhone = await userModel.findOne({phone});
    
    if(existEmail){
       return res.json({success:false,message:"Email Already Registered !"});
    }
    if(existPhone){
      return  res.json({success:false,message:"Phone No Already Registered !"});
    }
    if(password.length < 8){
        return  res.json({success:false,message:"Please Enter Strong Password !"});
    }
   
//    SEND OTP

    if(sentOTP(email,name)){
        res.json({success:true,message:"OTP has been successfully sent to your registered email address"});  
    }else{
        res.json({success:false,message:"Failed To Send OTP"});     
    }
    
}


// REGISTER CONTROLLER

export const register = async(req,res)=>{
    
    const {name,phone,email,password,otp} = req.body;
    
    const storedOtp = otpStore[email];
    const{OTP,expireTime} = storedOtp;
    
    if(Date.now() > expireTime && OTP==otp){
        return res.json({success:false,message:"Your OTP has expired !"});
    }

   if(OTP != otp){
      return res.json({success:false,message:"Oops! The OTP you entered is incorrect."})
    }else{
       delete otpStore[email];
    }
    

   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword =  await bcrypt.hash(password,salt);



    const newUser = userModel({
        name:name,
        phone:phone,
        email:email,
        password:hashedPassword
    })
    const newProfileSave = async(id)=>{
        
        const newProfile = profilesModel({
            user_id:id,
            basicInfo:{
                name:name
            },
            contactInfo:{
                phone:phone,
                email:email
            }
        })

         await newProfile.save();
    }

    try {
       const user = await newUser.save();
       newProfileSave(user._id)
       const token =  generateToken(user._id);
       const encryptedToken = setEncryptedToken(token);
       res.json({success:true,message:"Successfully Registered ",encryptedToken:encryptedToken});
    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            res.json({success:false, message: 'Validation failed', errors });
          } else {
            res.status(500).json({ message: 'Server error', error: error.message });
          }
    }

}


// GET USER DATA

export const getUserData = async(req,res)=>{

    const user_id =  req.id;
try {
    const userData = await userModel.findById(user_id,"-password");
    if(!userData){
        return res.json({success:false,message:"User Not Found !"});
    }
    return res.json({success:true,userData:userData});
    
} catch (error) {
     console.log(error);
     return res.json({success:false,message:"Failed To GeT User Data !"});
    }
}


// LOGIN CONTROLLER


export const SignIn = async(req,res)=>{
 
    const {userName,password} = req.body;
    let user;
    try {
        if(validator.isEmail(userName)){
            const email = userName;
             user = await userModel.findOne({email});
        }else{
            const phone = userName;
             user = await userModel.findOne({phone});
        }
       
        
        if(!user){
            return res.json({success:false,message:"User Does't Exist !"})
        }
        
        const isMatch = await bcrypt.compare(password,user.password);
        
        if(!isMatch){
           return res.json({success:false,message:"Password Does't Match !"})
        }
        
        if(user && isMatch){
            const token = generateToken(user._id);
            const encryptedToken = setEncryptedToken(token);
             
            return res.json({success:true,message:"Login successful !",encryptedToken:encryptedToken})
        }

    } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Failed To SignIn !"})
    }
}


// CONTROLLER FOR FORGOT-PASSWORD

export const forgotPassword = async(req,res)=>{

    const {email} = req.body;

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"This Email Is Not Registered. Please Try Again"})
        }else{
           
           if(sentOTP(email,user.name)){
                    res.json({success:true,message:"OTP has been successfully sent to your registered email address"});  
           }else{
                    res.json({success:false,message:"Failed To Send OTP"});     
           }
        }

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Something Wrong In Sent OTP !"})
    }

}


// VERIFY OTP

export const verifyOTP = async(req,res,next)=>{

    const{otp,email} = req.body;

    const storedOtp = otpStore[email];
    const{OTP,expireTime} = storedOtp;
    
    if(Date.now() > expireTime && OTP==otp){
        return res.json({success:false,message:"Your OTP has expired !"});
    }

   if(OTP != otp){
      return res.json({success:false,message:"Oops! The OTP you entered is incorrect"})
    }else{
        delete otpStore[email];
    }
    
    return res.json({success:true,message:"OTP verified successfully!"})
 }


// CONTROLLER FOR RESET-PASSWORD 


export const resetPassword = async(req,res)=>{

    const{newPassword,comfirmPassword,email} = req.body;
    

    if(newPassword !== comfirmPassword){
        return res.json({success:false,message:"Pasword Does't Match !"})
    }else{
        try {
            const user = await userModel.findOne({email});
            const salt = await bcrypt.genSalt(10);
            const newHashedPassword =  await bcrypt.hash(newPassword,salt);


            
            user.password = newHashedPassword;
            
            await user.save();
            
            res.json({success:true,message:"Your password has been updated successfully !"})
            
            
        } catch (error) {
            console.log(error);
            return res.json({success:false,message:"Failed To Update Password !"});

        }
    }
    
}















// FUNCTION FOR SEND OTP TO MAIL 

const sentOTP = async(email,name)=>{

     //  OTP GENERATION

    const OTP = generateOTP(5);
    const expireTime = Date.now()+300*1000;

    otpStore[email] = {OTP,expireTime};
    console.log(otpStore)
    
   
    // NODEMAILER CONFIG
 
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"subashmurugan2021@gmail.com",
            pass:process.env.NODEMAILER_PASS,
        }
    });

    const mailOption = {
        form:"subashmurugan2021@gmail.com",
        to:email,
        subject:"Complete Your Kalanjiyam Kalyana Malai Registration with this OTP",
        text:`Dear ${name},

        Thank you for registering with Kalanjiyam Kalyana Malai !
        
        To complete your registration and verify your account, please use the following One-Time Password (OTP):
        
        OTP: ${OTP}
        
        This OTP is valid for the next 5 minutes. Please do not share this OTP with anyone for your security.
        
        If you did not initiate this registration, please contact our support team immediately.
        
        Thank you for choosing Kalangiyum Kalyana Maalai, where we help you find your perfect match!
        
        Best regards,
        The Kalanjiyam Kalyana Malai Team
        [Website URL]
        [Customer Support Contact Information]
        
        `
    }
    await transporter.sendMail(mailOption).then(()=>{
        return true;
    }).catch((e)=>{
        console.log(e.message);
        return false;
    })

}



// FUNCTION FOR OTP GENERATION

const generateOTP = (length)=>{
    let otp = "";
    for(let i =0;i<length;i++){
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

// FUNCTION FOR GENERATE JWT TOKEN

const generateToken = (id)=>{

    return jwt.sign({id},process.env.SECRET_KEY,{
       expiresIn:"24h"
    });
}

// EXTRA ENCRYPTING THE TOKEN

function setEncryptedToken(token) {
    const encryptedToken = CryptoJS.AES.encrypt(token, process.env.SECRET_KEY_2).toString();
    return encryptedToken;
  }