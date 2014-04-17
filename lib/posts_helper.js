(function() {
    _PostsHelper = function() {
        this.insertNewPost = function(postAttributes) {
            var user = Meteor.user(),
                postWithSameLink = Posts.findOne({url: postAttributes.url});

            // ensure the user is logged in
            if (!user)
                throw new Meteor.Error(401, "You need to login to post new stories");

            // ensure the post has a title
            if (!postAttributes.title)
                throw new Meteor.Error(422, 'Please fill in a headline');

            // check that there are no previous posts with the same link
            if (postAttributes.url && postWithSameLink) {
                throw new Meteor.Error(302,
                    'This link has already been posted',
                    postWithSameLink._id);
            }

            // pick out the whitelisted keys
            var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
                userId: user._id,
                author: user.username,
                submitted: new Date().getTime(),
                commentsCount: 0,
                upvoters: [], votes: 0
            });

            var postId = Posts.insert(post);

            return postId;
        }
    }


    this.PostsHelper = new _PostsHelper()

}).call(this)
