export const poppyPlaytimeCards = Array.from({ length: 162 }, (_, index) => {
  const number = index + 1;

  return {
    number,
    name: `Card ${number}`,
    rarity: "da-verificare",
  };
});
