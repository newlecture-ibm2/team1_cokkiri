package com.coliving.admin.community.application.port.in;

import com.coliving.admin.community.application.command.DeleteAdminCommentCommand;
import com.coliving.admin.community.application.command.DeleteAdminPostCommand;
import com.coliving.admin.community.application.command.GetAdminCommentDetailCommand;
import com.coliving.admin.community.application.command.GetAdminPostDetailCommand;
import com.coliving.admin.community.application.command.ListAdminCommentsCommand;
import com.coliving.admin.community.application.command.ListAdminPostsCommand;
import com.coliving.admin.community.application.result.AdminCommentDetailResult;
import com.coliving.admin.community.application.result.AdminCommentListResult;
import com.coliving.admin.community.application.result.AdminPostDetailResult;
import com.coliving.admin.community.application.result.AdminPostListResult;

public interface AdminCommunityUseCase {
    AdminPostListResult listPosts(ListAdminPostsCommand command);

    AdminPostDetailResult getPostDetail(GetAdminPostDetailCommand command);

    void deletePost(DeleteAdminPostCommand command);

    AdminCommentListResult listComments(ListAdminCommentsCommand command);

    AdminCommentDetailResult getCommentDetail(GetAdminCommentDetailCommand command);

    void deleteComment(DeleteAdminCommentCommand command);
}
