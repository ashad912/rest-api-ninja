//Mex code
/*
UserSchema.methods.updatePassword = async function(password, newPassword) {
    const user = this;
  
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          user.password = newPassword
  
          resolve(user);
        } else {
          reject(0);
        }
      });
    });


    app.patch('/users/me', authenticate, async (req, res) => {
        try {
            const user = await req.user.updatePassword(req.body.password, req.body.newPassword)
            if(user){
                await user.save()
                res.sendStatus(200).send()
            }else{
                res.status(406).send('Password error')
            }
    
        } catch (error) {
            res.status(406).send('Password error')
        }
    })
    */