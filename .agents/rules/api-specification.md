---
trigger: model_decision
description: 새로운 API를 생성할 때 마다 반드시 참고해야 하는 API 명세서
---

# API Specification (압축본)
Base:`/api` | 인증:JWT Bearer (🔓Public,🔑Auth,👤USER+,🏠RESIDENT+,🔒ADMIN) 
응답:`{success, data, message, errorCode}` | 페이징:`{content, page, size, totalElements, totalPages}`

## 1. Auth
1.1 회원가입 | POST `/auth/register` | 🔓 | Req:{loginId,password(Confirm),name,birthDate,gender,nationality,phone,email}
1.2 로그인 | POST `/auth/login` | 🔓 | Req:{loginId,password} | Res:{accessToken,refreshToken,user}
1.3 로그아웃 | POST `/auth/logout` | 🔑 
1.4 갱신 | POST `/auth/refresh` | 🔓 | Req:{refreshToken} | Res:{accessToken,refreshToken}
1.5 ID찾기 | POST `/auth/find-id` | 🔓 | Req:{name,email} | Res:{maskedLoginId,createdAt}
1.6 비밀번호찾기(임시발급) | POST `/auth/reset-password` | 🔓 | Req:{loginId,email}

## 2. Profile
2.1 내정보조회/수정 | GET, PUT `/users/me` | 🔑 | PUT Req:{name,phone,email}
2.3 비밀번호변경 | PUT `/users/me/password` | 🔑 | Req:{currentPassword,newPassword(Confirm)}
2.4 탈퇴 | DELETE `/users/me` | 🔑 | Req:{password}
2.5 프사 업로드 | POST `/users/me/image` | 🔑 | Req:multipart(file)

## 3. Rooms
3.1 방목록 | GET `/rooms` | 🔓 | Query:roomType,minRent,maxRent,floor,p,s
3.2 방상세 | GET `/rooms/{spaceId}` | 🔓

## 4. Contract
4.1 신청(저장/제출) | POST `/contracts` | 👤 | Req:{spaceId,address,bankAccount,desiredStartDate,desiredDurationMonths,isDraft등}
4.2,3 임시수정/제출 | PUT, POST `/contracts/{id}[/submit]` | 👤
4.4 현황조회, 4.5 취소 | GET `/contracts/my-applications`, POST `/contracts/{id}/cancel` | 👤
4.6, 4.7 조건확인/체결 | GET `/contracts/{id}/terms`, POST `/contracts/{id}/sign` | 👤
4.8 내계약조회 | GET `/contracts/my` | 👤 | Query:status
4.9 내청구조회 | GET `/payments/my` | 🏠 | Query:status,p,s

## 5. Device
5.1 목록 | GET `/devices/my` | 🏠 
5.2 제어 | POST `/devices/{id}/control` | 🏠 | Req:{command,params}

## 6. Reservation
6.1 시설조회 | GET `/facilities` | 🏠 
6.2 타임슬롯 | GET `/facilities/{id}/slots` | 🏠 | Query:week_start
6.3 예약신청, 6.5 취소| POST `/reservations`, POST `/reservations/{id}/cancel` | 🏠 | Req:{spaceId,reservationDate,startTime,endTime}
6.4 내예약(이력) | GET `/reservations/my` | 🏠 | Query:status,p,s

## 7. Logs
7.1 기기사용이력 | GET `/control-logs/my` | 🏠 | Query:startDate,endDate,space_type등

## 8. Community
8.1 목록/상세 | GET `/posts`, GET `/posts/{id}` | 🔑 | Query:category,p,s,sort
8.2 작성/수정/삭제 | POST, PUT, DELETE `/posts[/id]` | 🔑 | POST Req:multipart(category,title,content,files,links)
8.3 좋아요토글 | POST `/posts/{id}/like` | 🔑 
8.4 댓글작성/수정/삭제 | POST `/posts/{id}/comments`, PUT, DELETE `/comments/{id}` | 🔑

## 9. VoC
9.1 등록/내목록/수정/취소 | POST `/voc`, GET `/voc/my`, PUT, POST `/voc/{id}[/cancel]` | 🔑 | POST Req:multipart(category,title,content,files)

## 10. Notification
10.1 목록/읽음 | GET `/notifications`, PATCH `/notifications/{id}/read` | 🔑 | Query:is_read,p,s

## 11. Admin (Space)
11.1 공간목록 | GET `/admin/spaces` | 🔒 | Query:type,status,floor,p,s
11.2 등록/수정/이미지 | POST, PUT `/admin/spaces[/id]`, POST `/admin/spaces/{id}/images` | 🔒
11.4 배치조회/저장 | GET, PUT `/admin/spaces/layout` | 🔒 | PUT Req:{positions}

## 12. Admin (Device)
12.1 목록조회 | GET `/admin/devices` | 🔒 | Query:spaceId,device_type_id,status,isActive,p,s
12.2 등록/수정/삭제 | POST, PUT, DELETE `/admin/devices[/id]` | 🔒 | Req:{spaceId,device_type_id,name,modelName,mockEndpoint}
12.3 (비)활성화 | PATCH `/admin/devices/{id}/active` | 🔒 | Req:{isActive}
12.4 제어/이력 | POST `/admin/devices/{id}/control`, GET `/admin/control-logs` | 🔒

## 13. Admin (Contract)
13.1 목록/등록/수정 | GET, POST `/admin/contracts`, PUT `/admin/contracts/{id}` | 🔒 | Query:status,origin,spaceName등
13.2 만료/해지 | POST `/admin/contracts/{id}/[expire|terminate]` | 🔒
13.3 신청록/승인/거절 | GET `/admin/contracts/applications`, POST `/admin/contracts/{id}/[approve|reject]` | 🔒

## 14. Admin (기타)
14.1 예약조회/승인/취소 | GET `/admin/reservations`, POST `/admin/reservations/{id}/[approve|cancel]` | 🔒
14.2 결제목록/승인 | GET `/admin/payments`, POST `/admin/payments/{id}/approve` | 🔒
14.3 대시보드/에러/에너지 | GET `/admin/dashboard`, GET `/admin/monitoring/errors`, GET `/admin/monitoring/energy` | 🔒
14.4 민원목록/답변 | GET `/admin/voc`, POST `/admin/voc/{id}/reply` | 🔒
