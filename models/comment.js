var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var path = require('path');

var CommentSchema = new Schema({
	image_id: {type: ObjectId},
	name: {type: String },
	email: {type: String },
	comment: {type: String },
	timestamp: { type: Date, 'default': Date.now }
});

// From PassBook
/*var CommentSchema = new Schema({
  comment:    { type: String },
  user: {type: String },
  timestamp:  { type: Date, 'default': Date.now }
});*/

//AM I SUPPOSED TO BE GRABBING AN IMAGE ID IN HERE?!
CommentSchema.virtual('image')
	.set(function(image){
		this._image = image;
	})
	.get(function() {
		return this.image;
	});

	
module.exports = mongoose.model('Comment', CommentSchema);
