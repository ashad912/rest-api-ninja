//routes - logical compositions

import express from 'express'
import { Ninja } from '../models/ninja';
import { auth } from '../middleware/auth';


export const router = express.Router()
//rather routes can be be param of app.use func in index.js

//get a list of ninjas from the db
router.get('/ninjas', auth, (req, res, next) => { //2nd param is auth method - nice!
    //res.send({type: 'GET'})
    /*Ninja.find({}).then((ninjas) => {
       res.send(ninjas) 
    })*/ //finding ninja and passing back to clients

    //below OUTDATED
    /*Ninja.geoNear( //inbuilt method prepared to get geo data by conditions
        {type:'Point', coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]},
        {maxDistance: 100000, spherical: true}
    ).then((ninjas)=> {
        res.send(ninjas)
    })*/

    //below ACTUAL
    Ninja.aggregate().near({
        near: {
         'type': 'Point',
         'coordinates': [parseFloat(req.query.lng), parseFloat(req.query.lat)]
        },
        maxDistance: 100000,
        spherical: true,
        distanceField: "dist.calculated"
    }).then((ninjas) => {
        res.send(ninjas)
    }).catch((err) => {
        res.send('error')
    })
})


router.get('/ninjas/me', auth, (req, res, next) => { //2nd param is auth method - nice!
    res.send(req.ninja)
})

//add a new ninja to the db

//for post method we're usin middleware - body-parser; client -> middleware -> server (post router method)
//thanks to body-parser we dont need to much other middleware - it prepare post data as a req object 
router.post('/ninjas', async (req, res, next) => {
    
    
    const ninja = new Ninja(req.body) //we assume that client send well-prepared JSON data :)
    /*
    ninja.save()
    */
    //now you can use Model method Ninja.create

    /* used before auth
    Ninja.create(req.body).then((ninja)=>{
        //console.log(req.body) //to console, down: to client
        
        res.status(201).send({
            type: 'POST',
            ninja: ninja
        })
    }).catch(next => {
        res.status(400).send(next)
    })
    */
    try {
        await ninja.save() //this method holds updated ninja!
        const token = await ninja.generateAuthToken()
        res.status(201).send({ninja, token})
    } catch (e) {
        res.status(400).send(e)
    }
    

    
    /* used with dummy data
    res.send({
        type: 'POST',
        name: req.body.name,
        rank: req.body.rank
    })
    */
    
    
})
//next method - go to next piece of middleware




router.post('/ninjas/login', async (req, res) => {
    try {
        const ninja = await Ninja.findByCredentials(req.body.email, req.body.password)
        const token = await ninja.generateAuthToken() //on instancegenerateAuthToken
        res.send({
            ninja: ninja,
            token: token
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/ninjas/logout', auth, async (req, res) => {
    try {
        req.ninja.tokens = req.ninja.tokens.filter((token)=> {
            return token.token !== req.token
        })

        await req.ninja.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//all sessions
router.post('/ninjas/logoutAll', auth, async (req, res) => {
    try {
        req.ninja.tokens = []
        await req.ninja.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//update a ninja in the db
router.put('/ninjas/me', auth, async (req, res, next) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'rank']

    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })


    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update!'})
    }

    try{
        const ninja = req.ninja

        updates.forEach((update) => {
            ninja[update] = req.body[update] //user[update] -> user.name, user.password itd.
        })

        await ninja.save()


        res.send(ninja)

    }catch(e){
        res.status(400).send(e)
    }
})

//update a ninja in the db
router.put('/ninjas/admin/:id', async (req, res, next) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']

    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })


    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update!'})
    }

    try{
        const ninja = await Ninja.findById(req.params.id)

        updates.forEach((update) => {
            ninja[update] = req.body[update] //user[update] -> user.name, user.password itd.
        })

        await ninja.save()

        if(!ninja){
            return res.status(404).send()
        }

        res.send(ninja)

    }catch(e){
        res.status(400).send(e)
    }
    //for auth i had to refactor sec below
    /*Ninja.findByIdAndUpdate({_id: req.params.id}, req.body).then((ninja)=>{
        //it works like patch, but mongo is smart and finds appropriate prop to swap xd
        //res.send(ninja) //here is outdated ninja!!! as u can see in delete
        
        //Ninja.findOne({_id: req.params.id}).then((ninja)=>{ //findById trigger findOne
        //    res.send(ninja)
        //})
        
        Ninja.findById(req.params.id).then((ninja)=>{ //findById trigger findOne
            res.send(ninja)
        })
    }).catch(next)*/
    


    //res.send({type: 'PUT'})
})

//delete a my ninja profile
router.delete('/ninjas/me', auth, async (req, res, next) => { //R: we attach user with auth
    try{
        await req.ninja.remove()
        res.send(req.ninja)
    }catch(e) {
        res.status(500).send()
    }
})


//delete a ninja from the db
router.delete('/ninjas/admin/:id', auth, (req, res, next) => {
    Ninja.findByIdAndRemove({_id: req.params.id}).then((ninja)=>{ //here is 'ninja' already deleted from db xd
        res.send(ninja)
    })
    //res.send({type: 'DELETE'})
})




//cannot test post, put, delete - have to use postman
//browser uses get reqs by deafault


/*
https://mongoosejs.com/docs/deprecations.html
This option affects the following model and query functions. There are no intentional backwards breaking changes, so you should be able to turn this option on without any code changes. If you discover any issues, please open an issue on GitHub.

Model.findByIdAndDelete()
Model.findByIdAndRemove()
Model.findByIdAndUpdate()
Model.findOneAndDelete()
Model.findOneAndRemove()
Model.findOneAndUpdate()
Query.findOneAndDelete()
Query.findOneAndRemove()
Query.findOneAndUpdate()

*/
