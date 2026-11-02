import React, { useEffect, useState, useRef } from "react";
import {
  Hand,
  Hammer,
  Link2,
  Unlink,
  ArrowUpRight,
  Shield,
  HeartHandshake,
  Banana,
  Eraser,
  Zap,
  Target,
  Wind,
} from "lucide-react";
import type { Player, Snapshot } from "../../shared/world";
import {
  teams,
  stateNames,
  prankRules,
  MISCHIEF,
  inSanctuary,
  type PrankAction,
} from "../../shared/mischief";
export function MischiefPanel({
  me,
  world,
  targetId,
  onSelect,
  onAction,
  onApproach,
  onStage,
}: {
  me: Player;
  world: Snapshot;
  targetId: string;
  onSelect: (id: string) => void;
  onAction: (action: PrankAction) => void;
  onApproach: (p: Player) => void;
  onStage: () => void;
}) {
  const [localTime, setLocalTime] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setLocalTime(Date.now()), 100);
    return () => clearInterval(t);
  }, []);
  const offset = useRef(0);
  useEffect(() => {
    offset.current = (world.social?.serverTime || Date.now()) - Date.now();
  }, [world.social?.serverTime]);
  const now = localTime + offset.current,
    s = me.soul,
    target = world.players.find((p) => p.id === targetId),
    free = (s?.state || "free") === "free",
    distance = target ? Math.hypot(target.x - me.x, target.y - me.y) : 0;
  const selectedActions: PrankAction[] = [
    "push",
    "bonk",
    s?.dragging ? "release" : "drag",
    "throw",
    "guard",
    "rescue",
    "banana",
    "disarm",
  ];
  const disabled = (action: PrankAction) => {
    const r = prankRules[action];
    if (
      !free ||
      (s?.energy ?? 100) < r.cost ||
      (s?.cooldowns[action] || 0) > now
    )
      return true;
    if (s?.dragging && !["throw", "release"].includes(action)) return true;
    if (
      ["push", "bonk", "drag", "rescue"].includes(action) &&
      (!target || distance > r.range)
    )
      return true;
    if (action === "drag" && target?.soul?.state !== "stunned") return true;
    if (["push", "bonk"].includes(action) && target?.soul?.state !== "free")
      return true;
    if (
      ["push", "bonk", "drag"].includes(action) &&
      ((s?.immuneUntil || 0) > now ||
        inSanctuary(me) ||
        (target &&
          ((target.soul?.immuneUntil || 0) > now || inSanctuary(target))))
    )
      return true;
    if (
      action === "throw" &&
      (!s?.dragging ||
        Math.hypot(me.x - MISCHIEF.trap.x, me.y - MISCHIEF.trap.y) >
          MISCHIEF.trap.radius)
    )
      return true;
    if (action === "rescue" && (!target?.soul || target.soul.state === "free"))
      return true;
    return false;
  };
  const actionIcons = {
    push: Hand,
    bonk: Hammer,
    drag: Link2,
    release: Unlink,
    throw: ArrowUpRight,
    guard: Shield,
    rescue: HeartHandshake,
    banana: Banana,
    disarm: Eraser,
    struggle: Wind,
  };
  const reason = (action: PrankAction) => {
    const r = prankRules[action];
    if ((s?.cooldowns[action] || 0) > now) return "Đang hồi chiêu";
    if ((s?.energy ?? 100) < r.cost) return "Thiếu thể lực";
    if (s?.dragging && !["release", "throw"].includes(action))
      return "Đang kéo vong";
    if (["push", "bonk", "drag", "rescue"].includes(action)) {
      if (!target) return "Chọn mục tiêu";
      if (distance > r.range) return "Đến gần hơn";
      if (action === "rescue")
        return target.soul?.state === "free" ? "Chưa cần cứu" : "";
      if (
        (s?.immuneUntil || 0) > now ||
        inSanctuary(me) ||
        (target.soul?.immuneUntil || 0) > now ||
        inSanctuary(target)
      )
        return "Đang được bảo vệ";
      if (action === "drag" && target.soul?.state !== "stunned")
        return "Cần đánh choáng";
      if (["push", "bonk"].includes(action) && target.soul?.state !== "free")
        return "Đã bị khống chế";
    }
    if (action === "throw") {
      if (!s?.dragging) return "Cần kéo vong trước";
      if (
        Math.hypot(me.x - MISCHIEF.trap.x, me.y - MISCHIEF.trap.y) >
        MISCHIEF.trap.radius
      )
        return "Đưa tới vòng ném";
    }
    return "";
  };
  return (
    <section className="mischief-panel" aria-label="Tương tác vong hồn">
      <div className="mischief-heading">
        <div>
          <span className="section-kicker">
            VONG HỒN QUẬY PHÁ · PHE {me.team || "A"}
          </span>
          <h3>Bảng điều khiển âm hồn</h3>
        </div>
        <div className="soul-status">
          <b>{stateNames[s?.state || "free"]}</b>
          <span>
            {s?.state !== "free" && s?.until
              ? `${Math.max(0, (s.until - now) / 1000).toFixed(1)}s`
              : inSanctuary(me)
                ? "Vùng nghỉ"
                : s && s.immuneUntil > now
                  ? "Hào quang bảo vệ"
                  : s?.dragging
                    ? "Đang kéo người"
                    : s?.guardUntil && s.guardUntil > now
                      ? "Đang đỡ đòn"
                      : "Sẵn sàng quậy"}
          </span>
        </div>
      </div>
      <div className="team-scoreboard">
        {Object.entries(teams).map(([id, t]) => (
          <div key={id} style={{ borderColor: `${t.color}55` }}>
            <span style={{ color: t.color }}>
              Phe {id} · {t.name}
            </span>
            <b>{world.social?.scores[id as keyof typeof teams] || 0}</b>
            <small>
              {world.social?.roster.filter((p) => p.team === id).length || 0}{" "}
              người
            </small>
          </div>
        ))}
      </div>
      <div className="energy-row">
        <span>
          <Zap size={13} /> Thể lực <b>{Math.floor(s?.energy ?? 100)}/100</b>
        </span>
        <div className="energy-meter">
          <i style={{ width: `${s?.energy ?? 100}%` }} />
        </div>
        <small>Hồi 10/giây · Không mất ấn khi bị troll</small>
      </div>
      <div className="target-roster" aria-label="Chọn mục tiêu">
        {world.players
          .filter((p) => p.id !== me.id)
          .map((p) => (
            <button
              key={p.id}
              className={targetId === p.id ? "selected" : ""}
              onClick={() => onSelect(p.id)}
            >
              <i style={{ background: teams[p.team || "A"].color }} />
              <span>{p.name}</span>
              <small>
                {p.team === me.team ? "Cùng phe" : `Phe ${p.team}`} ·{" "}
                {stateNames[p.soul?.state || "free"]}
              </small>
              {p.soul?.combo === 1 && <b>1/2 ★</b>}
            </button>
          ))}
        {world.players.length === 1 && (
          <p className="prank-empty">
            Chưa có đối tượng để quậy. Mời bạn vào cùng mã phòng; vẫn có thể thử
            đặt bẫy và đỡ đòn một mình.
          </p>
        )}
      </div>
      <div className="target-summary">
        <span>
          {target ? (
            <>
              <Target size={14} /> Mục tiêu <b>{target.name}</b> ·{" "}
              {Math.round(distance)} bước
            </>
          ) : (
            "Chọn vong trên bản đồ hoặc danh sách, rồi dùng chiêu."
          )}
        </span>
        {s?.dragging ? (
          <button onClick={onStage}>Đưa tới vòng ném ↗</button>
        ) : (
          target && (
            <button onClick={() => onApproach(target)} disabled={!free}>
              Đến gần mục tiêu ↗
            </button>
          )
        )}
      </div>
      {!free ? (
        <div className="struggle-box">
          <p>{s?.lastEvent}</p>
          <button
            className="gold-button"
            disabled={
              (s?.energy || 0) < 10 || (s?.cooldowns.struggle || 0) > now
            }
            onClick={() => onAction("struggle")}
          >
            <Wind size={20} /> Vùng vẫy · Space <small>10 thể lực</small>
          </button>
          <span>Rút ngắn khống chế · Ba lần vùng vẫy thoát kéo</span>
        </div>
      ) : (
        <div className="prank-actions">
          {selectedActions.map((action, index) => {
            const r = prankRules[action],
              remaining = Math.max(
                0,
                ((s?.cooldowns[action] || 0) - now) / 1000,
              );
            const Icon = actionIcons[action],
              why = reason(action);
            return (
              <React.Fragment key={action}>
                {(index === 0 || index === 4) && (
                  <div className="action-group-label">
                    <span>
                      {index === 0
                        ? "QUẬY PHÁ & KHỐNG CHẾ"
                        : "PHÒNG THỦ & ĐỒ NGHỀ"}
                    </span>
                    <small>
                      {index === 0
                        ? "Chọn vong · Áp sát · Ra chiêu"
                        : "Giữ mình · Cứu bạn · Đặt bẫy"}
                    </small>
                  </div>
                )}
                <button
                  disabled={disabled(action)}
                  onClick={() => onAction(action)}
                  title={`${why ? why + ". " : ""}${r.hint}`}
                  aria-label={`${r.key} ${r.label}`}
                  className={`action-tile action-${action} ${remaining ? "is-cooling" : ""}`}
                >
                  <span className="action-tile-icon">
                    <Icon size={23} />
                  </span>
                  <kbd>{r.key}</kbd>
                  <span className="action-tile-label">
                    {r.label}
                    <small>{why || r.hint.split(".")[0]}</small>
                  </span>
                  <span className="action-tile-cost">
                    <Zap size={10} />
                    {r.cost}
                  </span>
                  {remaining > 0 && (
                    <>
                      <span className="action-tile-timer">
                        {remaining.toFixed(1)}s
                      </span>
                      <span
                        className="action-tile-progress"
                        style={{
                          width: `${Math.min(100, ((remaining * 1000) / r.cooldown) * 100)}%`,
                        }}
                      />
                    </>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
      <div className="prank-instructions">
        <b>Gõ ×2 → choáng → kéo → đến vòng ném → ném.</b>
        <span>
          Đẩy chỉ gây ngã. Đồng đội có thể cứu; nạn nhân có thể vùng vẫy. Vùng
          nghỉ và hào quang chặn đòn mới. Cùng phe vẫn có thể troll nhau, điểm
          chỉ thưởng khi cản phe khác hoặc cứu cùng phe.
        </span>
      </div>
      <p className="last-soul-event" aria-live="polite">
        {s?.lastEvent}
      </p>
      <details className="party-roster">
        <summary>
          Xem nhóm ở các tầng ({world.social?.roster.length || 1} vong)
        </summary>
        {(["A", "B", "C"] as const).map((team) => (
          <p key={team}>
            <b style={{ color: teams[team].color }}>Phe {team}:</b>{" "}
            {world.social?.roster
              .filter((p) => p.team === team)
              .map((p) => `${p.name} (tầng ${p.floor})`)
              .join(", ") || "Chưa có ai"}
          </p>
        ))}
      </details>
    </section>
  );
}
