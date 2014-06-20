'use strict';
var should = require('should'),
    sinon = require('sinon'),
    PostsHelper = require('../../../lib/posts_helper');


//=======Configuration============
function resetGlobalDependencies() {
    //configure dependencies via node's 'global' namespace
    global.Meteor = {
        user: sinon.stub().returns({
            _id: 'user_id_700',
            username: 'james.donb'
        }),
        Error: sinon.spy()
    };

    global.Posts = {
        findOne: sinon.stub(),
        insert: sinon.stub().returns('new_post_id')
    };

    global.Posts.findOne
        .withArgs({url: 'an_existing_post_with_the_same_url'}).returns({_id: 'someId'})
        .withArgs({url: 'no_post_with_this_url'}).returns(undefined);
}


function getDefaultPostsHelper() {
    resetGlobalDependencies();
    return new PostsHelper();
}


//=======Testing============
describe('lib/posts_helper: PostsHelper', function() {
    beforeEach(function(){
        this.postsHelper = getDefaultPostsHelper();
    });


    it('should instantiate postsHelper', function() {
        should(this.postsHelper).be.ok;
    });
});
