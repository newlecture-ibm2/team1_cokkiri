package com.coliving.common.profile.application.port.in;

import com.coliving.common.profile.application.command.UpdateProfileCommand;

public interface EditProfileUseCase {
    void editProfile(Long userId, UpdateProfileCommand command);
    
    void sendVerificationCode(Long userId, String contact, String type);
    
    String confirmVerificationCode(Long userId, String contact, String code, String type);
}
