const express = require('express')
const router = express.Router()
const connection = require('../utility/mysqlConn')

router.use('/',function(req,res,next){ 
    try
    {
        var mobileno = req.session.mobileno
          
        if(!mobileno)
        {
            res.write("<script>alert('Please login to continue'); document.location.href='/'; </script>");
            res.end()
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

router.get('/addToCart',function(req,res){  
    try
    {
        var pId = req.query.pId
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
                    res.write("<script>alert('Added to cart'); document.location.href='/user'; </script>");
                    res.end()  
                }
            }
            catch(e)
            {
                console.log("xxxxx")
                res.write("<script>alert('Already added'); document.location.href='/user'; </script>");
                res.end()  
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

         res.write("<script>alert('Logged Out'); document.location.href='/'; </script>");
         res.end() 
    }
    catch(e)
    {
        res.redirect('/')
    }
})

module.exports = router