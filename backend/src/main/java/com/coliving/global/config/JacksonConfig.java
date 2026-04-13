package com.coliving.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;

/**
 * Jackson 직렬화 설정
 *
 * fix(#106): 타임존·시간 포맷 이슈 조치
 *
 * 문제 1 — Safari / 모바일 웹뷰 호환:
 *   <input type="time"> 은 Safari에서 초(ss) 없이 "HH:mm" 포맷만 반환한다.
 *   반면 Chrome은 step 속성에 따라 "HH:mm:ss"를 반환하기도 한다.
 *   Jackson 기본 LocalTime 역직렬화는 "HH:mm" 을 허용하지 않아 400 에러 발생.
 *   → 역직렬화: "HH:mm" / "HH:mm:ss" / "HH:mm:ss.SSS" 모두 허용하는 유연한 포맷 등록
 *   → 직렬화:   응답은 항상 "HH:mm:ss" 로 통일 (프론트 파싱 일관성 확보)
 *
 * 문제 2 — UTC → KST 9시간 오차:
 *   CoLivingApplication.main()에서 JVM TimeZone을 Asia/Seoul 로 강제 설정 후
 *   Jackson 역시 동일 타임존 기준으로 동작하므로 이 설정으로 추가 보장.
 */
@Configuration
public class JacksonConfig {

    /**
     * LocalTime 역직렬화 포맷:
     *   - "14:00"         (Safari <input type="time"> 기본 출력)
     *   - "14:00:00"      (Chrome, API 명세 권장)
     *   - "14:00:00.000"  (밀리초 포함 엣지케이스)
     */
    private static final DateTimeFormatter FLEXIBLE_TIME_FORMATTER =
            new DateTimeFormatterBuilder()
                    .appendPattern("HH:mm")
                    .optionalStart()
                    .appendPattern(":ss")
                    .optionalEnd()
                    .optionalStart()
                    .appendPattern(".SSS")
                    .optionalEnd()
                    .toFormatter();

    /** 직렬화(응답) 포맷: 항상 "HH:mm:ss" 로 통일 */
    private static final DateTimeFormatter RESPONSE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("HH:mm:ss");

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // LocalTime 직렬화: 응답 시 "HH:mm:ss"
        javaTimeModule.addSerializer(LocalTime.class,
                new LocalTimeSerializer(RESPONSE_TIME_FORMATTER));

        // LocalTime 역직렬화: "HH:mm" / "HH:mm:ss" / "HH:mm:ss.SSS" 모두 허용
        javaTimeModule.addDeserializer(LocalTime.class,
                new LocalTimeDeserializer(FLEXIBLE_TIME_FORMATTER));

        return new ObjectMapper()
                .registerModule(javaTimeModule)
                // 알 수 없는 필드 무시 (Spring 기본값 복원)
                .disable(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                // LocalDate 등을 [2026,5,1] 배열이 아닌 "2026-05-01" 문자열로 직렬화
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                // 모든 날짜/시간 직렬화·역직렬화 시 Asia/Seoul(KST) 기준
                .setTimeZone(java.util.TimeZone.getTimeZone("Asia/Seoul"));
    }
}
