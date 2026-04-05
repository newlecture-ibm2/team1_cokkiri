package com.coliving.global.attachment;

import com.coliving.common.community.model.PostAttachment;
import com.coliving.global.error.BusinessException;
import com.coliving.global.html.PostBodyHtmlPathNormalizer;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RetainedAttachmentResolverTest {

    @Test
    void resolve_preservesOrderAndUsesCanonicalFromExisting() {
        PostAttachment a = PostAttachment.builder()
                .fileUrl("/api/files/community/a.bin")
                .fileName("a.bin")
                .fileSize(10L)
                .build();
        PostAttachment b = PostAttachment.builder()
                .fileUrl("/api/files/community/b.bin")
                .fileName("b.bin")
                .fileSize(20L)
                .build();

        List<PostAttachment> existing = List.of(a, b);
        List<PostAttachment> client = List.of(
                PostAttachment.builder().fileUrl("/api/files/community/b.bin").fileName("spoof").fileSize(999L).build(),
                PostAttachment.builder()
                        .fileUrl(PostBodyHtmlPathNormalizer.BFF_COMMUNITY_FILES_PREFIX + "a.bin")
                        .build()
        );

        List<PostAttachment> out = RetainedAttachmentResolver.resolve(
                existing,
                client,
                PostAttachment::getFileUrl,
                PostBodyHtmlPathNormalizer::normalizeAttachmentUrlForMatch);

        assertEquals(2, out.size());
        assertEquals("/api/files/community/b.bin", out.get(0).getFileUrl());
        assertEquals("b.bin", out.get(0).getFileName());
        assertEquals(20L, out.get(0).getFileSize());
        assertEquals("/api/files/community/a.bin", out.get(1).getFileUrl());
        assertEquals("a.bin", out.get(1).getFileName());
        assertEquals(10L, out.get(1).getFileSize());
    }

    @Test
    void resolve_throwsWhenUnknownUrl() {
        PostAttachment a = PostAttachment.builder()
                .fileUrl("/api/files/community/a.bin")
                .fileName("a.bin")
                .build();
        assertThrows(BusinessException.class, () -> RetainedAttachmentResolver.resolve(
                List.of(a),
                List.of(PostAttachment.builder().fileUrl("/api/files/community/other.bin").build()),
                PostAttachment::getFileUrl,
                PostBodyHtmlPathNormalizer::normalizeAttachmentUrlForMatch));
    }

    @Test
    void resolve_throwsWhenBlankClientUrl() {
        PostAttachment a = PostAttachment.builder()
                .fileUrl("/api/files/community/a.bin")
                .fileName("a.bin")
                .build();
        assertThrows(BusinessException.class, () -> RetainedAttachmentResolver.resolve(
                List.of(a),
                List.of(PostAttachment.builder().fileUrl("  ").build()),
                PostAttachment::getFileUrl,
                PostBodyHtmlPathNormalizer::normalizeAttachmentUrlForMatch));
    }
}
