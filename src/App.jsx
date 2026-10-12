import React, { useState, useEffect } from "react";
import {
  testGemini,
  generateFullBattleText,
  askGemini,
  generateGimmickFlowText,
} from "./lib/ai";

import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import { TurnCard } from "./components/turnCard/TurnCard";
import { PartyCard } from "./components/partyCard/PartyCard";
import "./App.css";

function App() {
  // async function handleTest() {
  //   console.log("handleTest開始");

  //   try {
  //     const res = await testGemini();
  //     console.log("Geminiの返答:", res);
  //   } catch (error) {
  //     console.error("Geminiエラー:", error);
  //   }
  // }

  const [turns, setTurns] = useState([
    {
      id: crypto.randomUUID(),
      type: "selection",
      turnNumber: 0,
      events: [],
    },
  ]);
  const [activePath, setActivePath] = useState([]);

  const [battleSettings, setBattleSettings] = useState({
    generation: "free",
    rule: "single",
  });
  const generationRules = {
    free: ["single", "double", "triple", "rotation", "multi"],
    gen1: ["single"], // RGBP / LPLE
    gen2: ["single"], // GSC
    gen3: ["single", "double", "multi"], // RSE / FRLG
    gen4: ["single", "double", "multi"], // DPt / HGSS / BDSP
    gen5: ["single", "double", "triple", "rotation", "multi"], // BW / BW2
    gen6: ["single", "double", "triple", "rotation", "multi"], // XY / ORAS
    gen7: ["single", "double", "multi"], // SM / USUM
    gen8: ["single", "double"], // 剣盾
    gen9: ["single", "double", "multi"], // SV
  };
  const fieldSize = {
    single: 1,
    double: 2,
    multi: 2,
    triple: 3,
    rotation: 3,
  }[battleSettings.rule];
  const [fieldHistory, setFieldHistory] = useState([]);

  const [party, setParty] = useState(
    Array.from({ length: 6 }, () => ({
      name: "",
      ability: "",
      item: "",
      moves: ["", "", "", ""],
    })),
  );
  const [selectedPokemon, setSelectedPokemon] = useState([]);
  const recalcBranchTurnNumbers = (baseIndex, branchTurns) =>
    branchTurns.map((t, i) => ({ ...t, turnNumber: baseIndex + 1 + i }));
  const addTurn = () => {
    const branchIndex = turns.findIndex((t) => t.branches);
    if (branchIndex === -1) {
      const newTurn = {
        id: crypto.randomUUID(),
        type: turns.length === 0 ? "selection" : "turn",
        turnNumber: turns.length === 0 ? null : turns.length,
        events: [],
      };
      setTurns([...turns, newTurn]);
      return;
    }
    const condId = activePath[0];
    const branchTurns = turns[branchIndex].branches[condId];
    const newTurn = {
      id: crypto.randomUUID(),
      type: "turn",
      turnNumber: branchIndex + branchTurns.length + 1,
      events: [],
    };
    branchTurns.push(newTurn);
    setTurns([...turns]);
  };

  const splitTimelineAt = (turnIndex, conditions) => {
    const before = turns.slice(0, turnIndex + 1).map((t) => ({ ...t }));

    const nextTurns = turns.slice(turnIndex + 1);
    const clone = (obj) => JSON.parse(JSON.stringify(obj));

    const newBranches = {};
    conditions.forEach((cond) => {
      const cloned = nextTurns.map((t) => clone(t));
      const newTurnForBranch = {
        id: crypto.randomUUID(),
        type: "turn",
        turnNumber: null, // 一旦 null にして recalc で埋める
        events: [],
      };
      const branchArray = [newTurnForBranch, ...cloned];
      newBranches[cond.id] = recalcBranchTurnNumbers(turnIndex, branchArray);
    });
    const updatedTurns = [...before];
    updatedTurns[turnIndex] = {
      ...updatedTurns[turnIndex],
      branches: newBranches,
      branchConditions: conditions,
    };

    setTurns(updatedTurns);
    setActivePath([conditions[0].id]);
  };

  const deleteTurn = (id) => {
    setTurns(turns.filter((t) => t.id !== id));
  };

  const updateTurn = (updatedTurn) => {
    const newTurns = [...turns];
    const rootIndex = newTurns.findIndex((t) => t.id === updatedTurn.id);

    if (rootIndex !== -1) {
      newTurns[rootIndex] = updatedTurn;
      setTurns(newTurns);
      return;
    }

    const branchIndex = newTurns.findIndex((t) => t.branches);
    if (branchIndex === -1) return;
    const condId = activePath[0];
    const branchTurns = newTurns[branchIndex].branches[condId];
    const branchTurnIndex = branchTurns.findIndex(
      (t) => t.id === updatedTurn.id,
    );
    if (branchTurnIndex !== -1) {
      branchTurns[branchTurnIndex] = updatedTurn;
      setTurns(newTurns);
      return;
    }
  };

  const updateParty = (index, field, value) => {
    const newParty = [...party];

    if (field === "moves") {
      newParty[index].moves[value.moveIndex] = value.moveValue;
    } else {
      newParty[index][field] = value;
    }

    setParty(newParty);
  };
  const handleBranchSelect = (condId) => {
    setActivePath([condId]);
  };

  const [pokemonListJa, setPokemonListJa] = useState([]);
  const [pokemonAbilities, setPokemonAbilities] = useState(Array(6).fill([]));

  const fetchPokemonAbilities = async (index, speciesUrl, generation) => {
    if (!speciesUrl) return;

    try {
      // species取得
      const speciesRes = await fetch(speciesUrl);
      const speciesData = await speciesRes.json();

      // デフォルトフォーム取得
      const defaultForm = speciesData.varieties.find((v) => v.is_default);

      if (!defaultForm) {
        console.error("デフォルトフォームが見つかりません");
        return;
      }

      const pokemonUrl = defaultForm.pokemon.url;

      // pokemon取得
      const pokeRes = await fetch(pokemonUrl);
      const pokeData = await pokeRes.json();

      // ★ pokeDataを取得した後なので、ここで使う
      let abilities;

      if (generation === "free") {
        abilities = pokeData.abilities;
      } else {
        const genNumber = Number(generation.replace("gen", ""));

        // Gen1・Gen2は特性なし
        if (genNumber <= 2) {
          abilities = [];
        } else {
          const pastAbilities = (pokeData.past_abilities ?? [])
            .map((past) => ({
              generation: Number(
                past.generation.name.replace("generation-", ""),
              ),
              abilities: past.abilities,
            }))
            .sort((a, b) => a.generation - b.generation);

          console.log("選択世代:", genNumber);
          console.log("現在の特性:", pokeData.abilities);
          console.log("過去の特性:", pastAbilities);

          // 選択世代以上で一番近い過去データ
          const past = pastAbilities.find(
            (past) => past.generation >= genNumber,
          );

          if (past) {
            abilities = past.abilities;
          } else {
            abilities = pokeData.abilities;
          }
        }
      }

      // 特性の日本語名を取得
      const abilityNamesJa = await Promise.all(
        abilities
          .filter((a) => a.ability)
          .map(async (a) => {
            const res = await fetch(a.ability.url);
            const abilityData = await res.json();

            const jaNameObj = abilityData.names.find(
              (n) => n.language.name === "ja",
            );

            return {
              ja: jaNameObj ? jaNameObj.name : abilityData.name,
              id: abilityData.id,
            };
          }),
      );

      // state更新
      setPokemonAbilities((prev) => {
        const newArr = [...prev];
        newArr[index] = abilityNamesJa;
        return newArr;
      });
    } catch (err) {
      console.error("特性取得エラー:", err);
    }
  };
  const displayedTurns = (() => {
    const branchIndex = turns.findIndex((t) => t.branches);
    if (branchIndex === -1) return turns;

    const condId = activePath[0];

    return [
      ...turns.slice(0, branchIndex + 1),
      ...turns[branchIndex].branches[condId],
    ];
  })();

  const partyText = generateGimmickFlowText(party, turns);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const prompt = generateFullBattleText(
        party,
        turns,
        battleSettings,
        selectedPokemon,
      );
      const aiText = await askGemini(prompt);

      if (!aiText || aiText.trim() === "") {
        throw new Error("AI の応答が空でした。混雑している可能性があります。");
      }

      setResult(aiText);
    } catch (err) {
      setError(err.message || "AI の評価中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllPokemonJa = async () => {
      try {
        // ポケモンの種族一覧を取得
        const res = await fetch(
          "https://pokeapi.co/api/v2/pokemon-species?limit=2000",
        );

        if (!res.ok) {
          throw new Error(`Species API error: ${res.status}`);
        }

        const data = await res.json();

        // 各speciesの詳細から日本語名を取得
        const jaList = await Promise.all(
          data.results.map(async (p) => {
            const speciesRes = await fetch(p.url);

            if (!speciesRes.ok) {
              console.error("Species取得失敗:", p.name, speciesRes.status);
              return null;
            }

            const speciesData = await speciesRes.json();

            const jaNameObj = speciesData.names.find(
              (n) => n.language.name === "ja",
            );

            return {
              name_ja: jaNameObj ? jaNameObj.name : p.name,
              name_en: p.name,
              id: speciesData.id,
              url: p.url,
            };
          }),
        );

        const validList = jaList.filter((p) => p !== null);

        console.log("取得完了:", validList.length);
        console.log("最初のデータ:", validList[0]);

        setPokemonListJa(validList);
      } catch (error) {
        console.error("ポケモン取得エラー:", error);
      }
    };

    fetchAllPokemonJa();
  }, []);

  useEffect(() => {
    let field = selectedPokemon.slice(0, fieldSize);

    let history = [];

    for (let t = 0; t < turns.length; t++) {
      const turn = turns[t];
      for (const event of turn.events) {
        const { actor, actionType, actionName } = event;

        if (actionType === "交代") {
          const out = actor;
          const incoming = actionName;
          const idx = field.indexOf(out);
          if (idx !== -1) field[idx] = incoming;
        }

        if (actionType === "戦闘不能") {
          const fainted = actor;
          const idx = field.indexOf(fainted);
          if (idx !== -1) field[idx] = null;
        }

        if (actionType === "繰り出し") {
          const incoming = actor;
          const idx = field.indexOf(null);
          if (idx !== -1) field[idx] = incoming;
        }

        if (actionType === "ローテーション") {
          const idx = field.indexOf(event.actionName); // 1 or 2
          if (idx > 0) {
            const other = 3 - idx;

            const newField = [];
            newField[0] = field[idx];
            newField[other] = field[0];
            newField[idx] = field[other];

            field = newField;
          }
        }

        if (actionType === "ムーブ") {
          const idx = field.indexOf(event.actor);
          if (idx === 0 || idx === 2) {
            const temp = field[1];
            field[1] = field[idx];
            field[idx] = temp;
          }
        }
      }

      history.push([...field]); // このターン開始時の場
    }

    setFieldHistory(history);
  }, [selectedPokemon, turns, fieldSize]);

  return (
    <div
      style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "left" }}
    >
      <h1>ロマンギミックエディタ</h1>

      <p>
        このツールは、ポケモンのロマンギミック構築をターンごとに入力し、
        流れを整理するためのエディタです。
      </p>

      <ul>
        <div>まず世代と対戦ルールを選択します。</div>
        <div>次にパーティのポケモンと特性、持ち物、技を入力します。</div>
        <div>選出にある「イベントを追加」で選出ポケモンを入力します。</div>
        <div>
          「ターンを追加」でターンを追加し、その中にイベントを追加します。
        </div>
        <div>
          イベントで、技の使用、特性の発動など、ゲーム内で起こるすべての動きを順番に記入してください。
        </div>
        <div>
          基本動作はすべて選択肢で作ることができますが、特性、持ち物、タイプの変更や、メガシンカ、天候の変更などはすべて状態変化で行ってください。
        </div>
        <div>
          ターンの下には現在のターンの流れを文章化したものが出るので、コピーして共有することもできます。
        </div>
        <div>
          一番下には「AI評価」のボタンがあり、世代などを考慮してギミックの強み、弱点、成功率、面白さの観点で評価してくれます。
        </div>
      </ul>
      <select
        value={battleSettings.generation}
        onChange={(e) =>
          setBattleSettings({ ...battleSettings, generation: e.target.value })
        }
      >
        <option value="free">世代を選択</option>
        <option value="gen1">RGBP / LPLE</option>
        <option value="gen2">GSC</option>
        <option value="gen3">RSE / FRLG</option>
        <option value="gen4">DPt / HGSS / BDSP</option>
        <option value="gen5">BW / BW2</option>
        <option value="gen6">XY / ORAS</option>
        <option value="gen7">SM / USUM</option>
        <option value="gen8">剣盾</option>
        <option value="gen9">SV</option>
      </select>
      <select
        value={battleSettings.rule}
        onChange={(e) =>
          setBattleSettings({
            ...battleSettings,
            rule: e.target.value,
          })
        }
        disabled={!battleSettings.generation}
      >
        {battleSettings.generation &&
          generationRules[battleSettings.generation].map((rule) => (
            <option key={rule} value={rule}>
              {rule === "single" && "シングル"}
              {rule === "double" && "ダブル"}
              {rule === "triple" && "トリプル"}
              {rule === "rotation" && "ローテーション"}
              {rule === "multi" && "マルチ"}
            </option>
          ))}
      </select>
      <div className="party-container">
        {party.map((pokemon, index) => (
          <PartyCard
            key={index}
            index={index}
            pokemon={pokemon}
            updateParty={updateParty}
            pokemonListJa={pokemonListJa}
            fetchPokemonAbilities={fetchPokemonAbilities}
            pokemonAbilitie={pokemonAbilities[index]}
            generation={battleSettings.generation}
          />
        ))}
      </div>

      {/* ターンカードを並べる */}
      {displayedTurns.map((turn, index) => (
        <React.Fragment key={turn.id}>
          <TurnCard
            turn={turn}
            turnslength={turns.length}
            deleteTurn={deleteTurn}
            updateTurn={updateTurn}
            index={index}
            party={party}
            selectedPokemon={selectedPokemon}
            setSelectedPokemon={setSelectedPokemon}
            fieldHistory={fieldHistory}
          />
          {turn.branches && (
            <BranchTabs
              turn={turn}
              activePath={activePath}
              handleBranchSelect={handleBranchSelect}
            />
          )}
        </React.Fragment>
      ))}

      {/* 一番下のターン追加ボタン */}
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={addTurn}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
          }}
        >
          ＋ ターンを追加
        </button>
        {/* <button
          onClick={() =>
            splitTimelineAt(turns.length - 1, [
              { id: "condA", name: "" },
              { id: "condB", name: "" },
            ])
          }
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
          }}
        >
          ＋ 分岐を追加
        </button> */}
      </div>
      <div className="party-text-box">
        <pre>{partyText}</pre>

        <svg
          className="copy-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          onClick={() => {
            navigator.clipboard.writeText(partyText);
            alert("コピーしました！");
          }}
        >
          <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" />
        </svg>
      </div>

      <div>
        <button className="analyze-button" onClick={handleAnalyze}>
          AI評価
        </button>

        {/* 評価中の表示 */}
        {loading && (
          <div
            style={{ marginTop: "10px", fontWeight: "bold", color: "#4A90E2" }}
          >
            評価中です…（これには数分かかることがあります）
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#ffe5e5",
              border: "1px solid #ff7a7a",
              borderRadius: "6px",
              color: "#b30000",
              fontWeight: "bold",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div
            style={{
              marginTop: "20px",
              whiteSpace: "pre-wrap",
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: "#fafafa",
            }}
          >
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

function BranchTabs({ turn, activePath, handleBranchSelect }) {
  return (
    <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
      {Object.keys(turn.branches).map((condId) => (
        <button
          key={condId}
          onClick={() => handleBranchSelect(condId)}
          style={{
            padding: "6px 12px",
            background:
              activePath[activePath.length - 1] === condId ? "#ddd" : "#fff",
            border: "1px solid #aaa",
            borderRadius: "4px",
          }}
        >
          {condId}
        </button>
      ))}
    </div>
  );
}
