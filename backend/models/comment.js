const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  comment: { type: String, required: true },
  creatorId: { type: String, required: true },
  placeId: { type: mongoose.Types.ObjectId, required: true, ref: 'Place' }
});

// 데이터베이스에서는 places로 collection명이 저장된다.
// 최상단이라고 해야한, 그 places를 포함하고 있는 데이터베이스 이름은. 몽고DB링크에 저장해둔 데이터베이스 이름으로 저장된다.
module.exports = mongoose.model('Comment', commentSchema); 

