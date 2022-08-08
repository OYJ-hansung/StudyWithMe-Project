const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');
const Comment = require('../models/comment')

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    );
    return next(error);
  }
  // 오브제트형식으로 변경하고, _id > id로 변경하기 위한 getter
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }
  // places가 array로 들어오기 때문에 여기서는 map과 object를 같이 활용한다.
  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, code } = req.body;

  const createdPlace = new Place({
    title,
    description,
    code,
    image: req.file.path,
    creator: req.userData.userId
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  console.log(user);

  try { // 두가지 작업을 동시에 하기 위해서: 장소 만들기, 해당 장소에 알맞는 유저에게 장소 추가하기 > session, transaction. 
    // 추가적으로 알아야하는 것은, transaction은 새로운 collection을 생성하지 못한다. 즉, 만약 places 혹은 users collection이 몽고측에 존재하지 않으면 오류가 발생한다. 만약 없다면 수동으로 미리 생성해야한다.
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this place.', 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator'); // ref를 통해 연결한 creator를 불러옴, populate를 통해 데이터를 찾음과 동시에 작업할 수 있는 기능
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this place.',
      401
    );
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place); // 해당 장소를 제거 pull
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted place.' });
};






















const createComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { comment, placeId, creatorId, userName } = req.body;

  const createdComment = new Comment({
    comment,
    creatorId,
    userName,
    placeId,
    // creator: req.userData.userId
  });

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Creating comment failed, please try again.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for provided id.', 404);
    return next(error);
  }

  try { // 두가지 작업을 동시에 하기 위해서: 장소 만들기, 해당 장소에 알맞는 유저에게 장소 추가하기 > session, transaction. 
    // 추가적으로 알아야하는 것은, transaction은 새로운 collection을 생성하지 못한다. 즉, 만약 places 혹은 users collection이 몽고측에 존재하지 않으면 오류가 발생한다. 만약 없다면 수동으로 미리 생성해야한다.
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdComment.save({ session: sess });
    place.comments.push(createdComment);
    await place.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating comment failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdComment });
};



const getCommentsByPlaceId = async (req, res, next) => {
  const placeId = req.params.pid;
  let placeWithComments;
  try {
    placeWithComments = await Place.findById(placeId).populate('comments');
  } catch (err) {
    const error = new HttpError(
      'Fetching comments failed, please try again later.',
      500
    );
    return next(error);
  }
  // places가 array로 들어오기 때문에 여기서는 map과 object를 같이 활용한다.
  res.json({
    comments: placeWithComments.comments.map(comment =>
      comment.toObject({ getters: true })
    )
  });  
};



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.createComment = createComment;
exports.getCommentsByPlaceId = getCommentsByPlaceId;
