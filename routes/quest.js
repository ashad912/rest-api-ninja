import express from 'express'
import { Quest } from '../models/quest'

import {auth} from '../middleware/auth'
const router = new express.Router

router.post('/quests', auth, async (req, res) => {
    const quest = new Quest ({
        ...req.body,
        owner: req.ninja._id
    })

    try {
        await quest.save()
        res.status(201).send(quest)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/quests', auth, async (req, res) => {
    try {
        //const quests = await Quest.find({ owner: req.ninja._id}) //second approach

        await req.ninja.populate('quests').execPopulate() 
        
        res.send(req.ninja.quests)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/quests/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        //const quest = await Quest.findById(_id) //now we want pass add props 
        const quest = await Quest.findOne({_id, owner: req.ninja._id}) //in 'req' we pass authed user

        if(!quest){
            return res.status(404).send()
        }
        res.send(quest)
    } catch (e) {
        res.status(500).send()
    }
})


router.patch('/quests/:id', auth, async (req, res)=> {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']

    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    try{
        const quest = await Quest.findOne({_id: req.params.id, owner: req.ninja._id})
 
        if(!quest) {
            return res.status(404).send()
        }

        updates.forEach((update)=> { //acces by name of field
            return quest[update] = req.body[update]
        })
        await quest.save()

        res.send(quest)

    }catch (e) {
        res.status(400).send()
    }
})

router.delete('/quests/:id', auth, async (req, res) => {
    try {
        /*const quest = await Quest.findOne({_id: req.params.id, owner: req.ninja._id})
        if(!quest) {
            res.status(404).send()
        } 

        await quest.remove()
        */
       const quest = await Quest.findOneAndDelete({_id: req.params.id, owner: req.ninja._id})

       if(!quest) {
           res.status(404).send()
       } 

        res.send(quest)

    } catch (e) {
        res.status(500).send()
    }
})
export const questRouter = router