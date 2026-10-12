import { SelectionCard } from "../selectionCard/SelectionCard";
import { EventCard } from "../eventCard/EventCard";
import { BranchCard } from "../branchCard/BranchCard";

export function TurnCard({
  turn,
  turnslength,
  deleteTurn,
  updateTurn,
  index,
  party,
  selectedPokemon,
  setSelectedPokemon,
  fieldHistory,
}) {
  const isSelection = turn.type === "selection";
  const addEvent = () => {
    // turn0 なら選出カードを追加
    if (index === 0) {
      const newSelection = {
        id: crypto.randomUUID(),
        type: "selection",
        selection: [], // 選出ポケモンの配列
      };

      updateTurn({
        ...turn,
        events: [...turn.events, newSelection],
      });
      return;
    }
    const newEvent = {
      id: crypto.randomUUID(),
      type: "event",
      actor: "",
      actionType: "",
      actionName: "",
      intent: "",
    };

    updateTurn({
      ...turn,
      events: [...turn.events, newEvent],
    });
  };
  const deleteEvent = (eventId) => {
    const newEvents = turn.events.filter((ev) => ev.id !== eventId);
    updateTurn({ ...turn, events: newEvents });
  };

  const addBranch = () => {
    const newBranch = {
      id: crypto.randomUUID(),
      type: "branch",
      conditions: [
        {
          id: crypto.randomUUID(),
          name: "",
          events: [],
        },
        {
          id: crypto.randomUUID(),
          name: "",
          events: [],
        },
      ],
    };

    updateTurn({
      ...turn,
      events: [...turn.events, newBranch],
    });
  };

  const updateEvent = (eventId, key, value) => {
    const updatedEvents = turn.events.map((e) =>
      e.id === eventId ? { ...e, [key]: value } : e,
    );

    updateTurn({ ...turn, events: updatedEvents });
  };
  const updateBranch = (newBranchData) => {
    const updatedEvents = turn.events.map((e) =>
      e.id === newBranchData.id ? newBranchData : e,
    );

    updateTurn({ ...turn, events: updatedEvents });
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        marginBottom: "20px",
        borderRadius: "8px",
        position: "relative",
      }}
    >
      {/* 右上の削除ボタン */}
      {index === turnslength - 1 && index != 0 && (
        <button
          onClick={() => deleteTurn(turn.id)}
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
      )}
      {/* ターンのタイトル */}
      <h2>{isSelection ? "選出" : `ターン ${turn.turnNumber}`}</h2>
      {!isSelection && (
        <>
          {fieldHistory[index - 1] ? (
            <div style={{ display: "flex", gap: "8px" }}>
              {fieldHistory[index - 1].map((pokemon, i) => (
                <div key={i}>{pokemon ?? "-"}</div>
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: "10px", color: "#555" }}>
              現在の場のポケモンがここに表示されます
            </div>
          )}
        </>
      )}
      {/* イベントカードを並べる場所 最初だけ選出カード */}
      {turn.events.map((event, index2) => {
        if (event.type === "selection") {
          return (
            <SelectionCard
              key={event.id}
              event={event}
              deleteEvent={deleteEvent}
              party={party}
              index2={index2}
              selectedPokemon={selectedPokemon}
              setSelectedPokemon={setSelectedPokemon}
            />
          );
        }

        if (event.type === "branch") {
          return (
            <BranchCard
              key={event.id}
              turn={event}
              updateBranch={updateBranch}
              selectedPokemon={selectedPokemon}
              setSelectedPokemon={setSelectedPokemon}
            />
          );
        }

        return (
          <EventCard
            key={event.id}
            event={event}
            updateEvent={updateEvent}
            deleteEvent={deleteEvent}
            party={party}
            selectedPokemon={selectedPokemon}
          />
        );
      })}
      {/* イベントカード追加ボタンと分岐カード追加ボタン */}
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={addEvent}
          style={{
            padding: "6px 12px",
            fontSize: "14px",
          }}
        >
          ＋ イベントを追加
        </button>
        {/* <button
          onClick={addBranch}
          style={{
            padding: "6px 12px",
            fontSize: "14px",
          }}
        >
          ＋ 分岐を追加
        </button> */}
      </div>
    </div>
  );
}
