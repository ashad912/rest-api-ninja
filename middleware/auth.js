import jwt from 'jsonwebtoken'
import { Ninja } from '../models/ninja'

export const auth = async (req, res, next) => {
    //console.log('auth middleware')
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'thisismynewcourse')
        const ninja = await Ninja.findOne({_id: decoded._id, 'tokens.token': token}) //finding proper user with proper token

        if(!ninja) {
            throw new Error()
        }

        /*in future for admin auth
        if(req.path.toString().contains('admin'){ //assumed that paths are with 'admin'
            if(ninja.admin !== true) {
                throw new Error ()
            }
        }*/

        req.token = token //specified token - u can logout from specific device!
        req.ninja = ninja
        next()
        //console.log(token)
    }catch(e) {
        res.status(401).send({ error: 'Please authenticate.'})
    }
}

