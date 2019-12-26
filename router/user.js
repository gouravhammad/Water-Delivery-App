const express = require('express')
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

module.exports = router