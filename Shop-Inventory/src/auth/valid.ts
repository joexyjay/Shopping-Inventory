import Joi from 'joi'

const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().min(6).max(50).required(),
    adminkey: Joi.string().allow(null).required()
});

const loginValidate = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(6).max(50).required()
})

export {loginValidate}
export default userSchema