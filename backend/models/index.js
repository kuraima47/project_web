const User          = require("./user");
const Conversation  = require("./conversation");
const ConversationSeen = require("./conversationSeen");
const UserInterest  = require("./userInterest");
const Interest      = require("./interest");
const Message       = require("./message");
const Post          = require("./post");
const Hashtag       = require("./hashtag");
const Repost        = require("./repost");
const UserFollows   = require("./userFollow");
const Notification  = require("./notification");
const Pixel         = require("./pixel");

/* --------------------------------------------------
 * Conversation & ConversationSeen
 * -------------------------------------------------- */
Conversation.belongsTo(User, { as: 'sender',   foreignKey: 'senderId' });
Conversation.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
User.hasMany(Conversation, { as: 'sentConversations',     foreignKey: 'senderId' });
User.hasMany(Conversation, { as: 'receivedConversations', foreignKey: 'receiverId' });

ConversationSeen.belongsTo(Conversation, { foreignKey: 'conversationId' });
ConversationSeen.belongsTo(User,         { foreignKey: 'userId' });
Conversation.hasMany(ConversationSeen,   { foreignKey: 'conversationId' });
User.hasMany(ConversationSeen,           { foreignKey: 'userId' });

/* --------------------------------------------------
 * User <-> Interest (many-to-many)
 * -------------------------------------------------- */
// Relation de pivot : UserInterest appartient à User et à Interest
UserInterest.belongsTo(User,     { foreignKey: 'userId' });
UserInterest.belongsTo(Interest, { foreignKey: 'interestId' });

// (Optionnel si tu veux aussi faire `User.hasMany(UserInterest, ...)`)
User.hasMany(UserInterest,       { foreignKey: 'userId' });
Interest.hasMany(UserInterest,   { foreignKey: 'interestId' });

// Relation many-to-many classique
User.belongsToMany(Interest, {
    through:    UserInterest,
    foreignKey: 'userId',
    otherKey:   'interestId',
    as:         'interests',
});
Interest.belongsToMany(User, {
    through:    UserInterest,
    foreignKey: 'interestId',
    otherKey:   'userId',
    // Pas forcément besoin de `as`, sauf si tu veux
});

/* --------------------------------------------------
 * Message / Conversation / User
 * -------------------------------------------------- */
Message.belongsTo(User, { as: 'sender',   foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
Message.belongsTo(Conversation, { as: 'conversation', foreignKey: 'conversationId' });
Conversation.hasMany(Message,   { as: 'messages', foreignKey: 'conversationId' });

/* --------------------------------------------------
 * Notification
 * -------------------------------------------------- */
Notification.belongsTo(User,  { as: 'user',   foreignKey: 'userId' });
Notification.belongsTo(User,  { as: 'actor',  foreignKey: 'actorId' });
Notification.belongsTo(Post,  { as: 'post',   foreignKey: 'postId' });

/* --------------------------------------------------
 * Post <-> User
 * -------------------------------------------------- */
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
User.hasMany(Post,   { foreignKey: 'authorId' });

/* --------------------------------------------------
 * Post <-> Hashtag (many-to-many)
 * -------------------------------------------------- */
// Si tu fais include: [{ model: Hashtag, as: 'Hashtags' }], il faut un `as: 'Hashtags'` ici
Post.belongsToMany(Hashtag, {
    through: 'PostHashtags',
    as: 'Hashtags',
});
Hashtag.belongsToMany(Post, {
    through: 'PostHashtags',
    as: 'Posts', // ou un autre alias si tu veux
});

/* --------------------------------------------------
 * Post <-> Likes (User)
 * -------------------------------------------------- */
Post.belongsToMany(User, {
    through: 'PostLikes',
    as: 'likedBy',
    foreignKey: 'postId',
    unique: true
});
User.belongsToMany(Post, {
    through: 'PostLikes',
    as: 'likedPosts',
    foreignKey: 'userId',
    unique: true
});

/* --------------------------------------------------
 * Auto-références (Post)
 * -------------------------------------------------- */
Post.belongsTo(Post, { as: 'originalPost', foreignKey: 'originalPostId' });
Post.belongsTo(Post, { as: 'parentPost',   foreignKey: 'parentPostId' });
Post.hasMany(Post,   { as: 'responses',    foreignKey: 'parentPostId' });

/* --------------------------------------------------
 * Relation User <-> Repost (pivot)
 * -------------------------------------------------- */
User.belongsToMany(Post, {
    through:    Repost,
    foreignKey: 'userId',
    as:         'repostedPosts',
});
Post.belongsToMany(User, {
    through:    Repost,
    foreignKey: 'postId',
    as:         'repostedBy',
});

/* --------------------------------------------------
 * Relation Follows (UserFollows pivot)
 * -------------------------------------------------- */
User.belongsToMany(User, {
    as: 'followers',
    through:     UserFollows,
    foreignKey:  'followingId', // la colonne dans UserFollows
    otherKey:    'followerId',  // l’autre colonne
});
User.belongsToMany(User, {
    as: 'following',
    through:     UserFollows,
    foreignKey:  'followerId',
    otherKey:    'followingId',
});

/* --------------------------------------------------
 * Export
 * -------------------------------------------------- */
module.exports = {
    User,
    Conversation,
    ConversationSeen,
    UserInterest,
    Interest,
    Message,
    Post,
    Hashtag,
    Repost,
    UserFollows,
    Notification,
    Pixel
};
