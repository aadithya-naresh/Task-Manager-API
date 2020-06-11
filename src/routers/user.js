const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeMessage,sendCancellationMessage} =require('../emails/account')

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File must be a picture'))
        }
        cb(undefined,true)
    }
})


router.post('/users', async (req,res) =>{
    const user = new User(req.body)
    try{
        sendWelcomeMessage(user.email,user.name)
         await user.save()
         const token = await user.generateAuthToken()
         res.status(201).send({user,token})
    }catch(error){
        res.status(400).send(error)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res) =>{
   const buffer = await sharp(req.file.buffer).resize({ width:250 , height:250 }).png().toBuffer()
   
   req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next) =>{
    res.status(400).send({error:error.message})
})

router.post('/users/login',async (req,res) =>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(error){
        res.status(400).send()
    }
})
router.get('/users/me',auth,async (req,res) =>{
    res.send(req.user)
})


router.post('/users/logout',auth,async (req,res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token != req.token
        })

        await req.user.save()

        res.send()
    }catch(error){
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async (req,res) =>{
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    }catch(error){
        res.status(500).send()
    }
})
router.get('/users/:id',async (req,res) =>{
    const _id = req.params.id

    try{
        const user = await User.findById(_id)
        if(!user)
        return res.status(404).send('No user found')

        res.send(user)
    }catch(error){
        res.status(500).send(error)
    }
    
})

router.patch('/users/me',auth,async (req,res) =>{
    const updates = Object.keys(req.body)
    const allowed = ['name','age','password','email']

    const isPermitted = updates.every((update) =>{
        return allowed.includes(update)
    })

    if(!isPermitted)
    return res.status(400).send({error:'Invalid updates'})

    try{
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        res.send(req.user)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

router.delete('/users/me',auth,async (req,res) =>{

    try{
        sendCancellationMessage(req.user.email,req.user.name)
        await req.user.remove()
        res.send(req.user)
    }catch(error){
        res.status(500).send()
    }
})

router.delete('/users/me/avatar',auth,async (req,res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async (req,res) =>{
    try{
      const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-type','image/png')
        res.send(user.avatar)
    }catch(error){
        res.status(404).send()
    }
})
module.exports = router