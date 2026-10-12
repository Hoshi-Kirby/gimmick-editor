import "./PartyCard.css";
import { useState, useEffect } from "react";

export function PartyCard({
  index,
  pokemon,
  updateParty,
  pokemonListJa,
  fetchPokemonAbilities,
  pokemonAbilitie,
  generation,
}) {
  const [nameInput, setNameInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isAbilityFocused, setIsAbilityFocused] = useState(false);

  useEffect(() => {
    setNameInput(pokemon.name);
  }, [pokemon.name]);
  const handleNameInput = (e) => {
    const value = e.target.value;
    setNameInput(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = pokemonListJa.filter((p) => p.name_ja.includes(value));

    setSuggestions(filtered.slice(0, 10));
  };
  useEffect(() => {
    if (pokemon.name) {
      const species = pokemonListJa.find((x) => x.name_ja === pokemon.name);
      if (species) {
        fetchPokemonAbilities(index, species.url, generation);
      }
    }
  }, [pokemon.name, generation]);

  return (
    <div className="party-card">
      <h3>{index + 1}匹目</h3>

      {/* ポケモン名 */}
      <div className="pokemon-input-container">
        <input
          type="text"
          value={nameInput}
          onChange={handleNameInput}
          onBlur={() => {
            updateParty(index, "name", nameInput);
            setTimeout(() => setSuggestions([]), 100);
          }}
          placeholder="ポケモン名（日本語）"
        />

        {suggestions.length > 0 && (
          <div className="suggestion-box">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="suggestion-item"
                onClick={() => {
                  setNameInput(s.name_ja);
                  updateParty(index, "name", s.name_ja);
                }}
              >
                {s.name_ja}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 特性 */}
      <div className="pokemon-input-container">
        <input
          type="text"
          style={{
            fontSize: "12px",
          }}
          placeholder="特性"
          value={pokemon.ability}
          onFocus={() => setIsAbilityFocused(true)}
          onChange={(e) => updateParty(index, "ability", e.target.value)}
          onBlur={() => {
            setTimeout(() => setIsAbilityFocused(false), 100);
          }}
        />
        {isAbilityFocused && pokemonAbilitie.length > 0 && (
          <div className="suggestion-box">
            {pokemonAbilitie.map((ab) => (
              <div
                key={ab.id}
                className="suggestion-item"
                onClick={() => updateParty(index, "ability", ab.ja)}
              >
                {ab.ja}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 持ち物 */}
      <input
        type="text"
        style={{
          fontSize: "12px",
        }}
        placeholder="持ち物"
        value={pokemon.item}
        onChange={(e) => updateParty(index, "item", e.target.value)}
      />

      {/* 技4つ */}
      {pokemon.moves.map((move, moveIndex) => (
        <input
          key={moveIndex}
          type="text"
          placeholder={`技${moveIndex + 1}`}
          value={move}
          onChange={(e) =>
            updateParty(index, "moves", {
              moveIndex,
              moveValue: e.target.value,
            })
          }
        />
      ))}
    </div>
  );
}
