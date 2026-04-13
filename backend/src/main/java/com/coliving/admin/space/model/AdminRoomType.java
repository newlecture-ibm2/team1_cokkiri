package com.coliving.admin.space.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminRoomType {
    private Long roomTypeId;
    private String code;
    private String name;
    private Boolean isSystemDefault;
    private Integer sortOrder;
}
