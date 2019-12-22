const express = require('express')
const router = express.Router()
const connection = require('../utility/mysqlConn')

router.get('/',function(req,res){
    try
    {
         console.log(req.session.mobileno)
         console.log(req.session.email)

        var sql = "select * from product"
       
        connection.query(sql,function(error,result){
            if(error)
            {
                console.log(error)
                return;
            }
            else
            {
                res.render('UserHome',{result})
            }
        })
    }
    catch(e)
    {
        res.redirect('/')
    }
})

module.exports = router