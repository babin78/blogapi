var mongoose=require('mongoose');
var uniqueValidator=require('mongoose-unique-validator');
var crypto=require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var UserSchema=new  mongoose.Schema({
  username:{type: String, lowercase: true, required: [true, "can't be blank"],
  //match: [/^[a-zA-Z0-9]$/, 'is invalid'],
  index: true,
  unique: true
},
  email: {type: String, lowercase: true, required: [true, "can't be blank"],
  //match: [/\S@\S\.\S/, 'is invalid'],
   match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  index: true,
  unique: true},
  bio: String,
  image: String,
  hash: String,
  salt: String,
  favorites:[{type:mongoose.Schema.Types.ObjectId,ref:'Article'}],
  following: [{ type:mongoose.Schema.Types.ObjectId, ref: 'User' }],

},{timestamps: true});

UserSchema.methods.favorite = function(id){
  if(this.favorites.indexOf(id) === -1){
    this.favorites.push(id);
  }

  return this.save();
};

UserSchema.methods.unfavorite = function(id){
  this.favorites.remove( id );
  return this.save();
};

UserSchema.methods.isFavorite = function(id){
  return this.favorites.some(function(favoriteId){
    return favoriteId.toString() === id.toString();
  });
};

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
 var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
 return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate(),  60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    //exp: parseInt(exp.getTime() / 1000),
    exp:Math.floor(Date.now() / 1000) + (60 * 60),
  }, secret);
};

UserSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image
  };
};

UserSchema.methods.toProfileJSONFor = function(user){
  return {
    username: this.username,
    bio: this.bio,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: user?user.isFollowing(this._id) : false  // we'll implement following functionality in a few chapters :)
  };
};

UserSchema.methods.follow = function(id){
  if(this.following.indexOf(id) === -1){
    this.following.push(id);
  }

  return this.save();
};

UserSchema.methods.unfollow = function(id){
  this.following.remove(id);
  return this.save();
};

UserSchema.methods.isFollowing = function(id){
  return this.following.some(function(followId){
    return followId.toString() === id.toString();
  });
};

UserSchema.plugin(uniqueValidator,{message:'is already taken'});
mongoose.model('User',UserSchema);
