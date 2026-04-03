package com.coliving.common.community.application.port.in;

import com.coliving.common.community.application.command.*;
import com.coliving.common.community.application.result.*;

public interface CommunityUseCase {

    PostListResult getPostList(GetPostListCommand command);

    PostDetailResult getPostDetail(GetPostDetailCommand command);

    CreatePostResult createPost(CreatePostCommand command);

    UpdatePostResult updatePost(UpdatePostCommand command);

    DeletePostResult deletePost(DeletePostCommand command);

    ToggleLikeResult toggleLike(TogglePostLikeCommand command);

    CommentResult createComment(CreateCommentCommand command);

    CommentResult updateComment(UpdateCommentCommand command);

    CommentResult deleteComment(DeleteCommentCommand command);
}

