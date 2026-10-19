export const calciatoriPanini2627Cards = Array.from(
  { length: 609 },
  (_, index) => {
    const number = index + 1;

    return {
      number,
      name: `Figurina ${String(number).padStart(3, "0")}`,
      category: "da-verificare",
    };
  },
);
