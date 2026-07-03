import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { findDemoParticipant } from "@/lib/demo-participants.functions";
import { Section } from "@/components/module-ui";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// -----------------------------------------------------------------
// Types
// -----------------------------------------------------------------
type Participant = {
  id: string;
  class_code: string;
  nickname: string;
};

type ActivityRecord = {
  id: string;
  activity_session_id: string;
  participant_id: string;
  class_code: string;
  nickname: string;
  score: number;
  correct_count: number;
  wrong_count: number;
  completed: boolean;
  duration_seconds: number;
  created_at: string;
};

type ClassSnapshot = {
  participants: number;
  totalActivities: number;
  totalScore: number;
  avgScore: number;
  maxScore: number;
  totalCorrect: number;
  totalWrong: number;
  completedCount: number;
  todayCount: number;
};

// -----------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------
const LS = {
  playerKey: "vibecoding:mod09:demo:playerKey",
  classCode: "vibecoding:mod09:demo:classCode",
  nickname: "vibecoding:mod09:demo:nickname",
};

function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function normalizeClassCode(raw: string): string {
  let s = raw.trim().replace(/\s+/g, " ");
  s = s.replace(/[^0-9A-Za-z가-힣\- ]/g, "");
  s = s.slice(0, 20);
  s = s.replace(/[A-Z]/g, (c) => c.toLowerCase());
  return s;
}

function computeSnapshot(
  records: ActivityRecord[],
  participantCount: number,
): ClassSnapshot {
  const total = records.length;
  const scoreSum = records.reduce((a, r) => a + r.score, 0);
  const today = new Date();
  const todayCount = records.filter((r) => {
    const d = new Date(r.created_at);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;
  return {
    participants: participantCount,
    totalActivities: total,
    totalScore: scoreSum,
    avgScore: total ? Math.round(scoreSum / total) : 0,
    maxScore: records.reduce((a, r) => Math.max(a, r.score), 0),
    totalCorrect: records.reduce((a, r) => a + r.correct_count, 0),
    totalWrong: records.reduce((a, r) => a + r.wrong_count, 0),
    completedCount: records.filter((r) => r.completed).length,
    todayCount,
  };
}

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 10) return "방금 전";
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

// -----------------------------------------------------------------
// Main component
// -----------------------------------------------------------------
export function CloudDbDemoSection() {
  const [mounted, setMounted] = useState(false);
  const [playerKey, setPlayerKey] = useState("");
  const [me, setMe] = useState<Participant | null>(null);

  // form
  const [classCode, setClassCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);

  // data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [newRecordId, setNewRecordId] = useState<string | null>(null);
  const [lastLocalRecordId, setLastLocalRecordId] = useState<string | null>(null);
  const [snapshotBefore, setSnapshotBefore] = useState<ClassSnapshot | null>(null);
  const [snapshotAfter, setSnapshotAfter] = useState<ClassSnapshot | null>(null);

  // stage: onboard | lobby | play | result
  const [stage, setStage] = useState<"onboard" | "lobby" | "play" | "result">("onboard");

  // -----------------------------------------------------------
  // Mount + restore from localStorage
  // -----------------------------------------------------------
  useEffect(() => {
    setMounted(true);
    let pk = localStorage.getItem(LS.playerKey);
    if (!pk) {
      pk = makeId("player");
      localStorage.setItem(LS.playerKey, pk);
    }
    setPlayerKey(pk);
    setClassCode(localStorage.getItem(LS.classCode) ?? "");
    setNickname(localStorage.getItem(LS.nickname) ?? "");
  }, []);

  // Try to find existing participant for this playerKey + classCode
  useEffect(() => {
    if (!mounted || !playerKey) return;
    const savedClass = localStorage.getItem(LS.classCode);
    if (!savedClass) return;
    (async () => {
      const data = await findDemoParticipant({
        data: { playerKey, classCode: savedClass },
      });
      if (data) {
        setMe(data as Participant);
        setStage("lobby");
      }
    })();
  }, [mounted, playerKey]);

  // -----------------------------------------------------------
  // Fetch class data
  // -----------------------------------------------------------
  const fetchClassData = useCallback(
    async (code: string) => {
      if (!code) return;
      setLoading(true);
      const [{ data: parts }, { data: recs }] = await Promise.all([
        supabase.from("demo_participants_public").select("*").eq("class_code", code),
        supabase
          .from("demo_activity_records")
          .select("*")
          .eq("class_code", code)
          .order("created_at", { ascending: false }),
      ]);
      setParticipants((parts ?? []) as Participant[]);
      setRecords((recs ?? []) as ActivityRecord[]);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    if (me) fetchClassData(me.class_code);
  }, [me, fetchClassData]);

  // -----------------------------------------------------------
  // Realtime subscription
  // -----------------------------------------------------------
  useEffect(() => {
    if (!me) return;
    const code = me.class_code;
    const channel = supabase
      .channel(`class-${code}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "demo_activity_records",
          filter: `class_code=eq.${code}`,
        },
        (payload) => {
          const rec = payload.new as ActivityRecord;
          setRecords((prev) =>
            prev.some((r) => r.id === rec.id) ? prev : [rec, ...prev],
          );
          setNewRecordId(rec.id);
          setAutoRefreshing(true);
          setTimeout(() => setAutoRefreshing(false), 1500);
          if (rec.participant_id !== me.id) {
            toast("새로운 클래스 기록이 추가되었습니다.");
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "demo_participants",
          filter: `class_code=eq.${code}`,
        },
        (payload) => {
          const p = payload.new as Participant;
          setParticipants((prev) =>
            prev.some((x) => x.id === p.id) ? prev : [...prev, p],
          );
        },
      )
      .subscribe();

    // fallback poll every 15s
    const interval = setInterval(() => fetchClassData(code), 15000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [me, fetchClassData]);

  // -----------------------------------------------------------
  // Onboard submit
  // -----------------------------------------------------------
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const cc = normalizeClassCode(classCode);
    const nn = nickname.trim();
    if (!cc) {
      toast.error("함께 참여할 클래스 코드를 입력해 주세요.");
      return;
    }
    if (!nn) {
      toast.error("닉네임을 입력해 주세요.");
      return;
    }
    setSaving(true);
    // Participants are insert-only. Look up an existing row for this
    // (player_key, class_code); if none, insert a new one.
    let participant: Participant | null = null;
    const existing = await findDemoParticipant({
      data: { playerKey, classCode: cc },
    });
    if (existing) {
      participant = existing as Participant;
    } else {
      const { data: inserted, error } = await supabase
        .from("demo_participants")
        .insert({
          player_key: playerKey,
          class_code: cc,
          nickname: nn,
        })
        .select("id, class_code, nickname, created_at, updated_at")
        .single();
      if (error || !inserted) {
        setSaving(false);
        toast.error("참여 정보 저장에 실패했어요.");
        return;
      }
      participant = inserted as Participant;
    }
    setSaving(false);
    localStorage.setItem(LS.classCode, cc);
    localStorage.setItem(LS.nickname, nn);
    setClassCode(cc);
    setMe(participant);
    setStage("lobby");
  }

  function handleChangeClass() {
    if (
      !confirm(
        "클래스 코드를 변경하면 다른 학급의 기록 화면으로 이동합니다. 계속할까요?",
      )
    )
      return;
    setMe(null);
    setRecords([]);
    setParticipants([]);
    setSnapshotBefore(null);
    setSnapshotAfter(null);
    setStage("onboard");
  }

  // -----------------------------------------------------------
  // Activity: simple number order game
  // -----------------------------------------------------------
  const [gameNumbers, setGameNumbers] = useState<number[]>([]);
  const [nextTarget, setNextTarget] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [gameResult, setGameResult] = useState<{
    score: number;
    correct: number;
    wrong: number;
    completed: boolean;
    duration: number;
  } | null>(null);

  function startGame() {
    // shuffle 1..9
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map((v) => ({ v, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((x) => x.v);
    setGameNumbers(arr);
    setNextTarget(1);
    setCorrect(0);
    setWrong(0);
    setStartTime(Date.now());
    setGameResult(null);
    setSnapshotBefore(computeSnapshot(records, participants.length));
    setStage("play");
  }

  function handleTap(n: number) {
    if (n === nextTarget) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      if (n === 9) {
        finishGame(newCorrect, wrong, true);
      } else {
        setNextTarget(n + 1);
      }
    } else {
      setWrong((w) => w + 1);
    }
  }

  async function finishGame(finalCorrect: number, finalWrong: number, completed: boolean) {
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const timeBonus = completed ? Math.max(0, 100 - duration) * 5 : 0;
    const score =
      finalCorrect * 100 - finalWrong * 20 + timeBonus + (completed ? 100 : 0);
    const result = { score, correct: finalCorrect, wrong: finalWrong, completed, duration };
    setGameResult(result);

    if (!me) return;
    const sessionId = makeId("sess");
    const { data, error } = await supabase
      .from("demo_activity_records")
      .insert({
        activity_session_id: sessionId,
        participant_id: me.id,
        class_code: me.class_code,
        nickname: me.nickname,
        score,
        correct_count: finalCorrect,
        wrong_count: finalWrong,
        completed,
        duration_seconds: duration,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("기록 저장에 실패했어요.");
      return;
    }
    const inserted = data as ActivityRecord;
    setLastLocalRecordId(inserted.id);
    setNewRecordId(inserted.id);
    // refresh
    await fetchClassData(me.class_code);
    // compute after using local optimistic
    setSnapshotAfter((prev) => {
      // let the next records effect handle
      return prev;
    });
    setStage("result");
  }

  // After records refresh in result stage, compute after snapshot
  useEffect(() => {
    if (stage === "result" && snapshotBefore && !snapshotAfter) {
      setSnapshotAfter(computeSnapshot(records, participants.length));
    }
  }, [stage, records, participants.length, snapshotBefore, snapshotAfter]);

  // -----------------------------------------------------------
  // Aggregates for leaderboard
  // -----------------------------------------------------------
  const perPlayerAgg = useMemo(() => {
    const map = new Map<
      string,
      {
        participant_id: string;
        nickname: string;
        best: number;
        total: number;
        count: number;
        avg: number;
        lastAt: string;
        completed: number;
      }
    >();
    for (const r of records) {
      const cur = map.get(r.participant_id);
      if (!cur) {
        map.set(r.participant_id, {
          participant_id: r.participant_id,
          nickname: r.nickname,
          best: r.score,
          total: r.score,
          count: 1,
          avg: r.score,
          lastAt: r.created_at,
          completed: r.completed ? 1 : 0,
        });
      } else {
        cur.best = Math.max(cur.best, r.score);
        cur.total += r.score;
        cur.count += 1;
        cur.avg = Math.round(cur.total / cur.count);
        if (new Date(r.created_at) > new Date(cur.lastAt)) cur.lastAt = r.created_at;
        if (r.completed) cur.completed += 1;
      }
    }
    // also include participants with no records
    for (const p of participants) {
      if (!map.has(p.id)) {
        map.set(p.id, {
          participant_id: p.id,
          nickname: p.nickname,
          best: 0,
          total: 0,
          count: 0,
          avg: 0,
          lastAt: "",
          completed: 0,
        });
      }
    }
    return Array.from(map.values());
  }, [records, participants]);

  const topByBest = useMemo(
    () =>
      [...perPlayerAgg].sort(
        (a, b) => b.best - a.best || b.avg - a.avg || b.count - a.count,
      ),
    [perPlayerAgg],
  );

  const topByParticipation = useMemo(
    () =>
      [...perPlayerAgg].sort(
        (a, b) =>
          b.count - a.count ||
          b.total - a.total ||
          new Date(b.lastAt || 0).getTime() - new Date(a.lastAt || 0).getTime(),
      ),
    [perPlayerAgg],
  );

  const [leaderTab, setLeaderTab] = useState<"best" | "participation">("best");

  const myBestRank = useMemo(() => {
    if (!me) return null;
    const idx = topByBest.findIndex((p) => p.participant_id === me.id);
    return idx === -1 ? null : idx + 1;
  }, [topByBest, me]);

  // charts data
  const barData = useMemo(
    () =>
      records
        .slice(0, 10)
        .reverse()
        .map((r) => ({
          name: r.nickname.length > 6 ? r.nickname.slice(0, 6) + "…" : r.nickname,
          점수: r.score,
        })),
    [records],
  );

  const lineData = useMemo(() => {
    const ordered = [...records].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    let cum = 0;
    return ordered.map((r, i) => {
      cum += r.score;
      return { idx: i + 1, 누적점수: cum };
    });
  }, [records]);

  const snapshot = useMemo(
    () => computeSnapshot(records, participants.length),
    [records, participants],
  );

  const myRecords = useMemo(
    () => (me ? records.filter((r) => r.participant_id === me.id) : []),
    [records, me],
  );

  const myTotalScore = myRecords.reduce((a, r) => a + r.score, 0);

  // -----------------------------------------------------------
  // Render
  // -----------------------------------------------------------
  if (!mounted) return null;

  return (
    <Section title="Lovable Cloud 데이터베이스 저장 체험">
      <p className="text-sm text-body mb-4 leading-relaxed">
        같은 클래스 코드로 참여한 사람들의 활동 기록이 하나의 그룹으로 묶입니다.
        데이터베이스에 새 행이 추가될 때마다 학급 전체 집계와 순위가 즉시
        바뀌는 모습을 함께 관찰해 보세요.
      </p>

      {stage === "onboard" && (
        <OnboardForm
          classCode={classCode}
          setClassCode={setClassCode}
          nickname={nickname}
          setNickname={setNickname}
          onSubmit={handleJoin}
          saving={saving}
        />
      )}

      {me && stage !== "onboard" && (
        <ClassHeader
          me={me}
          snapshot={snapshot}
          onChangeClass={handleChangeClass}
          onRefresh={() => fetchClassData(me.class_code)}
          loading={loading}
          autoRefreshing={autoRefreshing}
        />
      )}

      {stage === "lobby" && me && (
        <LobbyView records={records} onStart={startGame} />
      )}

      {stage === "play" && (
        <GameView
          numbers={gameNumbers}
          nextTarget={nextTarget}
          correct={correct}
          wrong={wrong}
          onTap={handleTap}
          onGiveUp={() => finishGame(correct, wrong, false)}
        />
      )}

      {stage === "result" && me && gameResult && (
        <ResultView
          me={me}
          gameResult={gameResult}
          before={snapshotBefore}
          after={snapshotAfter ?? snapshot}
          myRecords={myRecords}
          myTotalScore={myTotalScore}
          onPlayAgain={startGame}
          onBackToLobby={() => setStage("lobby")}
          onClose={handleChangeClass}
        />
      )}

      {me && stage !== "onboard" && stage !== "play" && (
        <>
          <ClassStats snapshot={snapshot} classCode={me.class_code} />
          <Leaderboard
            tab={leaderTab}
            setTab={setLeaderTab}
            topByBest={topByBest}
            topByParticipation={topByParticipation}
            meId={me.id}
            myBestRank={myBestRank}
            totalPeople={perPlayerAgg.length}
          />
          <RecentActivity
            records={records}
            newRecordId={newRecordId}
            lastLocalRecordId={lastLocalRecordId}
          />
          {records.length >= 2 && (
            <ChartsBlock barData={barData} lineData={lineData} />
          )}
          <ExplainerCard classCode={me.class_code} />
        </>
      )}
    </Section>
  );
}

// -----------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------
function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block mb-3">
      <div className="text-sm font-semibold text-ink mb-1">
        {label} {required && <span className="text-coral">*</span>}
      </div>
      {children}
      {hint && <p className="text-xs text-muted-text mt-1">{hint}</p>}
    </label>
  );
}

function OnboardForm(props: {
  classCode: string;
  setClassCode: (v: string) => void;
  nickname: string;
  setNickname: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}) {
  return (
    <form
      onSubmit={props.onSubmit}
      className="bg-surface-card rounded-lg p-5 border border-hairline"
    >
      <p className="text-xs text-muted-text mb-3">
        교사가 안내한 클래스 코드와 닉네임만 입력하세요. 실명, 학번, 전화번호 등
        개인정보는 입력하지 마세요.
      </p>
      <Field
        label="클래스 코드"
        required
        hint="같은 코드를 입력한 참가자끼리 기록과 순위를 함께 봅니다. 예: 1-1, 2-3, 연수1조, science-a"
      >
        <input
          value={props.classCode}
          onChange={(e) => props.setClassCode(e.target.value)}
          maxLength={20}
          placeholder="1-1"
          className="w-full px-3 py-2 rounded-md border border-hairline bg-canvas text-body-strong"
        />
      </Field>
      <Field label="닉네임" required hint="공개되는 이름입니다. 개인정보를 담지 마세요.">
        <input
          value={props.nickname}
          onChange={(e) => props.setNickname(e.target.value)}
          maxLength={20}
          placeholder="과학토끼"
          className="w-full px-3 py-2 rounded-md border border-hairline bg-canvas"
        />
      </Field>
      <button
        type="submit"
        disabled={props.saving}
        className="mt-2 w-full bg-coral text-white py-2.5 rounded-md font-semibold hover:bg-coral-active disabled:opacity-60"
      >
        {props.saving ? "저장 중…" : "클래스 참여"}
      </button>
    </form>
  );
}

function StatCell({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-canvas rounded-md p-3 border border-hairline">
      <p className="text-[11px] uppercase tracking-widest text-muted-text">{label}</p>
      <p className="serif text-xl text-ink mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-muted-text mt-0.5">{sub}</p>}
    </div>
  );
}

function ClassHeader({
  me,
  snapshot,
  onChangeClass,
  onRefresh,
  loading,
  autoRefreshing,
}: {
  me: Participant;
  snapshot: ClassSnapshot;
  onChangeClass: () => void;
  onRefresh: () => void;
  loading: boolean;
  autoRefreshing: boolean;
}) {
  return (
    <div className="bg-ink text-canvas rounded-lg p-5 mb-4">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <p className="text-xs text-white/60 uppercase tracking-widest">현재 클래스</p>
          <h3 className="serif text-2xl mt-0.5">클래스 {me.class_code} 데이터 현황</h3>
          <p className="text-xs text-white/70 mt-1">
            {me.nickname}
            · 참가 중
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
          >
            {loading ? "새로고침…" : "지금 새로고침"}
          </button>
          <button
            onClick={onChangeClass}
            className="text-xs px-3 py-1.5 rounded-md border border-white/30 hover:bg-white/10"
          >
            클래스 코드 변경
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        <MiniStat label="참가자" value={`${snapshot.participants}명`} />
        <MiniStat label="저장된 기록" value={`${snapshot.totalActivities}행`} />
        <MiniStat label="누적 점수" value={snapshot.totalScore.toLocaleString()} />
        <MiniStat label="오늘 새 기록" value={`${snapshot.todayCount}개`} />
      </div>
      <p className="text-[11px] text-white/60 mt-3">
        {autoRefreshing ? "새 기록 도착 · " : ""}클래스 기록 자동 갱신 중
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded p-2">
      <p className="text-[10px] text-white/60 uppercase">{label}</p>
      <p className="serif text-lg text-white mt-0.5">{value}</p>
    </div>
  );
}

function LobbyView({ records, onStart }: { records: ActivityRecord[]; onStart: () => void }) {
  return (
    <div className="bg-surface-card rounded-lg p-5 mb-4">
      <p className="text-sm text-body leading-relaxed mb-3">
        같은 클래스 코드로 참여한 사람들의 활동 결과가 이곳에 함께 누적됩니다.
        아래 활동을 마치면 학급 전체 데이터가 즉시 갱신되는 모습을 볼 수 있어요.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onStart}
          className="bg-coral text-white px-4 py-2 rounded-md font-semibold hover:bg-coral-active"
        >
          내 활동 시작
        </button>
      </div>
      {records.length === 0 && (
        <p className="text-xs text-muted-text mt-3">
          아직 이 학급에 저장된 기록이 없어요. 첫 기록을 남겨보세요.
        </p>
      )}
    </div>
  );
}

function GameView({
  numbers,
  nextTarget,
  correct,
  wrong,
  onTap,
  onGiveUp,
}: {
  numbers: number[];
  nextTarget: number;
  correct: number;
  wrong: number;
  onTap: (n: number) => void;
  onGiveUp: () => void;
}) {
  return (
    <div className="bg-surface-soft rounded-lg p-5 mb-4">
      <div className="flex justify-between items-baseline mb-3 flex-wrap gap-2">
        <div>
          <p className="text-xs text-muted-text uppercase tracking-widest">
            짧은 숫자 순서 찾기
          </p>
          <p className="serif text-xl text-ink">
            다음 숫자: <span className="text-coral">{nextTarget}</span>
          </p>
        </div>
        <div className="text-xs text-body">
          맞힘 {correct} · 틀림 {wrong}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {numbers.map((n) => (
          <button
            key={n}
            onClick={() => onTap(n)}
            disabled={n < nextTarget}
            className={`aspect-square rounded-md serif text-2xl border ${
              n < nextTarget
                ? "bg-hairline text-muted-text border-hairline"
                : "bg-canvas hover:bg-surface-card border-hairline"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={onGiveUp}
          className="text-xs px-3 py-1.5 rounded-md border border-hairline hover:bg-canvas"
        >
          여기까지 기록으로 남기기
        </button>
      </div>
    </div>
  );
}

function ResultView(props: {
  me: Participant;
  gameResult: { score: number; correct: number; wrong: number; completed: boolean; duration: number };
  before: ClassSnapshot | null;
  after: ClassSnapshot;
  myRecords: ActivityRecord[];
  myTotalScore: number;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onClose: () => void;
}) {
  const { gameResult, before, after, myRecords, myTotalScore } = props;
  const myCount = myRecords.length;
  const beforeMyCount = Math.max(0, myCount - 1);
  const beforeMyScore = myTotalScore - gameResult.score;
  return (
    <div className="bg-surface-card rounded-lg p-5 mb-4 border border-coral/40">
      <p className="text-xs uppercase tracking-widest text-coral font-medium">이번 활동 결과</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 mb-4">
        <StatCell label="점수" value={gameResult.score} />
        <StatCell label="맞힘" value={gameResult.correct} />
        <StatCell label="틀림" value={gameResult.wrong} />
        <StatCell label="시간" value={`${gameResult.duration}초`} />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-canvas rounded-md p-4 border border-hairline">
          <p className="text-sm font-semibold text-ink mb-2">나의 기록 변화</p>
          <BeforeAfter
            rows={[
              ["활동 횟수", beforeMyCount, myCount],
              ["누적 점수", beforeMyScore, myTotalScore],
              ["기록 행 수", beforeMyCount, myCount],
            ]}
          />
        </div>
        <div className="bg-canvas rounded-md p-4 border border-hairline">
          <p className="text-sm font-semibold text-ink mb-2">클래스 전체 변화</p>
          {before ? (
            <BeforeAfter
              rows={[
                ["활동 횟수", before.totalActivities, after.totalActivities],
                ["누적 점수", before.totalScore, after.totalScore],
                ["기록 행 수", before.totalActivities, after.totalActivities],
                ["참여 인원", before.participants, after.participants],
              ]}
            />
          ) : (
            <p className="text-xs text-muted-text">이전 데이터가 없어요.</p>
          )}
        </div>
      </div>

      <p className="text-xs text-body mt-3 leading-relaxed">
        <span className="text-coral font-semibold">개인의 활동 기록이 저장되면</span>{" "}
        학급 전체 집계도 즉시 달라집니다. 내 기록 한 줄이 추가되면서 클래스 전체
        데이터도 함께 바뀌었어요.
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={props.onPlayAgain}
          className="bg-coral text-white px-4 py-2 rounded-md font-semibold hover:bg-coral-active"
        >
          한 번 더 데이터 쌓기
        </button>
        <button
          onClick={props.onBackToLobby}
          className="border border-hairline px-4 py-2 rounded-md hover:bg-surface-soft"
        >
          클래스 현황 보기
        </button>
        <button
          onClick={props.onClose}
          className="text-muted-text text-sm px-3 py-2 hover:text-ink"
        >
          체험 닫기
        </button>
      </div>
    </div>
  );
}

function BeforeAfter({ rows }: { rows: [string, number, number][] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-text">
          <th className="text-left font-normal py-1"></th>
          <th className="text-right font-normal py-1">저장 전</th>
          <th className="text-right font-normal py-1">저장 후</th>
          <th className="text-right font-normal py-1">변화</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, b, a]) => (
          <tr key={label} className="border-t border-hairline">
            <td className="py-1.5 text-body-strong">{label}</td>
            <td className="py-1.5 text-right">{b.toLocaleString()}</td>
            <td className="py-1.5 text-right font-semibold">{a.toLocaleString()}</td>
            <td className="py-1.5 text-right text-coral">
              {a - b >= 0 ? `+${(a - b).toLocaleString()}` : (a - b).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ClassStats({ snapshot, classCode }: { snapshot: ClassSnapshot; classCode: string }) {
  const items: [string, React.ReactNode, string][] = [
    ["참여한 닉네임 수", snapshot.participants, "현재 클래스 코드로 저장된 참가자 행의 개수"],
    ["전체 활동 횟수", snapshot.totalActivities, `class_code = ${classCode} 인 활동 행의 개수`],
    ["저장된 전체 행 수", snapshot.totalActivities, "활동 테이블의 총 행 수"],
    ["클래스 누적 점수", snapshot.totalScore.toLocaleString(), "현재 클래스의 모든 score 값을 더한 결과"],
    ["클래스 평균 점수", snapshot.avgScore.toLocaleString(), "현재 클래스의 전체 점수 평균"],
    ["최고 점수", snapshot.maxScore.toLocaleString(), "현재 클래스에서 나온 가장 높은 한 번의 점수"],
    ["전체 정답 수", snapshot.totalCorrect, "correct_count 값의 합"],
    ["전체 오답 수", snapshot.totalWrong, "wrong_count 값의 합"],
    ["완료 횟수", snapshot.completedCount, "completed = true 인 행의 개수"],
  ];
  return (
    <div className="mt-6">
      <h3 className="serif text-2xl text-ink mb-3">우리 클래스에 쌓인 데이터</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {items.map(([label, value, sub]) => (
          <StatCell key={label} label={label} value={value} sub={sub} />
        ))}
      </div>
    </div>
  );
}

function Leaderboard(props: {
  tab: "best" | "participation";
  setTab: (t: "best" | "participation") => void;
  topByBest: ReturnType<typeof aggType>;
  topByParticipation: ReturnType<typeof aggType>;
  meId: string;
  myBestRank: number | null;
  totalPeople: number;
}) {
  const list = props.tab === "best" ? props.topByBest : props.topByParticipation;
  const top10 = list.slice(0, 10);
  const meInTop = top10.some((p) => p.participant_id === props.meId);
  const meRow = list.find((p) => p.participant_id === props.meId);
  return (
    <div className="mt-6">
      <h3 className="serif text-2xl text-ink mb-2">클래스 점수판</h3>
      <div className="flex gap-1 mb-3">
        <TabBtn active={props.tab === "best"} onClick={() => props.setTab("best")}>
          최고 점수 순위
        </TabBtn>
        <TabBtn
          active={props.tab === "participation"}
          onClick={() => props.setTab("participation")}
        >
          참여·누적 현황
        </TabBtn>
      </div>
      <p className="text-xs text-muted-text mb-3">
        {props.tab === "best"
          ? "각 참가자의 가장 높은 한 번의 점수를 기준으로 비교합니다."
          : "활동을 반복하며 데이터가 얼마나 쌓였는지 확인합니다. 누적 점수는 실력 순위가 아니라 데이터 누적 현황입니다."}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-text">
            <tr className="border-b border-hairline">
              <th className="text-left py-2 pr-2">#</th>
              <th className="text-left py-2 pr-2">닉네임</th>
              {props.tab === "best" ? (
                <>
                  <th className="text-right py-2 pr-2">최고</th>
                  <th className="text-right py-2 pr-2">평균</th>
                  <th className="text-right py-2">참여</th>
                </>
              ) : (
                <>
                  <th className="text-right py-2 pr-2">참여</th>
                  <th className="text-right py-2 pr-2">누적</th>
                  <th className="text-right py-2">최근</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {top10.map((p, i) => (
              <tr
                key={p.participant_id}
                className={`border-b border-hairline ${
                  p.participant_id === props.meId ? "bg-coral/10" : ""
                }`}
              >
                <td className="py-2 pr-2 text-muted-text">{i + 1}</td>
                <td className="py-2 pr-2 text-body-strong">
                  {p.nickname}
                  {p.participant_id === props.meId && (
                    <span className="ml-2 text-[10px] bg-coral text-white px-1.5 py-0.5 rounded">
                      나
                    </span>
                  )}
                </td>
                {props.tab === "best" ? (
                  <>
                    <td className="py-2 pr-2 text-right font-semibold">{p.best.toLocaleString()}</td>
                    <td className="py-2 pr-2 text-right">{p.avg.toLocaleString()}</td>
                    <td className="py-2 text-right">{p.count}</td>
                  </>
                ) : (
                  <>
                    <td className="py-2 pr-2 text-right font-semibold">{p.count}</td>
                    <td className="py-2 pr-2 text-right">{p.total.toLocaleString()}</td>
                    <td className="py-2 text-right text-xs text-muted-text">
                      {p.lastAt ? timeAgo(p.lastAt) : "—"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!meInTop && meRow && (
        <p className="text-xs text-muted-text mt-2">
          현재 내 최고 점수 순위: {props.myBestRank ?? "—"}위 / {props.totalPeople}명 (최고{" "}
          {meRow.best.toLocaleString()}점, 참여 {meRow.count}회)
        </p>
      )}
    </div>
  );
}

// helper type for aggregate
function aggType() {
  return [] as {
    participant_id: string;
    nickname: string;
    
    best: number;
    total: number;
    count: number;
    avg: number;
    lastAt: string;
    completed: number;
  }[];
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-md border ${
        active ? "bg-coral text-white border-coral" : "border-hairline hover:bg-surface-soft"
      }`}
    >
      {children}
    </button>
  );
}

function RecentActivity({
  records,
  newRecordId,
  lastLocalRecordId,
}: {
  records: ActivityRecord[];
  newRecordId: string | null;
  lastLocalRecordId: string | null;
}) {
  const list = records.slice(0, 10);
  return (
    <div className="mt-6">
      <h3 className="serif text-2xl text-ink mb-3">방금 쌓인 클래스 데이터</h3>
      {list.length === 0 ? (
        <p className="text-sm text-muted-text">아직 저장된 기록이 없어요.</p>
      ) : (
        <ul className="space-y-1.5">
          {list.map((r) => {
            const isMineFresh = r.id === lastLocalRecordId;
            const isNew = r.id === newRecordId;
            return (
              <li
                key={r.id}
                className={`flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-md border ${
                  isMineFresh
                    ? "bg-coral/10 border-coral/30"
                    : "bg-canvas border-hairline"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-ink">{r.nickname}</span>
                  <span className="text-body"> · {r.score.toLocaleString()}점</span>
                  <span className="text-muted-text text-xs">
                    {" "}
                    · 숫자 {r.correct_count}개 {r.completed ? "완료" : "중단"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(isMineFresh || isNew) && (
                    <span className="text-[10px] bg-coral text-white px-1.5 py-0.5 rounded">
                      새로 저장됨
                    </span>
                  )}
                  <span className="text-xs text-muted-text">{timeAgo(r.created_at)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ChartsBlock({
  barData,
  lineData,
}: {
  barData: { name: string; 점수: number }[];
  lineData: { idx: number; 누적점수: number }[];
}) {
  return (
    <div className="mt-6">
      <h3 className="serif text-2xl text-ink mb-3">우리 클래스의 데이터 변화</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-canvas rounded-lg p-4 border border-hairline">
          <p className="text-sm font-semibold text-ink mb-2">최근 활동별 점수</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="점수" fill="hsl(var(--coral, 12 76% 61%))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-canvas rounded-lg p-4 border border-hairline">
          <p className="text-sm font-semibold text-ink mb-2">클래스 누적 점수</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="idx" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="누적점수"
                  stroke="hsl(var(--coral, 12 76% 61%))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-text mt-2">
        새로운 활동 행이 추가될수록 클래스 누적 점수 그래프가 계속 올라갑니다.
      </p>
    </div>
  );
}

function ExplainerCard({ classCode }: { classCode: string }) {
  return (
    <div className="mt-6 bg-surface-card rounded-lg p-5">
      <p className="text-xs uppercase tracking-widest text-muted-text">도움말</p>
      <h4 className="serif text-xl text-ink mt-0.5 mb-2">
        클래스 코드는 데이터베이스에서 어떤 역할을 하나요?
      </h4>
      <p className="text-sm text-body leading-relaxed">
        클래스 코드는 여러 참가자의 기록을 같은 그룹으로 묶는 기준입니다.
        데이터베이스에서 <code className="text-coral">class_code</code>가 같은 행만
        골라 조회하면 한 학급의 점수와 활동 기록을 함께 볼 수 있습니다.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 mt-3 font-mono text-xs">
        <div className="bg-canvas rounded p-3 border border-hairline">
          <p className="text-coral">class_code = {classCode}</p>
          <p>· 과학토끼 기록</p>
          <p>· 별빛교사 기록</p>
          <p>· 실험왕 기록</p>
        </div>
        <div className="bg-canvas rounded p-3 border border-hairline">
          <p className="text-muted-text">class_code = 1-2</p>
          <p>· 우주토끼 기록</p>
          <p>· 탐구왕 기록</p>
        </div>
      </div>
      <p className="text-xs text-body mt-3">
        같은 테이블에 저장되어도 <span className="text-coral font-semibold">클래스 코드 조건</span>으로
        학급별 데이터를 나눌 수 있습니다. 이 체험의 클래스 기록은 여러 참가자가
        함께 사용하는 데이터이므로 개별 사용자가 다른 사람의 기록을 수정하거나
        삭제할 수 없습니다.
      </p>
    </div>
  );
}
