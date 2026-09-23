const squishyDumplingOverrides = {
  76: { name: "Bibliotecario", rarity: "rare" },
  77: { name: "Infermiera", rarity: "rare" },
  78: { name: "Astronauta", rarity: "rare" },
  79: { name: "Veterinario", rarity: "rare" },
  80: { name: "Chef", rarity: "rare" },
  81: { name: "Breakdance", rarity: "rare" },
  82: { name: "Rapper", rarity: "rare" },
  83: { name: "K-Pop Idol", rarity: "rare" },
  84: { name: "Gamer", rarity: "rare" },
  85: { name: "Skater", rarity: "rare" },

  101: { name: "Make Up Artist", rarity: "ultra-rare" },
  102: { name: "Beauty Routine", rarity: "ultra-rare" },
  103: { name: "Ballerina", rarity: "ultra-rare" },
  104: { name: "Pet Lover", rarity: "ultra-rare" },
  105: { name: "Influencer", rarity: "ultra-rare" },
  106: { name: "Yoga", rarity: "ultra-rare" },
  107: { name: "ASMR", rarity: "ultra-rare" },
  108: { name: "Moon Night", rarity: "ultra-rare" },
  109: { name: "Pasticcera", rarity: "ultra-rare" },
  110: { name: "Pattinaggio", rarity: "ultra-rare" },
  111: { name: "Rosso", rarity: "ultra-rare" },
  112: { name: "Blu", rarity: "ultra-rare" },
  113: { name: "Giallo", rarity: "ultra-rare" },
  114: { name: "Rosa", rarity: "ultra-rare" },
  115: { name: "Verde", rarity: "ultra-rare" },
  116: { name: "Viola", rarity: "ultra-rare" },
  117: { name: "Nero", rarity: "ultra-rare" },
  118: { name: "Arancione", rarity: "ultra-rare" },
  119: { name: "Bianco Latte", rarity: "ultra-rare" },
  120: { name: "Turchese", rarity: "ultra-rare" },
};

export const squishyDumplingCards = Array.from({ length: 135 }, (_, index) => {
  const number = index + 1;
  const override = squishyDumplingOverrides[number];

  let rarity = "da-verificare";

  if (number >= 76 && number <= 100) {
    rarity = "rare";
  }

  if (number >= 101 && number <= 120) {
    rarity = "ultra-rare";
  }

  if (number >= 121 && number <= 130) {
    rarity = "rare-mystery";
  }

  if (number >= 131 && number <= 135) {
    rarity = "rare-crystal";
  }

  return {
    number,
    name: override?.name || `Card ${number}`,
    rarity: override?.rarity || rarity,
  };
});
