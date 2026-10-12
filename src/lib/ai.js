export async function askGemini(prompt) {
  console.log("Gemini request start:", new Date().toISOString());

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    console.log("Gemini response:", new Date().toISOString());
    console.log("Gemini raw:", data);

    return data.text ?? "返答なし";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

const generationNames = {
  free: "のゲーム",
  gen1: "赤・緑・青・ピカチュウ、レッツゴーピカチュウ・レッツゴーイーブイ",
  gen2: "金・銀・クリスタル",
  gen3: "ルビー・サファイア・エメラルド、ファイアレッド・リーフグリーン",
  gen4: "ダイヤモンド・パール・プラチナ、ハートゴールド・ソウルシルバー、ブリリアントダイヤモンド・シャイニングパール",
  gen5: "ブラック・ホワイト、ブラック２・ホワイト２",
  gen6: "X・Y、オメガルビー・アルファサファイア",
  gen7: "サン・ムーン、ウルトラサン・ウルトラムーン",
  gen8: "ソード・シールド",
  gen9: "スカーレット・バイオレット",
  gen0: "チャンピオンズ",
};

const ruleNames = {
  single: "シングル",
  double: "ダブル",
  triple: "トリプル",
  rotation: "ローテーション",
  multi: "マルチ",
};
const leadCountByRule = {
  single: 1,
  double: 2,
  triple: 3,
  rotation: 3,
  multi: 2,
};

export async function testGemini() {
  return await askGemini("日本の首都はどこですか？簡潔に答えてください。");
}

export function generatePartyText(party) {
  let text = "【パーティ】\n";

  party.forEach((p, i) => {
    const moves = p.moves.filter((m) => m && m.trim() !== "").join("／");

    text += `${i + 1}. ${p.name}（特性：${p.ability || "未定"}、持ち物：${p.item || "未定"}、技：${moves}）\n`;
  });

  return text + "\n";
}
export function generateSelectionText(turn0, battleSettings, selectedPokemon) {
  const { generation, rule } = battleSettings;
  const genName = generationNames[generation];
  const ruleName = ruleNames[rule];
  const leadCount = leadCountByRule[rule];

  let text = "";

  // 試合設定
  text += `この構築は、ポケットモンスター${genName}の${ruleName}バトルを想定しています。\n\n`;

  const selectionEvent = turn0.events.find((ev) => ev.type === "selection");
  if (!selectionEvent) return text;
  const selected = selectedPokemon;

  // 全体の選出
  text += `まず、${selected.join("・")}を選出します。\n`;

  // 先発
  const leads = selected.slice(0, leadCount);
  let leadText = "";
  if (rule === "triple") {
    leadText = `この時、先発は左から${leads.join("・")}です。`;
  } else if (rule === "rotation") {
    leadText = `この時、先発は${leads.join("・")}で、${leads[0]}が正面です。`;
  } else {
    leadText = `この時、先発は${leads.join("・")}です。`;
  }
  text += leadText + "\n";

  return text + "\n";
}

export function generateTurnText(turns) {
  let text = "";

  for (let i = 1; i < turns.length; i++) {
    const turn = turns[i];
    text += `【ターン${turn.turnNumber}】\n`;
    turn.events.forEach((ev) => {
      if (ev.type !== "event") return;
      const actor = ev.actor || "（未設定）";
      const action = ev.actionName || "（未設定）";
      const target = ev.target || "（未設定）";
      const intent = ev.intent || "";

      let line = "";
      switch (ev.actionType) {
        case "技の使用":
          line = `${actor}が${target}に${action}をする。`;
          break;
        case "攻撃技":
          line = `${actor}が攻撃をする。`;
          break;
        case "補助技":
          line = `${actor}が補助技をする。`;
          break;
        case "居座り":
          line = `${actor}が居座って何かをする。`;
          break;
        case "交代":
          line = `${actor}を${action}に交代する。`;
          break;
        case "ローテーション":
          line = `${actor}を${action}にローテーションする。`;
          break;
        case "ムーブ":
          line = `${actor}が中央にムーブする。`;
          break;
        case "特性の発動":
          line = `${actor}の特性「${action}」が発動する。`;
          break;
        case "持ち物の発動":
          line = `${actor}の持ち物「${action}」が発動する。`;
          break;
        case "状態変化":
          line = `${actor}の${action}が${target}になる。`;
          break;
        case "戦闘不能":
          line = `${actor}が戦闘不能になる。`;
          break;
        case "繰り出し":
          line = `${actor}を繰り出す。`;
          break;
        case "定数ダメージ":
          line = `${actor}は${action}のダメージを受ける。`;
          break;
        case "定数回復":
          line = `${actor}は${action}によって回復する。`;
          break;
        default:
          line = `${actor} は ${action} を行った。`;
      }
      text += line + "\n";
      if (intent.trim() !== "") {
        text += `（補足：${intent}）` + "\n";
      }
    });
    text += "\n";
  }
  return text;
}
export function generateTurnTextPlayer(turns) {
  let text = "";

  for (let i = 1; i < turns.length; i++) {
    const turn = turns[i];
    text += `【ターン${turn.turnNumber}】\n`;
    turn.events.forEach((ev) => {
      if (ev.type !== "event") return;
      const actor = ev.actor || "（未設定）";
      const action = ev.actionName || "（未設定）";
      const target = ev.target || "（未設定）";
      const intent = ev.intent || "";

      let line = "";
      switch (ev.actionType) {
        case "技の使用":
          line = `${actor}が${target}に${action}をする。`;
          break;
        case "攻撃技":
          line = `${actor}が攻撃をする。`;
          break;
        case "補助技":
          line = `${actor}が補助技をする。`;
          break;
        case "居座り":
          line = `${actor}が居座って何かをする。`;
          break;
        case "交代":
          line = `${actor}を${action}に交代する。`;
          break;
        case "ローテーション":
          line = `${actor}を${action}にローテーションする。`;
          break;
        case "ムーブ":
          line = `${actor}が中央にムーブする。`;
          break;
        case "特性の発動":
          line = `${actor}の特性「${action}」が発動する。`;
          break;
        case "持ち物の発動":
          line = `${actor}の持ち物「${action}」が発動する。`;
          break;
        case "状態変化":
          line = `${actor}の${action}が${target}になる。`;
          break;
        case "戦闘不能":
          line = `${actor}が戦闘不能になる。`;
          break;
        case "繰り出し":
          line = `${actor}を繰り出す。`;
          break;
        case "定数ダメージ":
          line = `${actor}は${action}のダメージを受ける。`;
          break;
        case "定数回復":
          line = `${actor}は${action}によって回復する。`;
          break;
        default:
          line = `${actor} は ${action} を行った。`;
      }
      text += line + "\n";
    });
    text += "\n";
  }
  return text;
}

export function generateFullBattleText(
  party,
  turns,
  battleSettings,
  selectedPokemon,
) {
  let text = "";

  // パーティ
  text += generatePartyText(party);

  // 選出
  text += generateSelectionText(turns[0], battleSettings, selectedPokemon);

  // ターン
  text += generateTurnText(turns);

  // 文章
  text +=
    "このギミック構築について、強み・弱点・実戦での成功率（数値ではなく文章）・ロマンギミックとしての面白さを簡潔に評価してください。弱点がある場合は改善案の例も提示してください。";
  text += "\n";
  text +=
    "評価にあたっては、この文章に記述された選出ルート・ターン進行・補足情報を最優先で参照し、その内容に基づいてギミックの成立条件やリスクを判断してください。また、この世代の環境ポケモンや一般的な技構成・持ち物を踏まえつつ、環境の一般的なパーティ構築に対してどの程度成立しやすいかも含めて分析してください。";
  text += "\n";

  return text;
}

export function generateGimmickFlowText(party, turns) {
  let text = "";

  // パーティ
  text += generatePartyText(party);

  // ターン
  text += generateTurnTextPlayer(turns);

  return text;
}
