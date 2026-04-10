package com.coliving;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class CoLivingApplication {

    public static void main(String[] args) {
        // fix(#106): JVM 기본 타임존을 Asia/Seoul(KST)로 강제 설정
        // application.yml의 jackson.time-zone 설정만으로는 JVM 타임존이 UTC로 남아
        // @FutureOrPresent 날짜 검증, LocalDate.now() 등에서 9시간 오차 발생 가능
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
        SpringApplication.run(CoLivingApplication.class, args);
    }
}
