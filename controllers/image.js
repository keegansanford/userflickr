var fs = require('fs');
var path = require('path');
var Models = require('../models');
var sidebar = require('../helpers/sidebar')
//handles all requests for our image app
module.exports = {
	index: function(req, res) {
		var viewModel = {
			image: {},
			comments:[],
			userName: req.user ? req.user.username : ''			
		};
		//find the image using the url 
		Models.Image.findOne({ filename: { $regex: req.params.image_id } },
			function (err, image) {
				if (err) { throw err; }
				if (image) {
					//if found, adds to views
					image.views++;
					//saves the image to use as the view
					viewModel.image = image;
					//save the updated model
					image.save();
                    Models.Comment.find(
                        {image_id: image._id},
                        {},
                        { sort: { 'timestamp': 1 }},
                        function(err, comments){
                            viewModel.comments = comments;
                            sidebar(viewModel, function(viewModel) {
                                res.render('image', viewModel);
                            });
                        }
                    );
				} else {
					//if no image, return to index
					res.redirect('/');
				}
			});
		},
	create: function(req, res) {
		var saveImage = function() {
			//info for creating a unique identifier
			var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                imgUrl = '';
			
			//generates the id
            for(var i=0; i < 6; i+=1) {
                imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
            }
			//checks to see if there's an image with this filename
			Models.Image.find({ filename: imgUrl }, function(err, images) {
				if (images.length > 0) {
					//if there's a match, make a different name
					saveImage();
				} else {
					//creates the path for storing the image
					var tempPath = req.files.file.path,
						ext = path.extname(req.files.file.name).toLowerCase(),
						targetPath = path.resolve('./public/upload/' + imgUrl + ext);
					//checks to make sure we're getting an image, then stores it if valid
					if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
						fs.rename(tempPath, targetPath, function(err) { 
							if (err) { 
								throw err; 
							}
							//creates the image model with details from the request (req)
							var newImg = new Models.Image({
								title: req.body.title,
								filename: imgUrl + ext,
								description: req.body.description
							});
							//saves the image
							newImg.save(function(err, image) {
								console.log('Successfully inserted image: ' + image.filename);
								res.redirect('/images/' + imgUrl);
							});
					});
					} else {
						fs.unlink(tempPath, function () {
							if (err) {
								throw err;
							}

							res.json(500, {error: 'Only image files are allowed.'});
						});
					}
				}
			});
		};	
		saveImage();
	},
	like: function(req, res) {

		Models.Image.findOne({ filename: { $regex: req.params.image_id } },

		function(err, image) {
         	image.likes++;
            console.log(image.likes);
            image.save();
            res.render('image',{'image':image});    

        });
	},
	comment: function(req, res) {
		Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {

                var newComment = new Models.Comment(req.body);
                newComment.image_id = image._id;
                newComment.save(function(err, comment) {


                res.redirect('/images/' + image.uniqueID + '#' + comment._id);
            });

        });
	}
};