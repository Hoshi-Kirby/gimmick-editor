import "./EventCard.css";
import { useState, useEffect } from "react";

export function EventCard({
  event,
  deleteEvent,
  updateEvent,
  party,
  selectedPokemon,
}) {
  const [isAbilityFocused, setIsAbilityFocused] = useState(false);
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
        position: "relative",
      }}
    >
      {/* 横並びの3つ（主体 → 行動の種類 → 行動名） */}
      <div className="event-row">
        {/* 主体 */}
        <div>
          <button
            onClick={() => deleteEvent(event.id)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              border: "none",
              background: "transparent",
              fontSize: "18px",
              cursor: "pointer",
              color: "#000000",
            }}
          >
            ×
          </button>
          {/* {!event.actor && <label>主体：</label>} */}
          <select
            className={event.actor ? "transparent-select" : ""}
            value={event.actor}
            onChange={(e) => updateEvent(event.id, "actor", e.target.value)}
          >
            <option value="">選択してください</option>

            {selectedPokemon.map((p, i) => (
              <option key={i} value={p}>
                {p || `ポケモン${i + 1}`}
              </option>
            ))}

            <option value="自分全体">自分全体</option>
            <option value="相手全体">相手全体</option>
            <option value="相手">相手</option>
            <option value="場">場</option>
          </select>
        </div>

        {/* 行動の種類 */}
        <div>
          {/* {!event.actionType && event.actor ? (
            <label>行動：</label>
          ) : (
            <label>：</label>
          )} */}
          {event.actor && <label>：</label>}
          {event.actor && (
            <select
              className={event.actionType ? "transparent-select" : ""}
              value={event.actionType}
              onChange={(e) =>
                updateEvent(event.id, "actionType", e.target.value)
              }
            >
              <option value="">選択してください</option>
              <option value="技の使用">技の使用</option>
              <option value="攻撃技">攻撃技</option>
              <option value="補助技">補助技</option>
              <option value="居座り">居座り</option>
              <option value="交代">交代</option>
              <option value="ローテーション">ローテーション</option>
              <option value="ムーブ">ムーブ</option>
              <option value="特性の発動">特性の発動</option>
              <option value="持ち物の発動">持ち物の発動</option>
              <option value="状態変化">状態変化</option>
              <option value="戦闘不能">戦闘不能</option>
              <option value="繰り出し">繰り出し</option>
              <option value="定数ダメージ">定数ダメージ</option>
              <option value="定数回復">定数回復</option>
            </select>
          )}
        </div>

        {/* 行動名 */}
        <div>
          {event.actionType && event.actor && (
            <>
              {/* 技の使用 */}
              {event.actionType === "技の使用" && (
                <div style={{ position: "relative" }}>
                  <input
                    className={event.actionName ? "transparent-input" : ""}
                    type="text"
                    placeholder="技名"
                    value={event.actionName}
                    onFocus={() => setIsAbilityFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setIsAbilityFocused(false), 100);
                    }}
                    onChange={(e) =>
                      updateEvent(event.id, "actionName", e.target.value)
                    }
                  />
                  {(() => {
                    if (!isAbilityFocused || !event.actor) return null;
                    const actorData = party.find((p) => p.name === event.actor);
                    if (!actorData) return null;
                    const moveCandidates = actorData.moves.filter((m) => m);

                    if (moveCandidates.length === 0) return null;

                    return (
                      <div
                        style={{
                          position: "absolute",
                          background: "white",
                          border: "1px solid #ccc",
                          width: "100%",
                          zIndex: 10,
                        }}
                      >
                        {moveCandidates.map((move, i) => (
                          <div
                            key={i}
                            style={{ padding: "4px", cursor: "pointer" }}
                            onClick={() =>
                              updateEvent(event.id, "actionName", move)
                            }
                          >
                            {move}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 交代 */}
              {event.actionType === "交代" && (
                <select
                  className={event.actionName ? "transparent-input" : ""}
                  value={event.actionName}
                  onChange={(e) =>
                    updateEvent(event.id, "actionName", e.target.value)
                  }
                >
                  <option value="">選択してください</option>

                  {selectedPokemon.map((p, i) => (
                    <option key={i} value={p}>
                      {p || `ポケモン${i + 1}`}
                    </option>
                  ))}
                </select>
              )}
              {/* ローテ */}
              {event.actionType === "ローテーション" && (
                <select
                  className={event.actionName ? "transparent-input" : ""}
                  value={event.actionName}
                  onChange={(e) =>
                    updateEvent(event.id, "actionName", e.target.value)
                  }
                >
                  <option value="">選択してください</option>

                  {selectedPokemon.map((p, i) => (
                    <option key={i} value={p}>
                      {p || `ポケモン${i + 1}`}
                    </option>
                  ))}
                </select>
              )}

              {/* 特性の発動 */}
              {event.actionType === "特性の発動" && (
                <div style={{ position: "relative" }}>
                  <input
                    className={event.actionName ? "transparent-input" : ""}
                    type="text"
                    placeholder="特性名"
                    value={event.actionName}
                    onFocus={() => setIsAbilityFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setIsAbilityFocused(false), 100);
                    }}
                    onChange={(e) =>
                      updateEvent(event.id, "actionName", e.target.value)
                    }
                  />

                  {(() => {
                    if (!isAbilityFocused || !event.actor) return null;

                    const actorData = party.find((p) => p.name === event.actor);
                    if (!actorData) return null;

                    const ability = actorData.ability;
                    if (!ability) return null;

                    return (
                      <div
                        style={{
                          position: "absolute",
                          background: "white",
                          border: "1px solid #ccc",
                          width: "100%",
                          zIndex: 10,
                        }}
                      >
                        <div
                          style={{ padding: "4px", cursor: "pointer" }}
                          onClick={() =>
                            updateEvent(event.id, "actionName", ability)
                          }
                        >
                          {ability}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 持ち物の発動 */}
              {event.actionType === "持ち物の発動" && (
                <div style={{ position: "relative" }}>
                  <input
                    className={event.actionName ? "transparent-input" : ""}
                    type="text"
                    placeholder="持ち物名"
                    value={event.actionName}
                    onFocus={() => setIsAbilityFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setIsAbilityFocused(false), 100);
                    }}
                    onChange={(e) =>
                      updateEvent(event.id, "actionName", e.target.value)
                    }
                  />
                  {(() => {
                    if (!isAbilityFocused || !event.actor) return null;

                    const actorData = party.find((p) => p.name === event.actor);
                    if (!actorData) return null;

                    const ability = actorData.item;
                    if (!ability) return null;

                    return (
                      <div
                        style={{
                          position: "absolute",
                          background: "white",
                          border: "1px solid #ccc",
                          width: "100%",
                          zIndex: 10,
                        }}
                      >
                        <div
                          style={{ padding: "4px", cursor: "pointer" }}
                          onClick={() =>
                            updateEvent(event.id, "actionName", ability)
                          }
                        >
                          {ability}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              {/* 変化 */}
              {event.actionType === "状態変化" && (
                <input
                  className={event.actionName ? "transparent-input" : ""}
                  type="text"
                  placeholder="何が"
                  value={event.actionName}
                  onChange={(e) =>
                    updateEvent(event.id, "actionName", e.target.value)
                  }
                />
              )}
              {/* ダメージ */}
              {event.actionType === "定数ダメージ" && (
                <input
                  className={event.actionName ? "transparent-input" : ""}
                  type="text"
                  placeholder="何による"
                  value={event.actionName}
                  onChange={(e) =>
                    updateEvent(event.id, "actionName", e.target.value)
                  }
                />
              )}

              {/* 回復 */}
              {event.actionType === "定数回復" && (
                <input
                  className={event.actionName ? "transparent-input" : ""}
                  type="text"
                  placeholder="何による"
                  value={event.actionName}
                  onChange={(e) =>
                    updateEvent(event.id, "actionName", e.target.value)
                  }
                />
              )}
            </>
          )}
        </div>
        <div>
          {/* 技の使用 */}
          {event.actionType === "技の使用" && (
            <select
              className={event.target ? "transparent-select" : ""}
              value={event.target || ""}
              onChange={(e) => updateEvent(event.id, "target", e.target.value)}
            >
              <option value="">対象を選択</option>
              {selectedPokemon.map((p, i) => (
                <option key={i} value={p}>
                  {p || `ポケモン${i + 1}`}
                </option>
              ))}
              <option value="自分">自分</option>
              <option value="相手">相手１体</option>
              <option value="相手全体">相手全体</option>
              <option value="味方全体">味方全体</option>
              <option value="場全体">場全体</option>
            </select>
          )}
          {event.actionType === "状態変化" && (
            <input
              className={event.target ? "transparent-input" : ""}
              type="text"
              placeholder="何に"
              value={event.target}
              onChange={(e) => updateEvent(event.id, "target", e.target.value)}
            />
          )}
        </div>
      </div>

      {/* 目的 */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <label style={{ fontSize: "10px" }}>補足説明（任意）：</label>
        <textarea
          className="fixed-textarea"
          value={event.intent}
          onChange={(e) => updateEvent(event.id, "intent", e.target.value)}
        />
      </div>
    </div>
  );
}
