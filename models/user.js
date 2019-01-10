var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs');
var moment = require('moment');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    Uname: {
      type: String,
      required: true,
      trim: true,
      minlength:1,
      max:100},
    email:{
      type:String,
      required: true,
      trim: true,
      minlength:1,
      unique: true,
      validate:{
        validator: validator.isEmail,
        message:`{VALUE} is not a valid email`
      }
    },
    password:{
      type:String,
      require: true,
      minlength: 6
    },
    accountCreation:{
      type: Date,
      default: moment().valueOf()
    },
    lastLogin:{
      type:Date
    },
    tokens:[{
      access:{
        type: String,
        required: true
      },
      token:{
        type:String,
        required: true
      }
    }]
  });

UserSchema.methods.toJson = function(){
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', "email"])
};

UserSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(()=> {
    return token;
  });
};

UserSchema.statics.findByToken = function(token){
  var User = this;
  var decoded;
  try{
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  }catch(e){
    return Promise.reject();
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) =>{
    if(!user){
      return Promise.reject();
    }

    return new Promise((resolve, reject) =>{
      bcrypt.compare(password, user.password, (err, res) =>{
        if(res){
          resolve(user);
        }else{
          reject();
        }
      });
    })
  })
};

UserSchema.methods.removeToken = function(token) {
  //lets you remove items from an array :$pull

  var user= this;

  return user.update({
    $pull:{
      tokens:{token}
    }
  })
}

//not using arrow function gives access to this variable
UserSchema.pre('save', function(next) {
  var user = this;

  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) =>{
    bcrypt.hash(user.password, salt, (err,hash) => {
        user.password = hash;
        next();
      });
    });
  }else{
    next()
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
