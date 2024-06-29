const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require('passport');
const { issLoggedin } = require("../middleware.js");

//Users
//Sign-UP
router.get("/signup",(req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync( async(req, res)=>{
    try{
        let { username, email, password, firstName, lastName, address, phone } = req.body;
        const newUser = new User({ username, email, password, firstName, lastName, address, phone });
        const registerUser = await User.register(newUser,password);
        console.log(registerUser);
        req.login(registerUser, (err) =>{
            if (err) {
                return next(err);
            }
            req.flash("success","Welcome to FurniShare!");
            res.redirect("/listings");
        });
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/users/signup");
    }
}));

//Log-IN
router.get("/login",(req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local",{failureRedirect: "/users/login" , failureFlash: true}) ,async (req,res) => {
    req.flash("success","Welcome back to FurniShare!");
    res.redirect("/listings");
});

//Log-out
router.get("/logout",(req, res, next) => {
    req.logout((err) =>{
        if (err) {
            return next(err);
        }
        req.flash("success","You are Logged out");
        res.redirect("/listings");
    });
});

//Profile
router.get("/profile", issLoggedin , wrapAsync( async(req, res, next) =>{
    let id = res.locals.crrUser._id;
    let user = await User.find(id);
    console.log(user);
    res.render("users/profile.ejs", {user : user[0]});
}))

router.get("/:id/edit", issLoggedin,wrapAsync( async(req,res)=>{
    let { id } = req.params;
    let user =  await User.findById(id);
    res.render("users/edit.ejs",{ user });
}))

router.put("/:id", issLoggedin ,wrapAsync( async(req,res)=>{
    let { id } = req.params;
    await User.findByIdAndUpdate(id,{...req.body});
    req.flash("success","Info Updated!");
    res.redirect(`/users/profile`);
}))


module.exports = router;