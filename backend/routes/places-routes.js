const express = require('express');
const { check } = require('express-validator');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);


router.get('/comment/:pid', placesControllers.getCommentsByPlaceId);
router.get('/user/:uid', placesControllers.getPlacesByUserId);



router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.createPlace
);

const data = upload.fields([{comment: 'comment'}, {placeId: 'placeId'}]);

router.post(
  '/comment',
  data,
  check('comment')
  .not()
  .isEmpty(),
  placesControllers.createComment
);

router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
