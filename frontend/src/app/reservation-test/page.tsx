"use client";

import React, { useState, useEffect } from "react";

interface Facility {
  spaceId: number;
  spaceName: string;
}

interface Reservation {
  id: number;
  spaceId: number;
  userId?: number;
  status: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  approvedBy?: string;
}

export default function ReservationTestPage() {
  const [userId, setUserId] = useState("1");
  const [adminId, setAdminId] = useState("999");

  // State
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [adminReservations, setAdminReservations] = useState<Reservation[]>([]);

  // Form State
  const [spaceId, setSpaceId] = useState("");
  const [reservationDate, setReservationDate] = useState("2026-05-01");
  // fix(#106): Safari는 <input type="time"> 초기값으로 "HH:mm:ss" 포맷을 인식 못함 → "HH:mm" 으로 통일
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("16:00");

  const [message, setMessage] = useState("");

  const fetchFacilities = async () => {
    try {
      const res = await fetch("/api/facilities");
      const data = await res.json();
      if (data.success) {
        setFacilities(data.data);
        if (data.data.length > 0) {
          setSpaceId(data.data[0].spaceId.toString());
        }
      }
    } catch (err: unknown) {
      setMessage("Facilities Fetch Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const fetchMyReservations = async () => {
    try {
      const res = await fetch("/api/reservations", {
        headers: { "X-User-Id": userId },
      });
      const data = await res.json();
      if (data.success) {
        setMyReservations(data.data);
      } else {
        setMessage("My Reservations Error: " + JSON.stringify(data));
      }
    } catch (err: unknown) {
      setMessage("My Reservations Fetch Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const fetchAdminReservations = async () => {
    try {
      const res = await fetch("/api/admin/reservations", {
        headers: { "X-Admin-Id": adminId },
      });
      const data = await res.json();
      if (data.success) {
        setAdminReservations(data.data);
      } else {
        setMessage("Admin Reservations Error: " + JSON.stringify(data));
      }
    } catch (err: unknown) {
      setMessage("Admin Reservations Fetch Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const createReservation = async () => {
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          spaceId: parseInt(spaceId),
          reservationDate,
          startTime,
          endTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Reservation Created: ID " + data.data.reservationId);
        fetchMyReservations();
        fetchAdminReservations();
      } else {
        setMessage("Create Error: " + JSON.stringify(data));
      }
    } catch (err: unknown) {
      setMessage("Create Request Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const cancelReservation = async (resId: number) => {
    try {
      const res = await fetch(`/api/reservations/${resId}/cancel`, {
        method: "PATCH",
        headers: { "X-User-Id": userId },
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Reservation Cancelled: ID " + resId);
        fetchMyReservations();
        fetchAdminReservations();
      } else {
        setMessage("Cancel Error: " + JSON.stringify(data));
      }
    } catch (err: unknown) {
      setMessage("Cancel Request Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const adminPatchReservation = async (resId: number, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/admin/reservations/${resId}/${action}`, {
        method: "PATCH",
        headers: { "X-Admin-Id": adminId },
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Reservation ${action} updated: ID ` + resId);
        fetchAdminReservations();
        fetchMyReservations();
      } else {
        setMessage(`Admin ${action} Error: ` + JSON.stringify(data));
      }
    } catch (err: unknown) {
      setMessage(`Admin ${action} Request Error: ` + (err instanceof Error ? err.message : String(err)));
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>예약 시스템 API 테스트 패널</h1>

      {message && (
        <div style={{ padding: "10px", margin: "10px 0", background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" }}>
          <strong>Message:</strong> {message}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px" }}>
        {/* User Panel */}
        <div style={{ flex: 1, border: "1px solid #ccc", padding: "15px" }}>
          <h2>입주자 모드 (X-User-Id)</h2>
          <div style={{ marginBottom: "10px" }}>
            <label>User ID: </label>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} />
            <button onClick={fetchMyReservations} style={{ marginLeft: "10px" }}>내 예약 불러오기</button>
          </div>

          <hr />
          <h3>예약 신청</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
            <label>
              시설:{" "}
              <select value={spaceId} onChange={(e) => setSpaceId(e.target.value)}>
                {facilities.map((fac) => (
                  <option key={fac.spaceId} value={fac.spaceId}>
                    {fac.spaceName} (ID: {fac.spaceId})
                  </option>
                ))}
              </select>
            </label>
            <label>날짜: <input type="date" value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} /></label>
            <label>시작시간: <input type="time" step="1800" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
            <label>종료시간: <input type="time" step="1800" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></label>
            <button onClick={createReservation} style={{ background: "#4CAF50", color: "#fff", padding: "10px" }}>신청하기</button>
          </div>

          <hr />
          <h3>내 예약 리스트</h3>
          <ul>
            {myReservations.map((r) => (
              <li key={r.id} style={{ marginBottom: "10px", border: "1px solid #eee", padding: "10px" }}>
                <strong>예약ID: {r.id}</strong> | 시설ID: {r.spaceId} | 상태: <b>{r.status}</b><br />
                {r.reservationDate} {r.startTime}~{r.endTime}
                <div style={{ marginTop: "5px" }}>
                  <button onClick={() => cancelReservation(r.id)} style={{ background: "red", color: "white" }}>예약 취소 (Rollback)</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Admin Panel */}
        <div style={{ flex: 1, border: "1px solid #333", padding: "15px", background: "#f9f9f9" }}>
          <h2>관리자 모드 (X-Admin-Id)</h2>
          <div style={{ marginBottom: "10px" }}>
            <label>Admin ID: </label>
            <input value={adminId} onChange={(e) => setAdminId(e.target.value)} />
            <button onClick={fetchAdminReservations} style={{ marginLeft: "10px" }}>전체 예약 불러오기</button>
          </div>

          <hr />
          <h3>전체 예약 리스트</h3>
          <ul>
            {adminReservations.map((r) => (
              <li key={r.id} style={{ marginBottom: "10px", border: "1px solid #ddd", padding: "10px", background: "#fff" }}>
                <strong>예약ID: {r.id}</strong> | 유저ID: {r.userId} | 시설ID: {r.spaceId} | 상태: <b>{r.status}</b><br />
                {r.reservationDate} {r.startTime}~{r.endTime} <br />
                승인자ID: {r.approvedBy || "없음"}
                <div style={{ marginTop: "5px", gap: "10px", display: "flex" }}>
                  <button onClick={() => adminPatchReservation(r.id, "approve")} style={{ background: "blue", color: "white" }}>승인 (Approve)</button>
                  <button onClick={() => adminPatchReservation(r.id, "reject")} style={{ background: "orange", color: "white" }}>반려 (Reject)</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
