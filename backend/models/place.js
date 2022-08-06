

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;


const placeSchema = new Schema({
  placeId :{ type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  code: {type: String, required: true},
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }]
});
placeSchema.plugin(uniqueValidator);
// 데이터베이스에서는 places로 collection명이 저장된다.
// 최상단이라고 해야한, 그 places를 포함하고 있는 데이터베이스 이름은. 몽고DB링크에 저장해둔 데이터베이스 이름으로 저장된다.
module.exports = mongoose.model('Place', placeSchema); 

