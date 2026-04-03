package com.coliving.common.voc.application.port.out;

import com.coliving.common.voc.model.Voc;
import com.coliving.common.voc.model.VocAttachment;
import com.coliving.common.voc.model.VocCategory;
import com.coliving.common.voc.model.VocStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface VocRepositoryPort {

    Voc create(Long userId, VocCategory category, String title, String content, List<VocAttachment> attachments);

    Optional<Voc> findByVocIdAndUserId(Long vocId, Long userId);

    Optional<Voc> findByVocId(Long vocId);

    Page<Voc> findByUserId(Long userId, Pageable pageable);

    Page<Voc> findPageForAdmin(VocStatus status, Pageable pageable);

    Voc updateOwned(Long vocId, Long userId, VocCategory category, String title, String content,
                    List<VocAttachment> attachments);

    void cancelOwned(Long vocId, Long userId);

    Voc applyAdminReply(Long vocId, Long adminUserId, String reply);

    Voc markResolved(Long vocId);
}
