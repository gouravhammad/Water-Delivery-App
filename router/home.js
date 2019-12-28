const express = require('express')
const { check, validationResult } = require('express-validator');
const router = express.Router()
const connection = require('../utility/mysqlConn')

router.get('/',function(req,res){
    try
    {
        res.render('Home')
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.get('/login',function(req,res){
    try
    {
        user = { mobileno:null, password:null }
        error = { mobileError:null, passwordError:null }

        res.render('Login',{user,error})
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.get('/register',function(req,res){
    try
    {
        user = { email:null, mobileno:null, username:null, password:null }
        error = {nameError:null, passwordError:null, emailError:null, mobileError:null}

        res.render('Register',{user,error,regError:null})
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.post('/addUser', [
    check('email','Must be of Min 5 and Max 30 length').trim().isEmail().isLength({ min: 5 , max: 30}),
    check('mobileno','Must be 10 digits').trim().isLength({ min: 10 , max: 10}),
    check('username','Must be of Min 5 and Max 20 length').trim().isLength({ min: 5 , max: 20}),
    check('password','Must be of Min 8 and Max 20 length').trim().isLength({ min: 8 , max: 20})
  ], (req, res) => {

    try
    {
        const errors = validationResult(req);
        
        user = {
            email: req.body.email,
            mobileno: req.body.mobileno,
            username: req.body.username,
            password: req.body.password
        }

        error = {nameError:null, passwordError:null, emailError:null, mobileError:null}

        for(i = 0; i < errors.errors.length; i++)
        {
            name =  errors.errors[i].param

            if(name === 'username')
            {
                error.nameError = errors.errors[i].msg
            }
            else if(name === 'email')
            {
                error.emailError = errors.errors[i].msg
            }
            else if(name === 'password')
            {
                error.passwordError = errors.errors[i].msg
            }
            else
            {
                error.mobileError = errors.errors[i].msg
            }
        }

        if (!errors.isEmpty())
        {
            res.render('Register',{user:user,error:error,regError:null})
        }
        else
        {
            var sql = "select * from user where mobileno = ?"
            x = [[user.mobileno]]
    
            connection.query(sql,[x],function(err,result){
                if(err) throw err
                if(result.length == 1)
                {
                    res.render('Register',{user,error,regError:'Mobile already registered'})
                }
                else
                {
                    var address = 'Indore'
                    var sql = "insert into user values ?"
                    x = [[user.mobileno,user.username,user.email,address,user.password]]
            
                    connection.query(sql,[x],function(err,result){
                        if(err) throw err

                        req.session.mobileno = user.mobileno
                      
                        res.render('Alert',{
                            type:"success",
                            title:"Account Created",
                            text:"You have successfully created your account",
                            link:"user?category=drinking"
                        }) 
                    })
                }
            }) 
        }
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.post('/loginVerify', [
    check('mobileno','Must be 10 digits').trim().isLength({ min: 10 , max: 10}),
    check('password','Must be of Min 8 and Max 20 length').trim().isLength({ min: 8 , max: 20})
  ], (req, res) => {

    try
    {
        const errors = validationResult(req);
        
        user = {
            mobileno: req.body.mobileno,
            password: req.body.password
        }

        error = {mobileError:null, passwordError:null}

        for(i = 0; i < errors.errors.length; i++)
        {
            name =  errors.errors[i].param

            if(name === 'mobileno')
            {
                error.mobileError = errors.errors[i].msg
            }
            else
            {
                error.passwordError = errors.errors[i].msg
            }
        }

        if (!errors.isEmpty())
        {
            res.render('Login',{user:user,error:error})
        }
        else
        {
            var sql = "select * from user where password = '" + user.password + "' and mobileno = " + user.mobileno 
            
            connection.query(sql,function(err,result){
                if(err) throw err
                if(result.length == 0)
                {
                    res.render('Alert',{
                        type:"error",
                        title:"Oops...",
                        text:"Invalid Mobile/Password",
                        link:"login"
                    })
                }
                else
                {
                    req.session.mobileno = user.mobileno
                    res.redirect('../user?category=drinking')
                }
            }) 
        }
    }
    catch(e)
    {
        res.redirect('/')
    }
})

module.exports = router