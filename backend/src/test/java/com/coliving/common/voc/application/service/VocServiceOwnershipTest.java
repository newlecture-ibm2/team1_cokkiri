package com.coliving.common.voc.application.service;

import com.coliving.common.notification.application.port.out.NotificationRepositoryPort;
import com.coliving.common.voc.application.command.CancelVocCommand;
import com.coliving.common.voc.application.command.GetMyVocCommand;
import com.coliving.common.voc.application.command.UpdateVocCommand;
import com.coliving.common.voc.application.port.out.VocRepositoryPort;
import com.coliving.common.voc.model.Voc;
import com.coliving.common.voc.model.VocCategory;
import com.coliving.common.voc.model.VocStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VocServiceOwnershipTest {

    @Mock
    private VocRepositoryPort vocRepositoryPort;

    @Mock
    private NotificationRepositoryPort notificationRepositoryPort;

    @InjectMocks
    private VocService vocService;

    @Test
    void getMyVoc_whenVocMissing_returnsNotFound() {
        when(vocRepositoryPort.findByVocId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vocService.getMyVoc(GetMyVocCommand.builder().vocId(1L).userId(10L).build()))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.NOT_FOUND);
    }

    @Test
    void getMyVoc_whenWrongOwner_returnsForbidden() {
        when(vocRepositoryPort.findByVocId(1L)).thenReturn(Optional.of(sampleVoc(1L, 99L, VocStatus.OPEN)));

        assertThatThrownBy(() -> vocService.getMyVoc(GetMyVocCommand.builder().vocId(1L).userId(10L).build()))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.FORBIDDEN);
    }

    @Test
    void getMyVoc_whenOwner_ok() {
        when(vocRepositoryPort.findByVocId(1L)).thenReturn(Optional.of(sampleVoc(1L, 10L, VocStatus.OPEN)));

        assertThat(vocService.getMyVoc(GetMyVocCommand.builder().vocId(1L).userId(10L).build()).getVocId())
                .isEqualTo(1L);
    }

    @Test
    void updateVoc_whenWrongOwner_returnsForbidden_andDoesNotUpdate() {
        when(vocRepositoryPort.findByVocId(1L)).thenReturn(Optional.of(sampleVoc(1L, 99L, VocStatus.OPEN)));

        assertThatThrownBy(() -> vocService.updateVoc(UpdateVocCommand.builder()
                .vocId(1L)
                .userId(10L)
                .category(VocCategory.FACILITY)
                .title("t")
                .content("c")
                .build()))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.FORBIDDEN);

        verify(vocRepositoryPort, never()).updateOwned(any(), any(), any(), any(), any(), any());
    }

    @Test
    void cancelVoc_whenWrongOwner_returnsForbidden_andDoesNotCancel() {
        when(vocRepositoryPort.findByVocId(1L)).thenReturn(Optional.of(sampleVoc(1L, 99L, VocStatus.OPEN)));

        assertThatThrownBy(() -> vocService.cancelVoc(CancelVocCommand.builder().vocId(1L).userId(10L).build()))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.FORBIDDEN);

        verify(vocRepositoryPort, never()).cancelOwned(any(), any());
        verify(notificationRepositoryPort, never()).softDeleteByReference(any(), any());
    }

    private static Voc sampleVoc(Long vocId, Long userId, VocStatus status) {
        return Voc.builder()
                .vocId(vocId)
                .userId(userId)
                .category(VocCategory.FACILITY)
                .title("title")
                .content("content")
                .attachments(List.of())
                .status(status)
                .adminReply(null)
                .replyUserId(null)
                .repliedAt(null)
                .createdAt(null)
                .updatedAt(null)
                .build();
    }
}
