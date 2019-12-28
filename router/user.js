const express = require('express')
const { check, validationResult } = require('express-validator');
const router = express.Router()
const connection = require('../utility/mysqlConn')

router.use('/',function(req,res,next){ 
    try
    {
        var mobileno = req.session.mobileno
          
        if(!mobileno)
        {
            res.render('Alert',{
                type:"error",
                title:"Login to continue",
                text:"You have logged out, please login to continue",
                link:"/"
            })
        }
        else
        {
            next()
        } 
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.get('/logout',function(req,res){ 
    try
    {
         req.session.mobileno = null

         res.render('Alert',{
            type:"success",
            title:"Logged Out",
            text:"You have been logged out",
            link:"/"
        })
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.get('/',function(req,res){
    try
    {
        var category = req.query.category
        var drinking = true
        var domestic = false

        if(category)
        {
            var sql = "select * from product where category = '" + category + "'"
            
            if(category == 'domestic')
            {
                drinking = false
                domestic = true
            }
        }
        else
        {
            var sql = "select * from product where category = 'drinking'"
        }

        connection.query(sql,function(error,result){
            if(error) throw error

            res.render('UserHome',{result,drinking,domestic,cartTotal:10})
        })
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.post('/addToCart',function(req,res){  
    try
    {
        var pId = req.body.pId
        var category = req.body.category
        
        if(category == 'true')
        {
            category = 'drinking'
        }
        else
        {
            category = 'domestic'
        }

        var mobileno = req.session.mobileno
        var quantity = 1

        var sql = "insert into cart values ?"
                
        x = [[mobileno,pId,quantity]]
                
        connection.query(sql,[x],function(err,result){
            try
            {
                if(err) throw err

                if(result.affectedRows == 1)
                {
                    res.render('Alert',{
                        type:"success",
                        title:"Added to cart",
                        text:"Product has been added to cart",
                        link:".?category=" + category
                    }) 
                }
            }
            catch(e)
            {
                res.render('Alert',{
                    type:"info",
                    title:"Already added",
                    text:"Product is already there in cart",
                    link:".?category=" + category
                })
            }
        })
    } 
    catch(e)
    {
        res.redirect('/')
    }
})

router.get('/myAccount',function(req,res){
    try
    {
        var sql = "select * from user where mobileno = ?"
        x = [[user.mobileno]]

        connection.query(sql,[x],function(err,result){
            if(err) throw err
            if(result.length == 1)
            {
                res.render('MyAccount',{result})
            }
            else
            {
                console.log("Problem myAccount")
            }
        })
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.get('/updateUser',function(req,res){
    try
    {
        var sql = "select * from user where mobileno = ?"
        x = [[user.mobileno]]

        connection.query(sql,[x],function(err,result){
            if(err) throw err
            if(result.length == 1)
            {
                res.render('UpdateUser',{user:result[0]})
            }
            else
            {
                console.log("Problem myAccount")
            }
        })
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.post('/saveChangesUser', [
    check('email','Email must be of Min 5 and Max 30 length').trim().isEmail().isLength({ min: 5 , max: 30}),
    check('username','Must be of Min 5 and Max 20 length').trim().isLength({ min: 5 , max: 20}),
    check('password','Must be of Min 8 and Max 20 length').trim().isLength({ min: 8 , max: 20}),
    check('address','Must be of Min 5 and Max 20 length').trim().isLength({ min: 5 , max: 20})
  ], (req, res) => {

    try
    {
        const errors = validationResult(req);
        
        user = {
            email: req.body.email,
            username: req.body.username,
            address: req.body.address,
            password: req.body.password,
            mobileno: req.body.mobileno
        }

        error = {nameError:null, passwordError:null, emailError:null, addressError:null}

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
                error.addressError = errors.errors[i].msg
            }
        }

        if (!errors.isEmpty())
        {
            res.render('UpdateUser',{user:user,error:error})
        }
        else
        {
            var sql = "update user set username = '" + user.username + "', email = '" + user.email + "', address = '" + user.address + "', password = '" + user.password + "' where mobileno = " + user.mobileno
          
            console.log(sql)
            connection.query(sql,function(err,result){
                if(err) throw err
                if(result.affectedRows == 1)
                {
                    res.render('Alert',{
                        type:"success",
                        title:"Account Updated",
                        text:"You have successfully updated your account",
                        link:"/user/myAccount"
                    })   
                }
                else
                {
                    console.log("Error in Updating")
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