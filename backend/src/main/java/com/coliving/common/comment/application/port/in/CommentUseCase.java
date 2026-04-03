package com.coliving.common.comment.application.port.in;

import com.coliving.common.comment.application.command.*;
import com.coliving.common.comment.application.result.*;

public interface CommentUseCase {

    CommentResult createComment(CreateCommentCommand command);

    CommentResult updateComment(UpdateCommentCommand command);

    CommentResult deleteComment(DeleteCommentCommand command);
}

