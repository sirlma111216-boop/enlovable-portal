// 모듈 9 클라우드 DB 체험 — Firebase Firestore 데이터 계층
//
// Firestore 구조:
//   classes/{classCode}
//   classes/{classCode}/participants/{uid}          ← 기존 demo_participants 대체
//   classes/{classCode}/activityRecords/{sessionId} ← 기존 demo_activity_records 대체
//
// 식별자는 Firebase Anonymous Auth의 uid를 사용합니다 (기존 player_key 대체).
// UI 호환을 위해 반환 타입의 필드명은 기존 snake_case 형태를 유지합니다.
import {
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

// -----------------------------------------------------------------
// UI에서 사용하는 타입 (기존 Supabase 시절 형태 유지)
// -----------------------------------------------------------------
export type Participant = {
  id: string; // Firebase auth uid
  class_code: string;
  nickname: string;
};

export type ActivityRecord = {
  id: string; // activitySessionId (문서 ID)
  activity_session_id: string;
  participant_id: string; // Firebase auth uid
  class_code: string;
  nickname: string;
  score: number;
  correct_count: number;
  wrong_count: number;
  completed: boolean;
  duration_seconds: number;
  created_at: string; // ISO 문자열
};

// -----------------------------------------------------------------
// 내부 헬퍼
// -----------------------------------------------------------------
function participantsCol(classCode: string) {
  return collection(getFirebaseDb(), "classes", classCode, "participants");
}

function activityRecordsCol(classCode: string) {
  return collection(getFirebaseDb(), "classes", classCode, "activityRecords");
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return new Date().toISOString();
}

function mapParticipant(
  snap: QueryDocumentSnapshot<DocumentData> | { id: string; data: () => DocumentData | undefined },
  classCode: string,
): Participant {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    class_code: (d.classCode as string) ?? classCode,
    nickname: (d.nickname as string) ?? "익명",
  };
}

function mapRecord(
  snap: QueryDocumentSnapshot<DocumentData>,
  classCode: string,
): ActivityRecord {
  const d = snap.data({ serverTimestamps: "estimate" });
  return {
    id: snap.id,
    activity_session_id: (d.activitySessionId as string) ?? snap.id,
    participant_id: (d.participantId as string) ?? "",
    class_code: (d.classCode as string) ?? classCode,
    nickname: (d.nickname as string) ?? "익명",
    score: Number(d.score ?? 0),
    correct_count: Number(d.correctCount ?? 0),
    wrong_count: Number(d.wrongCount ?? 0),
    completed: Boolean(d.completed),
    duration_seconds: Number(d.durationSeconds ?? 0),
    created_at: toIso(d.createdAt),
  };
}

// -----------------------------------------------------------------
// 1) 익명 로그인 — uid 확보
// -----------------------------------------------------------------
export async function ensureAnonymousUser(): Promise<string> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser.uid;

  // 초기화 직후에는 currentUser가 아직 복원 전일 수 있으므로 첫 상태를 기다립니다.
  const existing = await new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
  if (existing) return existing.uid;

  try {
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch (e) {
    console.error(e);
    throw new Error(
      "익명 로그인에 실패했어요. Firebase 콘솔에서 Anonymous 로그인이 켜져 있는지 확인해 주세요.",
    );
  }
}

// -----------------------------------------------------------------
// 2) 참가자 조회 (자동 복귀용) — 없으면 null
// -----------------------------------------------------------------
export async function findParticipant(
  classCode: string,
): Promise<Participant | null> {
  const uid = await ensureAnonymousUser();
  const snap = await getDoc(doc(participantsCol(classCode), uid));
  if (!snap.exists()) return null;
  return mapParticipant(snap, classCode);
}

// -----------------------------------------------------------------
// 3) 참가자 등록 — 이미 있으면 기존 정보(닉네임 포함) 유지
// -----------------------------------------------------------------
export async function ensureParticipant(
  classCode: string,
  nickname: string,
): Promise<Participant> {
  const uid = await ensureAnonymousUser();
  const ref = doc(participantsCol(classCode), uid);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return mapParticipant(snap, classCode);
    }
    await setDoc(ref, {
      nickname,
      classCode,
      createdAt: serverTimestamp(),
    });
    return { id: uid, class_code: classCode, nickname };
  } catch (e) {
    console.error(e);
    throw new Error("참여 정보 저장에 실패했어요.");
  }
}

// -----------------------------------------------------------------
// 4) 활동 기록 저장
// -----------------------------------------------------------------
export async function saveActivityRecord(input: {
  classCode: string;
  nickname: string;
  activitySessionId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  completed: boolean;
  durationSeconds: number;
}): Promise<ActivityRecord> {
  const uid = await ensureAnonymousUser();
  const ref = doc(activityRecordsCol(input.classCode), input.activitySessionId);

  try {
    await setDoc(ref, {
      activitySessionId: input.activitySessionId,
      participantId: uid,
      classCode: input.classCode,
      nickname: input.nickname,
      score: input.score,
      correctCount: input.correctCount,
      wrongCount: input.wrongCount,
      completed: input.completed,
      durationSeconds: input.durationSeconds,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error(e);
    throw new Error("기록 저장에 실패했어요.");
  }

  return {
    id: input.activitySessionId,
    activity_session_id: input.activitySessionId,
    participant_id: uid,
    class_code: input.classCode,
    nickname: input.nickname,
    score: input.score,
    correct_count: input.correctCount,
    wrong_count: input.wrongCount,
    completed: input.completed,
    duration_seconds: input.durationSeconds,
    created_at: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------
// 5) 일회성 조회 ("지금 새로고침" 버튼용)
// -----------------------------------------------------------------
export async function fetchClassData(classCode: string): Promise<{
  participants: Participant[];
  records: ActivityRecord[];
}> {
  try {
    const [pSnap, rSnap] = await Promise.all([
      getDocs(participantsCol(classCode)),
      getDocs(query(activityRecordsCol(classCode), orderBy("createdAt", "desc"))),
    ]);
    return {
      participants: pSnap.docs.map((d) => mapParticipant(d, classCode)),
      records: rSnap.docs.map((d) => mapRecord(d, classCode)),
    };
  } catch (e) {
    console.error(e);
    throw new Error("클래스 데이터를 불러오지 못했어요.");
  }
}

// -----------------------------------------------------------------
// 6) 실시간 구독 — 참가자 + 활동 기록 (기존 Supabase Realtime 대체)
// -----------------------------------------------------------------
export function subscribeClassData(
  classCode: string,
  callbacks: {
    onParticipants: (participants: Participant[]) => void;
    /** 전체 목록과, 이번 스냅샷에서 새로 추가된 기록(초기 로드는 제외) */
    onRecords: (records: ActivityRecord[], added: ActivityRecord[]) => void;
    onError?: (message: string) => void;
  },
): () => void {
  const handleError = (e: unknown) => {
    console.error(e);
    callbacks.onError?.(
      "클래스 데이터 실시간 연결에 문제가 발생했어요. 잠시 후 새로고침해 주세요.",
    );
  };

  const unsubParticipants = onSnapshot(
    participantsCol(classCode),
    (snap) => {
      callbacks.onParticipants(snap.docs.map((d) => mapParticipant(d, classCode)));
    },
    handleError,
  );

  let firstRecordsSnapshot = true;
  const unsubRecords = onSnapshot(
    query(activityRecordsCol(classCode), orderBy("createdAt", "desc")),
    (snap) => {
      const all = snap.docs.map((d) => mapRecord(d, classCode));
      const added = firstRecordsSnapshot
        ? []
        : snap
            .docChanges()
            .filter((c) => c.type === "added")
            .map((c) => mapRecord(c.doc, classCode));
      firstRecordsSnapshot = false;
      callbacks.onRecords(all, added);
    },
    handleError,
  );

  return () => {
    unsubParticipants();
    unsubRecords();
  };
}
