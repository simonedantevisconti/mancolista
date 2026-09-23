export const squishyDumplingCards = Array.from({ length: 135 }, (_, index) => {
  const number = index + 1;

  return {
    number,
    name: `Card ${number}`,
    rarity: "da-verificare",
  };
});
