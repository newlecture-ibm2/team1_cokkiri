package com.coliving.global.json;

import com.coliving.common.voc.model.VocAttachment;
import com.coliving.global.error.BusinessException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MultipartRetainedJsonParserTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void parseListOrNull_blankReturnsNull() {
        assertNull(MultipartRetainedJsonParser.parseListOrNull(
                null, objectMapper, new TypeReference<List<VocAttachment>>() {}));
        assertNull(MultipartRetainedJsonParser.parseListOrNull(
                "  ", objectMapper, new TypeReference<List<VocAttachment>>() {}));
    }

    @Test
    void parseListOrNull_parsesArray() {
        String json = "[{\"fileUrl\":\"/api/files/voc/x.png\",\"fileName\":\"x.png\",\"fileSize\":3}]";
        List<VocAttachment> list = MultipartRetainedJsonParser.parseListOrNull(
                json, objectMapper, new TypeReference<List<VocAttachment>>() {});
        assertEquals(1, list.size());
        assertEquals("/api/files/voc/x.png", list.get(0).getFileUrl());
        assertEquals("x.png", list.get(0).getFileName());
    }

    @Test
    void parseListOrNull_invalidJsonThrows() {
        assertThrows(BusinessException.class,
                () -> MultipartRetainedJsonParser.parseListOrNull("not-json", objectMapper,
                        new TypeReference<List<VocAttachment>>() {}));
    }
}
