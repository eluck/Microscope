'use strict';
var should = require('should'),
    sinon = require('sinon'),
    _ = require('underscore'),
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

    global._ = _;
}


function resetDate(date) {
    global.Date = sinon.stub().returns(
        { getTime: sinon.stub().returns(date) }
    );
}


var originalDate = Date;


function revertDate() {
    global.Date = originalDate;
}


function getDefaultPostsHelper() {
    resetGlobalDependencies();
    return new PostsHelper();
}


function getDefaultPostAttributes() {
    return {
        url: 'no_post_with_this_url',
        title: 'a title',
        message: 'message'
    };
}


//=======Testing============
describe('lib/posts_helper: PostsHelper', function() {
    beforeEach(function(){
        this.postsHelper = getDefaultPostsHelper();
        this.postAttributes = getDefaultPostAttributes();
    });


    it('should instantiate postsHelper', function() {
        should(this.postsHelper).be.ok;
    });


    it('should not miss public fields', function() {
        var postsHelper = this.postsHelper;
        var missingFields = ['insertNewPost'].reduce(function(missingFields, field){
            if (!postsHelper.hasOwnProperty(field)) missingFields.push(field);
            return missingFields;
        }, []);
        missingFields.should.be.eql([]);
    });


    it('should not throw with default arguments', function() {
        sinon.spy(this.postsHelper, 'insertNewPost');
        this.postsHelper.insertNewPost(this.postAttributes);
        this.postsHelper.insertNewPost.threw().should.be.false;
    });


    it('should prevent posting if there\'s no current user', function() {
        Meteor.user = sinon.stub().returns(null);
        should(this.postsHelper.insertNewPost.bind(this.postsHelper, this.postAttributes)).throw();
        Meteor.Error.calledWith(401, "You need to login to post new stories").should.be.true;
    });


    it('should prevent posting if a title is not set', function() {
        this.postAttributes.title = undefined;
        should(this.postsHelper.insertNewPost.bind(this.postsHelper, this.postAttributes)).throw();
        Meteor.Error.calledWith(422, 'Please fill in a headline').should.be.true;
    });


    it('should prevent posting if such an url has been posted earlier', function() {
        this.postAttributes.url = 'an_existing_post_with_the_same_url';
        should(this.postsHelper.insertNewPost.bind(this.postsHelper, this.postAttributes)).throw();
        Meteor.Error.calledWith(302, 'This link has already been posted', 'someId').should.be.true;
    });


    it('should return the new post id', function() {
        this.postsHelper.insertNewPost(this.postAttributes).should.be.eql('new_post_id');
    });


    it('should set post\'s fields correctly', function() {
        Posts.insert = sinon.spy();
        var now = new Date().getTime();
        resetDate(now);
        this.postsHelper.insertNewPost(this.postAttributes);
        revertDate();
        Posts.insert.args[0].should.be.eql([{
            url: 'no_post_with_this_url' ,
            title: 'a title',
            message: 'message',
            userId: 'user_id_700',
            author: 'james.donb',
            submitted: now,
            commentsCount: 0,
            upvoters: [],
            votes: 0
        }]);
    });
});

