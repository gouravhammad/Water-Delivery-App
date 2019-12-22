const express = require('express')
const bodyparser = require('body-parser')
const session = require('express-session')
const path = require('path')
const homeRouter = require('./router/home')
const userRouter = require('./router/user')
const app = express()

const PORT = process.env.PORT || 3000

app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())

// Inbuild Middleware
app.use(express.static(path.join(__dirname,'public')))

// Session Setup
app.use(session({
    secret:'My Secret Key',
    resave: true,
    saveUninitialized: true
}))

// View Engine Setup
app.set('views',path.join(__dirname,'templates/views'))
app.set('view engine','ejs')

// Router Handler
app.use('/',homeRouter)
app.use('/user',userRouter)

app.get('*',function(req,res){
    res.render('404');
})

// Server
app.listen(PORT,function(error){
    if(error) throw error
    console.log("Server created Successfully on Port",PORT)
})