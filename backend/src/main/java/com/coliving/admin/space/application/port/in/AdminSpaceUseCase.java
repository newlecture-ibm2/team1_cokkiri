package com.coliving.admin.space.application.port.in;

import com.coliving.admin.space.application.command.CreateSpaceCommand;
import com.coliving.admin.space.application.command.UpdateSpaceCommand;
import com.coliving.admin.space.application.result.AdminSpaceResult;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminSpaceUseCase {

    AdminSpaceResult createSpace(CreateSpaceCommand command);

    AdminSpaceResult getSpace(Long spaceId);

    Page<AdminSpaceResult> getSpaces(Pageable pageable);

    AdminSpaceResult updateSpace(UpdateSpaceCommand command);

    void deleteSpace(Long spaceId);

    void uploadImage(Long spaceId, org.springframework.web.multipart.MultipartFile file, com.coliving.user.room.model.ImageType imageType, Boolean isThumbnail);

    java.nio.file.Path loadImage(Long spaceId, String fileName);
}
