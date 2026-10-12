import { SelectionCard } from "../selectionCard/SelectionCard";
import { EventCard } from "../eventCard/EventCard";

export function BranchCard({
  turn,
  updateBranch,
  selectedPokemon,
  setSelectedPokemon,
}) {
  // 条件名を編集する
  const updateConditionName = (condId, newName) => {
    const newConditions = turn.conditions.map((cond) =>
      cond.id === condId ? { ...cond, name: newName } : cond,
    );
    updateBranch({ ...turn, conditions: newConditions });
  };

  // 条件内にイベントを追加する
  const addEventToCondition = (condId) => {
    let newEvent;

    if (turn.type === "selection") {
      newEvent = {
        id: crypto.randomUUID(),
        type: "selection",
        selectedPokemon: [], // SelectionCard が使うデータ
      };
    } else {
      newEvent = {
        id: crypto.randomUUID(),
        type: "event",
        actor: "",
        actionType: "",
        actionName: "",
        intent: "",
      };
    }

    const newConditions = turn.conditions.map((cond) =>
      cond.id === condId
        ? { ...cond, events: [...cond.events, newEvent] }
        : cond,
    );

    updateBranch({ ...turn, conditions: newConditions });
  };

  // 条件を追加する
  const addCondition = () => {
    const newCondition = {
      id: crypto.randomUUID(),
      name: "",
      events: [],
    };

    updateBranch({
      ...turn,
      conditions: [...turn.conditions, newCondition],
    });
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
      }}
    >
      {/* 条件ブロックを並べる */}
      {turn.conditions.map((cond) => (
        <div
          key={cond.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
          }}
        >
          {/* 条件名 */}
          <input
            type="text"
            value={cond.name}
            placeholder="条件"
            onChange={(e) => updateConditionName(cond.id, e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />

          {/* 条件内のイベント */}
          {cond.events.map((ev) => {
            cond.events.map((ev, index2) =>
              ev.type === "selection" ? (
                <SelectionCard
                  key={ev.id}
                  party={party}
                  index2={index2}
                  selectedPokemon={selectedPokemon}
                  setSelectedPokemon={setSelectedPokemon}
                />
              ) : (
                <EventCard
                  key={ev.id}
                  event={ev}
                  updateEvent={(eventId, key, value) => {
                    const newEvents = cond.events.map((e) =>
                      e.id === eventId ? { ...e, [key]: value } : e,
                    );

                    const newConditions = turn.conditions.map((c) =>
                      c.id === cond.id ? { ...c, events: newEvents } : c,
                    );

                    updateBranch({ ...turn, conditions: newConditions });
                  }}
                  selectedPokemon={selectedPokemon}
                />
              ),
            );
          })}

          {/* 条件内イベント追加ボタン */}
          <button onClick={() => addEventToCondition(cond.id)}>
            ＋ イベントを追加
          </button>
        </div>
      ))}

      {/* 条件追加ボタン */}
      <button onClick={addCondition} style={{ marginTop: "10px" }}>
        ＋ 条件を追加
      </button>
    </div>
  );
}
