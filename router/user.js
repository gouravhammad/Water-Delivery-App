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
            next();
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
        var mobileno = req.session.mobileno
        var category = req.query.category
        var drinking = true
        var domestic = false

        if(category)
        {
            var sql1 = "select * from product where category='"+category+"' ; "
            
            if(category == 'domestic')
            {
                drinking = false
                domestic = true
            }
        }
        else
        {
            var sql1 = "select * from product where category='drinking' ; "
        }

        var sql2 = "select count(*) as cartTotal from cart where mobileno="+mobileno+" ; "
        var sql = sql1 + sql2

        connection.query(sql,function(error,result){
           
            if(error) throw error

            res.render('UserHome',{
                result:result[0],
                drinking,
                domestic,
                cartTotal:result[1]
            })
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
                
        var x = [[mobileno,pId,quantity]]
                
        connection.query(sql,[x],function(err,result){
            try
            {
                if(err) throw err

                res.render('Alert',{
                    type:"success",
                    title:"Added to cart",
                    text:"Product has been added to cart",
                    link:"/user?category="+category
                }) 
            }
            catch(e)
            {
                res.render('Alert',{
                    type:"info",
                    title:"Already added",
                    text:"Product is already there in cart",
                    link:"/user?category="+category
                })
            }
        })
    } 
    catch(e)
    {
        res.redirect('/')
    }
})

router.post('/buyNow',function(req,res){  
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
                
        var x = [[mobileno,pId,quantity]]
                
        connection.query(sql,[x],function(err,result){
            try
            {
                if(err) throw err

                res.redirect('cart')
            }
            catch(e)
            {
                res.redirect('cart')
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
        var mobileno = req.session.mobileno

        var sql1 = "select * from user where mobileno="+mobileno+" ; "
        var sql2 = "select count(*) as cartTotal from cart where mobileno="+mobileno
        var sql = sql1 + sql2

        connection.query(sql,function(err,result){
            
            if(err) throw err
           
            res.render('MyAccount',{
                result:result[0],
                cartTotal:result[1]
            })
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
        var mobileno = req.session.mobileno
        var error = {
            nameError:null,
            addressError:null,
            emailError:null,
            passwordError:null
        }

        var sql1 = "select * from user where mobileno="+mobileno+" ; "
        var sql2 = "select count(*) as cartTotal from cart where mobileno="+mobileno
        var sql = sql1 + sql2

        connection.query(sql,function(err,result){
        
            if(err) throw err
           
            res.render('UpdateUser',{
                user:result[0],
                cartTotal:result[1]
            })
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
        
        var user = {
            email: req.body.email,
            username: req.body.username,
            address: req.body.address,
            password: req.body.password,
            mobileno: req.body.mobileno
        }

        error = {
            nameError:null,
            passwordError:null,
            emailError:null,
            addressError:null
        }

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
            var sql = "select count(*) as cartTotal from cart where mobileno="+user.mobileno
            
            connection.query(sql,function(err,result){
                if(err) throw err
               
                res.render('Updateuser',{
                    user:[user],
                    error,
                    cartTotal:result
                })
            })
        }
        else
        {
            var sql = "update user set username='"+user.username+"', email='"+user.email+"', address='"+user.address+"', password='"+user.password+"' where mobileno="+user.mobileno+"; "
          
            connection.query(sql,function(err,result){
                
                if(err) throw err
              
                res.render('Alert',{
                    type:"success",
                    title:"Account Updated",
                    text:"You have successfully updated your account",
                    link:"/user/myAccount"
                })   
                     
            }) 
        }
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.get('/cart',function(req,res){ 
    try
    {
        var mobileno = req.session.mobileno

        var sql1 = "select p.pId,p.price,p.name,p.picture,c.quantity from product p,cart c where p.pId=c.pId and c.mobileno="+mobileno+" ; "
        var sql2 = "select count(*) as cartTotal from cart where mobileno="+mobileno+" ; "
        var sql3 = "select sum(p.price*c.quantity) as total from cart c,product p where c.pId = p.pId and c.mobileno="+mobileno+" ; "
        var sql = sql1 + sql2 + sql3
       
        connection.query(sql,function(err,result){
           
            if(err) throw err
           
            if(result[0].length >= 1)
            {
                res.render('Cart',{
                    result:result[0],
                    cartTotal:result[1],
                    total:result[2],
                    error:null
                })
            }
            else
            {
                res.render('Cart',{
                    result:null,
                    cartTotal:result[1],
                    total:null,
                    error:'No items in cart'
                })
            }
        })   
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.post('/removeFromCart',function(req,res){ 
    try
    {
        var mobileno = req.session.mobileno
        var pId = req.body.pId

        var sql = "delete from cart where pId="+pId+" and mobileno="+mobileno
       
        connection.query(sql,function(err,result){
            
            if(err) throw err
          
            res.redirect('cart') 
        })   
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.post('/changeQuantity',function(req,res){ 
    try
    {
        var mobileno = req.session.mobileno
        var quantity = req.body.name
        var pId = req.body.pId

        var sql = "update cart set quantity="+quantity+" where pId="+pId+" and mobileno="+mobileno
       
        connection.query(sql,function(err,result){
            
            if(err) throw err
          
            res.redirect('cart')
        })   
    }
    catch(e)
    {
        res.redirect('/')
    }
})

router.get('/payment',function(req,res){ 
    try
    {
        var mobileno = req.session.mobileno

        var sql1 = "select count(*) as cartTotal from cart where mobileno="+mobileno+" ; "
        var sql2 = "select sum(p.price*c.quantity) as total from cart c,product p where c.pId = p.pId and c.mobileno="+mobileno+" ; "
        var sql = sql1+sql2
        
        connection.query(sql,function(err,result){
           
            if(err) throw err
           
            res.render('Checkout',{
                cartTotal:result[0],
                total:result[1]
            })
        })
    }
    catch(e)
    {
        res.redirect('/')
    }
})


module.exports = router