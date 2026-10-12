export function SelectionCard({
  event,
  deleteEvent,
  party,
  index2,
  selectedPokemon,
  setSelectedPokemon,
}) {
  const handleSelect = (e) => {
    const value = e.target.value;
    if (!value) return;

    const newSelected = [...selectedPokemon];
    newSelected[index2] = value;
    setSelectedPokemon(newSelected);
  };

  return (
    <div
      className="selection-card"
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
        position: "relative",
      }}
    >
      <div className="event-row">
        <button
          onClick={() => {
            deleteEvent(event.id);
            const newSelected = [...selectedPokemon];
            newSelected.splice(index2, 1); // index2 のポケモンを削除
            setSelectedPokemon(newSelected);
          }}
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
        <div>
          <select
            className={selectedPokemon[index2] ? "transparent-select" : ""}
            onChange={handleSelect}
          >
            <option value="">選択してください</option>

            {party.map((p, i) => (
              <option key={i} value={p.name}>
                {p.name || `ポケモン${i + 1}`}
              </option>
            ))}
          </select>
        </div>

        <label>選出</label>
      </div>
    </div>
  );
}
