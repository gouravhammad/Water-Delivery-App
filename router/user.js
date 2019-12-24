const express = require('express')
const router = express.Router()
const connection = require('../utility/mysqlConn')

router.get('/',function(req,res){
    try
    {
        console.log(req.session.mobileno)
        var category = req.query.category
        var drinking = true
        var domestic = false

        if(category)
        {
            var sql = "select * from product where category = '" + category + "'"
            
            if(category == 'drinking')
            {
                drinking = true
                domestic = false
            }
            else
            {
                drinking = false
                domestic = true
            }
        }
        else
        {
            var sql = "select * from product"
        }

        connection.query(sql,function(error,result){
            if(error)
            {
                console.log(error)
                return;
            }
            else
            {
                res.render('UserHome',{result,drinking,domestic})
            }
        })
    }
    catch(e)
    {
        res.redirect('/')
    }
})

module.exports = router